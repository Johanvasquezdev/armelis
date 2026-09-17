# Armelis Windows Custom Installer Suite

This directory contains the personalized Windows installer packages for **Armelis Tactical Command**.

---

## 1. Quick PowerShell Setup Wizard (`Install-Armelis.ps1`)

An interactive script that configures Armelis on your workstation without requiring third-party compilers.

### Features
* **ASCII Tactical Shield Banner:** Displays the animated Armelis terminal shield in Cold Cyan or Warm Amber.
* **PATH Registration:** Adds `%LOCALAPPDATA%\Armelis\bin` to User `PATH`.
* **File Explorer Integration:** Adds **"Scan with Armelis"** to folder right-click context menus with the official shield `.ico` icon.
* **Shortcuts:** Creates Start Menu and Desktop shortcuts with custom brand icons.

### Usage
```powershell
# Run with Cold Analytical theme (Default)
powershell -ExecutionPolicy Bypass -File .\installer\Install-Armelis.ps1

# Run with Warm Protective theme
powershell -ExecutionPolicy Bypass -File .\installer\Install-Armelis.ps1 -Theme warm
```

---

## 2. Standalone Compiled Setup Wizard (`armelis-setup.iss`)

If you want to distribute a single `.exe` installer (`Armelis-Setup-x64.exe`):

### Requirements
* [Inno Setup 6+](https://jrsoftware.org/isdl.php) installed on your system.

### Build Command
```cmd
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer\armelis-setup.iss
```
This produces `installer\dist\Armelis-Setup-x64.exe` with:
* Custom dark-navy sidebar art (`installer-sidebar.bmp`)
* Branded header banner (`installer-header.bmp`)
* Official multi-resolution application icon (`icon.ico`)
* Multilingual support (English & Spanish)
* MIT License agreement page
* Automated registry hooks for Windows Explorer context menu & PATH registration

---

## 3. Tauri 2 Desktop Bundler

You can also build the native Windows installer directly using Tauri:
```cmd
cd apps/desktop
npm run tauri build
```
This uses the customized NSIS installer configuration defined in `apps/desktop/src-tauri/tauri.conf.json`.
