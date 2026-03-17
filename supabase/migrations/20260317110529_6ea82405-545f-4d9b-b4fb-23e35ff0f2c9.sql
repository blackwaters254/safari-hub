-- Create tours table
CREATE TABLE public.tours (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'wildlife',
  duration text NOT NULL DEFAULT '',
  price_label text NOT NULL DEFAULT '',
  price_ksh numeric NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  short_description text DEFAULT '',
  description text DEFAULT '',
  highlights jsonb DEFAULT '[]'::jsonb,
  itinerary jsonb DEFAULT '[]'::jsonb,
  included jsonb DEFAULT '[]'::jsonb,
  excluded jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

-- Anyone can view active tours
CREATE POLICY "Anyone can view active tours"
  ON public.tours FOR SELECT
  USING (true);

-- Admins can manage tours
CREATE POLICY "Admins can insert tours"
  ON public.tours FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tours"
  ON public.tours FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tours"
  ON public.tours FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));