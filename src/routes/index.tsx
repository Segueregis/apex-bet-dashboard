import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Activity } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · LatencyOps" },
      { name: "description", content: "Authenticate to access the real-time betting operations console." },
    ],
  }),
  component: LoginPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 chars").max(72),
});

function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  if (user) return <Navigate to="/dashboard" />;

  const handle = (mode: "in" | "up") => async (e: FormEvent) => {
    e.preventDefault();
    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { error } = mode === "in" ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (error) toast.error(error);
    else { toast.success(mode === "in" ? "Authenticated" : "Account created"); navigate({ to: "/dashboard" }); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-mono text-2xl font-bold text-grad tracking-tight">LatencyOps</span>
          </div>
          <h1 className="text-xl font-semibold">Operations Console</h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">Authenticate to continue</p>
        </div>

        <Card className="card-grad border-border/60 p-6 shadow-card">
          <Tabs defaultValue="in">
            <TabsList className="grid grid-cols-2 mb-6 w-full">
              <TabsTrigger value="in" className="font-mono">Sign in</TabsTrigger>
              <TabsTrigger value="up" className="font-mono">Sign up</TabsTrigger>
            </TabsList>

            {(["in", "up"] as const).map((mode) => (
              <TabsContent key={mode} value={mode}>
                <form onSubmit={handle(mode)} className="space-y-4">
                  <div>
                    <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                    <Input className="font-mono mt-1" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                    <Input className="font-mono mt-1" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" disabled={busy} className="w-full font-mono glow">
                    {busy ? "..." : mode === "in" ? "Authenticate" : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 font-mono">
          Secured · session-based auth
        </p>
      </div>
    </div>
  );
}
