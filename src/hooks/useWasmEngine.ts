/**
 * useWasmEngine
 * --------------
 * Hook preparado para integrar um módulo WebAssembly (C++) responsável
 * pelo processamento de odds em tempo real e disparo de apostas via
 * Direct API Request.
 *
 * O módulo .wasm real deve ser colocado em `public/wasm/engine.wasm`
 * junto com a glue gerada (wasm-pack ou Emscripten). A interface
 * abaixo descreve o contrato que esse módulo deverá expor.
 *
 * Enquanto o binário não existe, o hook opera em modo "simulator" e
 * gera eventos sintéticos para validar UI/latência da camada React.
 */
import { useEffect, useRef, useState, useCallback } from "react";

export interface EngineEvent {
  ts: number;
  level: "info" | "ok" | "warn" | "err";
  channel: "engine" | "houseA" | "houseB" | "match";
  message: string;
  latencyMs?: number;
}

export interface DelayMetric {
  houseA: number; // ms
  houseB: number; // ms
  delta: number;  // ms (A - B, positivo = A mais lenta)
}

export interface WasmEngineApi {
  status: "idle" | "running" | "error";
  events: EngineEvent[];
  delay: DelayMetric;
  start: () => void;
  stop: () => void;
  clear: () => void;
}

const MAX_EVENTS = 200;

export function useWasmEngine(): WasmEngineApi {
  const [status, setStatus] = useState<WasmEngineApi["status"]>("idle");
  const [events, setEvents] = useState<EngineEvent[]>([]);
  const [delay, setDelay] = useState<DelayMetric>({ houseA: 0, houseB: 0, delta: 0 });
  const tickRef = useRef<number | null>(null);

  const push = useCallback((e: EngineEvent) => {
    setEvents((prev) => {
      const next = [e, ...prev];
      return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
    });
  }, []);

  const start = useCallback(() => {
    if (tickRef.current != null) return;
    setStatus("running");
    push({ ts: Date.now(), level: "info", channel: "engine", message: "Engine started (simulator mode — WASM module not loaded)" });

    // TODO: substituir por: await WebAssembly.instantiateStreaming(fetch('/wasm/engine.wasm'), importObject)
    tickRef.current = window.setInterval(() => {
      const a = 8 + Math.random() * 60;
      const b = 8 + Math.random() * 60;
      setDelay({ houseA: a, houseB: b, delta: a - b });

      const r = Math.random();
      if (r < 0.08) push({ ts: Date.now(), level: "ok", channel: "match", message: "⚽ Goal detected", latencyMs: Math.round(Math.min(a, b)) });
      else if (r < 0.18) push({ ts: Date.now(), level: "ok", channel: a < b ? "houseA" : "houseB", message: `Bet placed in ${Math.round(Math.min(a, b))}ms`, latencyMs: Math.round(Math.min(a, b)) });
      else if (r < 0.22) push({ ts: Date.now(), level: "warn", channel: a > b ? "houseA" : "houseB", message: "Latency spike detected", latencyMs: Math.round(Math.max(a, b)) });
    }, 350);
  }, [push]);

  const stop = useCallback(() => {
    if (tickRef.current != null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setStatus("idle");
    push({ ts: Date.now(), level: "info", channel: "engine", message: "Engine stopped" });
  }, [push]);

  const clear = useCallback(() => setEvents([]), []);

  useEffect(() => () => { if (tickRef.current != null) clearInterval(tickRef.current); }, []);

  return { status, events, delay, start, stop, clear };
}
