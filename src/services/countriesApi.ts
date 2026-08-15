export const API_BASE = 'https://api.restcountries.com/countries/v5';
export const FIELDS =
  'names.common,flag.emoji,flag.url_svg,capitals,region,subregion,population,languages,currencies,calling_codes,borders';

// The API's own `region` values — label is what we show, value is what we query with.
export const REGIONS: { label: string; value: string }[] = [
  { label: 'Africa', value: 'Africa' },
  { label: 'Americas', value: 'Americas' },
  { label: 'Antarctica', value: 'Antarctic' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Europe', value: 'Europe' },
  { label: 'Oceania', value: 'Oceania' },
];

// ---- API response shapes (trimmed to the fields we request) ----

export interface CountryCapital {
  name: string;
  coordinates?: { lat: number; lng: number };
  attributes?: Record<string, boolean>;
}

export interface CountryLanguage {
  iso_639_1?: string;
  iso_639_2?: string;
  bcp_47?: string;
  name: string;
  native_name?: string;
}

export interface CountryCurrency {
  code?: string;
  name?: string;
  symbol?: string;
}

export interface Country {
  names: {
    common: string;
    official?: string;
  };
  flag?: {
    emoji?: string;
    url_svg?: string;
  };
  capitals?: CountryCapital[];
  region?: string;
  subregion?: string;
  population?: number | null;
  languages?: CountryLanguage[];
  currencies?: Record<string, CountryCurrency>;
  calling_codes?: string[];
  borders?: string[];
}

export interface ApiMeta {
  total: number;
  count: number;
  limit: number;
  offset: number;
  more: boolean;
  request_id?: string;
}

export interface ApiSuccessResponse {
  data: {
    objects: Country[];
    meta: ApiMeta;
  };
}

export interface ApiErrorResponse {
  errors: { message: string }[];
}

export async function parseApiError(res: Response): Promise<Error> {
  const body = (await res.json().catch(() => null)) as ApiErrorResponse | null;
  return new Error(body?.errors?.[0]?.message || `Request failed (${res.status})`);
}
