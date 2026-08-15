import { useState } from 'react';
import { clearLookupLog, getLookupLog, type LookupLogEntry } from '../services/lookupLog/lookupLog';

interface AdminPageProps {
  name: string;
  onLogout: () => void;
}

export default function AdminPage({ name, onLogout }: AdminPageProps) {
  const [entries, setEntries] = useState<LookupLogEntry[]>(() => getLookupLog());

  const handleClear = () => {
    if (!window.confirm('Clear the entire lookup log? This cannot be undone.')) return;
    clearLookupLog();
    setEntries([]);
  };

  return (
    <div className="mx-auto my-8 max-w-lg p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="m-0 text-lg text-white">Lookup log</h1>
          <p className="m-0 text-xs text-gray-500">Signed in as {name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEntries(getLookupLog())}
            className="cursor-pointer rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={entries.length === 0}
            className="cursor-pointer rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear log
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="cursor-pointer rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800"
          >
            Log out
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No lookups recorded yet.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-gray-800 px-2.5 py-2 text-left text-xs tracking-wide text-gray-400 uppercase">
                Country
              </th>
              <th className="border-b border-gray-800 px-2.5 py-2 text-left text-xs tracking-wide text-gray-400 uppercase">
                IP address
              </th>
              <th className="border-b border-gray-800 px-2.5 py-2 text-left text-xs tracking-wide text-gray-400 uppercase">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-900">
                <td className="border-b border-gray-800 px-2.5 py-2">{entry.countryName}</td>
                <td className="border-b border-gray-800 px-2.5 py-2">{entry.ip}</td>
                <td className="border-b border-gray-800 px-2.5 py-2">
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
