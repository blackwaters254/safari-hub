ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS bank_usd_name text,
  ADD COLUMN IF NOT EXISTS bank_usd_account_name text,
  ADD COLUMN IF NOT EXISTS bank_usd_account_number text,
  ADD COLUMN IF NOT EXISTS bank_usd_branch text,
  ADD COLUMN IF NOT EXISTS bank_usd_swift text;