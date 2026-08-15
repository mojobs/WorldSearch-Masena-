import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE, FIELDS, parseApiError, type Country, type ApiSuccessResponse } from '../countriesApi';

export type { Country };

const DEBOUNCE_MS = 250;
const MIN_CHARS = 2;

type SearchStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface UseCountrySearchResult {
  query: string;
  results: Country[];
  status: SearchStatus;
  error: string | null;
  search: (rawTerm: string) => void;
}

/**
 * useCountrySearch
 *
 * Debounces user input, cancels stale in-flight requests, and caches
 * results client-side so repeat searches (including backspacing to a
 * previous prefix) resolve instantly with no network round trip.
 */
export function useCountrySearch(apiKey: string): UseCountrySearchResult {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Country[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, Country[]>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef<string>('');

  const runSearch = useCallback(
    async (normalized: string) => {
      // Cancel any previous in-flight request — its response is now stale
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      latestQueryRef.current = normalized;

      try {
        const url = `${API_BASE}?q=${encodeURIComponent(normalized)}&response_fields=${FIELDS}&limit=8`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw await parseApiError(res);
        }

        const json = (await res.json()) as ApiSuccessResponse;
        // The API's `q` param matches against multiple fields (e.g. calling
        // codes), so re-filter client-side to only match on country name.
        const objects = (json.data?.objects ?? []).filter((c) =>
          c.names.common.toLowerCase().includes(normalized)
        );

        // Ignore this response if a newer query has since superseded it
        if (latestQueryRef.current !== normalized) return;

        cacheRef.current.set(normalized, objects);
        setResults(objects);
        setStatus(objects.length ? 'success' : 'empty');
        setError(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return; // expected on rapid typing/unmount
        if (latestQueryRef.current !== normalized) return;

        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
        setStatus('error');
        setResults([]);
      }
    },
    [apiKey]
  );

  const search = useCallback(
    (rawTerm: string) => {
      const term = rawTerm.trim();
      setQuery(rawTerm);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (term.length < MIN_CHARS) {
        setStatus('idle');
        setResults([]);
        setError(null);
        if (abortRef.current) abortRef.current.abort();
        return;
      }

      const normalized = term.toLowerCase();

      // Instant cache hit — no debounce, no network, no loading flicker
      const cached = cacheRef.current.get(normalized);
      if (cached) {
        setResults(cached);
        setStatus(cached.length ? 'success' : 'empty');
        setError(null);
        return;
      }

      // Show a loading state immediately so the UI can render a skeleton,
      // even though the actual fetch is debounced.
      setStatus('loading');

      debounceRef.current = setTimeout(() => {
        void runSearch(normalized);
      }, DEBOUNCE_MS);
    },
    [runSearch]
  );

  // Cleanup on unmount: kill any pending debounce and in-flight request
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { query, results, status, error, search };
}
