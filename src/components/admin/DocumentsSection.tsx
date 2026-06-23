import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Receipt, FileSpreadsheet, FileSignature, Download, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "@/assets/logo.jpeg";

type DocType = "letter" | "receipt" | "quotation" | "invoice";

const BRAND = {
  name: "Blackwaters Safaris Ltd",
  tagline: "Premium Kenyan Safari Experiences",
  address: "AMBANK Building, Monrovia Street, Nairobi, Kenya",
  phone: "+254 118 596 089",
  email: "info@blackwaterssafaris.com",
  web: "www.blackwaterssafaris.com",
};

const today = () => new Date().toISOString().split("T")[0];
const docNo = (prefix: string) => `${prefix}-${Date.now().toString().slice(-7)}`;

interface LineItem { description: string; qty: number; unitPrice: number; }

const downloadPdf = async (el: HTMLElement, filename: string) => {
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
  const pdf = new jsPDF("p", "mm", "a4");
  const w = 210, h = 297;
  const imgH = (canvas.height * w) / canvas.width;
  let heightLeft = imgH;
  let pos = 0;
  const img = canvas.toDataURL("image/jpeg", 0.95);
  pdf.addImage(img, "JPEG", 0, pos, w, imgH);
  heightLeft -= h;
  while (heightLeft > 0) {
    pos = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(img, "JPEG", 0, pos, w, imgH);
    heightLeft -= h;
  }
  pdf.save(filename);
};

function Letterhead({ subtitle }: { subtitle: string }) {
  return (
    <div className="border-b-4 border-amber-600 pb-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900 leading-tight">{BRAND.name}</h1>
          <p className="text-xs text-amber-700 italic">{BRAND.tagline}</p>
        </div>
        <div className="text-right text-[10px] text-neutral-600 leading-snug">
          <p>{BRAND.address}</p>
          <p>{BRAND.phone} · {BRAND.email}</p>
          <p>{BRAND.web}</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.25em] font-bold text-amber-700">{subtitle}</p>
    </div>
  );
}

function Footer() {
  return (
    <div className="border-t border-neutral-300 mt-8 pt-3 text-center text-[9px] text-neutral-500">
      {BRAND.name} · {BRAND.address} · {BRAND.phone} · {BRAND.email}
    </div>
  );
}

/* ---------- LETTER ---------- */
function LetterDoc() {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState({
    date: today(),
    ref: docNo("LTR"),
    recipientName: "",
    recipientAddress: "",
    salutation: "Dear Sir/Madam,",
    subject: "",
    body: "",
    signerName: "",
    signerTitle: "Managing Director",
  });
  const u = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

  const exportPdf = async () => {
    if (!ref.current) return;
    setBusy(true);
    try { await downloadPdf(ref.current, `Letter-${data.ref}.pdf`); toast.success("Letter downloaded"); }
    catch (e: any) { toast.error("Failed: " + e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-3 bg-card p-5 rounded-xl border">
        <h3 className="font-heading font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> Letter Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Date</Label><Input type="date" value={data.date} onChange={(e) => u("date", e.target.value)} /></div>
          <div><Label>Reference</Label><Input value={data.ref} onChange={(e) => u("ref", e.target.value)} /></div>
        </div>
        <div><Label>Recipient Name</Label><Input value={data.recipientName} onChange={(e) => u("recipientName", e.target.value)} placeholder="Mr. John Doe" /></div>
        <div><Label>Recipient Address</Label><Textarea rows={2} value={data.recipientAddress} onChange={(e) => u("recipientAddress", e.target.value)} placeholder="Company / address lines" /></div>
        <div><Label>Salutation</Label><Input value={data.salutation} onChange={(e) => u("salutation", e.target.value)} /></div>
        <div><Label>Subject (RE:)</Label><Input value={data.subject} onChange={(e) => u("subject", e.target.value)} /></div>
        <div><Label>Body</Label><Textarea rows={10} value={data.body} onChange={(e) => u("body", e.target.value)} placeholder="Write the letter content..." /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Signer Name</Label><Input value={data.signerName} onChange={(e) => u("signerName", e.target.value)} /></div>
          <div><Label>Title</Label><Input value={data.signerTitle} onChange={(e) => u("signerTitle", e.target.value)} /></div>
        </div>
        <Button onClick={exportPdf} disabled={busy} className="w-full mt-2">
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} Download PDF
        </Button>
      </div>
      <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl overflow-auto">
        <div ref={ref} className="bg-white text-black p-10 mx-auto text-sm" style={{ width: 794, minHeight: 1123, fontFamily: "Georgia, serif" }}>
          <Letterhead subtitle="Official Correspondence" />
          <div className="flex justify-between text-xs mb-6">
            <div><strong>Ref:</strong> {data.ref}</div>
            <div><strong>Date:</strong> {new Date(data.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          <div className="mb-6">
            <p className="font-semibold">{data.recipientName || "Recipient Name"}</p>
            <p className="whitespace-pre-line text-xs">{data.recipientAddress}</p>
          </div>
          <p className="mb-3">{data.salutation}</p>
          {data.subject && <p className="font-bold underline mb-3">RE: {data.subject.toUpperCase()}</p>}
          <div className="whitespace-pre-line leading-relaxed mb-8 text-justify">{data.body || "Letter body will appear here..."}</div>
          <p className="mb-10">Yours sincerely,</p>
          <div className="border-t border-neutral-400 w-56 pt-1">
            <p className="font-bold">{data.signerName || "Authorised Signatory"}</p>
            <p className="text-xs">{data.signerTitle}</p>
            <p className="text-xs italic">{BRAND.name}</p>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

/* ---------- ITEM-BASED DOC (receipt / quotation / invoice) ---------- */
function ItemDoc({ type }: { type: Exclude<DocType, "letter"> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const prefix = type === "receipt" ? "RCP" : type === "invoice" ? "INV" : "QTN";
  const title = type === "receipt" ? "Official Receipt" : type === "invoice" ? "Tax Invoice" : "Quotation";

  const [data, setData] = useState({
    docNo: docNo(prefix),
    date: today(),
    dueDate: today(),
    validUntil: today(),
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    currency: "KSh",
    taxPct: type === "receipt" ? 0 : 16,
    notes: type === "receipt" ? "Thank you for your payment." : type === "quotation" ? "Quotation valid for 30 days. Prices subject to availability." : "Payment due within 14 days. Bank/M-Pesa details on request.",
    paymentMethod: "M-Pesa",
    refNumber: "",
  });
  const [items, setItems] = useState<LineItem[]>([{ description: "Safari Package", qty: 1, unitPrice: 0 }]);
  const u = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

  const subTotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = subTotal * (data.taxPct / 100);
  const total = subTotal + tax;

  const updateItem = (i: number, k: keyof LineItem, v: any) => {
    setItems(items.map((it, idx) => idx === i ? { ...it, [k]: k === "description" ? v : Number(v) || 0 } : it));
  };

  const exportPdf = async () => {
    if (!ref.current) return;
    setBusy(true);
    try { await downloadPdf(ref.current, `${title.replace(/\s/g, "")}-${data.docNo}.pdf`); toast.success(`${title} downloaded`); }
    catch (e: any) { toast.error("Failed: " + e.message); }
    finally { setBusy(false); }
  };

  const fmt = (n: number) => `${data.currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-3 bg-card p-5 rounded-xl border">
        <h3 className="font-heading font-bold flex items-center gap-2">
          {type === "receipt" ? <Receipt className="w-4 h-4" /> : type === "invoice" ? <FileSpreadsheet className="w-4 h-4" /> : <FileSignature className="w-4 h-4" />}
          {title} Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Doc #</Label><Input value={data.docNo} onChange={(e) => u("docNo", e.target.value)} /></div>
          <div><Label>Date</Label><Input type="date" value={data.date} onChange={(e) => u("date", e.target.value)} /></div>
        </div>
        {type === "invoice" && <div><Label>Due Date</Label><Input type="date" value={data.dueDate} onChange={(e) => u("dueDate", e.target.value)} /></div>}
        {type === "quotation" && <div><Label>Valid Until</Label><Input type="date" value={data.validUntil} onChange={(e) => u("validUntil", e.target.value)} /></div>}
        {type === "receipt" && (
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Payment Method</Label><Input value={data.paymentMethod} onChange={(e) => u("paymentMethod", e.target.value)} /></div>
            <div><Label>Reference #</Label><Input value={data.refNumber} onChange={(e) => u("refNumber", e.target.value)} placeholder="M-Pesa code..." /></div>
          </div>
        )}
        <div><Label>Client Name</Label><Input value={data.clientName} onChange={(e) => u("clientName", e.target.value)} /></div>
        <div><Label>Client Address</Label><Textarea rows={2} value={data.clientAddress} onChange={(e) => u("clientAddress", e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Email</Label><Input value={data.clientEmail} onChange={(e) => u("clientEmail", e.target.value)} /></div>
          <div><Label>Currency</Label><Input value={data.currency} onChange={(e) => u("currency", e.target.value)} /></div>
          <div><Label>Tax %</Label><Input type="number" value={data.taxPct} onChange={(e) => u("taxPct", Number(e.target.value))} /></div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <Label>Line Items</Label>
            <Button size="sm" variant="outline" onClick={() => setItems([...items, { description: "", qty: 1, unitPrice: 0 }])}>
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <Input className="col-span-6" placeholder="Description" value={it.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
              <Input className="col-span-2" type="number" placeholder="Qty" value={it.qty} onChange={(e) => updateItem(i, "qty", e.target.value)} />
              <Input className="col-span-3" type="number" placeholder="Unit price" value={it.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} />
              <Button size="icon" variant="ghost" className="col-span-1" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div><Label>Notes / Terms</Label><Textarea rows={3} value={data.notes} onChange={(e) => u("notes", e.target.value)} /></div>

        <Button onClick={exportPdf} disabled={busy} className="w-full mt-2">
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} Download PDF
        </Button>
      </div>

      {/* PREVIEW */}
      <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl overflow-auto">
        <div ref={ref} className="bg-white text-black p-10 mx-auto text-sm" style={{ width: 794, minHeight: 1123, fontFamily: "Helvetica, Arial, sans-serif" }}>
          <Letterhead subtitle={title} />

          <div className="flex justify-between mb-6 text-xs">
            <div>
              <p className="font-bold text-neutral-500 uppercase text-[10px] mb-1">Billed To</p>
              <p className="font-semibold text-sm">{data.clientName || "Client Name"}</p>
              <p className="whitespace-pre-line">{data.clientAddress}</p>
              {data.clientEmail && <p>{data.clientEmail}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-amber-700 text-base">{title}</p>
              <p><strong>No:</strong> {data.docNo}</p>
              <p><strong>Date:</strong> {new Date(data.date).toLocaleDateString("en-GB")}</p>
              {type === "invoice" && <p><strong>Due:</strong> {new Date(data.dueDate).toLocaleDateString("en-GB")}</p>}
              {type === "quotation" && <p><strong>Valid Until:</strong> {new Date(data.validUntil).toLocaleDateString("en-GB")}</p>}
              {type === "receipt" && data.refNumber && <p><strong>Ref:</strong> {data.refNumber}</p>}
              {type === "receipt" && <p><strong>Method:</strong> {data.paymentMethod}</p>}
            </div>
          </div>

          <table className="w-full text-xs mb-6 border-collapse">
            <thead>
              <tr className="bg-emerald-900 text-white">
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Description</th>
                <th className="text-right p-2">Qty</th>
                <th className="text-right p-2">Unit Price</th>
                <th className="text-right p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-neutral-200">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{it.description || "—"}</td>
                  <td className="p-2 text-right">{it.qty}</td>
                  <td className="p-2 text-right">{fmt(it.unitPrice)}</td>
                  <td className="p-2 text-right font-semibold">{fmt(it.qty * it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-6">
            <div className="w-64 text-xs space-y-1">
              <div className="flex justify-between"><span>Subtotal:</span><span>{fmt(subTotal)}</span></div>
              {data.taxPct > 0 && <div className="flex justify-between"><span>Tax ({data.taxPct}%):</span><span>{fmt(tax)}</span></div>}
              <div className="flex justify-between font-bold text-base bg-amber-100 text-emerald-900 px-2 py-2 mt-1 border-t-2 border-amber-600">
                <span>{type === "receipt" ? "PAID" : "TOTAL"}:</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {data.notes && (
            <div className="mt-6 p-3 bg-amber-50 border-l-4 border-amber-600 text-xs">
              <p className="font-bold text-amber-800 mb-1">Notes:</p>
              <p className="whitespace-pre-line">{data.notes}</p>
            </div>
          )}

          {type === "receipt" && (
            <div className="mt-10 text-center">
              <div className="inline-block border-4 border-emerald-700 text-emerald-700 font-black text-2xl px-6 py-2 rotate-[-8deg] opacity-80">PAID</div>
            </div>
          )}

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function DocumentsSection() {
  const [tab, setTab] = useState<DocType>("letter");
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Documents</h1>
        <p className="text-muted-foreground text-sm">Create branded letters, receipts, quotations, and invoices — download as PDF instantly.</p>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as DocType)}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="letter"><FileText className="w-4 h-4 mr-1.5" /> Letter</TabsTrigger>
          <TabsTrigger value="receipt"><Receipt className="w-4 h-4 mr-1.5" /> Receipt</TabsTrigger>
          <TabsTrigger value="quotation"><FileSignature className="w-4 h-4 mr-1.5" /> Quote</TabsTrigger>
          <TabsTrigger value="invoice"><FileSpreadsheet className="w-4 h-4 mr-1.5" /> Invoice</TabsTrigger>
        </TabsList>
        <TabsContent value="letter" className="mt-5"><LetterDoc /></TabsContent>
        <TabsContent value="receipt" className="mt-5"><ItemDoc type="receipt" /></TabsContent>
        <TabsContent value="quotation" className="mt-5"><ItemDoc type="quotation" /></TabsContent>
        <TabsContent value="invoice" className="mt-5"><ItemDoc type="invoice" /></TabsContent>
      </Tabs>
    </div>
  );
}
