import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { StatusDot } from "./StatusDot";
import { z } from "zod";

const HOUSES = ["House A", "House B"] as const;

const schema = z.object({
  endpoint: z.string().trim().max(500).url("Endpoint must be a valid URL").or(z.literal("")),
  api_token: z.string().trim().max(2000),
  session_cookie: z.string().trim().max(4000),
});

interface Row {
  house_label: string;
  endpoint: string;
  api_token: string;
  session_cookie: string;
}

export function ConnectionSettings() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("connection_settings").select("*").eq("user_id", user.id);
      const map: Record<string, Row> = {};
      for (const h of HOUSES) map[h] = { house_label: h, endpoint: "", api_token: "", session_cookie: "" };
      data?.forEach((d) => {
        map[d.house_label] = {
          house_label: d.house_label,
          endpoint: d.endpoint ?? "",
          api_token: d.api_token ?? "",
          session_cookie: d.session_cookie ?? "",
        };
      });
      setRows(map);
      setLoading(false);
    })();
  }, [user]);

  const update = (house: string, field: keyof Row, value: string) =>
    setRows((p) => ({ ...p, [house]: { ...p[house], [field]: value } }));

  const save = async (house: string) => {
    if (!user) return;
    const r = rows[house];
    const parsed = schema.safeParse({ endpoint: r.endpoint, api_token: r.api_token, session_cookie: r.session_cookie });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(house);
    const { error } = await supabase.from("connection_settings").upsert(
      { user_id: user.id, house_label: house, endpoint: r.endpoint || null, api_token: r.api_token || null, session_cookie: r.session_cookie || null },
      { onConflict: "user_id,house_label" },
    );
    setSaving(null);
    if (error) toast.error(error.message);
    else toast.success(`${house} configuration saved`);
  };

  if (loading) return <Card className="p-6 card-grad">Loading…</Card>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {HOUSES.map((h) => {
        const r = rows[h];
        const configured = !!(r.endpoint && r.api_token);
        return (
          <Card key={h} className="card-grad p-6 border-border/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">{h}</h3>
              <StatusDot status={configured ? "online" : "offline"} label={configured ? "configured" : "not set"} />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Endpoint</Label>
              <Input
                className="font-mono mt-1"
                placeholder="https://api.house.com/v1/bet"
                value={r.endpoint}
                onChange={(e) => update(h, "endpoint", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">API Token</Label>
              <Input
                className="font-mono mt-1"
                type="password"
                placeholder="••••••••••••••"
                value={r.api_token}
                onChange={(e) => update(h, "api_token", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Session Cookie</Label>
              <Textarea
                className="font-mono mt-1 text-xs h-20 resize-none"
                placeholder="session=abc123; auth=xyz..."
                value={r.session_cookie}
                onChange={(e) => update(h, "session_cookie", e.target.value)}
              />
            </div>
            <Button onClick={() => save(h)} disabled={saving === h} className="w-full font-mono">
              {saving === h ? "Saving…" : "Save"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
