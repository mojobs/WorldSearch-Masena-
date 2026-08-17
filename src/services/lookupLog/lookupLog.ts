const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface LookupLogEntry {
  id: string;
  countryName: string;
  ip: string;
  geo: { country: string | null; city: string | null; continent: string | null } | null;
  timestamp: string;
}

/** Returns all recorded lookups (across every device), newest first. */
export async function getLookupLog(): Promise<LookupLogEntry[]> {
  const res = await fetch(`${API_BASE}/api/lookups`);
  if (!res.ok) throw new Error(`Failed to load lookup log (${res.status})`);
  return res.json();
}

/**
 * Records a country lookup. The server determines the caller's IP from the
 * request itself (and resolves it via the REST Countries IP API) rather than
 * trusting an IP reported by the client.
 */
export async function addLookupLogEntry(entry: { countryName: string }): Promise<LookupLogEntry> {
  const res = await fetch(`${API_BASE}/api/lookups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error(`Failed to record lookup (${res.status})`);
  return res.json();
}

/** Deletes all recorded lookups. */
export async function clearLookupLog(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/lookups`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to clear lookup log (${res.status})`);
}
