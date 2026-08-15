import type { Country } from '../services/countriesApi';

interface CountryFlagProps {
  country: Country;
  className?: string;
}

function isSafeImageUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

export default function CountryFlag({ country, className }: CountryFlagProps) {
  const flagUrl = country.flag?.url_svg;

  if (!flagUrl || !isSafeImageUrl(flagUrl)) {
    return (
      <span className={className} aria-hidden="true">
        {country.flag?.emoji}
      </span>
    );
  }

  return (
    <img
      src={flagUrl}
      alt={`Flag of ${country.names.common}`}
      className={className}
    />
  );
}
