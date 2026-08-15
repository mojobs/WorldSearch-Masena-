import { useState } from "react"
import CountriesPage from "./components/CountriesPage"
import AdminPage from "./components/AdminPage"
import LoginPage from "./components/LoginPage"
import { getAuthSession, logout, type AuthSession } from "./services/authSession/authSession"

const App = () => {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession())

  const handleLogout = () => {
    logout()
    setSession(null)
  }

  return (
    <div className="app">
      {!session ? (
        <LoginPage onLogin={setSession} />
      ) : session.role === 'admin' ? (
        <AdminPage name={session.name} onLogout={handleLogout} />
      ) : (
        <CountriesPage
          apiKey={import.meta.env.VITE_COUNTRIES_API_KEY}
          name={session.name}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default App
