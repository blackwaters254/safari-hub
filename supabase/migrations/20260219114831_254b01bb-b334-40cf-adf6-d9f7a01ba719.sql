-- Allow anyone to look up support tickets by ticket_code (for the chat feature)
CREATE POLICY "Anyone can view tickets by code"
ON public.support_tickets
FOR SELECT
USING (ticket_code IS NOT NULL);
