import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Building2, Flame, Save, DollarSign, Tag } from "lucide-react";


export default function PaymentSettingsSection() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await (supabase as any).from("payment_settings").select("*").limit(1).maybeSingle();
    setSettings(data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!settings) return;
    setLoading(true);
    const { id, created_at, updated_at, ...payload } = settings;
    const { error } = await (supabase as any).from("payment_settings").update(payload).eq("id", id);
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Settings saved & synced to site");
  };

  if (!settings) return <div className="p-6 text-muted-foreground">Loading payment settings...</div>;

  const update = (k: string, v: any) => setSettings({ ...settings, [k]: v });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Payment Settings</h1>
        <p className="text-muted-foreground text-sm">Edit M-Pesa and bank details — changes sync to the booking page instantly.</p>
      </div>

      {/* M-PESA */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">M-Pesa Paybill</h2>
            <p className="text-xs text-muted-foreground">Shown to customers when STK push fails</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Paybill Number</Label>
            <Input value={settings.paybill_number} onChange={(e) => update("paybill_number", e.target.value)} />
          </div>
          <div>
            <Label>Account Name / Number</Label>
            <Input value={settings.paybill_account} onChange={(e) => update("paybill_account", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Till Number (optional)</Label>
            <Input value={settings.till_number || ""} onChange={(e) => update("till_number", e.target.value)} />
          </div>
        </div>
      </div>

      {/* BANK */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">Bank Transfer</h2>
            <p className="text-xs text-muted-foreground">Alternative payment option</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Bank Name</Label>
            <Input value={settings.bank_name} onChange={(e) => update("bank_name", e.target.value)} />
          </div>
          <div>
            <Label>Account Name</Label>
            <Input value={settings.bank_account_name} onChange={(e) => update("bank_account_name", e.target.value)} />
          </div>
          <div>
            <Label>Account Number</Label>
            <Input value={settings.bank_account_number} onChange={(e) => update("bank_account_number", e.target.value)} />
          </div>
          <div>
            <Label>Branch</Label>
            <Input value={settings.bank_branch} onChange={(e) => update("bank_branch", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>SWIFT Code (international)</Label>
            <Input value={settings.bank_swift || ""} onChange={(e) => update("bank_swift", e.target.value)} />
          </div>
        </div>
      </div>

      {/* HOT DEAL */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">Hot Deal Countdown</h2>
            <p className="text-xs text-muted-foreground">Controls homepage popup & countdown timer</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 items-end">
          <div>
            <Label>Countdown End (date & time)</Label>
            <Input
              type="datetime-local"
              value={settings.hot_deal_end_date ? new Date(settings.hot_deal_end_date).toISOString().slice(0, 16) : ""}
              onChange={(e) => update("hot_deal_end_date", new Date(e.target.value).toISOString())}
            />
          </div>
          <div className="flex items-center gap-3 pb-2">
            <Switch checked={settings.hot_deal_active} onCheckedChange={(v) => update("hot_deal_active", v)} />
            <Label className="!mb-0">Hot deal popup active</Label>
          </div>
        </div>
      </div>

      {/* CURRENCY RATES */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">Currency Exchange Rates</h2>
            <p className="text-xs text-muted-foreground">Rate per 1 KSh. Updates prices across the site instantly.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>USD rate (1 KSh = ? USD)</Label>
            <Input
              type="number"
              step="0.0001"
              value={settings.currency_rate_usd ?? ""}
              onChange={(e) => update("currency_rate_usd", parseFloat(e.target.value))}
            />
            <p className="text-[11px] text-muted-foreground mt-1">e.g. 0.0077 means 1 USD ≈ KSh {settings.currency_rate_usd ? (1 / settings.currency_rate_usd).toFixed(2) : "—"}</p>
          </div>
          <div>
            <Label>EUR rate (1 KSh = ? EUR)</Label>
            <Input
              type="number"
              step="0.0001"
              value={settings.currency_rate_eur ?? ""}
              onChange={(e) => update("currency_rate_eur", parseFloat(e.target.value))}
            />
            <p className="text-[11px] text-muted-foreground mt-1">e.g. 0.0071 means 1 EUR ≈ KSh {settings.currency_rate_eur ? (1 / settings.currency_rate_eur).toFixed(2) : "—"}</p>
          </div>
        </div>
      </div>

      <Button onClick={save} disabled={loading} size="lg" className="w-full sm:w-auto">
        <Save className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save & Sync to Site"}
      </Button>
    </div>
  );
}
