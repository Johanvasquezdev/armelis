use serde::Serialize;
use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
};

#[derive(Serialize)]
struct ScanResult {
    status: String,
    exit_code: Option<i32>,
    stdout: String,
    stderr: String,
}

fn clean_target_string(target: &str) -> String {
    let mut s = target.trim();
    if (s.starts_with('"') && s.ends_with('"')) || (s.starts_with('\'') && s.ends_with('\'')) {
        if s.len() >= 2 {
            s = &s[1..s.len() - 1];
        }
    }
    s.trim().to_string()
}

fn strip_verbatim_prefix(path: PathBuf) -> PathBuf {
    let mut canonical_str = path.to_string_lossy().to_string();
    if canonical_str.starts_with(r"\\?\UNC\") {
        canonical_str = format!(r"\\{}", &canonical_str[8..]);
    } else if canonical_str.starts_with(r"\\?\") {
        canonical_str = canonical_str[4..].to_string();
    }
    PathBuf::from(canonical_str)
}

fn validate_target(target: &str) -> Result<PathBuf, String> {
    let clean = clean_target_string(target);
    if clean.is_empty() || clean.contains('\0') {
        return Err("A local repository path is required".into());
    }
    if clean.contains("://") {
        return Err("Remote URLs are not allowed; choose a local directory".into());
    }
    let p = Path::new(&clean);
    if !p.exists() {
        return Err(format!("The target directory does not exist: {clean}"));
    }
    if !p.is_dir() {
        return Err(format!("The scan target must be a directory: {clean}"));
    }

    // Resolve canonical path but strip extended-length prefix (\\?\) which breaks Go/Trivy CLI
    let canonical = fs::canonicalize(p).unwrap_or_else(|_| p.to_path_buf());
    Ok(strip_verbatim_prefix(canonical))
}

fn validate_scanners(scanners: &[String]) -> Result<(), String> {
    if scanners.is_empty() {
        return Err("Select at least one scanner".into());
    }
    if scanners.iter().any(|scanner| scanner.is_empty() || !scanner.chars().all(|character| character.is_ascii_lowercase())) {
        return Err("Scanner names contain unsupported characters".into());
    }
    Ok(())
}

fn validate_executable(path: &str, label: &str, default_value: Option<&str>) -> Result<String, String> {
    let clean = path.trim().trim_matches('"').trim_matches('\'').to_string();
    let resolved = if clean.is_empty() {
        default_value.unwrap_or("").to_string()
    } else {
        clean
    };
    if resolved.is_empty() || resolved.contains(';') || resolved.contains('&') || resolved.contains('|') {
        return Err(format!("Invalid {label} executable path"));
    }
    Ok(resolved)
}

fn pipeline_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..").join("embedding-pipeline")
}

fn default_python() -> PathBuf {
    let venv = pipeline_root().join(".venv");
    if cfg!(windows) {
        venv.join("Scripts").join("python.exe")
    } else {
        venv.join("bin").join("python")
    }
}

fn assert_inside(workspace: &Path, candidate: &Path) -> Result<(), String> {
    let workspace_canon = strip_verbatim_prefix(fs::canonicalize(workspace).unwrap_or_else(|_| workspace.to_path_buf()));
    let candidate_canon = strip_verbatim_prefix(fs::canonicalize(candidate).unwrap_or_else(|_| candidate.to_path_buf()));
    if !candidate_canon.starts_with(&workspace_canon) {
        return Err("Path must remain inside the workspace root".into());
    }
    Ok(())
}

#[tauri::command]
async fn run_scan(target: String, scanners: Vec<String>, trivy_executable: Option<String>) -> Result<ScanResult, String> {
    let target_path = validate_target(&target)?;
    validate_scanners(&scanners)?;
    let clean_trivy = validate_executable(trivy_executable.as_deref().unwrap_or(""), "Trivy", Some("trivy"))?;

    let clean_trivy_for_err = clean_trivy.clone();
    let thread_handle = std::thread::spawn(move || {
        Command::new(&clean_trivy)
            .args([
                "repo",
                "--format", "json",
                "--scanners", &scanners.join(","),
                "--skip-dirs", "**/node_modules",
                "--skip-dirs", "**/.git",
                "--skip-dirs", "**/dist",
                "--skip-dirs", "**/build",
                "--skip-dirs", "**/.next",
                "--skip-dirs", "**/target",
                "--skip-dirs", "**/.venv",
                "--skip-dirs", "**/embedding-pipeline/.cache",
                "--skip-dirs", "**/.gemini",
                "--timeout", "120s",
            ])
            .arg(&target_path)
            .output()
    });

    let output = thread_handle
        .join()
        .map_err(|_| "Scanner worker thread panicked".to_string())?
        .map_err(|error| format!("Could not start Trivy executable '{clean_trivy_for_err}': {error}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout).into_owned();
    let stderr = String::from_utf8_lossy(&output.stderr).into_owned();
    let is_success = output.status.success() && (!stdout.trim().is_empty() || stderr.is_empty());

    Ok(ScanResult {
        status: if is_success { "COMPLETED".into() } else { "FAILED".into() },
        exit_code: output.status.code(),
        stdout,
        stderr,
    })
}

#[tauri::command]
fn embed_findings(workspace: String, findings_json: String, python_executable: Option<String>) -> Result<ScanResult, String> {
    let workspace_path = match validate_target(&workspace) {
        Ok(path) => path,
        Err(error) => {
            return Ok(ScanResult {
                status: "FAILED".into(),
                exit_code: None,
                stdout: String::new(),
                stderr: error,
            });
        }
    };

    if let Err(error) = serde_json::from_str::<serde_json::Value>(&findings_json) {
        return Ok(ScanResult {
            status: "FAILED".into(),
            exit_code: None,
            stdout: String::new(),
            stderr: format!("Normalized findings JSON is invalid: {error}"),
        });
    }

    let embeddings_dir = workspace_path.join(".armelis").join("embeddings");
    if let Err(error) = fs::create_dir_all(&embeddings_dir) {
        return Ok(ScanResult {
            status: "FAILED".into(),
            exit_code: None,
            stdout: String::new(),
            stderr: format!("Could not create embeddings directory: {error}"),
        });
    }

    let input_path = embeddings_dir.join("findings.json");
    let output_path = embeddings_dir.join("finding_embeddings.jsonl");
    if let Err(error) = fs::write(&input_path, findings_json.as_bytes()) {
        return Ok(ScanResult {
            status: "FAILED".into(),
            exit_code: None,
            stdout: String::new(),
            stderr: format!("Could not write findings for embedding: {error}"),
        });
    }

    if let Err(error) = assert_inside(&workspace_path, &input_path) {
        return Ok(ScanResult {
            status: "FAILED".into(),
            exit_code: None,
            stdout: String::new(),
            stderr: error,
        });
    }

    let default_python_path = default_python();
    let default_python_str = default_python_path.to_string_lossy().into_owned();
    let python = match validate_executable(
        python_executable.as_deref().unwrap_or(""),
        "Python",
        Some(&default_python_str),
    ) {
        Ok(path) => path,
        Err(error) => {
            return Ok(ScanResult {
                status: "FAILED".into(),
                exit_code: None,
                stdout: String::new(),
                stderr: error,
            });
        }
    };

    let python_path = PathBuf::from(&python);
    if !python_path.exists() {
        return Ok(ScanResult {
            status: "FAILED".into(),
            exit_code: None,
            stdout: String::new(),
            stderr: format!(
                "Python embedder venv not found at {python}. Create apps/desktop/embedding-pipeline/.venv and install requirements.txt."
            ),
        });
    }

    let root = pipeline_root();
    let runner = root.join("run.py");
    if !runner.exists() {
        return Ok(ScanResult {
            status: "FAILED".into(),
            exit_code: None,
            stdout: String::new(),
            stderr: format!("Embedding runner not found at {}.", runner.display()),
        });
    }

    let input_str = input_path.to_string_lossy().into_owned();
    let output_str = output_path.to_string_lossy().into_owned();
    let runner_str = runner.to_string_lossy().into_owned();
    let output = Command::new(&python)
        .args([&runner_str, "--input", &input_str, "--output", &output_str])
        .current_dir(&root)
        .env("PYTHONPATH", root.join("src"))
        .env("HF_HOME", root.join(".cache"))
        .env("TRANSFORMERS_TRUST_REMOTE_CODE", "0")
        .output();

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).into_owned();
            let stderr = String::from_utf8_lossy(&output.stderr).into_owned();
            Ok(ScanResult {
                status: if output.status.success() { "SUCCEEDED".into() } else { "FAILED".into() },
                exit_code: output.status.code(),
                stdout,
                stderr,
            })
        }
        Err(error) => Ok(ScanResult {
            status: "FAILED".into(),
            exit_code: None,
            stdout: String::new(),
            stderr: format!("Could not start Python embedder '{python}': {error}"),
        }),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![run_scan, embed_findings])
        .run(tauri::generate_context!())
        .expect("error while running Armelis desktop application");
}
