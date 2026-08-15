import { useState } from 'react';
import { useCountrySearch } from '../services/useCountrySearch/useCountrySearch';
import { useDefaultCountries } from '../services/useDefaultCountries/useDefaultCountries';
import { useRegionCountries } from '../services/useRegionCountries/useRegionCountries';
import { useFavorites } from '../services/useFavorites/useFavorites';
import { getVisitorIp } from '../services/ipLookup/ipLookup';
import { addLookupLogEntry } from '../services/lookupLog/lookupLog';
import { REGIONS, type Country } from '../services/countriesApi';
import CountryDetailsModal from './CountryDetailsModal';
import CountryList from './CountryList';
import SearchErrorState from './SearchErrorState';

interface CountrySearchProps {
  apiKey: string;
  name: string;
  onLogout: () => void;
}

function SkeletonList() {
  return (
    <ul className="mt-3 flex list-none flex-col gap-1.5 p-0" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="h-9 animate-pulse rounded-lg bg-gray-800" />
      ))}
    </ul>
  );
}

export default function CountrySearch({ apiKey, name, onLogout }: CountrySearchProps) {
  const { query, results, status, search } = useCountrySearch(apiKey);
  const {
    countries: defaultCountries,
    status: defaultStatus,
    retry: retryDefault,
  } = useDefaultCountries(apiKey);

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const {
    countries: regionCountries,
    status: regionStatus,
    retry: retryRegion,
  } = useRegionCountries(apiKey, selectedRegion);

  const [showFavorites, setShowFavorites] = useState(false);
  const { favorites, isFavorite, toggleFavorite, clearFavorites } = useFavorites();

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const handleSelect = (country: Country) => {
    setSelectedCountry(country);
    void getVisitorIp()
      .then((ip) => addLookupLogEntry({ countryName: country.names.common, ip }))
      .catch((err) => console.warn('Failed to record country lookup', err));
  };

  const handleSearchChange = (value: string) => {
    setSelectedRegion(null);
    setShowFavorites(false);
    search(value);
  };

  const handleRegionClick = (value: string) => {
    setShowFavorites(false);
    setSelectedRegion((prev) => (prev === value ? null : value));
    search('');
  };

  const handleFavoritesClick = () => {
    setSelectedRegion(null);
    setShowFavorites((prev) => !prev);
    search('');
  };

  const handleClearFavorites = () => {
    if (!window.confirm('Clear all favorite countries? This cannot be undone.')) return;
    clearFavorites();
  };

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col p-6">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h1 className="m-0 text-[1.9rem] xl:text-[2rem] 2xl:text-[2.5rem] font-bold  text-white">World Search 🌍</h1>

      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search for a country..."
        aria-label="Search for a country"
        className="box-border w-full shrink-0 rounded-lg border border-gray-700 bg-black px-3.5 py-2.5 text-base text-white outline-none transition-colors placeholder:text-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
      />

      <div className="mt-2.5 flex shrink-0 flex-wrap gap-1.5">
        {REGIONS.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => handleRegionClick(r.value)}
            aria-pressed={selectedRegion === r.value}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selectedRegion === r.value
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-gray-700 bg-black text-gray-300 hover:bg-gray-800'
            }`}
          >
            {r.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleFavoritesClick}
          aria-pressed={showFavorites}
          className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            showFavorites
              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
              : 'border-gray-700 bg-black text-gray-300 hover:bg-gray-800'
          }`}
        >
          ♥ Favorites{favorites.length ? ` (${favorites.length})` : ''}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
      {status === 'idle' && showFavorites && (
        <>
          <div className="mt-3 flex items-center justify-between">
            <p className="m-0 text-sm text-gray-400">
              {favorites.length ? `${favorites.length} favorite${favorites.length === 1 ? '' : 's'}` : 'No favorites yet.'}
            </p>
            {favorites.length > 0 && (
              <button
                type="button"
                onClick={handleClearFavorites}
                className="cursor-pointer border-none bg-transparent p-0 text-sm text-indigo-400 underline hover:text-indigo-300"
              >
                Clear favorites
              </button>
            )}
          </div>
          {favorites.length > 0 && <CountryList countries={favorites} onSelect={handleSelect} />}
        </>
      )}

      {status === 'idle' && !showFavorites && selectedRegion && (
        <>
          {regionStatus === 'loading' && <SkeletonList />}
          {regionStatus === 'success' && <CountryList countries={regionCountries} onSelect={handleSelect} />}
          {regionStatus === 'empty' && <p className="mt-3 text-sm text-gray-400">No countries found in this region.</p>}
          {regionStatus === 'error' && <SearchErrorState onRetry={retryRegion} />}
        </>
      )}

      {status === 'idle' && !showFavorites && !selectedRegion && (
        <>
          {defaultStatus === 'loading' && <SkeletonList />}
          {defaultStatus === 'success' && <CountryList countries={defaultCountries} onSelect={handleSelect} />}
          {defaultStatus === 'error' && <SearchErrorState onRetry={retryDefault} />}
        </>
      )}

      {/* Skeleton shows the instant the user types, before the network call fires */}
      {status === 'loading' && <SkeletonList />}

      {status === 'success' && <CountryList countries={results} onSelect={handleSelect} />}

      {status === 'empty' && <p className="mt-3 text-sm text-gray-400">No countries found.</p>}

      {status === 'error' && <SearchErrorState onRetry={() => search(query)} />}
      </div>

      {selectedCountry && (
        <CountryDetailsModal
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          isFavorite={isFavorite(selectedCountry.names.common)}
          onToggleFavorite={toggleFavorite}
        />
      )}
      <div className='flex shrink-0 justify-between pt-5'>
        <p>{name}</p>
        <button
          type="button"
          onClick={onLogout}
          className="cursor-pointer rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-700"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
