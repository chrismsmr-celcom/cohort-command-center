import { useEffect, useState } from "react";
import { KeyRound, Mail, Github, Chrome } from "lucide-react";
import {
  persistSessionFromCallback, readSession, refreshSession, sendMagicLink,
  signIn, signInWithOAuth, signUp, type CohortSession,
} from "@/lib/cohort-auth";

type Props = { onAuthenticated: (session: CohortSession) => void };

export function AuthGate({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        let session = persistSessionFromCallback() || readSession();
        if (!session) return;
        if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000) + 60) {
          session = await refreshSession(session);
        }
        if (active && session.access_token) onAuthenticated(session);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Session validation failed");
      }
    };
    void initialize();
    return () => { active = false; };
  }, [onAuthenticated]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await action();
      if (result && typeof result === "object" && "access_token" in result) {
        onAuthenticated(result as CohortSession);
      } else {
        setMessage("Check your email to continue.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-7 shadow-xl">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">C</div>
          <div><h1 className="text-lg font-semibold">Cohort</h1><p className="text-xs text-muted-foreground">Multi-agent coordination</p></div>
        </div>
        <h2 className="text-xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your account can belong to multiple workspaces.</p>
        <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); void run(() => mode === "signin" ? signIn(email, password) : signUp(email, password)); }}>
          <label className="block text-xs text-muted-foreground">Email
            <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground" placeholder="you@company.com" />
          </label>
          <label className="block text-xs text-muted-foreground">Password
            <input required minLength={8} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground" placeholder="At least 8 characters" />
          </label>
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"><KeyRound className="size-4" />{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        <button disabled={busy || !email} onClick={() => void run(() => sendMagicLink(email))} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm hover:bg-accent disabled:opacity-50"><Mail className="size-4" />Send magic link</button>
        <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground"><span className="h-px flex-1 bg-border" />OR CONTINUE WITH<span className="h-px flex-1 bg-border" /></div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => signInWithOAuth("google")} className="flex items-center justify-center gap-2 rounded-md border border-border py-2 text-sm hover:bg-accent"><Chrome className="size-4" />Google</button>
          <button onClick={() => signInWithOAuth("github")} className="flex items-center justify-center gap-2 rounded-md border border-border py-2 text-sm hover:bg-accent"><Github className="size-4" />GitHub</button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {message && <p role="status" className="mt-4 rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p>}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to Cohort?" : "Already have an account?"}{" "}
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }} className="font-medium text-primary hover:underline">{mode === "signin" ? "Create an account" : "Sign in"}</button>
        </p>
      </section>
    </main>
  );
}
