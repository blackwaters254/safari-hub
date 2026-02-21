
-- Opportunities table (vacancies, internships, partnerships)
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'vacancy', -- vacancy, internship, partnership
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT DEFAULT '',
  location TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  salary_range TEXT DEFAULT '',
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active opportunities" ON public.opportunities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage opportunities" ON public.opportunities
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  cover_letter TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  portfolio_url TEXT DEFAULT '',
  social_instagram TEXT DEFAULT '',
  social_tiktok TEXT DEFAULT '',
  social_youtube TEXT DEFAULT '',
  social_twitter TEXT DEFAULT '',
  social_other TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewed, shortlisted, rejected, accepted
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit applications" ON public.applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage applications" ON public.applications
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) VALUES ('applications', 'applications', true);

CREATE POLICY "Anyone can upload application docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'applications');

CREATE POLICY "Anyone can view application docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'applications');

CREATE POLICY "Admins can delete application docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'applications' AND has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the content creator vacancy
INSERT INTO public.opportunities (title, type, description, requirements, location, is_paid, deadline)
VALUES (
  'Content Creator - Travel & Safari',
  'vacancy',
  'We are looking for a passionate content creator who is willing to travel across Kenya capturing the beauty of our safari experiences, cultural encounters, and beach getaways. You will create engaging content for our social media platforms, website, and marketing campaigns. This is an unpaid opportunity ideal for building your portfolio with world-class wildlife and travel content.',
  '• Strong photography and/or videography skills
• Experience with social media content creation
• Willingness to travel extensively across Kenya
• Basic video editing skills (CapCut, Premiere, or similar)
• Active social media presence is a plus
• Must have own camera equipment (phone camera acceptable)
• Passion for wildlife, travel, and storytelling',
  'Nairobi, Kenya (with extensive travel)',
  false,
  NOW() + INTERVAL '60 days'
);
