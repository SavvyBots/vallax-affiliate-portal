import { useState } from "react";
import { apiFetch } from "../provider/api";

export function LoginPage({
  onSuccess,
  initialError,
}: {
  onSuccess: () => void;
  initialError?: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());

    setIsPending(true);
    apiFetch("/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email: values.email, password: values.password }),
    })
      .then(onSuccess)
      .catch((loginError: unknown) => {
        if (loginError instanceof Error) {
          console.error("Login request failed:", loginError);
        }

        setError("No se ha podido iniciar sesión. Comprueba tus datos e inténtalo de nuevo.");
      })
      .finally(() => setIsPending(false));
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <img className="brand-logo" src="/vallax-iso-color-claro.png" alt="Vallax" />
        <p className="eyebrow">VALLAX</p>
        <h1>Affiliate Portal</h1>
        <p className="muted">Consulta tus referidos y tus comisiones.</p>
        <form onSubmit={onSubmit} className="stack-form">
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Contraseña
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button disabled={isPending} type="submit">
            {isPending ? "Entrando…" : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </main>
  );
}
