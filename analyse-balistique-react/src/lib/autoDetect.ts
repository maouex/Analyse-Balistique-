/**
 * Auto-detection of impacts on a target image using Canvas API.
 *
 * Algorithm:
 * 1. Convert to grayscale
 * 2. Adaptive threshold (local mean) to handle variable lighting
 * 3. Morphological cleanup (erode then dilate) to remove noise
 * 4. Connected component labeling via flood-fill
 * 5. Filter components by size and circularity
 * 6. Return centroids as detected impact points
 */

import type { Point } from '../types';

export interface DetectionOptions {
  /** Minimum blob area in pixels (default: 20) */
  minArea?: number;
  /** Maximum blob area in pixels (default: 5000) */
  maxArea?: number;
  /** Adaptive threshold block radius in pixels (default: 15) */
  blockRadius?: number;
  /** Threshold offset — higher = stricter dark detection (default: 15) */
  thresholdOffset?: number;
  /** Minimum circularity 0-1, where 1 = perfect circle (default: 0.3) */
  minCircularity?: number;
  /** Region of interest — only detect within this radius from center (pixels). Null = full image */
  roiCenter?: Point | null;
  roiRadius?: number | null;
}

const DEFAULT_OPTIONS: Required<DetectionOptions> = {
  minArea: 20,
  maxArea: 5000,
  blockRadius: 15,
  thresholdOffset: 15,
  minCircularity: 0.3,
  roiCenter: null,
  roiRadius: null,
};

interface BlobInfo {
  area: number;
  perimeter: number;
  sumX: number;
  sumY: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Detect dark impact holes on a lighter target background.
 * Returns an array of image-coordinate Points for each detected impact.
 */
export function detectImpacts(
  image: HTMLImageElement,
  options: DetectionOptions = {},
): Point[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Draw image to offscreen canvas
  const w = image.width;
  const h = image.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  // Step 1: Grayscale
  const gray = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Step 2: Compute integral image for fast local mean
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    for (let x = 0; x < w; x++) {
      rowSum += gray[y * w + x];
      integral[(y + 1) * (w + 1) + (x + 1)] =
        rowSum + integral[y * (w + 1) + (x + 1)];
    }
  }

  // Step 3: Adaptive threshold — pixel is "dark" if below local mean - offset
  const binary = new Uint8Array(w * h); // 1 = dark (impact candidate)
  const br = opts.blockRadius;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const x1 = Math.max(0, x - br);
      const y1 = Math.max(0, y - br);
      const x2 = Math.min(w - 1, x + br);
      const y2 = Math.min(h - 1, y + br);
      const area = (x2 - x1 + 1) * (y2 - y1 + 1);
      const sum =
        integral[(y2 + 1) * (w + 1) + (x2 + 1)] -
        integral[y1 * (w + 1) + (x2 + 1)] -
        integral[(y2 + 1) * (w + 1) + x1] +
        integral[y1 * (w + 1) + x1];
      const localMean = sum / area;
      binary[y * w + x] = gray[y * w + x] < localMean - opts.thresholdOffset ? 1 : 0;
    }
  }

  // Step 4: Morphological erosion then dilation (3x3 kernel) to remove noise
  const eroded = morphErode(binary, w, h);
  const cleaned = morphDilate(eroded, w, h);

  // Step 5: Connected component labeling
  const labels = new Int32Array(w * h);
  let nextLabel = 1;
  const blobs = new Map<number, BlobInfo>();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (cleaned[y * w + x] === 1 && labels[y * w + x] === 0) {
        // ROI filter: skip if outside region of interest
        if (opts.roiCenter && opts.roiRadius) {
          const dx = x - opts.roiCenter.x;
          const dy = y - opts.roiCenter.y;
          if (dx * dx + dy * dy > opts.roiRadius * opts.roiRadius) continue;
        }

        const label = nextLabel++;
        const blob = floodFill(cleaned, labels, w, h, x, y, label, opts.roiCenter, opts.roiRadius);
        if (blob.area >= opts.minArea) {
          blobs.set(label, blob);
        }
      }
    }
  }

  // Step 6: Filter by size and circularity, return centroids
  const results: Point[] = [];

  for (const [, blob] of blobs) {
    if (blob.area < opts.minArea || blob.area > opts.maxArea) continue;

    // Circularity = 4π × area / perimeter²
    const circularity = blob.perimeter > 0
      ? (4 * Math.PI * blob.area) / (blob.perimeter * blob.perimeter)
      : 0;
    if (circularity < opts.minCircularity) continue;

    const cx = blob.sumX / blob.area;
    const cy = blob.sumY / blob.area;

    // Final ROI check on centroid
    if (opts.roiCenter && opts.roiRadius) {
      const dx = cx - opts.roiCenter.x;
      const dy = cy - opts.roiCenter.y;
      if (dx * dx + dy * dy > opts.roiRadius * opts.roiRadius) continue;
    }

    results.push({ x: cx, y: cy });
  }

  return results;
}

function floodFill(
  binary: Uint8Array,
  labels: Int32Array,
  w: number,
  h: number,
  startX: number,
  startY: number,
  label: number,
  roiCenter: Point | null,
  roiRadius: number | null,
): BlobInfo {
  const stack: number[] = [startX, startY];
  const blob: BlobInfo = {
    area: 0,
    perimeter: 0,
    sumX: 0,
    sumY: 0,
    minX: startX,
    minY: startY,
    maxX: startX,
    maxY: startY,
  };

  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    const idx = y * w + x;

    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    if (binary[idx] !== 1 || labels[idx] !== 0) continue;

    // ROI check
    if (roiCenter && roiRadius) {
      const dx = x - roiCenter.x;
      const dy = y - roiCenter.y;
      if (dx * dx + dy * dy > roiRadius * roiRadius) continue;
    }

    labels[idx] = label;
    blob.area++;
    blob.sumX += x;
    blob.sumY += y;
    if (x < blob.minX) blob.minX = x;
    if (y < blob.minY) blob.minY = y;
    if (x > blob.maxX) blob.maxX = x;
    if (y > blob.maxY) blob.maxY = y;

    // Check if border pixel (for perimeter)
    let isBorder = false;
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h || binary[ny * w + nx] === 0) {
        isBorder = true;
      }
    }
    if (isBorder) blob.perimeter++;

    // Push 4-neighbors
    stack.push(x - 1, y);
    stack.push(x + 1, y);
    stack.push(x, y - 1);
    stack.push(x, y + 1);
  }

  return blob;
}

function morphErode(src: Uint8Array, w: number, h: number): Uint8Array {
  const dst = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      // 3x3: pixel is 1 only if all neighbors are 1
      let all = 1;
      for (let dy = -1; dy <= 1 && all; dy++) {
        for (let dx = -1; dx <= 1 && all; dx++) {
          if (src[(y + dy) * w + (x + dx)] === 0) all = 0;
        }
      }
      dst[y * w + x] = all;
    }
  }
  return dst;
}

function morphDilate(src: Uint8Array, w: number, h: number): Uint8Array {
  const dst = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      // 3x3: pixel is 1 if any neighbor is 1
      let any = 0;
      for (let dy = -1; dy <= 1 && !any; dy++) {
        for (let dx = -1; dx <= 1 && !any; dx++) {
          if (src[(y + dy) * w + (x + dx)] === 1) any = 1;
        }
      }
      dst[y * w + x] = any;
    }
  }
  return dst;
}
