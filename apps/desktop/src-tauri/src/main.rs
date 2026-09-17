use serde::Serialize;
use std::{fs, path::{Path, PathBuf}, process::Command};

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
    let mut canonical_str = canonical.to_string_lossy().to_string();
    if canonical_str.starts_with(r"\\?\UNC\") {
        canonical_str = format!(r"\\{}", &canonical_str[8..]);
    } else if canonical_str.starts_with(r"\\?\") {
        canonical_str = canonical_str[4..].to_string();
    }
    Ok(PathBuf::from(canonical_str))
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

#[tauri::command]
fn scan_local_repository(target: String, scanners: Vec<String>, trivy_executable: String) -> Result<ScanResult, String> {
    let target_path = validate_target(&target)?;
    validate_scanners(&scanners)?;
    let clean_trivy = trivy_executable.trim().trim_matches('"').trim_matches('\'').to_string();
    if clean_trivy.is_empty() || clean_trivy.contains(';') || clean_trivy.contains('&') || clean_trivy.contains('|') {
        return Err("Invalid Trivy executable path".into());
    }

    let output = Command::new(&clean_trivy)
        .args([
            "repo",
            "--format", "json",
            "--scanners", &scanners.join(","),
            "--skip-dirs", "node_modules,.git,dist,build,.next"
        ])
        .arg(&target_path)
        .output()
        .map_err(|error| format!("Could not start Trivy executable '{clean_trivy}': {error}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout).into_owned();
    let stderr = String::from_utf8_lossy(&output.stderr).into_owned();
    let is_success = output.status.success() && (!stdout.trim().is_empty() || stderr.is_empty());

    Ok(ScanResult {
        status: if is_success { "COMPLETED" } else { "FAILED" }.into(),
        exit_code: output.status.code(),
        stdout,
        stderr,
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![scan_local_repository])
        .run(tauri::generate_context!())
        .expect("error while running Armelis desktop application");
}
