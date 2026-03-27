-- Drop ALL existing policies on support_tickets
DROP POLICY IF EXISTS "Anyone can view tickets by code" ON public.support_tickets;
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Anyone can update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;

-- Drop ALL existing policies on ticket_messages
DROP POLICY IF EXISTS "Anyone can view ticket messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Anyone can send ticket messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can view own ticket messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can send messages to own tickets" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admins can send messages" ON public.ticket_messages;

-- support_tickets policies
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create tickets" ON public.support_tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ticket_messages policies
CREATE POLICY "Admins can view all messages" ON public.ticket_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own ticket messages" ON public.ticket_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.support_tickets WHERE support_tickets.id = ticket_messages.ticket_id AND support_tickets.user_id = auth.uid()));
CREATE POLICY "Users can send messages to own tickets" ON public.ticket_messages FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.support_tickets WHERE support_tickets.id = ticket_messages.ticket_id AND support_tickets.user_id = auth.uid()));
CREATE POLICY "Admins can send messages" ON public.ticket_messages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Secure functions for guest chat via ticket code
CREATE OR REPLACE FUNCTION public.get_ticket_by_code(_code text)
RETURNS SETOF public.support_tickets
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$ SELECT * FROM public.support_tickets WHERE ticket_code = _code AND code_expires_at > now() LIMIT 1; $$;

CREATE OR REPLACE FUNCTION public.get_messages_by_ticket_code(_code text)
RETURNS SETOF public.ticket_messages
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$ SELECT tm.* FROM public.ticket_messages tm JOIN public.support_tickets st ON st.id = tm.ticket_id WHERE st.ticket_code = _code AND st.code_expires_at > now() ORDER BY tm.created_at ASC; $$;

CREATE OR REPLACE FUNCTION public.send_message_by_ticket_code(_code text, _message text, _sender_type text DEFAULT 'customer')
RETURNS public.ticket_messages
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE _ticket_id uuid; _result public.ticket_messages;
BEGIN
  SELECT id INTO _ticket_id FROM public.support_tickets WHERE ticket_code = _code AND code_expires_at > now() LIMIT 1;
  IF _ticket_id IS NULL THEN RAISE EXCEPTION 'Invalid or expired ticket code'; END IF;
  INSERT INTO public.ticket_messages (ticket_id, message, sender_type) VALUES (_ticket_id, _message, _sender_type) RETURNING * INTO _result;
  RETURN _result;
END; $$;