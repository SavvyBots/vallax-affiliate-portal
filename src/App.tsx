import { useEffect, useState } from "react";
import { getCurrentSession } from "./provider/auth-provider";
import { LoginPage } from "./auth/login";
import { AffiliateDashboard } from "./dashboard/affiliate-dashboard";
import "./styles.css";

function AppContent() {
  const [authenticated, setAuthenticated] = useState<boolean>();
  const [loginError, setLoginError] = useState<string>();

  useEffect(() => {
    getCurrentSession()
      .then((session) => setAuthenticated(Boolean(session)))
      .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === undefined) {
    return <div className="loading-screen">Cargando portal…</div>;
  }

  if (!authenticated) {
    return (
      <LoginPage
        initialError={loginError}
        onSuccess={() => {
          setLoginError(undefined);
          setAuthenticated(true);
        }}
      />
    );
  }

  return (
    <AffiliateDashboard
      onLogout={() => setAuthenticated(false)}
      onAccessDenied={(message) => {
        setLoginError(message);
        setAuthenticated(false);
      }}
    />
  );
}

function App() {
  return <div className="theme-app"><AppContent /></div>;
}

export default App;
