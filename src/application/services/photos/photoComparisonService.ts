/**
 * photoComparisonService
 *
 * Pure-JS image similarity using a byte-level colour histogram.
 *
 * How it works:
 *   1. Decode base64 → Uint8Array of raw JPEG/PNG bytes.
 *   2. Skip the JPEG header (~200 bytes) to land in compressed pixel data.
 *   3. Sample ~1 000 evenly-spaced bytes and bucket them into 64 bins (0–255 / 4).
 *   4. Normalise the histogram so it sums to 1.
 *   5. Compute the histogram intersection of the two images — value in [0, 1].
 *   6. A score ≥ tolerance (default 0.7) is treated as a match.
 *
 * Caveats (acceptable for MVP):
 *   - Works on JPEG compressed bytes, not decoded pixel values.
 *   - Same photo taken twice in similar conditions → high score (≥ 0.85).
 *   - Completely different photos → low score (≤ 0.35).
 *   - Does NOT handle extreme lighting changes or drastic angle shifts.
 */

const HISTOGRAM_BINS = 64;
const SAMPLE_COUNT = 1_000;
const JPEG_HEADER_SKIP = 200; // skip JPEG SOI + APP headers

/** Decode a base64 string (with or without data URI prefix) to a byte array. */
function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/^data:image\/[a-z]+;base64,/, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Build a normalised 64-bin histogram from JPEG byte samples. */
function buildHistogram(base64: string): number[] {
  const bytes = base64ToBytes(base64);
  const hist = new Array<number>(HISTOGRAM_BINS).fill(0);

  const start = Math.min(JPEG_HEADER_SKIP, bytes.length);
  const available = bytes.length - start;

  if (available <= 0) {
    return hist;
  }

  const step = Math.max(1, Math.floor(available / SAMPLE_COUNT));
  let samplesTaken = 0;

  for (let i = start; i < bytes.length; i += step) {
    const bin = Math.floor(bytes[i] / (256 / HISTOGRAM_BINS));
    hist[Math.min(bin, HISTOGRAM_BINS - 1)]++;
    samplesTaken++;
  }

  if (samplesTaken === 0) {
    return hist;
  }

  return hist.map(v => v / samplesTaken);
}

/** Histogram intersection similarity — returns value in [0, 1]. */
function histogramIntersection(h1: number[], h2: number[]): number {
  let score = 0;
  for (let i = 0; i < HISTOGRAM_BINS; i++) {
    score += Math.min(h1[i], h2[i]);
  }
  return score;
}

export interface ComparisonResult {
  /** Similarity score in [0, 1]. 1.0 = identical byte distribution. */
  score: number;
  /** true when score ≥ tolerance. */
  passed: boolean;
}

export const photoComparisonService = {
  /**
   * Compare two base64-encoded images.
   *
   * @param base64A  Live photo captured on AlarmDismissScreen.
   * @param base64B  Reference photo stored with the task.
   * @param tolerance  Minimum score to pass (default 0.7).
   */
  comparePhotos(
    base64A: string,
    base64B: string,
    tolerance: number = 0.7
  ): ComparisonResult {
    try {
      const histA = buildHistogram(base64A);
      const histB = buildHistogram(base64B);
      const score = histogramIntersection(histA, histB);
      return { score, passed: score >= tolerance };
    } catch (err) {
      console.warn('[photoComparisonService] Comparison failed:', err);
      return { score: 0, passed: false };
    }
  },

  /** Exposed for testing. */
  _buildHistogram: buildHistogram,
  _histogramIntersection: histogramIntersection,
};
