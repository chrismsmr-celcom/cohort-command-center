export type Branch = { id: string; name: string; agent: string; status: "open" | "conflict" | "merged"; changes: number; base: string; updated: string };
export const agents = [
  { id: "agent-planner", role: "Planner", model: "gpt-5", status: "active", commits: 142, conflicts: 3, lease: "plan.roadmap" },
  { id: "agent-backend", role: "Backend engineer", model: "claude-sonnet", status: "active", commits: 318, conflicts: 11, lease: "api.schema" },
  { id: "agent-frontend", role: "Frontend engineer", model: "gemini-pro", status: "waiting", commits: 204, conflicts: 7, lease: null },
  { id: "agent-reviewer", role: "Reviewer", model: "gpt-5-mini", status: "idle", commits: 61, conflicts: 0, lease: null },
  { id: "agent-research", role: "Researcher", model: "claude-haiku", status: "active", commits: 97, conflicts: 2, lease: "docs.sources" },
] as const;
export const branches: Branch[] = [
  { id: "br_9f2a", name: "implement-api", agent: "agent-backend", status: "conflict", changes: 6, base: "a41c9e2f", updated: "il y a 2 min" },
  { id: "br_77c1", name: "landing-copy", agent: "agent-frontend", status: "open", changes: 3, base: "a41c9e2f", updated: "il y a 6 min" },
  { id: "br_3b0e", name: "q3-roadmap", agent: "agent-planner", status: "open", changes: 9, base: "c08d11ab", updated: "il y a 14 min" },
  { id: "br_e5d4", name: "sources-audit", agent: "agent-research", status: "merged", changes: 12, base: "c08d11ab", updated: "il y a 32 min" },
  { id: "br_12aa", name: "review-pr-48", agent: "agent-reviewer", status: "merged", changes: 1, base: "f9e2007c", updated: "il y a 1 h" },
  { id: "br_c4f9", name: "auth-schema", agent: "agent-backend", status: "conflict", changes: 4, base: "f9e2007c", updated: "il y a 1 h" },
];
export const stateKeys = [
  { key: "api.schema", hash: "sha256:7b1e04c2", value: { version: 3, routes: 14 }, writer: "agent-backend" },
  { key: "plan.roadmap", hash: "sha256:a90f3d11", value: ["auth", "billing", "mcp-remote"], writer: "agent-planner" },
  { key: "ui.theme", hash: "sha256:0c2e88aa", value: { mode: "dark", accent: "amber" }, writer: "agent-frontend" },
  { key: "docs.sources", hash: "sha256:51d2be70", value: { count: 38, verified: 31 }, writer: "agent-research" },
  { key: "release.version", hash: "sha256:e1f04a9b", value: "0.4.0-beta", writer: "agent-reviewer" },
  { key: "config.require_leases", hash: "sha256:3ac7d002", value: true, writer: "system" },
];
export const events = [
  { t: "13:48:12", type: "conflict.detected", agent: "agent-backend", detail: "api.schema — modify vs modify", level: "warn" },
  { t: "13:47:55", type: "lease.acquired", agent: "agent-backend", detail: "api.schema · ttl 30s", level: "info" },
  { t: "13:46:31", type: "branch.commit", agent: "agent-research", detail: "sources-audit → main (12 keys)", level: "ok" },
  { t: "13:45:02", type: "lease.wait", agent: "agent-frontend", detail: "attend ui.theme détenu par agent-planner", level: "info" },
  { t: "13:43:40", type: "conflict.resolved", agent: "agent-reviewer", detail: "release.version · strategy=prefer_head", level: "ok" },
  { t: "13:41:18", type: "branch.create", agent: "agent-planner", detail: "q3-roadmap depuis c08d11ab", level: "info" },
  { t: "13:39:07", type: "deadlock.detected", agent: "system", detail: "cycle: frontend → planner → frontend", level: "error" },
  { t: "13:37:51", type: "snapshot.created", agent: "system", detail: "head a41c9e2f (parent c08d11ab)", level: "info" },
] as const;
export const activity = Array.from({ length: 14 }, (_, i) => ({
  day: `${6 + i} nov`,
  commits: [32, 41, 28, 55, 61, 47, 38, 72, 66, 81, 59, 74, 90, 84][i],
  conflicts: [3, 5, 2, 6, 4, 7, 3, 8, 5, 9, 4, 6, 7, 5][i],
}));
export const conflict = { key: "api.schema", base: { version: 2, routes: 12 }, head: { version: 3, routes: 13 }, branch: { version: 3, routes: 14, auth: "jwt" } };
