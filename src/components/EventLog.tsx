import { useEffect, useRef } from "react";
import type { EngineEvent } from "@/hooks/useWasmEngine";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

const levelColor: Record<EngineEvent["level"], string> = {
  info: "text-muted-foreground",
  ok: "text-primary",
  warn: "text-warning",
  err: "text-destructive",
};

function fmtTime(ts: number) {
  const d = new Date(ts);
  return `${d.toLocaleTimeString("en-GB", { hour12: false })}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

export function EventLog({ events, onClear }: { events: EngineEvent[]; onClear: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ top: 0 }); }, [events.length]);

  return (
    <Card className="card-grad border-border/60 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <div>
          <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Event Log</h3>
          <p className="text-xs text-muted-foreground mt-0.5">ms-precision · live</p>
        </div>
        <Button size="sm" variant="ghost" onClick={onClear} className="font-mono text-xs">
          <Trash2 className="h-3 w-3 mr-1" /> clear
        </Button>
      </div>
      <div
        ref={ref}
        className="font-mono text-xs h-[420px] overflow-y-auto p-4 space-y-1"
        style={{ background: "var(--terminal-bg)" }}
      >
        {events.length === 0 ? (
          <div className="text-muted-foreground">
            <span className="text-primary">$</span> waiting for engine events<span className="blink">_</span>
          </div>
        ) : (
          events.map((e, i) => (
            <div key={i} className="flex gap-2 leading-relaxed">
              <span className="text-muted-foreground shrink-0">{fmtTime(e.ts)}</span>
              <span className="text-accent shrink-0 w-16">[{e.channel}]</span>
              <span className={cn("flex-1", levelColor[e.level])}>{e.message}</span>
              {e.latencyMs != null && (
                <span className="text-primary shrink-0">{e.latencyMs}ms</span>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
