import type { CohortSession } from "./cohort-auth";
import { workspaceHeaders } from "./cohort-workspaces";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function cohortApi<T>(
  path: string,
  session: CohortSession,
  workspaceId: string,
  init: RequestInit = {},
): Promise<T> {
  if (!apiBase) throw new Error("VITE_API_BASE_URL is not configured.");
  if (!path.startsWith("/")) throw new Error("API paths must start with /");
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      ...workspaceHeaders(session, workspaceId),
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) throw new Error("Your session has expired. Sign in again.");
    if (response.status === 403) throw new Error("You do not have access to this workspace or action.");
    throw new Error(payload.detail || `Cohort API request failed (${response.status})`);
  }
  return payload as T;
}
