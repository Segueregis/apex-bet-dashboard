import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWasmEngine } from "@/hooks/useWasmEngine";
import { DelayMonitor } from "@/components/DelayMonitor";
import { EventLog } from "@/components/EventLog";
import { ConnectionSettings } from "@/components/ConnectionSettings";
import { StatusDot } from "@/components/StatusDot";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, Play, Square, Cpu } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · LatencyOps" },
      { name: "description", content: "Real-time delay monitor, event log and connection settings." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const engine = useWasmEngine();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-muted-foreground">
        Authenticating<span className="blink">_</span>
      </div>
    );
  }

  const avgLatency = (engine.delay.houseA + engine.delay.houseB) / 2;
  const connStatus = engine.status === "running" ? "online" : "offline";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-40 bg-background/80">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-mono font-bold text-lg text-grad">LatencyOps</span>
            <span className="text-xs font-mono text-muted-foreground ml-3 hidden sm:inline">/ FIFA e-soccer console</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-5">
              <StatusDot status={connStatus} label="engine" />
              <StatusDot status={connStatus} label="latency" latency={avgLatency} />
              <div className="flex items-center gap-2 text-xs font-mono">
                <Cpu className="h-3 w-3 text-accent" />
                <span className="text-muted-foreground">WASM</span>
                <span className="text-warning">simulator</span>
              </div>
            </div>
            <span className="hidden lg:inline text-xs font-mono text-muted-foreground">{user.email}</span>
            <Button size="sm" variant="ghost" onClick={signOut} className="font-mono">
              <LogOut className="h-4 w-4 mr-1" /> exit
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Engine controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-mono">Operations</h1>
            <p className="text-sm text-muted-foreground font-mono">Real-time market monitoring · low-latency core</p>
          </div>
          <div className="flex gap-2">
            {engine.status === "running" ? (
              <Button onClick={engine.stop} variant="destructive" className="font-mono">
                <Square className="h-4 w-4 mr-2" /> stop engine
              </Button>
            ) : (
              <Button onClick={engine.start} className="font-mono glow">
                <Play className="h-4 w-4 mr-2" /> start engine
              </Button>
            )}
          </div>
        </div>

        {/* Delay + Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DelayMonitor delay={engine.delay} />
          <EventLog events={engine.events} onClear={engine.clear} />
        </div>

        {/* Connection settings */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold font-mono">Connection Settings</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Tokens, cookies and endpoints stored encrypted per user · consumed by the WASM engine via Direct API Request.
            </p>
          </div>
          <ConnectionSettings />
        </section>
      </main>
    </div>
  );
}
