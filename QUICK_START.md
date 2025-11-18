# Quick Start Guide - Building Executable Packages

## For Users Who Want Installers

### Option 1: Download Pre-built Installers (Recommended)
If automated builds are set up via GitHub Actions:
1. Go to the [Releases](../../releases) page
2. Download the installer for your platform:
   - **macOS**: Download `.dmg` file
   - **Windows**: Download `.exe` file
3. Run the installer

### Option 2: Build Locally

#### Prerequisites
- Install [Node.js](https://nodejs.org/) (v16+)
- Install [Git](https://git-scm.com/)

#### On macOS or Linux

1. Open Terminal and run:
```bash
# Clone the repository
git clone <repository-url>
cd WebAPP

# Make build script executable
chmod +x build.sh

# Run the build
./build.sh
```

2. Find installers in the `dist/` folder:
   - macOS: `CRM Webinar & Training-1.0.0.dmg`
   - Windows: `CRM Webinar & Training Setup 1.0.0.exe` (if cross-compiling)

#### On Windows

1. Open Command Prompt or PowerShell and run:
```cmd
REM Clone the repository
git clone <repository-url>
cd WebAPP

REM Run the build
build.bat
```

2. Find installers in the `dist\` folder:
   - Windows: `CRM Webinar & Training Setup 1.0.0.exe`

## Installation

### macOS
1. Open the `.dmg` file
2. Drag the app to Applications folder
3. First launch: Right-click → Open (to bypass Gatekeeper)
4. Use normally from Applications

### Windows
1. Run the `.exe` installer
2. Follow the installation wizard
3. Choose installation directory (or use default)
4. Launch from Start Menu or Desktop shortcut

## First Time Setup

1. Launch the application
2. Click "Create one" to register a new account
3. Fill in your details:
   - Full Name
   - Username
   - Email
   - Password (minimum 6 characters)
4. Click "Create Account"
5. Log in with your credentials

## Troubleshooting

### macOS: "App is damaged and can't be opened"
This happens with unsigned apps. To fix:
```bash
xattr -cr "/Applications/CRM Webinar & Training.app"
```

### Windows: "Windows protected your PC"
Click "More info" → "Run anyway"

### Build fails
See [BUILD.md](BUILD.md) for detailed troubleshooting

## What's Next?

After installation:
- Add your first contacts
- Schedule a webinar
- Create a training course
- Start messaging team members

For detailed usage instructions, see [README.md](README.md)
