import { useCallback, useEffect, useState } from 'react';
import { EPLDataset } from '../types';

export type DataState =
  | { status: 'loading' }
  | { status: 'ready'; dataset: EPLDataset }
  | { status: 'error'; error: string; retry: () => void };

/** Loads the bundled dashboard dataset (`src/data/eplData.json`). */
export function useEPLData(): DataState {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<DataState>({ status: 'loading' });
  const retry = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    import('../data/eplData.json')
      .then((mod) => {
        if (cancelled) return;
        setState({ status: 'ready', dataset: (mod.default ?? mod) as unknown as EPLDataset });
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
