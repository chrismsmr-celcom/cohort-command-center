import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ChevronDown, LogOut, RefreshCw, Layers3 } from "lucide-react";
import { AuthGate } from "./AuthGate";
import { signOut, type CohortSession } from "@/lib/cohort-auth";
import { listWorkspaces, type CohortWorkspace } from "@/lib/cohort-workspaces";

const ACTIVE_WORKSPACE_KEY = "cohort.active-workspace";

type ActiveWorkspaceContextValue = { workspace: CohortWorkspace; session: CohortSession };
const ActiveWorkspaceContext = createContext<ActiveWorkspaceContextValue | null>(null);

export function useActiveWorkspace() {
  const value = useContext(ActiveWorkspaceContext);
  if (!value) throw new Error("useActiveWorkspace must be used inside WorkspaceGate");
  return value;
}

export function WorkspaceGate({ children }: { children: (workspace: CohortWorkspace, session: CohortSession) => React.ReactNode }) {
  const [session, setSession] = useState<CohortSession | null>(null);
  const [workspaces, setWorkspaces] = useState<CohortWorkspace[]>([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (current: CohortSession) => {
    setLoading(true); setError("");
    try {
      const items = await listWorkspaces(current);
      setWorkspaces(items);
      const saved = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
      const next = items.some((w) => w.id === saved) ? saved! : items[0]?.id || "";
      setActiveId(next);
      if (next) localStorage.setItem(ACTIVE_WORKSPACE_KEY, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load workspaces");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (session) void load(session); }, [session, load]);

  if (!session) return <AuthGate onAuthenticated={setSession} />;
  const active = workspaces.find((w) => w.id === activeId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex min-h-14 items-center gap-3 border-b border-border px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold"><span className="grid size-7 place-items-center rounded bg-primary text-primary-foreground">C</span>Cohort</div>
        <div className="ml-auto flex items-center gap-2">
          {loading ? <span className="text-xs text-muted-foreground">Loading workspaces…</span> : workspaces.length > 0 ? (
            <label className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs">
              <Layers3 className="size-3.5 text-muted-foreground" />
              <select aria-label="Active workspace" value={activeId} onChange={(e) => { setActiveId(e.target.value); localStorage.setItem(ACTIVE_WORKSPACE_KEY, e.target.value); }} className="max-w-48 bg-transparent text-foreground outline-none">
                {workspaces.map((w) => <option key={w.id} value={w.id}>{w.name} · {w.role}</option>)}
              </select>
              <ChevronDown className="size-3 text-muted-foreground" />
            </label>
          ) : null}
          <button onClick={() => void load(session)} className="rounded-md border border-border p-2 text-muted-foreground hover:bg-accent" aria-label="Refresh workspaces"><RefreshCw className="size-3.5" /></button>
          <button onClick={async () => { await signOut(); setSession(null); setWorkspaces([]); setActiveId(""); }} className="rounded-md border border-border p-2 text-muted-foreground hover:bg-accent" aria-label="Sign out"><LogOut className="size-3.5" /></button>
        </div>
      </header>
      {error ? <div role="alert" className="mx-auto mt-6 max-w-3xl rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div> : null}
      {!loading && !error && workspaces.length === 0 ? <div className="mx-auto mt-16 max-w-lg rounded-xl border border-border bg-card p-8 text-center"><h2 className="text-lg font-semibold">No workspace available</h2><p className="mt-2 text-sm text-muted-foreground">Your account is authenticated, but the API returned no active workspace membership. Ask an owner to invite you or check the provisioning migration.</p></div> : null}
      {active && <ActiveWorkspaceContext.Provider value={{ workspace: active, session }}>{children(active, session)}</ActiveWorkspaceContext.Provider>}
    </div>
  );
}
