# Building the CRM Application

This guide explains how to build executable packages for macOS and Windows.

## Prerequisites

Before building, ensure you have:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Git** - [Download](https://git-scm.com/)
4. **Internet connection** (for downloading dependencies)

### Platform-Specific Requirements

#### For macOS Builds:
- macOS 10.13 or higher
- Xcode Command Line Tools: `xcode-select --install`
- At least 2GB of free disk space

#### For Windows Builds:
- Windows 10 or higher
- Windows SDK (automatically installed with Visual Studio)
- At least 2GB of free disk space

## Quick Start

### Option 1: Using Build Scripts (Recommended)

**On macOS/Linux:**
```bash
chmod +x build.sh
./build.sh
```

**On Windows:**
```cmd
build.bat
```

### Option 2: Manual Build Process

1. **Clone the repository:**
```bash
git clone <repository-url>
cd WebAPP
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build for your platform:**

For macOS:
```bash
npm run build:mac
```

For Windows:
```bash
npm run build:win
```

For both platforms:
```bash
npm run build:all
```

## Build Outputs

After a successful build, you'll find the installers in the `dist/` folder:

### macOS
- **DMG installer**: `dist/CRM Webinar & Training-1.0.0.dmg`
- **ZIP archive**: `dist/CRM Webinar & Training-1.0.0-mac.zip`

**Installation:**
1. Open the `.dmg` file
2. Drag the app to the Applications folder
3. Launch from Applications

### Windows
- **NSIS installer**: `dist/CRM Webinar & Training Setup 1.0.0.exe`
- **Portable version**: `dist/CRM Webinar & Training 1.0.0.exe`

**Installation:**
1. Run the `.exe` installer
2. Follow the installation wizard
3. Launch from Start Menu or Desktop shortcut

## Build Configuration

The build configuration is in `package.json` under the `build` section:

```json
{
  "build": {
    "appId": "com.crm.webinar.training",
    "productName": "CRM Webinar & Training",
    "directories": {
      "output": "dist"
    },
    "mac": {
      "category": "public.app-category.business",
      "target": ["dmg", "zip"]
    },
    "win": {
      "target": ["nsis", "portable"]
    }
  }
}
```

## Customization

### Changing App Icons

1. Create your icons:
   - **macOS**: 1024x1024 PNG → convert to `.icns`
   - **Windows**: 256x256 PNG → convert to `.ico`

2. Place them in `assets/icons/`:
   - `assets/icons/icon.icns` (macOS)
   - `assets/icons/icon.ico` (Windows)
   - `assets/icons/icon.png` (Linux/fallback)

3. Update `package.json`:
```json
{
  "build": {
    "mac": {
      "icon": "assets/icons/icon.icns"
    },
    "win": {
      "icon": "assets/icons/icon.ico"
    }
  }
}
```

### Code Signing (Optional but Recommended)

#### macOS
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    }
  }
}
```

#### Windows
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "your-password",
      "signingHashAlgorithms": ["sha256"],
      "signDlls": true
    }
  }
}
```

## Troubleshooting

### Common Issues

**1. "electron-builder" not found**
```bash
npm install --save-dev electron-builder
```

**2. Build fails on macOS**
- Install Xcode Command Line Tools: `xcode-select --install`
- Accept Xcode license: `sudo xcodebuild -license accept`

**3. Build fails on Windows**
- Run as Administrator
- Install Windows Build Tools: `npm install --global windows-build-tools`

**4. "ENOSPC: System limit for number of file watchers reached"** (Linux)
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**5. Out of memory during build**
```bash
export NODE_OPTIONS=--max-old-space-size=4096
npm run build:all
```

### Clean Build

If builds are failing, try a clean build:
```bash
# Remove node_modules and lock files
rm -rf node_modules package-lock.json

# Remove previous builds
rm -rf dist

# Reinstall and rebuild
npm install
npm run build:all
```

## Build Sizes

Expected installer sizes:

| Platform | Installer Type | Size (approx) |
|----------|---------------|---------------|
| macOS    | DMG          | 80-120 MB     |
| macOS    | ZIP          | 80-120 MB     |
| Windows  | NSIS Setup   | 60-100 MB     |
| Windows  | Portable     | 60-100 MB     |

## Advanced: CI/CD Builds

For automated builds using GitHub Actions, see `.github/workflows/build.yml`.

This will automatically build and release installers when you push a tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Distribution Checklist

Before distributing your application:

- [ ] Update version number in `package.json`
- [ ] Test the application thoroughly
- [ ] Add/update app icons
- [ ] Sign the application (macOS and Windows)
- [ ] Test installers on target platforms
- [ ] Create release notes
- [ ] Update README with installation instructions
- [ ] Consider notarization (macOS)

## Auto-Updates (Optional)

To enable auto-updates, configure electron-updater:

1. Install electron-updater:
```bash
npm install electron-updater
```

2. Add to `main.js`:
```javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

3. Configure in `package.json`:
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "your-repo"
    }
  }
}
```

## Support

For build issues:
1. Check the [electron-builder documentation](https://www.electron.build/)
2. Review error logs in the console
3. Search GitHub issues for similar problems
4. Create an issue in the repository

## License

MIT License - See LICENSE file for details
