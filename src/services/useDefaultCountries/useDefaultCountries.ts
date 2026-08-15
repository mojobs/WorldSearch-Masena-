import { useCallback, useEffect, useState } from 'react';
import { API_BASE, FIELDS, parseApiError, type ApiSuccessResponse, type Country } from '../countriesApi';

const DEFAULT_LIMIT = 10;
const TOP_N = 20;

type DefaultCountriesStatus = 'loading' | 'success' | 'error';

interface UseDefaultCountriesResult {
  countries: Country[];
  status: DefaultCountriesStatus;
  error: string | null;
  retry: () => void;
}

export function useDefaultCountries(apiKey: string): UseDefaultCountriesResult {
  const [countries, setCountries] = useState<Country[]>([]);
  const [status, setStatus] = useState<DefaultCountriesStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function load() {
      try {
        const url = `${API_BASE}?response_fields=${FIELDS}&limit=${DEFAULT_LIMIT}`;
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
        setCountries(sorted.slice(0, TOP_N));
        setStatus('success');
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
  }, [apiKey, reloadToken]);

  const retry = useCallback(() => {
    setStatus('loading');
    setError(null);
    setReloadToken((t) => t + 1);
  }, []);

  return { countries, status, error, retry };
}
