# Building on Your Local Machine

Due to network restrictions in the current environment, the application cannot be built here. Follow these steps to build on your local machine:

## Step 1: Clone the Repository

```bash
git clone https://github.com/Marchano/WebAPP.git
cd WebAPP
```

## Step 2: Install Dependencies

```bash
npm install
```

This will download:
- Electron (~100 MB)
- electron-builder (~50 MB)
- Other dependencies (~20 MB)

**Total download**: ~170 MB

## Step 3: Build Installers

### For macOS (on a Mac):
```bash
npm run build:mac
```

**Output** (in `dist/` folder):
- `CRM Webinar & Training-1.0.0.dmg` (~90 MB)
- `CRM Webinar & Training-1.0.0-mac.zip` (~90 MB)

### For Windows (on Windows or Mac):
```bash
npm run build:win
```

**Output** (in `dist/` folder):
- `CRM Webinar & Training Setup 1.0.0.exe` (~70 MB) - Installer
- `CRM Webinar & Training 1.0.0.exe` (~70 MB) - Portable

### For Both Platforms:
```bash
npm run build:all
```

## Step 4: Test the Installer

### macOS:
1. Open `dist/CRM Webinar & Training-1.0.0.dmg`
2. Drag to Applications
3. Launch and verify functionality

### Windows:
1. Run `dist/CRM Webinar & Training Setup 1.0.0.exe`
2. Install to Program Files
3. Launch and verify functionality

## Expected Build Times

| Platform | Build Time | Size |
|----------|------------|------|
| macOS DMG | 2-5 min | ~90 MB |
| Windows NSIS | 2-4 min | ~70 MB |
| Both | 4-9 min | ~160 MB |

## Automated Builds via GitHub Actions

This repository includes a GitHub Actions workflow that automatically builds installers when you push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow will:
1. Build for both macOS and Windows
2. Create a GitHub Release
3. Upload installers as release assets

## Distribution

Once built, you can distribute the installers:

1. **Direct download**: Share the installer files
2. **GitHub Releases**: Upload to GitHub releases page
3. **Website**: Host on your own website
4. **App stores**: Submit to Mac App Store / Microsoft Store (requires developer accounts)

## Code Signing (Recommended for Distribution)

For production distribution, you should sign your installers:

### macOS
- Requires: Apple Developer account ($99/year)
- Tool: `codesign` (included with Xcode)
- Notarization: Required for macOS 10.15+

### Windows
- Requires: Code signing certificate (~$100-500)
- Tool: SignTool (included with Windows SDK)
- SmartScreen: Builds reputation over time

See [BUILD.md](BUILD.md) for detailed signing instructions.
