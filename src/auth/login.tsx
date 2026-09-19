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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
        <header className="auth-brand">
          <img className="brand-logo" src="/vallax-iso-color-claro.png" alt="" />
          <p className="brand-name">VALLAX</p>
          <h1>Portal de afiliados</h1>
          <p className="muted">Consulta tus referidos y gestiona tus comisiones.</p>
        </header>
        <form onSubmit={onSubmit} className="stack-form">
          <label>
            Correo electrónico
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Contraseña
            <span className="password-field">
              <input name="password" type={isPasswordVisible ? "text" : "password"} autoComplete="current-password" required />
              <button
                className="password-toggle"
                type="button"
                aria-pressed={isPasswordVisible}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? "Ocultar" : "Mostrar"}
              </button>
            </span>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button disabled={isPending} type="submit">
            {isPending ? "Entrando…" : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </main>
  );
}
