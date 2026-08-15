import { useCallback, useState } from 'react';
import type { Country } from '../countriesApi';

const STORAGE_KEY = 'world-search:favorites';

interface UseFavoritesResult {
  favorites: Country[];
  isFavorite: (name: string) => boolean;
  toggleFavorite: (country: Country) => void;
  clearFavorites: () => void;
}

function readAll(): Country[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('useFavorites: failed to read localStorage', err);
    return [];
  }
}

function writeAll(favorites: Country[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.warn('useFavorites: failed to write localStorage', err);
  }
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<Country[]>(() => readAll());

  const isFavorite = useCallback((name: string) => favorites.some((f) => f.names.common === name), [favorites]);

  const toggleFavorite = useCallback((country: Country) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.names.common === country.names.common);
      const next = exists ? prev.filter((f) => f.names.common !== country.names.common) : [...prev, country];
      writeAll(next);
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    writeAll([]);
    setFavorites([]);
  }, []);

  return { favorites, isFavorite, toggleFavorite, clearFavorites };
}
