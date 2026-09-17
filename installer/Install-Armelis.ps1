<#
.SYNOPSIS
    Armelis Tactical Security Intelligence — Windows Installer & Setup Wizard
.DESCRIPTION
    Installs Armelis Tactical Command (Desktop & CLI) to the local Windows environment.
    Configures Windows PATH, File Explorer Context Menu ("Scan with Armelis"), and Start Menu shortcuts.
.AUTHOR
    Johan Vasquez
.LICENSE
    MIT License
#>

param (
    [switch]$Silent,
    [string]$InstallDir = "$env:LOCALAPPDATA\Armelis",
    [ValidateSet('cold', 'warm')][string]$Theme = 'cold'
)

$ErrorActionPreference = 'Stop'

function Show-ArmelisBanner([string]$mode = 'cold') {
    Clear-Host
    $isCold = ($mode -eq 'cold')
    $esc = [char]27
    $reset = "$esc[0m"
    $bold = "$esc[1m"
    $dim = "$esc[2m"
    $accent = if ($isCold) { "$esc[38;2;0;229;255m" } else { "$esc[38;2;245;158;11m" }
    $white = "$esc[38;2;240;246;252m"

    $shield = if ($isCold) {
        @(
            "   ╭───▲───╮   ",
            "  ╱  ╭─┴─╮  ╲  ",
            " ▕  ╭┤◈ ═├╮  ▏ ",
            " ▕  │ ╰◈╯ │  ▏ ",
            "  ╲  ╰─┬─╯  ╱  ",
            "   ╰───▼───╯   "
        )
    } else {
        @(
            "   ╭───▲───╮   ",
            "  ╱  ╭─┴─╮  ╲  ",
            " ▕  ╭┤▞ ▚├╮  ▏ ",
            " ▕  │ ▚ ▞ │  ▏ ",
            "  ╲  ╰─┬─╯  ╱  ",
            "   ╰───▼───╯   "
        )
    }

    $fontARME = @(
        " █████╗ ██████╗ ███╗   ███╗███████╗",
        "██╔══██╗██╔══██╗████╗ ████║██╔════╝",
        "███████║██████╔╝██╔████╔██║█████╗  ",
        "██╔══██║██╔══██╗██║╚██╔╝██║██╔══╝  ",
        "██║  ██║██║  ██║██║ ╚═╝ ██║███████╗",
        "╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝"
    )

    $fontLIS = @(
        "██╗     ██╗███████╗",
        "██║     ██║██╔════╝",
        "██║     ██║███████╗",
        "██║     ██║╚════██║",
        "███████╗██║███████║",
        "╚══════╝╚═╝╚══════╝"
    )

    $bracketLeft = @(' ╔ ', ' ║ ', ' ║ ', ' ║ ', ' ║ ', ' ╚ ')
    $bracketRight = @(' ╗', ' ║', ' ║', ' ║', ' ║', ' ╝')

    Write-Host ""
    for ($i = 0; $i -lt 6; $i++) {
        $line = "$accent$bold$($shield[$i])$reset $white$bold$($fontARME[$i])$reset$accent$bold$($bracketLeft[$i])$($fontLIS[$i])$($bracketRight[$i])$reset"
        Write-Host $line
    }
    Write-Host ""
    $themeLabel = if ($isCold) { "Cold analytical mode" } else { "Warm protective" }
    Write-Host " $dim Application Security Intelligence & Choke-Point Defense • $reset$bold$themeLabel$reset"
    Write-Host " $dim See every hop. Sever the chain against bedrock.$reset"
    Write-Host ""
    Write-Host " -------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  OFFICIAL WINDOWS SETUP WIZARD                                 v0.1.0 (MIT)" -ForegroundColor Cyan
    Write-Host " -------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ""
}

function Register-Path([string]$binPath) {
    $currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $paths = $currentPath -split ';' | Where-Object { $_ -ne '' }
    if ($paths -notcontains $binPath) {
        Write-Host " [+] Adding to User PATH: $binPath" -ForegroundColor Green
        [Environment]::SetEnvironmentVariable('Path', "$currentPath;$binPath", 'User')
        $env:Path = "$env:Path;$binPath"
    } else {
        Write-Host " [=] Bin directory already present in User PATH." -ForegroundColor DarkGray
    }
}

function Register-ContextMenu([string]$binDir, [string]$iconFile) {
    try {
        $cmdPath = "$binDir\armelis.cmd"
        
        # 1. Directory right-click
        $dirKey = "HKCU:\Software\Classes\Directory\shell\Armelis"
        New-Item -Path $dirKey -Force | Out-Null
        Set-ItemProperty -Path $dirKey -Name "(Default)" -Value "Scan with Armelis"
        if (Test-Path $iconFile) {
            Set-ItemProperty -Path $dirKey -Name "Icon" -Value $iconFile
        }
        $dirCmdKey = "$dirKey\command"
        New-Item -Path $dirCmdKey -Force | Out-Null
        Set-ItemProperty -Path $dirCmdKey -Name "(Default)" -Value "cmd.exe /k `"$cmdPath`" scan `"%1`""

        # 2. Directory background right-click
        $bgKey = "HKCU:\Software\Classes\Directory\Background\shell\Armelis"
        New-Item -Path $bgKey -Force | Out-Null
        Set-ItemProperty -Path $bgKey -Name "(Default)" -Value "Scan directory with Armelis"
        if (Test-Path $iconFile) {
            Set-ItemProperty -Path $bgKey -Name "Icon" -Value $iconFile
        }
        $bgCmdKey = "$bgKey\command"
        New-Item -Path $bgCmdKey -Force | Out-Null
        Set-ItemProperty -Path $bgCmdKey -Name "(Default)" -Value "cmd.exe /k `"$cmdPath`" scan `"%V`""

        Write-Host " [+] Registered File Explorer Context Menu: 'Scan with Armelis'" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to register context menu: $_"
    }
}

function Create-Shortcuts([string]$installDir, [string]$iconFile) {
    try {
        $wsh = New-Object -ComObject WScript.Shell
        
        # Desktop Shortcut
        $desktopPath = [Environment]::GetFolderPath('Desktop')
        $shortcut = $wsh.CreateShortcut("$desktopPath\Armelis.lnk")
        $shortcut.TargetPath = "$installDir\bin\armelis.cmd"
        $shortcut.Arguments = "--cold"
        $shortcut.WorkingDirectory = "$installDir"
        $shortcut.Description = "Armelis Application Security Intelligence"
        if (Test-Path $iconFile) {
            $shortcut.IconLocation = $iconFile
        }
        $shortcut.Save()
        Write-Host " [+] Created Desktop Shortcut: $desktopPath\Armelis.lnk" -ForegroundColor Green

        # Start Menu Shortcut
        $startMenu = [Environment]::GetFolderPath('StartMenu') + "\Programs\Armelis"
        if (-not (Test-Path $startMenu)) {
            New-Item -ItemType Directory -Path $startMenu -Force | Out-Null
        }
        $smShortcut = $wsh.CreateShortcut("$startMenu\Armelis Tactical Command.lnk")
        $smShortcut.TargetPath = "$installDir\bin\armelis.cmd"
        $smShortcut.Arguments = "--cold"
        $smShortcut.WorkingDirectory = "$installDir"
        $smShortcut.Description = "Armelis Tactical Security Command"
        if (Test-Path $iconFile) {
            $smShortcut.IconLocation = $iconFile
        }
        $smShortcut.Save()
        Write-Host " [+] Created Start Menu Entry: $startMenu\Armelis Tactical Command.lnk" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to create shortcuts: $_"
    }
}

function Install-Armelis() {
    Show-ArmelisBanner -mode $Theme

    Write-Host " Target Installation Directory: $InstallDir" -ForegroundColor Cyan
    Write-Host ""

    $binDir = "$InstallDir\bin"
    $iconsDir = "$InstallDir\icons"
    $repoRoot = (Resolve-Path "$PSScriptRoot\..").Path

    New-Item -ItemType Directory -Path $binDir -Force | Out-Null
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null

    # Copy Icons
    $sourceIco = "$repoRoot\apps\desktop\src-tauri\icons\icon.ico"
    $targetIco = "$iconsDir\icon.ico"
    if (Test-Path $sourceIco) {
        Copy-Item $sourceIco $targetIco -Force
    }

    # Copy Logo Assets
    $sourceLogo = "$repoRoot\apps\web\public\armelis-logo.png"
    if (Test-Path $sourceLogo) {
        Copy-Item $sourceLogo "$iconsDir\armelis-logo.png" -Force
    }
    $sourceLogoWarm = "$repoRoot\apps\web\public\armelis-logo-warm.png"
    if (Test-Path $sourceLogoWarm) {
        Copy-Item $sourceLogoWarm "$iconsDir\armelis-logo-warm.png" -Force
    }

    # Create Windows CLI Command Wrapper (armelis.cmd)
    $launcherJs = "$repoRoot\bin\armelis.js"
    $cmdContent = @"
@echo off
node "$launcherJs" %*
"@
    Set-Content -Path "$binDir\armelis.cmd" -Value $cmdContent -Encoding ASCII
    Write-Host " [+] Generated CLI Executable: $binDir\armelis.cmd" -ForegroundColor Green

    # Create PowerShell Launcher (armelis.ps1)
    $ps1Content = @"
param([Parameter(ValueFromRemainingArguments=`$true)]`$args)
node "$launcherJs" @args
"@
    Set-Content -Path "$binDir\armelis.ps1" -Value $ps1Content -Encoding UTF8

    # Register in User PATH
    Register-Path -binPath $binDir

    # Register File Explorer Context Menu
    Register-ContextMenu -binDir $binDir -iconFile $targetIco

    # Create Desktop and Start Menu Shortcuts
    Create-Shortcuts -installDir $InstallDir -iconFile $targetIco

    Write-Host ""
    Write-Host " ===============================================================================" -ForegroundColor DarkGray
    Write-Host "  INSTALLATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host " ===============================================================================" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host " You can now run Armelis from any terminal session:" -ForegroundColor White
    Write-Host "   armelis scan ." -ForegroundColor Cyan
    Write-Host "   armelis trace ." -ForegroundColor Cyan
    Write-Host "   armelis break ." -ForegroundColor Cyan
    Write-Host "   armelis --warm" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " Right-click any folder in Windows Explorer to scan directly with Armelis." -ForegroundColor White
    Write-Host ""
}

Install-Armelis
