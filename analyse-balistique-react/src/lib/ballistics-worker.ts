/**
 * Web Worker for ballistics simulation.
 * Offloads heavy RK2 integration from the main/render thread.
 */

import { simulateSpread } from './ballistics-sim';
import type { BallisticParams, SimulationResult } from './ballistics-sim';

export interface WorkerRequest {
  id: number;
  params: BallisticParams;
  distanceM: number;
  impactPositionsCm: Array<{ x: number; y: number }>;
}

export interface WorkerResponse {
  id: number;
  result: SimulationResult;
  durationMs: number;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, params, distanceM, impactPositionsCm } = e.data;
  const t0 = performance.now();
  const result = simulateSpread(params, distanceM, impactPositionsCm);
  const durationMs = performance.now() - t0;

  self.postMessage({ id, result, durationMs } satisfies WorkerResponse);
};
