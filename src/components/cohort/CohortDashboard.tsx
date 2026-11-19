import { useState } from "react";
import {
  LayoutDashboard, GitBranch, Database, ScrollText, Settings2, Bot, Search, Bell, Plus,
  GitMerge, AlertTriangle, Lock, Activity, ArrowUpRight, Download, ChevronRight, CircleDot, X, Command,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { activity, agents, branches, conflict, events, stateKeys, type Branch } from "./data";
import { cn } from "@/lib/utils";

type Tab = "Vue d'ensemble" | "Agents" | "Branches" | "État partagé" | "Journal" | "Paramètres";
const nav: { tab: Tab; icon: typeof Bot }[] = [
  { tab: "Vue d'ensemble", icon: LayoutDashboard }, { tab: "Agents", icon: Bot },
  { tab: "Branches", icon: GitBranch }, { tab: "État partagé", icon: Database },
  { tab: "Journal", icon: ScrollText }, { tab: "Paramètres", icon: Settings2 },
];

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-lg border border-border bg-card", className)}>{children}</section>;
}
function CardHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
      <div><h2 className="text-sm font-semibold">{title}</h2>{sub && <p className="text-xs text-muted-foreground">{sub}</p>}</div>
      {right}
    </div>
  );
}
const statusStyle = {
  open: "bg-info/10 text-info border-info/30", conflict: "bg-destructive/10 text-destructive border-destructive/30",
  merged: "bg-success/10 text-success border-success/30", active: "bg-success/10 text-success border-success/30",
  waiting: "bg-primary/10 text-primary border-primary/30", idle: "bg-muted text-muted-foreground border-border",
} as Record<string, string>;
const statusLabel: Record<string, string> = { open: "Ouverte", conflict: "Conflit", merged: "Fusionnée", active: "Actif", waiting: "En attente", idle: "Inactif" };
function Pill({ s }: { s: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", statusStyle[s])}><span className={cn("size-1.5 rounded-full bg-current", s === "active" && "pulse-dot")} />{statusLabel[s]}</span>;
}
const levelColor = { ok: "text-success", warn: "text-primary", error: "text-destructive", info: "text-info" } as const;
const Mono = ({ children, className }: { children: React.ReactNode; className?: string }) => <code className={cn("font-mono text-xs text-muted-foreground", className)}>{children}</code>;

function PageHead({ eyebrow, title, desc, action }: { eyebrow: string; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p className="font-mono text-[11px] tracking-widest text-primary">{eyebrow}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{desc}</p></div>
      {action}
    </div>
  );
}
function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">{children}</button>;
}
function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-accent">{children}</button>;
}

function Overview({ go, resolve }: { go: (t: Tab) => void; resolve: (b: Branch) => void }) {
  const stats = [
    { label: "Agents actifs", value: "3 / 5", delta: "+1 aujourd'hui", icon: Bot },
    { label: "Branches ouvertes", value: "4", delta: "2 en conflit", icon: GitBranch },
    { label: "Commits (14 j)", value: "828", delta: "+18,4 %", icon: GitMerge },
    { label: "Taux de conflit", value: "8,1 %", delta: "−2,3 pts", icon: AlertTriangle },
  ];
  const conflicts = branches.filter((b) => b.status === "conflict");
  return (
    <>
      <PageHead eyebrow="WORKSPACE / MAIN" title="Vue d'ensemble" desc="Comment vos agents se coordonnent, partagent l'état et résolvent les changements concurrents." action={<div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs"><span className="size-2 rounded-full bg-success pulse-dot" />Runtime opérationnel · HEAD <Mono className="text-foreground">a41c9e2f</Mono></div>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, delta, icon: I }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between text-muted-foreground"><span className="text-xs">{label}</span><I className="size-4" /></div>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHead title="Activité de coordination" sub="Commits et conflits · 14 derniers jours" right={<div className="flex gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-chart-1" />Commits</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-chart-2" />Conflits</span></div>} />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gx" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="commits" stroke="var(--chart-1)" fill="url(#gc)" strokeWidth={2} />
                <Area type="monotone" dataKey="conflicts" stroke="var(--chart-2)" fill="url(#gx)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHead title="À traiter" sub="Conflits qui demandent une résolution" right={<span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">{conflicts.length}</span>} />
          <div className="divide-y divide-border">
            {conflicts.map((b) => (
              <button key={b.id} onClick={() => resolve(b)} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-accent/50">
                <div className="grid size-9 place-items-center rounded-md bg-destructive/10 text-destructive"><AlertTriangle className="size-4" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{b.name}</p><p className="text-xs text-muted-foreground">{b.agent} · {b.updated}</p></div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground">Baux actifs</p>
              <div className="mt-2 space-y-2">{agents.filter((a) => a.lease).map((a) => <div key={a.id} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><Lock className="size-3 text-primary" /><Mono className="text-foreground">{a.lease}</Mono></span><span className="text-muted-foreground">{a.id}</span></div>)}</div>
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHead title="Activité récente" sub="Derniers événements du runtime" right={<GhostBtn onClick={() => go("Journal")}>Ouvrir le journal <ArrowUpRight className="size-3" /></GhostBtn>} />
          <EventList items={events.slice(0, 5)} />
        </Card>
        <Card>
          <CardHead title="Agents" sub="Charge par agent" />
          <div className="space-y-4 p-5">
            {agents.map((a) => (
              <div key={a.id}>
                <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium">{a.id}</span><span className="text-muted-foreground">{a.commits} commits</span></div>
                <div className="h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(a.commits / 318) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function EventList({ items }: { items: readonly (typeof events)[number][] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((e, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3 text-sm">
          <Mono className="w-16 shrink-0">{e.t}</Mono>
          <CircleDot className={cn("size-3.5 shrink-0", levelColor[e.level])} />
          <Mono className="w-36 shrink-0 text-foreground">{e.type}</Mono>
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{e.detail}</span>
          <span className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground md:inline">{e.agent}</span>
        </div>
      ))}
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border text-left">{head.map((h) => <th key={h} className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wider text-muted-foreground">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

function Branches({ resolve, create }: { resolve: (b: Branch) => void; create: () => void }) {
  const [filter, setFilter] = useState<"all" | Branch["status"]>("all");
  const list = branches.filter((b) => filter === "all" || b.status === filter);
  return (
    <>
      <PageHead eyebrow="WORKSPACE / COORDINATION" title="Branches" desc="Espaces isolés où chaque agent travaille sans écraser les autres." action={<PrimaryBtn onClick={create}><Plus className="size-4" />Créer une branche</PrimaryBtn>} />
      <Card>
        <div className="flex gap-1 border-b border-border p-2">
          {(["all", "open", "conflict", "merged"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition", filter === f ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>{f === "all" ? "Toutes" : statusLabel[f]}</button>
          ))}
        </div>
        <Table head={["BRANCHE", "AGENT", "STATUT", "CHANGEMENTS", "BASE", "MAJ", ""]}>
          {list.map((b) => (
            <tr key={b.id} className="transition hover:bg-accent/40">
              <td className="px-5 py-3"><div className="flex items-center gap-2"><GitBranch className="size-3.5 text-muted-foreground" /><span className="font-medium">{b.name}</span></div><Mono>{b.id}</Mono></td>
              <td className="px-5 py-3 text-muted-foreground">{b.agent}</td>
              <td className="px-5 py-3"><Pill s={b.status} /></td>
              <td className="px-5 py-3"><Mono className="text-foreground">{b.changes} clés</Mono></td>
              <td className="px-5 py-3"><Mono>{b.base}</Mono></td>
              <td className="px-5 py-3 text-xs text-muted-foreground">{b.updated}</td>
              <td className="px-5 py-3 text-right">{b.status === "conflict" ? <GhostBtn onClick={() => resolve(b)}>Résoudre</GhostBtn> : b.status === "open" ? <GhostBtn>Fusionner</GhostBtn> : null}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

function Agents() {
  return (
    <>
      <PageHead eyebrow="WORKSPACE / AGENTS" title="Agents" desc="Les agents connectés via l'API ou le serveur MCP." action={<PrimaryBtn><Plus className="size-4" />Connecter un agent</PrimaryBtn>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => (
          <Card key={a.id} className="p-5 transition hover:border-primary/40">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary"><Bot className="size-5" /></div><div><p className="font-medium">{a.id}</p><p className="text-xs text-muted-foreground">{a.role}</p></div></div>
              <Pill s={a.status} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-md border border-border bg-background/50 p-3 text-center">
              <div><p className="text-lg font-semibold">{a.commits}</p><p className="text-[11px] text-muted-foreground">Commits</p></div>
              <div><p className="text-lg font-semibold">{a.conflicts}</p><p className="text-[11px] text-muted-foreground">Conflits</p></div>
              <div><p className="text-lg font-semibold">{a.lease ? 1 : 0}</p><p className="text-[11px] text-muted-foreground">Baux</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs"><Mono>{a.model}</Mono>{a.lease && <span className="flex items-center gap-1 text-primary"><Lock className="size-3" />{a.lease}</span>}</div>
          </Card>
        ))}
      </div>
    </>
  );
}

function SharedState() {
  return (
    <>
      <PageHead eyebrow="WORKSPACE / SHARED MEMORY" title="État partagé" desc="Vue adressée par contenu des valeurs que les agents lisent et écrivent ensemble." action={<span className="rounded-md border border-border bg-card px-3 py-1.5 text-xs">HEAD <Mono className="text-foreground">a41c9e2f</Mono></span>} />
      <Card>
        <CardHead title="Clés du workspace" sub={`${stateKeys.length} clés dans le snapshot courant`} right={<span className="font-mono text-[11px] text-muted-foreground">CONTENT ADDRESSED</span>} />
        <Table head={["CLÉ", "HASH", "VALEUR", "DERNIER AUTEUR"]}>
          {stateKeys.map((k) => (
            <tr key={k.key} className="hover:bg-accent/40">
              <td className="px-5 py-3 font-mono text-xs font-medium">{k.key}</td>
              <td className="px-5 py-3"><Mono>{k.hash}</Mono></td>
              <td className="px-5 py-3"><code className="rounded bg-muted px-2 py-1 font-mono text-xs">{JSON.stringify(k.value)}</code></td>
              <td className="px-5 py-3 text-xs text-muted-foreground">{k.writer}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

function EventLog() {
  return (
    <>
      <PageHead eyebrow="WORKSPACE / AUDIT TRAIL" title="Journal d'événements" desc="Registre ordonné des décisions, écritures, baux et opérations de branches." action={<GhostBtn><Download className="size-3.5" />Exporter JSONL</GhostBtn>} />
      <Card><EventList items={events} /></Card>
    </>
  );
}

function SettingsPage() {
  const rows = [["Stockage", "PostgreSQL"], ["Baux obligatoires", "Oui, pour les écritures"], ["Multi-processus", "Instance unique"], ["Authentification", "JWT + appartenance"], ["Transport MCP", "stdio"], ["Version", "0.4.0-beta"]];
  return (
    <>
      <PageHead eyebrow="WORKSPACE / CONFIGURATION" title="Paramètres du runtime" desc="Configuration et limites opérationnelles de cette instance Cohort." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHead title="Stockage et coordination" />{rows.map(([k, v]) => <div key={k} className="flex justify-between border-b border-border px-5 py-3 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>)}</Card>
        <Card className="p-5"><p className="text-sm font-semibold">Note de déploiement</p><p className="mt-2 text-sm text-muted-foreground">Ce déploiement est limité à une seule organisation. L'isolation multi-organisations et le MCP distant authentifié ne sont pas encore activés.</p><div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-primary">Bêta — les API et formats d'événements peuvent changer.</div></Card>
      </div>
    </>
  );
}

function Modal({ title, eyebrow, onClose, children }: { title: string; eyebrow: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-lg border border-border bg-popover p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between"><div><p className="font-mono text-[11px] tracking-widest text-primary">{eyebrow}</p><h2 className="text-lg font-semibold">{title}</h2></div><button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent"><X className="size-4" /></button></div>
        {children}
      </div>
    </div>
  );
}

export function CohortDashboard() {
  const [tab, setTab] = useState<Tab>("Vue d'ensemble");
  const [resolving, setResolving] = useState<Branch | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5"><div className="grid size-8 place-items-center rounded-md bg-primary font-bold text-primary-foreground glow-primary">C</div><div><p className="text-sm font-semibold">Cohort</p><p className="text-[11px] text-muted-foreground">cerbere · beta</p></div></div>
        <div className="mx-3 mb-3 flex items-center justify-between rounded-md border border-sidebar-border px-3 py-2 text-xs"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-success" />main</span><ChevronRight className="size-3 text-muted-foreground" /></div>
        <nav className="flex-1 space-y-0.5 px-3">
          <p className="px-2 pb-1 pt-2 font-mono text-[10px] tracking-widest text-muted-foreground">WORKSPACE</p>
          {nav.map(({ tab: t, icon: I }) => (
            <button key={t} onClick={() => setTab(t)} className={cn("flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition", tab === t ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground")}>
              <I className={cn("size-4", tab === t && "text-primary")} />{t}
              {t === "Branches" && <span className="ml-auto rounded bg-destructive/15 px-1.5 text-[10px] text-destructive">2</span>}
            </button>
          ))}
        </nav>
        <div className="m-3 rounded-md border border-sidebar-border p-3">
          <div className="flex items-center gap-2 text-xs"><Activity className="size-3.5 text-success" />API · 42 ms</div>
          <div className="mt-3 flex items-center gap-2"><div className="grid size-7 place-items-center rounded-full bg-accent text-xs font-semibold">C</div><div className="min-w-0"><p className="truncate text-xs font-medium">christopher@cohort.dev</p><p className="text-[10px] text-muted-foreground">Admin</p></div></div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">Workspace <ChevronRight className="size-3.5" /><span className="text-foreground">{tab}</span></div>
          <div className="ml-auto hidden w-72 items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:flex"><Search className="size-3.5" />Rechercher branches, clés, événements…<kbd className="ml-auto flex items-center gap-0.5 rounded border border-border px-1 font-mono text-[10px]"><Command className="size-2.5" />K</kbd></div>
          <button className="relative rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"><Bell className="size-4" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" /></button>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 md:hidden">{nav.map(({ tab: t }) => <button key={t} onClick={() => setTab(t)} className={cn("shrink-0 rounded-md px-3 py-1.5 text-xs", tab === t ? "bg-accent text-foreground" : "text-muted-foreground")}>{t}</button>)}</div>
        <main className="bg-grid flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {tab === "Vue d'ensemble" && <Overview go={setTab} resolve={setResolving} />}
            {tab === "Agents" && <Agents />}
            {tab === "Branches" && <Branches resolve={setResolving} create={() => setCreating(true)} />}
            {tab === "État partagé" && <SharedState />}
            {tab === "Journal" && <EventLog />}
            {tab === "Paramètres" && <SettingsPage />}
          </div>
        </main>
      </div>
      {resolving && (
        <Modal eyebrow="REVUE DE CONFLIT" title={`Résoudre ${resolving.name}`} onClose={() => setResolving(null)}>
          <p className="mb-3 text-sm text-muted-foreground">Clé <Mono className="text-foreground">{conflict.key}</Mono> — comparez les trois versions avant d'appliquer une résolution.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["base", "head", "branch"] as const).map((k) => (
              <div key={k} className={cn("rounded-md border bg-background p-3", k === "branch" ? "border-primary/40" : "border-border")}><p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{k}</p><pre className="font-mono text-xs">{JSON.stringify(conflict[k], null, 2)}</pre></div>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2"><GhostBtn onClick={() => setResolving(null)}>Garder HEAD</GhostBtn><PrimaryBtn onClick={() => setResolving(null)}><GitMerge className="size-4" />Appliquer la branche</PrimaryBtn></div>
        </Modal>
      )}
      {creating && (
        <Modal eyebrow="WORKSPACE / BRANCHES" title="Créer une branche" onClose={() => setCreating(false)}>
          {["ID de l'agent", "Nom de la branche"].map((l, i) => <label key={l} className="mb-3 block text-xs text-muted-foreground">{l}<input placeholder={i ? "implement-api" : "agent-backend"} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring" /></label>)}
          <div className="mt-5 flex justify-end gap-2"><GhostBtn onClick={() => setCreating(false)}>Annuler</GhostBtn><PrimaryBtn onClick={() => setCreating(false)}>Créer</PrimaryBtn></div>
        </Modal>
      )}
    </div>
  );
}
