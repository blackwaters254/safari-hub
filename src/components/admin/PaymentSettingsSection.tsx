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

      {/* BANK — KES */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">Bank Transfer — KES Account</h2>
            <p className="text-xs text-muted-foreground">Shown to local clients paying in Kenya Shillings</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Bank Name</Label><Input value={settings.bank_name || ""} onChange={(e) => update("bank_name", e.target.value)} /></div>
          <div><Label>Account Name</Label><Input value={settings.bank_account_name || ""} onChange={(e) => update("bank_account_name", e.target.value)} /></div>
          <div><Label>Account Number</Label><Input value={settings.bank_account_number || ""} onChange={(e) => update("bank_account_number", e.target.value)} /></div>
          <div><Label>Branch</Label><Input value={settings.bank_branch || ""} onChange={(e) => update("bank_branch", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>SWIFT Code (optional)</Label><Input value={settings.bank_swift || ""} onChange={(e) => update("bank_swift", e.target.value)} /></div>
        </div>
      </div>

      {/* BANK — USD */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">Bank Transfer — USD Account (International)</h2>
            <p className="text-xs text-muted-foreground">Default for international clients & those paying in USD/EUR</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Bank Name</Label><Input value={settings.bank_usd_name || ""} onChange={(e) => update("bank_usd_name", e.target.value)} placeholder="e.g. KCB Bank Kenya" /></div>
          <div><Label>Account Name</Label><Input value={settings.bank_usd_account_name || ""} onChange={(e) => update("bank_usd_account_name", e.target.value)} placeholder="Blackwaters Safaris Ltd" /></div>
          <div><Label>USD Account Number</Label><Input value={settings.bank_usd_account_number || ""} onChange={(e) => update("bank_usd_account_number", e.target.value)} /></div>
          <div><Label>Branch</Label><Input value={settings.bank_usd_branch || ""} onChange={(e) => update("bank_usd_branch", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>SWIFT / BIC Code</Label><Input value={settings.bank_usd_swift || ""} onChange={(e) => update("bank_usd_swift", e.target.value)} placeholder="Required for international wires" /></div>
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

      {/* PROMOTION (3-Day Mara & Amboseli) */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Tag className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">Hot Deal Promotion</h2>
            <p className="text-xs text-muted-foreground">Editable promo shown on the homepage & popup. Prices in KSh — site auto-converts on currency toggle.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Title</Label>
            <Input value={settings.hot_deal_title || ""} onChange={(e) => update("hot_deal_title", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Subtitle</Label>
            <Input value={settings.hot_deal_subtitle || ""} onChange={(e) => update("hot_deal_subtitle", e.target.value)} />
          </div>
          <div>
            <Label>Savings Badge Label</Label>
            <Input value={settings.hot_deal_savings_label || ""} onChange={(e) => update("hot_deal_savings_label", e.target.value)} placeholder="SAVE $350" />
          </div>
          <div className="sm:col-span-2">
            <Label>Package Includes (one item per line)</Label>
            <Textarea
              rows={6}
              value={(settings.hot_deal_includes || []).join("\n")}
              onChange={(e) => update("hot_deal_includes", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
            />
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-sm font-semibold">Pricing tiers (KSh)</p>
          {[1, 2, 3].map((n) => (
            <div key={n} className="grid sm:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
              <div>
                <Label className="text-xs">Tier {n} Label</Label>
                <Input value={settings[`hot_deal_tier${n}_label`] || ""} onChange={(e) => update(`hot_deal_tier${n}_label`, e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Original (was) KSh</Label>
                <Input type="number" value={settings[`hot_deal_tier${n}_was_ksh`] ?? 0} onChange={(e) => update(`hot_deal_tier${n}_was_ksh`, parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Current (now) KSh</Label>
                <Input type="number" value={settings[`hot_deal_tier${n}_now_ksh`] ?? 0} onChange={(e) => update(`hot_deal_tier${n}_now_ksh`, parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          ))}
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
