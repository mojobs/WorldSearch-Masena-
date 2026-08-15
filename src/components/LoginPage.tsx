import { useState, type FormEvent } from 'react';
import { login, type AuthSession } from '../services/authSession/authSession';

interface LoginPageProps {
  onLogin: (session: AuthSession) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const session = login(name, password);
    if (session) {
      onLogin(session);
    } else {
      setError('Enter a name and password.');
    }
  };

  return (
    <div className="mx-auto my-8 max-w-lg p-6">
      <form
        className="mx-auto my-12 flex max-w-xs flex-col gap-2 rounded-xl border border-gray-800 p-6 text-center"
        onSubmit={handleSubmit}
      >
        <h1 className="m-0 mb-2 text-lg text-white">World Search 🌍</h1>

        <label htmlFor="login-name" className="text-left text-sm text-gray-400">
          Name
        </label>
        <input
          id="login-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="rounded-lg border border-gray-700 bg-black px-3 py-2 text-[0.95rem] text-white"
        />

        <label htmlFor="login-password" className="mt-1 text-left text-sm text-gray-400">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-gray-700 bg-black px-3 py-2 text-[0.95rem] text-white"
        />

        <button
          type="submit"
          className="mt-2 cursor-pointer rounded-lg border-none bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Log in
        </button>

        {error && <p className="m-0 text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
}
