import { useEffect, useState, type ComponentType } from "react";
import { Activity, ArrowUpRight, CheckCircle2, Clock3, Github, RefreshCw, Server, ShieldCheck, Smartphone } from "lucide-react";

import { modules as discoveredModules } from "./.generated/mockup-components";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) {
          return;
        }
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(
            `No exported React component found in ${componentPath}.tsx\n\nMake sure the file has at least one exported function component.`,
          );
          return;
        }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) {
          return;
        }

        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>
        {error}
      </pre>
    );
  }

  if (!Component) return null;

  return <Component />;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getPreviewExamplePath(): string {
  const basePath = getBasePath();
  return `${basePath}/preview/ComponentName`;
}

function Gallery() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Component Preview Server
        </h1>
        <p className="text-gray-500 mb-4">
          This server renders individual components for the workspace canvas.
        </p>
        <p className="text-sm text-gray-400">
          Access component previews at{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
            {getPreviewExamplePath()}
          </code>
        </p>
      </div>
    </div>
  );
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

type SystemStatus = {
  status: string;
  service: string;
  environment: string;
  version: string;
  startedAt: string;
  uptimeSeconds: number;
  checkedAt: string;
};

const fallbackStatus: SystemStatus = {
  status: "operational",
  service: "miranha-api",
  environment: "local preview",
  version: "1.0.0",
  startedAt: new Date().toISOString(),
  uptimeSeconds: 0,
  checkedAt: new Date().toISOString(),
};

function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}min` : `${minutes}min`;
}

function AdminDashboard() {
  const [status, setStatus] = useState<SystemStatus>(fallbackStatus);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  async function refreshStatus() {
    setLoading(true);
    setLastError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "/api";
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/system/status`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus((await response.json()) as SystemStatus);
    } catch {
      setLastError("API indisponível. Exibindo o último estado conhecido.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshStatus();
    const interval = window.setInterval(() => void refreshStatus(), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const isOperational = status.status === "operational" || status.status === "ok";

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="brand-mark"><span>MI</span><div><strong>Miranha IA</strong><small>Control center</small></div></div>
        <nav className="dashboard-nav" aria-label="Navegação principal">
          <a className="active" href="#overview"><Activity size={17} /> Visão geral</a>
          <a href="#access"><ShieldCheck size={17} /> Acessos</a>
          <a href="#portfolio"><Github size={17} /> Portfólio</a>
        </nav>
        <div className="sidebar-footer"><span className="status-dot" /> Sistema monitorado</div>
      </aside>
      <section className="dashboard-content" id="overview">
        <header className="dashboard-header">
          <div><p className="eyebrow">PAINEL DE OPERAÇÕES</p><h1>Seu sistema, em um só lugar.</h1><p className="muted">Acompanhe os acessos e a saúde da experiência em iOS, Android e web.</p></div>
          <button className="refresh-button" onClick={() => void refreshStatus()} disabled={loading} title="Atualizar status"><RefreshCw size={17} className={loading ? "spin" : ""} /> Atualizar</button>
        </header>
        {lastError && <div className="notice"><span>{lastError}</span><button onClick={() => void refreshStatus()}>Tentar novamente</button></div>}
        <div className="metric-grid">
          <article className="metric-card metric-primary"><div className="metric-icon"><CheckCircle2 size={20} /></div><span>API principal</span><strong>{isOperational ? "Operacional" : "Atenção"}</strong><small>Última verificação: {new Date(status.checkedAt).toLocaleTimeString("pt-BR")}</small></article>
          <article className="metric-card"><div className="metric-icon dark"><Server size={20} /></div><span>Ambiente</span><strong>{status.environment}</strong><small>Versão {status.version}</small></article>
          <article className="metric-card"><div className="metric-icon warm"><Clock3 size={20} /></div><span>Disponibilidade atual</span><strong>{formatUptime(status.uptimeSeconds)}</strong><small>Desde {new Date(status.startedAt).toLocaleDateString("pt-BR")}</small></article>
        </div>
        <section className="section-block" id="access"><div className="section-heading"><div><p className="eyebrow">COBERTURA</p><h2>Acesso multiplataforma</h2></div><span className="live-label"><span className="status-dot" /> ao vivo</span></div><div className="platform-grid"><div><Smartphone size={22} /><strong>iOS</strong><span>Expo configurado</span></div><div><Smartphone size={22} /><strong>Android</strong><span>Expo configurado</span></div><div><Activity size={22} /><strong>Desktop web</strong><span>Painel responsivo</span></div></div></section>
        <section className="portfolio-banner" id="portfolio"><div><p className="eyebrow">PROJETO</p><h2>Miranha IA</h2><p>Uma experiência afetiva multiplataforma, com monitoramento centralizado e base pronta para evoluir.</p></div><a href={import.meta.env.VITE_GITHUB_URL ?? "https://github.com"} target="_blank" rel="noreferrer">Abrir portfólio <ArrowUpRight size={17} /></a></section>
      </section>
    </main>
  );
}

function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <PreviewRenderer
        componentPath={previewPath}
        modules={discoveredModules}
      />
    );
  }

  return <AdminDashboard />;
}

export default App;
