/**
 * Auto-detection of small dark impact dots on a light target.
 *
 * Optimized for: black pellet holes (3-15px) on white/light paper.
 *
 * Algorithm:
 * 1. Grayscale conversion
 * 2. Light Gaussian blur (σ=1) to reduce camera noise
 * 3. Dual threshold: absolute darkness + local contrast
 * 4. NO erosion (would destroy tiny dots)
 * 5. Optional 1px dilation to merge touching pixels
 * 6. Connected component labeling
 * 7. Filter by area (very small min) and return centroids
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

  // Step 2: Light Gaussian blur (3x3, σ≈1) to suppress camera noise
  const blurred = gaussianBlur3x3(gray, w, h);

  // Step 3: Compute integral image for fast local mean
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    for (let x = 0; x < w; x++) {
      rowSum += blurred[y * w + x];
      integral[(y + 1) * (w + 1) + (x + 1)] =
        rowSum + integral[y * (w + 1) + (x + 1)];
    }
  }

  // Step 4: Dual threshold — a pixel is "dark" if:
  //   (a) it's absolutely dark (below global threshold), OR
  //   (b) it's significantly darker than its local neighborhood
  //
  // Sensitivity maps:
  //   - Higher sensitivity → higher absolute threshold (more pixels qualify)
  //   - Higher sensitivity → lower local contrast needed
  const absThreshold = 60 + sensitivity * 1.6;  // 60..220
  const localBlockR = 12;  // radius for local mean computation
  const localOffset = 30 - sensitivity * 0.25;  // 30..5  (contrast needed below local mean)

  const binary = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // ROI early exit
      if (roiCenter && roiRadius) {
        const dx = x - roiCenter.x;
        const dy = y - roiCenter.y;
        if (dx * dx + dy * dy > roiRadius * roiRadius) continue;
      }

      const val = blurred[y * w + x];

      // (a) Absolute darkness test
      if (val < absThreshold) {
        // (b) Also check local contrast to avoid marking large dark areas
        //     (like shadows or dark target regions) as impacts
        const x1 = Math.max(0, x - localBlockR);
        const y1 = Math.max(0, y - localBlockR);
        const x2 = Math.min(w - 1, x + localBlockR);
        const y2 = Math.min(h - 1, y + localBlockR);
        const area = (x2 - x1 + 1) * (y2 - y1 + 1);
        const sum =
          integral[(y2 + 1) * (w + 1) + (x2 + 1)] -
          integral[y1 * (w + 1) + (x2 + 1)] -
          integral[(y2 + 1) * (w + 1) + x1] +
          integral[y1 * (w + 1) + x1];
        const localMean = sum / area;

        // Pixel must be darker than local mean by at least localOffset
        if (val < localMean - localOffset) {
          binary[y * w + x] = 1;
        }
      }
    }
  }

  // Step 5: Light dilation (3x3) to connect adjacent dark pixels into blobs
  // NO erosion — it would destroy 3-5px dots entirely
  const dilated = morphDilate(binary, w, h);

  // Step 6: Connected component labeling via flood-fill
  const labels = new Int32Array(w * h);
  let nextLabel = 1;

  interface BlobInfo {
    area: number;
    sumX: number;
    sumY: number;
    // Count of original (pre-dilation) dark pixels — for scoring
    corePixels: number;
  }

  const blobs = new Map<number, BlobInfo>();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (dilated[y * w + x] === 1 && labels[y * w + x] === 0) {
        const label = nextLabel++;
        const blob = floodFill(dilated, binary, labels, w, h, x, y, label);
        blobs.set(label, blob);
      }
    }
  }

  // Step 7: Filter and return centroids
  const results: Point[] = [];

  for (const [, blob] of blobs) {
    // Use core pixels (pre-dilation) for area filtering — more accurate
    const effectiveArea = blob.corePixels;
    if (effectiveArea < minArea || effectiveArea > maxArea) continue;

    const cx = blob.sumX / blob.area;
    const cy = blob.sumY / blob.area;

    // Final ROI check on centroid
    if (roiCenter && roiRadius) {
      const dx = cx - roiCenter.x;
      const dy = cy - roiCenter.y;
      if (dx * dx + dy * dy > roiRadius * roiRadius) continue;
    }

    results.push({ x: cx, y: cy });
  }

  return results;
}

function floodFill(
  dilated: Uint8Array,
  original: Uint8Array,
  labels: Int32Array,
  w: number,
  h: number,
  startX: number,
  startY: number,
  label: number,
) {
  const stack: number[] = [startX, startY];
  const blob = { area: 0, sumX: 0, sumY: 0, corePixels: 0 };

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
    if (original[idx] === 1) blob.corePixels++;

    stack.push(x - 1, y);
    stack.push(x + 1, y);
    stack.push(x, y - 1);
    stack.push(x, y + 1);
  }

  return blob;
}

function gaussianBlur3x3(src: Uint8Array, w: number, h: number): Uint8Array {
  // Kernel: [1 2 1; 2 4 2; 1 2 1] / 16
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
      dst[y * w + x] = (val + 8) >> 4; // divide by 16 with rounding
    }
  }
  // Copy edges
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
