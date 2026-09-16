import { useCallback, useEffect, useState } from 'react';
import { EPLDataset } from '../types';
import { isEPLDataset } from '../lib/validateDataset';

export type DataState =
  | { status: 'loading' }
  | { status: 'ready'; dataset: EPLDataset }
  | { status: 'error'; error: string; retry: () => void };

const REMOTE_DATA_TIMEOUT_MS = 10_000;

/**
 * Async dataset loader. Today it resolves the bundled `eplData.json`;
 * when `VITE_DATA_URL` is set it fetches remote JSON instead (same schema),
 * which is the seam a future live API plugs into. Bundled data remains the
 * offline fallback.
 */
export function useEPLData(): DataState {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<DataState>({ status: 'loading' });
  const retry = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    const load = async (): Promise<EPLDataset> => {
      const remoteUrl = import.meta.env.VITE_DATA_URL as string | undefined;
      if (remoteUrl) {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), REMOTE_DATA_TIMEOUT_MS);
        try {
          const res = await fetch(remoteUrl, { signal: controller.signal });
          if (!res.ok) {
            throw new Error(`Data fetch failed (${res.status} ${res.statusText}) from ${remoteUrl}.`);
          }
          return (await res.json()) as EPLDataset;
        } catch (error) {
          if (controller.signal.aborted) {
            throw new Error(`Data fetch timed out after ${REMOTE_DATA_TIMEOUT_MS / 1000}s.`);
          }
          throw error;
        } finally {
          window.clearTimeout(timeoutId);
        }
      }
      const mod = await import('../data/eplData.json');
      return (mod.default ?? mod) as unknown as EPLDataset;
    };

    load()
      .then((dataset) => {
        if (cancelled) return;
        if (!isEPLDataset(dataset)) {
          throw new Error('Dataset loaded but failed schema validation.');
        }
        setState({ status: 'ready', dataset });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown data loading error.',
          retry,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [nonce, retry]);

  return state;
}
