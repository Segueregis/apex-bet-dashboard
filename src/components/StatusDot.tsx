import { cn } from "@/lib/utils";

type Status = "online" | "offline" | "degraded";

export function StatusDot({ status, label, latency }: { status: Status; label?: string; latency?: number }) {
  const color =
    status === "online" ? "bg-success" : status === "degraded" ? "bg-warning" : "bg-destructive";
  return (
    <div className="inline-flex items-center gap-2 text-xs font-mono">
      <span className={cn("h-2 w-2 rounded-full pulse-dot", color)} />
      {label && <span className="text-muted-foreground uppercase tracking-wider">{label}</span>}
      {typeof latency === "number" && (
        <span className="text-foreground">{latency.toFixed(1)}ms</span>
      )}
    </div>
  );
}
