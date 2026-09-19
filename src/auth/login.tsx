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
      <section className="auth-intro">
        <div className="auth-intro-brand">
          <img className="brand-logo" src="/vallax-iso-color-claro.png" alt="" />
          <p className="brand-name">VALLAX</p>
        </div>
        <div className="auth-intro-copy">
          <p className="section-kicker">Partners / 01</p>
          <h1>Tu crecimiento,<br /><span>en datos.</span></h1>
          <p>Seguimiento preciso de referidos, ingresos y comisiones.</p>
        </div>
        <p className="auth-intro-foot">Programa de afiliados Vallax</p>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <header className="auth-brand">
            <div className="auth-mobile-brand"><img src="/vallax-iso-color-claro.png" alt="" /><span>VALLAX</span></div>
            <p className="section-kicker">Acceso privado</p>
            <h2>Portal de afiliados</h2>
            <p className="muted">Introduce tus credenciales para continuar.</p>
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
            <button className="login-submit" disabled={isPending} type="submit">
              <span>{isPending ? "Entrando…" : "Iniciar sesión"}</span>
              {!isPending && <span aria-hidden="true">→</span>}
            </button>
          </form>
          <p className="auth-help">Acceso exclusivo para afiliados autorizados.</p>
        </div>
      </section>
    </main>
  );
}
