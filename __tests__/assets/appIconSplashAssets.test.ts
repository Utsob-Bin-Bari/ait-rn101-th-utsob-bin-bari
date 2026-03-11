/**
 * Story 1.1 — App Icon & Splash Screen
 * Asset and configuration validation tests.
 * These tests verify all native assets and config files required by the story ACs.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

/** Read width/height from a PNG file header (bytes 16–23 of the file). */
function readPngDimensions(filePath: string): {width: number; height: number} | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const buf = fs.readFileSync(filePath);
  // PNG signature: 8 bytes. IHDR chunk: 4 (length) + 4 (type) + 4 (width) + 4 (height) = starts at offset 8.
  if (buf.length < 24) {
    return null;
  }
  const sig = buf.toString('hex', 0, 8);
  if (sig !== '89504e470d0a1a0a') {
    return null;
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return {width, height};
}

// ─── AC1: Android App Icon ────────────────────────────────────────────────────

describe('AC1 — Android App Icon', () => {
  const androidDensities = [
    {density: 'mipmap-mdpi', size: 48},
    {density: 'mipmap-hdpi', size: 72},
    {density: 'mipmap-xhdpi', size: 96},
    {density: 'mipmap-xxhdpi', size: 144},
    {density: 'mipmap-xxxhdpi', size: 192},
  ];

  androidDensities.forEach(({density, size}) => {
    it(`ic_launcher.png exists at ${size}×${size} in ${density}`, () => {
      const filePath = path.join(
        ROOT,
        `android/app/src/main/res/${density}/ic_launcher.png`,
      );
      const dims = readPngDimensions(filePath);
      expect(dims).not.toBeNull();
      expect(dims!.width).toBe(size);
      expect(dims!.height).toBe(size);
    });

    it(`ic_launcher_round.png exists at ${size}×${size} in ${density}`, () => {
      const filePath = path.join(
        ROOT,
        `android/app/src/main/res/${density}/ic_launcher_round.png`,
      );
      const dims = readPngDimensions(filePath);
      expect(dims).not.toBeNull();
      expect(dims!.width).toBe(size);
      expect(dims!.height).toBe(size);
    });
  });
});

// ─── AC2: iOS App Icon ────────────────────────────────────────────────────────

describe('AC2 — iOS App Icon', () => {
  const iosIcons = [
    {filename: 'Icon-20@2x.png', size: 40},
    {filename: 'Icon-20@3x.png', size: 60},
    {filename: 'Icon-29@2x.png', size: 58},
    {filename: 'Icon-29@3x.png', size: 87},
    {filename: 'Icon-40@2x.png', size: 80},
    {filename: 'Icon-40@3x.png', size: 120},
    {filename: 'Icon-60@2x.png', size: 120},
    {filename: 'Icon-60@3x.png', size: 180},
    {filename: 'Icon-1024.png', size: 1024},
  ];

  const appiconset = path.join(
    ROOT,
    'ios/TaskBell/Images.xcassets/AppIcon.appiconset',
  );

  iosIcons.forEach(({filename, size}) => {
    it(`iOS icon ${filename} exists at ${size}×${size}`, () => {
      const filePath = path.join(appiconset, filename);
      const dims = readPngDimensions(filePath);
      expect(dims).not.toBeNull();
      expect(dims!.width).toBe(size);
      expect(dims!.height).toBe(size);
    });
  });

  it('Contents.json has a filename for every image slot and those files exist', () => {
    const contentsPath = path.join(appiconset, 'Contents.json');
    expect(fs.existsSync(contentsPath)).toBe(true);
    const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));
    contents.images.forEach((img: {filename?: string}) => {
      expect(img.filename).toBeDefined();
      const iconPath = path.join(appiconset, img.filename!);
      expect(fs.existsSync(iconPath)).toBe(true);
    });
  });
});

// ─── AC3: Android Splash Screen ───────────────────────────────────────────────

describe('AC3 — Android Splash Screen configuration', () => {
  it('build.gradle includes core-splashscreen dependency', () => {
    const filePath = path.join(ROOT, 'android/app/build.gradle');
    const contents = fs.readFileSync(filePath, 'utf8');
    expect(contents).toContain('core-splashscreen');
  });

  it('colors.xml defines splashBackground colour', () => {
    const filePath = path.join(
      ROOT,
      'android/app/src/main/res/values/colors.xml',
    );
    expect(fs.existsSync(filePath)).toBe(true);
    const contents = fs.readFileSync(filePath, 'utf8');
    expect(contents).toContain('splashBackground');
  });

  it('styles.xml contains Theme.App.Starting with postSplashScreenTheme', () => {
    const filePath = path.join(
      ROOT,
      'android/app/src/main/res/values/styles.xml',
    );
    const contents = fs.readFileSync(filePath, 'utf8');
    expect(contents).toContain('Theme.App.Starting');
    expect(contents).toContain('Theme.SplashScreen');
    expect(contents).toContain('postSplashScreenTheme');
  });

  it('AndroidManifest.xml activity references Theme.App.Starting', () => {
    const filePath = path.join(
      ROOT,
      'android/app/src/main/AndroidManifest.xml',
    );
    const contents = fs.readFileSync(filePath, 'utf8');
    expect(contents).toContain('Theme.App.Starting');
  });

  it('MainActivity.kt calls installSplashScreen()', () => {
    const filePath = path.join(
      ROOT,
      'android/app/src/main/java/com/taskbell/MainActivity.kt',
    );
    const contents = fs.readFileSync(filePath, 'utf8');
    expect(contents).toContain('installSplashScreen');
  });
});

// ─── AC4: iOS Launch Screen ───────────────────────────────────────────────────

describe('AC4 — iOS LaunchScreen brand update', () => {
  it('LaunchScreen.storyboard uses TaskBell purple (#3A49F9) background', () => {
    const filePath = path.join(ROOT, 'ios/TaskBell/LaunchScreen.storyboard');
    const contents = fs.readFileSync(filePath, 'utf8');
    // Brand purple expressed as red=0.227 green=0.286 blue=0.976 in storyboard float notation
    expect(contents).toContain('3A49F9');
  });

  it('Info.plist still references LaunchScreen storyboard (unchanged)', () => {
    const filePath = path.join(ROOT, 'ios/TaskBell/Info.plist');
    const contents = fs.readFileSync(filePath, 'utf8');
    expect(contents).toContain('LaunchScreen');
  });
});
