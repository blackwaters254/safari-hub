
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paybill_number text NOT NULL DEFAULT '247247',
  paybill_account text NOT NULL DEFAULT 'BLACKWATERS',
  till_number text NOT NULL DEFAULT '',
  bank_name text NOT NULL DEFAULT 'Equity Bank',
  bank_account_name text NOT NULL DEFAULT 'Blackwaters Safaris Ltd',
  bank_account_number text NOT NULL DEFAULT '0123456789',
  bank_branch text NOT NULL DEFAULT 'Nairobi CBD',
  bank_swift text NOT NULL DEFAULT '',
  hot_deal_end_date timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  hot_deal_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payment settings"
ON public.payment_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert payment settings"
ON public.payment_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payment settings"
ON public.payment_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete payment settings"
ON public.payment_settings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_settings (paybill_number, paybill_account, bank_account_number)
VALUES ('247247', 'BLACKWATERS', '0123456789');
