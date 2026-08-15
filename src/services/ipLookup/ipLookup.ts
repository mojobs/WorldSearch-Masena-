const IP_LOOKUP_URL = 'https://api.ipify.org?format=json';

let cachedIp: string | null = null;
let inFlight: Promise<string> | null = null;

/**
 * getVisitorIp
 *
 * Resolves the visitor's public IP via a free, keyless lookup service.
 * Never rejects — falls back to 'unknown' on any failure so callers can
 * always safely record a log entry regardless of network conditions.
 */
export function getVisitorIp(): Promise<string> {
  if (cachedIp) return Promise.resolve(cachedIp);
  if (inFlight) return inFlight;

  inFlight = fetch(IP_LOOKUP_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`IP lookup failed (${res.status})`);
      return res.json() as Promise<{ ip: string }>;
    })
    .then(({ ip }) => {
      cachedIp = ip;
      return ip;
    })
    .catch((err) => {
      console.warn('getVisitorIp failed, falling back to "unknown"', err);
      return 'unknown';
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
