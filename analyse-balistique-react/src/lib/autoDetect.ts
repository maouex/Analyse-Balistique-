/**
 * Auto-detection of small dark impact dots on a light target.
 *
 * Optimized for: black pellet holes (3-15px) on white/light paper.
 *
 * Two-pass algorithm:
 * Pass 1: Adaptive threshold to find obvious dark spots
 * Pass 2: Learn the brightness profile of detected impacts, then
 *          sweep again with relaxed thresholds to catch identical
 *          dots that were missed due to local lighting variations.
 */

import type { Point } from '../types';

export interface DetectionOptions {
  /** Minimum blob area in pixels (default: 3) */
  minArea?: number;
  /** Maximum blob area in pixels (default: 8000) */
  maxArea?: number;
  /** Sensitivity 0-100: higher = detect more (default: 50) */
  sensitivity?: number;
  /** Region of interest center (image coords) */
  roiCenter?: Point | null;
  /** Region of interest radius in pixels */
  roiRadius?: number | null;
}

interface BlobInfo {
  area: number;
  sumX: number;
  sumY: number;
  corePixels: number;
  /** Sum of gray values of core pixels — for brightness profiling */
  brightnessSum: number;
}

/**
 * Detect dark impact holes on a lighter target background.
 */
export function detectImpacts(
  image: HTMLImageElement,
  options: DetectionOptions = {},
): Point[] {
  const {
    minArea = 3,
    maxArea = 8000,
    sensitivity = 50,
    roiCenter = null,
    roiRadius = null,
  } = options;

  const w = image.width;
  const h = image.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, w, h).data;

  // Step 1: Grayscale
  const gray = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = Math.round(
      0.299 * pixels[i * 4] + 0.587 * pixels[i * 4 + 1] + 0.114 * pixels[i * 4 + 2],
    );
  }

  // Step 2: Light Gaussian blur to suppress camera noise
  const blurred = gaussianBlur3x3(gray, w, h);

  // Step 3: Integral image for fast local mean
  const integral = buildIntegral(blurred, w, h);

  // ────────────────────────────────────────────────────────────
  // PASS 1: Adaptive threshold
  // ────────────────────────────────────────────────────────────
  const absThreshold = 60 + sensitivity * 1.6;        // 60..220
  const localBlockR = 25;                              // larger = more stable mean
  const localOffset = 28 - sensitivity * 0.24;         // 28..4

  const binary1 = thresholdPass(
    blurred, integral, w, h,
    absThreshold, localBlockR, localOffset,
    roiCenter, roiRadius,
  );

  const dilated1 = morphDilate(binary1, w, h);
  const { results: pass1Results, blobs: pass1Blobs } = extractBlobs(
    dilated1, binary1, blurred, w, h, minArea, maxArea, roiCenter, roiRadius,
  );

  // ────────────────────────────────────────────────────────────
  // PASS 2: Learn from pass 1, sweep again with relaxed thresholds
  // ────────────────────────────────────────────────────────────
  if (pass1Blobs.length === 0) {
    return pass1Results;
  }

  // Compute brightness profile of detected impacts
  const brightnesses = pass1Blobs.map(b => b.brightnessSum / b.corePixels);
  brightnesses.sort((a, b) => a - b);
  const medianBrightness = brightnesses[Math.floor(brightnesses.length / 2)];

  // Areas of detected impacts
  const areas = pass1Blobs.map(b => b.corePixels);
  areas.sort((a, b) => a - b);
  const medianArea = areas[Math.floor(areas.length / 2)];

  // Pass 2: use the learned brightness as absolute threshold (with margin)
  // and relax the local contrast requirement significantly
  const pass2AbsThreshold = Math.min(255, medianBrightness + 40 + sensitivity * 0.5);
  const pass2LocalOffset = Math.max(2, localOffset * 0.4); // much more lenient
  const pass2MinArea = Math.max(2, Math.floor(medianArea * 0.4));
  const pass2MaxArea = Math.max(maxArea, medianArea * 5);

  const binary2 = thresholdPass(
    blurred, integral, w, h,
    pass2AbsThreshold, localBlockR, pass2LocalOffset,
    roiCenter, roiRadius,
  );

  const dilated2 = morphDilate(binary2, w, h);
  const { results: pass2Results } = extractBlobs(
    dilated2, binary2, blurred, w, h, pass2MinArea, pass2MaxArea, roiCenter, roiRadius,
  );

  // Merge: add pass 2 results that are not too close to existing pass 1 results
  const merged = [...pass1Results];
  const minDistSq = 10 * 10; // minimum 10px between impacts to avoid duplicates

  for (const p2 of pass2Results) {
    let tooClose = false;
    for (const p1 of merged) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      if (dx * dx + dy * dy < minDistSq) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) {
      merged.push(p2);
    }
  }

  return merged;
}

// ─── Helpers ──────────────────────────────────────────────────

function buildIntegral(src: Uint8Array, w: number, h: number): Float64Array {
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    for (let x = 0; x < w; x++) {
      rowSum += src[y * w + x];
      integral[(y + 1) * (w + 1) + (x + 1)] =
        rowSum + integral[y * (w + 1) + (x + 1)];
    }
  }
  return integral;
}

function localMean(
  integral: Float64Array, w: number, h: number,
  x: number, y: number, radius: number,
): number {
  const x1 = Math.max(0, x - radius);
  const y1 = Math.max(0, y - radius);
  const x2 = Math.min(w - 1, x + radius);
  const y2 = Math.min(h - 1, y + radius);
  const area = (x2 - x1 + 1) * (y2 - y1 + 1);
  const sum =
    integral[(y2 + 1) * (w + 1) + (x2 + 1)] -
    integral[y1 * (w + 1) + (x2 + 1)] -
    integral[(y2 + 1) * (w + 1) + x1] +
    integral[y1 * (w + 1) + x1];
  return sum / area;
}

function thresholdPass(
  blurred: Uint8Array,
  integral: Float64Array,
  w: number, h: number,
  absThreshold: number,
  blockR: number,
  offset: number,
  roiCenter: Point | null,
  roiRadius: number | null,
): Uint8Array {
  const binary = new Uint8Array(w * h);
  const roiR2 = roiRadius ? roiRadius * roiRadius : 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (roiCenter && roiRadius) {
        const dx = x - roiCenter.x;
        const dy = y - roiCenter.y;
        if (dx * dx + dy * dy > roiR2) continue;
      }

      const val = blurred[y * w + x];
      if (val < absThreshold) {
        const mean = localMean(integral, w, h, x, y, blockR);
        if (val < mean - offset) {
          binary[y * w + x] = 1;
        }
      }
    }
  }
  return binary;
}

function extractBlobs(
  dilated: Uint8Array,
  original: Uint8Array,
  blurred: Uint8Array,
  w: number, h: number,
  minArea: number, maxArea: number,
  roiCenter: Point | null, roiRadius: number | null,
): { results: Point[]; blobs: BlobInfo[] } {
  const labels = new Int32Array(w * h);
  let nextLabel = 1;
  const allBlobs: BlobInfo[] = [];
  const results: Point[] = [];
  const roiR2 = roiRadius ? roiRadius * roiRadius : 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (dilated[y * w + x] === 1 && labels[y * w + x] === 0) {
        const label = nextLabel++;
        const blob = floodFill(dilated, original, blurred, labels, w, h, x, y, label);

        const effectiveArea = blob.corePixels;
        if (effectiveArea < minArea || effectiveArea > maxArea) continue;

        const cx = blob.sumX / blob.area;
        const cy = blob.sumY / blob.area;

        if (roiCenter && roiRadius) {
          const dx = cx - roiCenter.x;
          const dy = cy - roiCenter.y;
          if (dx * dx + dy * dy > roiR2) continue;
        }

        results.push({ x: cx, y: cy });
        allBlobs.push(blob);
      }
    }
  }

  return { results, blobs: allBlobs };
}

function floodFill(
  dilated: Uint8Array,
  original: Uint8Array,
  blurred: Uint8Array,
  labels: Int32Array,
  w: number, h: number,
  startX: number, startY: number,
  label: number,
): BlobInfo {
  const stack: number[] = [startX, startY];
  const blob: BlobInfo = { area: 0, sumX: 0, sumY: 0, corePixels: 0, brightnessSum: 0 };

  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    const idx = y * w + x;

    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    if (dilated[idx] !== 1 || labels[idx] !== 0) continue;

    labels[idx] = label;
    blob.area++;
    blob.sumX += x;
    blob.sumY += y;
    if (original[idx] === 1) {
      blob.corePixels++;
      blob.brightnessSum += blurred[idx];
    }

    stack.push(x - 1, y);
    stack.push(x + 1, y);
    stack.push(x, y - 1);
    stack.push(x, y + 1);
  }

  return blob;
}

function gaussianBlur3x3(src: Uint8Array, w: number, h: number): Uint8Array {
  const dst = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const val =
        src[(y - 1) * w + x - 1] +
        src[(y - 1) * w + x] * 2 +
        src[(y - 1) * w + x + 1] +
        src[y * w + x - 1] * 2 +
        src[y * w + x] * 4 +
        src[y * w + x + 1] * 2 +
        src[(y + 1) * w + x - 1] +
        src[(y + 1) * w + x] * 2 +
        src[(y + 1) * w + x + 1];
      dst[y * w + x] = (val + 8) >> 4;
    }
  }
  for (let x = 0; x < w; x++) {
    dst[x] = src[x];
    dst[(h - 1) * w + x] = src[(h - 1) * w + x];
  }
  for (let y = 0; y < h; y++) {
    dst[y * w] = src[y * w];
    dst[y * w + w - 1] = src[y * w + w - 1];
  }
  return dst;
}

function morphDilate(src: Uint8Array, w: number, h: number): Uint8Array {
  const dst = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (
        src[y * w + x] ||
        src[(y - 1) * w + x] ||
        src[(y + 1) * w + x] ||
        src[y * w + x - 1] ||
        src[y * w + x + 1]
      ) {
        dst[y * w + x] = 1;
      }
    }
  }
  return dst;
}
