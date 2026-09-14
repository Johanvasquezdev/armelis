use serde::Serialize;
use std::{fs, path::{Path, PathBuf}, process::Command};

#[derive(Serialize)]
struct ScanResult {
    status: String,
    exit_code: Option<i32>,
    stdout: String,
    stderr: String,
}

fn validate_target(target: &str) -> Result<PathBuf, String> {
    if target.trim().is_empty() || target.contains("\0") {
        return Err("A local repository path is required".into());
    }
    if target.contains("://") {
        return Err("Remote URLs are not allowed; choose a local directory".into());
    }
    let path = fs::canonicalize(Path::new(target)).map_err(|_| "The target directory does not exist".to_string())?;
    if !path.is_dir() {
        return Err("The scan target must be a directory".into());
    }
    Ok(path)
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
    if trivy_executable.trim().is_empty() || trivy_executable.contains(' ') || trivy_executable.contains(';') {
        return Err("The Trivy executable must be a single executable path".into());
    }

    let output = Command::new(&trivy_executable)
        .args(["repo", "--format", "json", "--scanners", &scanners.join(",")])
        .arg(&target_path)
        .output()
        .map_err(|error| format!("Could not start Trivy: {error}"))?;

    Ok(ScanResult {
        status: if output.status.success() { "COMPLETED" } else { "FAILED" }.into(),
        exit_code: output.status.code(),
        stdout: String::from_utf8_lossy(&output.stdout).into_owned(),
        stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![scan_local_repository])
        .run(tauri::generate_context!())
        .expect("error while running CyberScan desktop application");
}
