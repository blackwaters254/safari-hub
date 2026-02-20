-- Add customer_phone to support_tickets for phone-based ticket lookup
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS customer_phone text DEFAULT '';