import { useEffect, useState } from "react";
import { apiFetch } from "../provider/api";

type Overview = {
  partner: { id: string; status: string; level: number; commissionRate: number };
  referredUsers: number;
  netRevenue: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  nextLevel: { level: number; minimumNetRevenue: number; commissionRate: number } | null;
  levelProgress: number;
};

type AffiliateUser = {
  id: string;
  referredUserId: string;
  name: string;
  registeredAt: string;
};

type Commission = {
  id: string;
  referredUserId: string;
  operationType: string;
  productId: string;
  store: string;
  netRevenueAmount: string;
  commissionAmount: string;
  currency: string;
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
};

const ITEMS_PER_PAGE = 5;

function Pagination({
  currentPage,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-button"
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </button>
      <span>Página {currentPage} de {totalPages}</span>
      <button
        className="pagination-button"
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
      </button>
    </div>
  );
}

function money(value: number | string, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(Number(value));
}

function formatOperation(type: string) {
  if (type === "INITIAL_PURCHASE") return "Primera suscripción";
  if (type === "RENEWAL") return "Renovación";
  if (type === "NON_RENEWING_PURCHASE") return "Compra de tokens";
  return type;
}

export function AffiliateDashboard({
  onLogout,
  onAccessDenied,
}: {
  onLogout: () => void;
  onAccessDenied: (message: string) => void;
}) {
  const [overview, setOverview] = useState<Overview>();
  const [users, setUsers] = useState<AffiliateUser[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [commissionsPage, setCommissionsPage] = useState(1);
  const [error, setError] = useState<string>();

  const visibleUsers = users.slice(
    (usersPage - 1) * ITEMS_PER_PAGE,
    usersPage * ITEMS_PER_PAGE,
  );
  const visibleCommissions = commissions.slice(
    (commissionsPage - 1) * ITEMS_PER_PAGE,
    commissionsPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    Promise.all([
      apiFetch<Overview>("/affiliate-portal/overview"),
      apiFetch<AffiliateUser[]>("/affiliate-portal/users"),
      apiFetch<Commission[]>("/affiliate-portal/commissions"),
    ])
      .then(([summary, referredUsers, earnings]) => {
        setOverview(summary);
        setUsers(referredUsers);
        setCommissions(earnings);
      })
      .catch((requestError) => {
        const message = requestError instanceof Error ? requestError.message : "No se han podido cargar los datos";
        if (message === "El email o la contraseña no son correctos.") {
          apiFetch("/auth/sign-out", { method: "POST", body: JSON.stringify({}) })
            .finally(() => onAccessDenied("Tu sesión ha caducado. Inicia sesión de nuevo."));
          return;
        }
        if (message === "Affiliate access is not active") {
          apiFetch("/auth/sign-out", { method: "POST", body: JSON.stringify({}) })
            .finally(() => onAccessDenied("Tu cuenta no está habilitada como afiliado."));
          return;
        }
        setError(message);
      });
  }, []);

  async function logout() {
    await apiFetch("/auth/sign-out", { method: "POST", body: JSON.stringify({}) });
    onLogout();
  }

  if (error) return <div className="loading-screen form-error">{error}</div>;
  if (!overview) return <div className="loading-screen">Cargando tus datos…</div>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup"><img className="brand-logo-inline" src="/vallax-iso-color-claro.png" alt="Vallax" /><div><p className="eyebrow">VALLAX</p><h1>Affiliate Portal</h1></div></div>
        <button className="button-quiet" onClick={logout}>Cerrar sesión</button>
      </header>
      <main className="dashboard">
        <section className="welcome-row">
          <div><p className="eyebrow">RESUMEN</p><h2>Tus resultados</h2></div>
          <span className="status-pill">Cuenta activa · {overview.partner.commissionRate * 100}%</span>
        </section>
        <section className="level-panel">
          <div className="level-title"><div><p className="eyebrow">PROGRESIÓN</p><h3>Nivel {overview.partner.level}</h3></div><strong>{overview.partner.commissionRate * 100}%</strong></div>
          {overview.nextLevel ? <>
            <div className="level-copy"><span>{money(overview.netRevenue)} netos acumulados</span><span>Nivel {overview.nextLevel.level} · {overview.nextLevel.commissionRate * 100}%</span></div>
            <div className="progress-track"><div className="progress-value" style={{ width: `${overview.levelProgress}%` }} /></div>
            <p className="level-hint">Te faltan {money(Math.max(0, overview.nextLevel.minimumNetRevenue - overview.netRevenue))} para alcanzar el siguiente porcentaje.</p>
          </> : <p className="level-hint">Has alcanzado el nivel máximo de comisión.</p>}
        </section>
        <section className="stat-grid">
          <article className="stat-card"><span>Usuarios referidos</span><strong>{overview.referredUsers}</strong></article>
          <article className="stat-card"><span>Comisiones pendientes</span><strong>{money(overview.pendingCommissions)}</strong></article>
          <article className="stat-card"><span>Total pagado</span><strong>{money(overview.paidCommissions)}</strong></article>
          <article className="stat-card accent"><span>Total generado</span><strong>{money(overview.totalCommissions)}</strong></article>
        </section>
        <section className="content-grid">
          <article className="panel">
            <div className="panel-heading"><div><p className="eyebrow">AUDIENCIA</p><h3>Usuarios referidos</h3></div><span>{users.length}</span></div>
            {users.length === 0 ? <p className="empty-state">Todavía no hay usuarios registrados.</p> : <><div className="table-wrap"><table><thead><tr><th>Usuario</th><th>Registrado</th></tr></thead><tbody>{visibleUsers.map((item) => <tr key={item.id}><td>{item.name}</td><td>{new Date(item.registeredAt).toLocaleDateString("es-ES")}</td></tr>)}</tbody></table></div><Pagination currentPage={usersPage} totalItems={users.length} onPageChange={setUsersPage} /></>}
          </article>
          <article className="panel commissions-panel">
            <div className="panel-heading"><div><p className="eyebrow">INGRESOS</p><h3>Comisiones</h3></div><span>{commissions.length}</span></div>
            {commissions.length === 0 ? <p className="empty-state">Todavía no hay comisiones.</p> : <><div className="table-wrap"><table><thead><tr><th>Operación</th><th>Comisión</th><th>Estado</th></tr></thead><tbody>{visibleCommissions.map((item) => <tr key={item.id}><td><strong>{formatOperation(item.operationType)}</strong><small>{item.store} · {new Date(item.createdAt).toLocaleDateString("es-ES")}</small></td><td className="commission-value">{money(item.commissionAmount, item.currency)}</td><td><span className={`commission-status ${item.status}`}>{item.status === "paid" ? "Pagada" : item.status === "cancelled" ? "Cancelada" : "Pendiente"}</span></td></tr>)}</tbody></table></div><Pagination currentPage={commissionsPage} totalItems={commissions.length} onPageChange={setCommissionsPage} /></>}
          </article>
        </section>
      </main>
    </div>
  );
}
