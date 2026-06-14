ALTER TABLE public.payment_settings 
  ADD COLUMN IF NOT EXISTS currency_rate_usd numeric NOT NULL DEFAULT 0.0077,
  ADD COLUMN IF NOT EXISTS currency_rate_eur numeric NOT NULL DEFAULT 0.0071;

UPDATE public.tours 
SET image_url = '/__l5e/assets-v1/4420b1b8-b5c6-4222-915c-c981b4d3497d/hot-deal-mara-amboseli-v5.jpeg'
WHERE id = '20928833-cf8b-4479-8f99-592b7e8763dc';