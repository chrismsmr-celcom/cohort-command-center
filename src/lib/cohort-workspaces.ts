import type { CohortSession } from "./cohort-auth";

export type CohortWorkspace = { id: string; name: string; role: string };

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function listWorkspaces(session: CohortSession): Promise<CohortWorkspace[]> {
  if (!apiBase) throw new Error("VITE_API_BASE_URL is not configured.");
  const response = await fetch(`${apiBase}/api/workspaces`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || "Unable to load workspaces");
  return (payload.items || []) as CohortWorkspace[];
}

export function workspaceHeaders(session: CohortSession, workspaceId: string) {
  return {
    Authorization: `Bearer ${session.access_token}`,
    "X-Organization-ID": workspaceId,
    "Content-Type": "application/json",
  };
}
