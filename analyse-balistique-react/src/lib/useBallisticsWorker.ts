import { useRef, useEffect, useState, useCallback } from 'react';
import type { BallisticParams, SimulationResult } from './ballistics-sim';
import type { WorkerRequest, WorkerResponse } from './ballistics-worker';

/**
 * Hook that runs ballistics simulation in a Web Worker.
 * Falls back to main-thread synchronous execution if workers unavailable.
 */
export function useBallisticsWorker(
  ballisticParams: BallisticParams | null,
  distanceM: number,
  impactPositionsCm: Array<{ x: number; y: number }>,
) {
  const workerRef = useRef<Worker | null>(null);
  const idRef = useRef(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [computing, setComputing] = useState(false);

  // Create worker on mount
  useEffect(() => {
    try {
      const worker = new Worker(
        new URL('./ballistics-worker.ts', import.meta.url),
        { type: 'module' }
      );
      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const resp = e.data;
        // Only accept latest request
        if (resp.id === idRef.current) {
          setResult(resp.result);
          setComputing(false);
        }
      };
      worker.onerror = () => {
        // Worker failed — fall back to sync
        workerRef.current = null;
      };
      workerRef.current = worker;
    } catch {
      // Workers not supported — fall back
      workerRef.current = null;
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  // Dispatch simulation when params change
  useEffect(() => {
    if (!ballisticParams || impactPositionsCm.length === 0) {
      setResult(null);
      setComputing(false);
      return;
    }

    const id = ++idRef.current;
    setComputing(true);

    if (workerRef.current) {
      // Worker path
      const msg: WorkerRequest = { id, params: ballisticParams, distanceM, impactPositionsCm };
      workerRef.current.postMessage(msg);
    } else {
      // Sync fallback (import dynamically to avoid bundling twice)
      import('./ballistics-sim').then(({ simulateSpread }) => {
        if (id !== idRef.current) return; // stale
        const res = simulateSpread(ballisticParams, distanceM, impactPositionsCm);
        setResult(res);
        setComputing(false);
      });
    }
  }, [ballisticParams, distanceM, impactPositionsCm]);

  const clear = useCallback(() => {
    idRef.current++;
    setResult(null);
    setComputing(false);
  }, []);

  return { simResult: result, computing, clear };
}
