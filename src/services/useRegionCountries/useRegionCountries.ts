import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE, FIELDS, parseApiError, type ApiSuccessResponse, type Country } from '../countriesApi';

const LIMIT = 100;

type RegionStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface UseRegionCountriesResult {
  countries: Country[];
  status: RegionStatus;
  error: string | null;
  retry: () => void;
}

export function useRegionCountries(apiKey: string, region: string | null): UseRegionCountriesResult {
  const [countries, setCountries] = useState<Country[]>([]);
  const [status, setStatus] = useState<RegionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const cacheRef = useRef<Map<string, Country[]>>(new Map());

  useEffect(() => {
    if (!region) return;

    const cached = cacheRef.current.get(region);
    if (cached) {
      setCountries(cached);
      setStatus(cached.length ? 'success' : 'empty');
      setError(null);
      return;
    }

    let ignore = false;
    const controller = new AbortController();
    setStatus('loading');

    async function load() {
      try {
        const url = `${API_BASE}?region=${encodeURIComponent(region as string)}&response_fields=${FIELDS}&limit=${LIMIT}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw await parseApiError(res);
        }

        const json = (await res.json()) as ApiSuccessResponse;
        const objects = json.data?.objects ?? [];
        const sorted = [...objects].sort((a, b) => a.names.common.localeCompare(b.names.common));

        if (ignore) return;
        cacheRef.current.set(region as string, sorted);
        setCountries(sorted);
        setStatus(sorted.length ? 'success' : 'empty');
        setError(null);
      } catch (err) {
        if (ignore) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;

        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
        setStatus('error');
      }
    }

    void load();

    return () => {
      ignore = true;
      controller.abort();
    };
    // reloadToken drives no logic here — bumping it just forces this effect
    // (and therefore a fresh fetch) to re-run when retry() is called.
  }, [apiKey, region, reloadToken]);

  const retry = useCallback(() => {
    setStatus('loading');
    setError(null);
    setReloadToken((t) => t + 1);
  }, []);

  return {
    countries: region ? countries : [],
    status: region ? status : 'idle',
    error: region ? error : null,
    retry,
  };
}
