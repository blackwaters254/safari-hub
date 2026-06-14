
ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS hot_deal_title text DEFAULT '3-Day Maasai Mara & Amboseli',
  ADD COLUMN IF NOT EXISTS hot_deal_subtitle text DEFAULT 'Two iconic destinations. One unforgettable safari. Limited slots available.',
  ADD COLUMN IF NOT EXISTS hot_deal_savings_label text DEFAULT 'SAVE $350',
  ADD COLUMN IF NOT EXISTS hot_deal_tier1_label text DEFAULT '2 Sharing',
  ADD COLUMN IF NOT EXISTS hot_deal_tier2_label text DEFAULT 'Group of 4',
  ADD COLUMN IF NOT EXISTS hot_deal_tier3_label text DEFAULT 'Group of 7',
  ADD COLUMN IF NOT EXISTS hot_deal_tier1_now_ksh numeric DEFAULT 143000,
  ADD COLUMN IF NOT EXISTS hot_deal_tier2_now_ksh numeric DEFAULT 125000,
  ADD COLUMN IF NOT EXISTS hot_deal_tier3_now_ksh numeric DEFAULT 88000,
  ADD COLUMN IF NOT EXISTS hot_deal_tier1_was_ksh numeric DEFAULT 188000,
  ADD COLUMN IF NOT EXISTS hot_deal_tier2_was_ksh numeric DEFAULT 169000,
  ADD COLUMN IF NOT EXISTS hot_deal_tier3_was_ksh numeric DEFAULT 123000,
  ADD COLUMN IF NOT EXISTS hot_deal_includes text[] DEFAULT ARRAY[
    'Transport in 4x4 Safari Vehicle',
    'Sarova Mara Game Camp (luxury) — 1 night',
    'Sentrim Amboseli — 1 night',
    'All meals as per itinerary',
    'Professional Driver Guide',
    'Game drives & park entry fees',
    'Bottled water throughout'
  ];
