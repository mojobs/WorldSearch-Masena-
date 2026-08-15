import { useEffect } from 'react';
import type { Country } from '../services/countriesApi';
import CountryFlag from './CountryFlag';

interface CountryDetailsModalProps {
  country: Country;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (country: Country) => void;
}

function formatCapitals(country: Country): string {
  return country.capitals?.map((c) => c.name).join(', ') || 'Unknown';
}

function formatLanguages(country: Country): string {
  return country.languages?.map((l) => l.name).join(', ') || 'Unknown';
}

function formatCurrencies(country: Country): string {
  const currencies = Object.values(country.currencies ?? {});
  if (!currencies.length) return 'Unknown';
  return currencies
    .map((c) => [c.name, c.symbol ? `(${c.symbol})` : null].filter(Boolean).join(' '))
    .join(', ');
}

function formatCallingCodes(country: Country): string {
  return country.calling_codes?.map((c) => `+${c}`).join(', ') || 'Unknown';
}

function formatBorders(country: Country): string {
  return country.borders?.join(', ') || 'None';
}

export default function CountryDetailsModal({ country, onClose, isFavorite, onToggleFavorite }: CountryDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-800 bg-black px-6 pt-5 pb-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2.5">
          <CountryFlag country={country} className="h-6 w-8 shrink-0 rounded-sm object-cover text-2xl leading-none" />
          <h2 id="country-modal-title" className="flex-1 text-lg text-white">
            {country.names.common}
          </h2>
          <button
            type="button"
            onClick={() => onToggleFavorite(country)}
            aria-label={isFavorite ? `Remove ${country.names.common} from favorites` : `Add ${country.names.common} to favorites`}
            aria-pressed={isFavorite}
            className={`cursor-pointer rounded-md border-none bg-transparent px-1.5 py-0.5 text-2xl leading-none hover:bg-gray-800 ${
              isFavorite ? 'text-red-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-md border-none bg-transparent px-1.5 py-0.5 text-2xl leading-none text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            ×
          </button>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2">
          <dt className="text-nowrap text-sm font-semibold text-gray-400">Capital</dt>
          <dd className="m-0 text-sm text-gray-100">{formatCapitals(country)}</dd>

          <dt className="text-nowrap text-sm font-semibold text-gray-400">Region</dt>
          <dd className="m-0 text-sm text-gray-100">{country.region || 'Unknown'}</dd>

          <dt className="text-nowrap text-sm font-semibold text-gray-400">Subregion</dt>
          <dd className="m-0 text-sm text-gray-100">{country.subregion || 'Unknown'}</dd>

          <dt className="text-nowrap text-sm font-semibold text-gray-400">Population</dt>
          <dd className="m-0 text-sm text-gray-100">
            {country.population != null ? country.population.toLocaleString() : 'Unknown'}
          </dd>

          <dt className="text-nowrap text-sm font-semibold text-gray-400">Languages</dt>
          <dd className="m-0 text-sm text-gray-100">{formatLanguages(country)}</dd>

          <dt className="text-nowrap text-sm font-semibold text-gray-400">Currencies</dt>
          <dd className="m-0 text-sm text-gray-100">{formatCurrencies(country)}</dd>

          <dt className="text-nowrap text-sm font-semibold text-gray-400">Calling codes</dt>
          <dd className="m-0 text-sm text-gray-100">{formatCallingCodes(country)}</dd>

          <dt className="text-nowrap text-sm font-semibold text-gray-400">Borders (codes)</dt>
          <dd className="m-0 text-sm text-gray-100">{formatBorders(country)}</dd>
        </dl>
      </div>
    </div>
  );
}
