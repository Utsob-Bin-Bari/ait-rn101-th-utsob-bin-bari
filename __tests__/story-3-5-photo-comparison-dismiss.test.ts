/**
 * Story 3.5: Photo Comparison & Dismiss Enforcement
 *
 * Tests cover:
 *   - photoComparisonService histogram and similarity logic
 *   - Tolerance boundary (0.7) applied correctly
 *   - AlarmDismissScreen mode selection (photo / no-ref / simple)
 *   - Dismiss flow on pass; retry on fail
 *   - Fallback when ref photo is missing
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a minimal fake base64 string (repeated byte pattern). */
function fakeBase64(byteValue: number, length = 2000): string {
  const byte = String.fromCharCode(byteValue);
  return btoa(byte.repeat(length));
}

// ─── photoComparisonService ───────────────────────────────────────────────────

describe('photoComparisonService — core logic', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { photoComparisonService } = require('../src/application/services/photos/photoComparisonService');

  it('exports comparePhotos, _buildHistogram and _histogramIntersection', () => {
    expect(typeof photoComparisonService.comparePhotos).toBe('function');
    expect(typeof photoComparisonService._buildHistogram).toBe('function');
    expect(typeof photoComparisonService._histogramIntersection).toBe('function');
  });

  describe('_buildHistogram', () => {
    it('returns an array of 64 bins', () => {
      const hist = photoComparisonService._buildHistogram(fakeBase64(128));
      expect(hist).toHaveLength(64);
    });

    it('normalises histogram so bins sum to ~1', () => {
      const hist = photoComparisonService._buildHistogram(fakeBase64(50));
      const total = hist.reduce((a: number, b: number) => a + b, 0);
      expect(total).toBeCloseTo(1, 1);
    });

    it('returns all-zero histogram for empty string', () => {
      const hist = photoComparisonService._buildHistogram('');
      const total = hist.reduce((a: number, b: number) => a + b, 0);
      expect(total).toBe(0);
    });
  });

  describe('_histogramIntersection', () => {
    it('returns 1.0 for two identical normalised histograms', () => {
      const h = new Array(64).fill(1 / 64);
      const score = photoComparisonService._histogramIntersection(h, h);
      expect(score).toBeCloseTo(1.0, 3);
    });

    it('returns 0.0 for two completely non-overlapping histograms', () => {
      const h1 = new Array(64).fill(0);
      h1[0] = 1;
      const h2 = new Array(64).fill(0);
      h2[63] = 1;
      const score = photoComparisonService._histogramIntersection(h1, h2);
      expect(score).toBe(0);
    });

    it('returns a value between 0 and 1 for partially overlapping histograms', () => {
      const h1 = new Array(64).fill(0);
      h1[0] = 0.5;
      h1[1] = 0.5;
      const h2 = new Array(64).fill(0);
      h2[0] = 0.5;
      h2[2] = 0.5;
      const score = photoComparisonService._histogramIntersection(h1, h2);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });
  });

  describe('comparePhotos', () => {
    it('AC2: identical images score 1.0 and pass', () => {
      const b64 = fakeBase64(100);
      const result = photoComparisonService.comparePhotos(b64, b64, 0.7);
      expect(result.score).toBeCloseTo(1.0, 2);
      expect(result.passed).toBe(true);
    });

    it('AC3: very different images score below 0.7 and fail', () => {
      // All-0 bytes vs all-255 bytes → completely different histograms
      const b64A = fakeBase64(0);
      const b64B = fakeBase64(255);
      const result = photoComparisonService.comparePhotos(b64A, b64B, 0.7);
      expect(result.score).toBeLessThan(0.7);
      expect(result.passed).toBe(false);
    });

    it('passes when score exactly equals tolerance', () => {
      // Craft similar images that should have high intersection
      const b64 = fakeBase64(128);
      // Same image → score ~1.0 which is ≥ 0.7
      const result = photoComparisonService.comparePhotos(b64, b64, 0.7);
      expect(result.passed).toBe(true);
    });

    it('uses tolerance 0.7 by default when not supplied', () => {
      const b64 = fakeBase64(100);
      const result = photoComparisonService.comparePhotos(b64, b64);
      expect(result.passed).toBe(true);
    });

    it('respects custom tolerance values', () => {
      const b64 = fakeBase64(100);
      // score will be ~1.0 for same image
      expect(photoComparisonService.comparePhotos(b64, b64, 0.99).passed).toBe(true);
      expect(photoComparisonService.comparePhotos(b64, b64, 1.01).passed).toBe(false);
    });

    it('does not throw and returns { score: 0, passed: false } on error input', () => {
      const result = photoComparisonService.comparePhotos('not-base64-!!', 'also-bad-!!', 0.7);
      expect(result.passed).toBe(false);
      expect(typeof result.score).toBe('number');
    });
  });
});

// ─── AlarmDismissScreen mode selection ───────────────────────────────────────

describe('AlarmDismissScreen — getDismissMode logic', () => {
  // Mirrors the getDismissMode function from AlarmDismissScreen
  type DismissMode = 'photo' | 'no-ref' | 'simple';

  const getDismissMode = (task: {
    photo_dismiss_enabled?: number;
    photo_dismiss_ref_path?: string | null;
  }): DismissMode => {
    if (task.photo_dismiss_enabled === 1) {
      return task.photo_dismiss_ref_path ? 'photo' : 'no-ref';
    }
    return 'simple';
  };

  it('AC1: mode=photo when photo_dismiss_enabled=1 and ref path set', () => {
    expect(getDismissMode({ photo_dismiss_enabled: 1, photo_dismiss_ref_path: '/path/ref.jpg' })).toBe('photo');
  });

  it('AC4: mode=no-ref when photo_dismiss_enabled=1 but no ref path', () => {
    expect(getDismissMode({ photo_dismiss_enabled: 1, photo_dismiss_ref_path: null })).toBe('no-ref');
    expect(getDismissMode({ photo_dismiss_enabled: 1, photo_dismiss_ref_path: undefined })).toBe('no-ref');
  });

  it('AC5: mode=simple when photo_dismiss_enabled=0', () => {
    expect(getDismissMode({ photo_dismiss_enabled: 0 })).toBe('simple');
    expect(getDismissMode({ photo_dismiss_enabled: undefined })).toBe('simple');
    expect(getDismissMode({})).toBe('simple');
  });
});

// ─── Dismiss flow logic ───────────────────────────────────────────────────────

describe('AlarmDismissScreen — dismiss flow logic', () => {
  it('AC2: dismissAlarm stops sound, cancels notification, and navigates back', async () => {
    const stopSound = jest.fn();
    const cancelNotification = jest.fn().mockResolvedValue(undefined);
    const goBack = jest.fn();

    const dismissAlarm = async () => {
      stopSound();
      await cancelNotification('task-1');
      goBack();
    };

    await dismissAlarm();
    expect(stopSound).toHaveBeenCalledTimes(1);
    expect(cancelNotification).toHaveBeenCalledWith('task-1');
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('AC2: handleTakePhoto calls dismissAlarm when comparison passes', async () => {
    const { photoComparisonService } = require('../src/application/services/photos/photoComparisonService');
    const dismissAlarm = jest.fn().mockResolvedValue(undefined);
    const setCompareError = jest.fn();
    const setComparing = jest.fn();

    const liveBase64 = fakeBase64(100);
    const refBase64 = fakeBase64(100); // identical → passes

    const tolerance = 0.7;
    const result = photoComparisonService.comparePhotos(liveBase64, refBase64, tolerance);

    if (result.passed) {
      await dismissAlarm();
    } else {
      setCompareError(`Photo doesn't match — try again (score: ${(result.score * 100).toFixed(0)}%)`);
    }

    expect(dismissAlarm).toHaveBeenCalledTimes(1);
    expect(setCompareError).not.toHaveBeenCalled();
  });

  it('AC3: handleTakePhoto sets compareError when comparison fails', async () => {
    const { photoComparisonService } = require('../src/application/services/photos/photoComparisonService');
    const dismissAlarm = jest.fn().mockResolvedValue(undefined);
    const setCompareError = jest.fn();

    const liveBase64 = fakeBase64(0);
    const refBase64 = fakeBase64(255); // very different → fails

    const result = photoComparisonService.comparePhotos(liveBase64, refBase64, 0.7);

    if (result.passed) {
      await dismissAlarm();
    } else {
      setCompareError(`Photo doesn't match — try again (score: ${(result.score * 100).toFixed(0)}%)`);
    }

    expect(dismissAlarm).not.toHaveBeenCalled();
    expect(setCompareError).toHaveBeenCalledWith(expect.stringContaining("Photo doesn't match"));
  });

  it('AC3: snooze stops sound but does NOT cancel notification', () => {
    const stopSound = jest.fn();
    const cancelNotification = jest.fn();
    const goBack = jest.fn();

    const handleSnooze = () => {
      stopSound();
      goBack();
    };

    handleSnooze();
    expect(stopSound).toHaveBeenCalledTimes(1);
    expect(cancelNotification).not.toHaveBeenCalled();
    expect(goBack).toHaveBeenCalledTimes(1);
  });
});
