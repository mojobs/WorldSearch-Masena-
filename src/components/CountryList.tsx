import type { Country } from '../services/countriesApi';
import CountryFlag from './CountryFlag';

interface CountryListProps {
  countries: Country[];
  onSelect: (country: Country) => void;
}

export default function CountryList({ countries, onSelect }: CountryListProps) {
  return (
    <ul className="mt-3 flex list-none flex-col gap-1.5 p-0">
      {countries.map((c) => (
        <li key={c.names.common}>
          <button
            type="button"
            onClick={() => onSelect(c)}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg bg-gray-900 px-3 py-2.5 text-left transition-colors hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <CountryFlag country={c} className="h-5 w-7 shrink-0 rounded-sm object-cover text-xl leading-none" />
            <span className="text-[1.2rem] md:text-[1.75rem] text-gray-100">{c.names.common}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
