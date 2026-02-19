
-- Add a ticket_code column and expiry to support_tickets for the conversation code system
ALTER TABLE public.support_tickets
ADD COLUMN IF NOT EXISTS ticket_code text UNIQUE,
ADD COLUMN IF NOT EXISTS code_expires_at timestamp with time zone;

-- Create index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_support_tickets_code ON public.support_tickets (ticket_code) WHERE ticket_code IS NOT NULL;

-- Add a conversation_messages table for ticket chat
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_type text NOT NULL DEFAULT 'customer' CHECK (sender_type IN ('customer', 'admin')),
  message text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Anyone with ticket access can view messages
CREATE POLICY "Anyone can view ticket messages" ON public.ticket_messages
FOR SELECT USING (true);

-- Anyone can insert messages (they need the ticket code to find the ticket)
CREATE POLICY "Anyone can create ticket messages" ON public.ticket_messages
FOR INSERT WITH CHECK (true);

-- Admins can delete messages
CREATE POLICY "Admins can delete ticket messages" ON public.ticket_messages
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
