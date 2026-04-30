import type { DelayMetric } from "@/hooks/useWasmEngine";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DelayMonitor({ delay }: { delay: DelayMetric }) {
  const max = Math.max(delay.houseA, delay.houseB, 80);
  const aPct = (delay.houseA / max) * 100;
  const bPct = (delay.houseB / max) * 100;
  const winner = delay.houseA < delay.houseB ? "A" : "B";
  const advantage = Math.abs(delay.delta);

  return (
    <Card className="card-grad p-6 border-border/60">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Delay Monitor</h3>
          <p className="text-xs text-muted-foreground mt-0.5">FIFA e-soccer · response time A/B</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground font-mono">ADVANTAGE</div>
          <div className="text-lg font-mono font-bold text-grad">+{advantage.toFixed(1)}ms · {winner}</div>
        </div>
      </div>

      <Bar label="House A" value={delay.houseA} pct={aPct} winning={winner === "A"} />
      <div className="h-3" />
      <Bar label="House B" value={delay.houseB} pct={bPct} winning={winner === "B"} />
    </Card>
  );
}

function Bar({ label, value, pct, winning }: { label: string; value: number; pct: number; winning: boolean }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5 font-mono text-xs">
        <span className={cn("uppercase tracking-wider", winning ? "text-primary" : "text-muted-foreground")}>{label}</span>
        <span className={winning ? "text-primary font-bold" : "text-foreground"}>{value.toFixed(1)} ms</span>
      </div>
      <div className="h-2 rounded-full bg-input overflow-hidden">
        <div
          className={cn("h-full transition-all duration-200 rounded-full", winning ? "bg-primary glow" : "bg-accent/60")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
