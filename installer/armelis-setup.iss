; Script generated for Inno Setup Compiler 6+
; Armelis Tactical Security Intelligence - Windows Setup Wizard
; Author: Johan Vasquez (Personal Project - MIT License)

#define MyAppName "Armelis"
#define MyAppFullName "Armelis Tactical Command"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "Johan Vasquez"
#define MyAppURL "https://github.com/Johanvasquezdev/armelis"
#define MyAppExeName "armelis.cmd"

[Setup]
AppId={{D68F2314-1B19-4F58-9A74-298319D4F200}
AppName={#MyAppFullName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppFullName}
AllowNoIcons=yes
LicenseFile=..\LICENSE
OutputDir=dist
OutputBaseFilename=Armelis-Setup-x64
SetupIconFile=..\apps\desktop\src-tauri\icons\icon.ico
WizardImageFile=..\apps\desktop\src-tauri\icons\installer-sidebar.bmp
WizardSmallImageFile=..\apps\desktop\src-tauri\icons\installer-header.bmp
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
DisableWelcomePage=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "addtopath"; Description: "Add Armelis CLI to System PATH"; GroupDescription: "Command Line Configuration:"
Name: "contextmenu"; Description: "Add 'Scan with Armelis' to File Explorer context menu"; GroupDescription: "Windows Shell Integration:"

[Files]
Source: "..\bin\armelis.js"; DestDir: "{app}\bin"; Flags: ignoreversion
Source: "..\packages\*"; DestDir: "{app}\packages"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\apps\desktop\src-tauri\icons\icon.ico"; DestDir: "{app}\icons"; Flags: ignoreversion
Source: "..\apps\web\public\armelis-logo.png"; DestDir: "{app}\icons"; Flags: ignoreversion
Source: "..\apps\web\public\armelis-logo-warm.png"; DestDir: "{app}\icons"; Flags: ignoreversion
Source: "..\LICENSE"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppFullName}"; Filename: "{cmd}"; Parameters: "/k ""{app}\bin\armelis.cmd"" --cold"; IconFilename: "{app}\icons\icon.ico"; Comment: "Armelis Application Security Command"
Name: "{group}\{cm:UninstallProgram,{#MyAppFullName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppFullName}"; Filename: "{cmd}"; Parameters: "/k ""{app}\bin\armelis.cmd"" --cold"; IconFilename: "{app}\icons\icon.ico"; Tasks: desktopicon

[Registry]
; Context Menu for Directory
Root: HKCU; Subkey: "Software\Classes\Directory\shell\Armelis"; ValueType: string; ValueName: ""; ValueData: "Scan with Armelis"; Flags: uninsdeletekey; Tasks: contextmenu
Root: HKCU; Subkey: "Software\Classes\Directory\shell\Armelis"; ValueType: string; ValueName: "Icon"; ValueData: """{app}\icons\icon.ico"""; Tasks: contextmenu
Root: HKCU; Subkey: "Software\Classes\Directory\shell\Armelis\command"; ValueType: string; ValueName: ""; ValueData: """cmd.exe"" /k """"{app}\bin\armelis.cmd"""" scan """"%1"""""; Tasks: contextmenu

; Context Menu for Directory Background
Root: HKCU; Subkey: "Software\Classes\Directory\Background\shell\Armelis"; ValueType: string; ValueName: ""; ValueData: "Scan directory with Armelis"; Flags: uninsdeletekey; Tasks: contextmenu
Root: HKCU; Subkey: "Software\Classes\Directory\Background\shell\Armelis"; ValueType: string; ValueName: "Icon"; ValueData: """{app}\icons\icon.ico"""; Tasks: contextmenu
Root: HKCU; Subkey: "Software\Classes\Directory\Background\shell\Armelis\command"; ValueType: string; ValueName: ""; ValueData: """cmd.exe"" /k """"{app}\bin\armelis.cmd"""" scan """"%V"""""; Tasks: contextmenu

[Run]
Filename: "{cmd}"; Parameters: "/k ""{app}\bin\armelis.cmd"" --cold"; Description: "{cm:LaunchProgram,{#MyAppFullName}}"; Flags: nowait postinstall skipifsilent
