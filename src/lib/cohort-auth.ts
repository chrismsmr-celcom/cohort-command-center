export type CohortSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  token_type: string;
  user: { id: string; email?: string };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function config() {
  if (!supabaseUrl || !anonKey) {
    throw new Error("Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return { supabaseUrl, anonKey };
}

const SESSION_KEY = "cohort.auth.session";

export function readSession(): CohortSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as CohortSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: CohortSession | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
}

async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  const { supabaseUrl, anonKey } = config();
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.msg || payload.message || payload.error_description || payload.error || "Authentication request failed");
  }
  return payload as T;
}

export async function signIn(email: string, password: string) {
  const session = await authRequest<CohortSession>("token?grant_type=password", { email, password });
  saveSession(session);
  return session;
}

export async function signUp(email: string, password: string) {
  const result = await authRequest<CohortSession>("signup", { email, password });
  if (result.access_token) saveSession(result);
  return result;
}

export async function sendMagicLink(email: string) {
  await authRequest("otp", { email, create_user: true, email_redirect_to: window.location.origin });
}

export async function signInWithOAuth(provider: "google" | "github" | "azure") {
  const { supabaseUrl, anonKey } = config();
  const redirectTo = `${window.location.origin}/`;
  const url = new URL(`${supabaseUrl}/auth/v1/authorize`);
  url.searchParams.set("provider", provider);
  url.searchParams.set("redirect_to", redirectTo);
  url.searchParams.set("apikey", anonKey);
  window.location.assign(url.toString());
}

export async function refreshSession(session: CohortSession) {
  const refreshed = await authRequest<CohortSession>("token?grant_type=refresh_token", {
    refresh_token: session.refresh_token,
  });
  saveSession(refreshed);
  return refreshed;
}

export async function signOut() {
  const session = readSession();
  if (session) {
    const { supabaseUrl, anonKey } = config();
    await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: anonKey, Authorization: `Bearer ${session.access_token}` },
    }).catch(() => undefined);
  }
  saveSession(null);
}

export function persistSessionFromCallback() {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (!accessToken || !refreshToken) return readSession();
  const expiresIn = Number(hash.get("expires_in") || "3600");
  const session: CohortSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: hash.get("token_type") || "bearer",
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    user: { id: hash.get("user_id") || "", email: undefined },
  };
  saveSession(session);
  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  return session;
}
