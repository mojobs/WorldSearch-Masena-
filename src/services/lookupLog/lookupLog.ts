const STORAGE_KEY = 'world-search:lookup-log';
const MAX_ENTRIES = 500;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface LookupLogEntry {
  id: string;
  countryName: string;
  ip: string;
  timestamp: string;
}

function readAll(): LookupLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const cutoff = Date.now() - MAX_AGE_MS;
    const fresh = parsed.filter((entry: LookupLogEntry) => new Date(entry.timestamp).getTime() >= cutoff);
    if (fresh.length !== parsed.length) writeAll(fresh);

    return fresh;
  } catch (err) {
    console.warn('lookupLog: failed to read localStorage', err);
    return [];
  }
}

function writeAll(entries: LookupLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('lookupLog: failed to write localStorage', err);
  }
}

/** Returns all recorded lookups, newest first. */
export function getLookupLog(): LookupLogEntry[] {
  return [...readAll()].reverse();
}

/** Records a country lookup and returns the created entry. */
export function addLookupLogEntry(entry: { countryName: string; ip: string }): LookupLogEntry {
  const full: LookupLogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  const entries = readAll();
  entries.push(full);
  writeAll(entries.slice(-MAX_ENTRIES));

  return full;
}

/** Deletes all recorded lookups. */
export function clearLookupLog(): void {
  writeAll([]);
}
