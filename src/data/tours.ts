export interface Tour {
  id: string;
  title: string;
  category: "wildlife" | "beach" | "cultural" | "adventure" | "custom";
  duration: string;
  price: string;
  image: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  itinerary: { day: string; title: string; description: string }[];
  included: string[];
  excluded: string[];
}

export const tours: Tour[] = [
  {
    id: "masai-mara-safari",
    title: "Masai Mara Wildlife Safari",
    category: "wildlife",
    duration: "4 Days / 3 Nights",
    price: "From KSh 162,500",
    image: "masai-mara",
    shortDescription: "Experience the world-famous Masai Mara with its abundant wildlife and the Great Migration.",
    description: "Embark on an unforgettable journey to the Masai Mara National Reserve, one of Africa's most magnificent game reserves. Witness the Big Five, experience the Great Migration, and immerse yourself in the breathtaking landscapes of the Kenyan savanna.",
    highlights: ["Big Five game viewing", "Great Migration (seasonal)", "Maasai village visit", "Sunset game drives", "Luxury tented camp accommodation"],
    itinerary: [
      { day: "Day 1", title: "Nairobi to Masai Mara", description: "Depart Nairobi early morning, scenic drive through the Great Rift Valley. Afternoon game drive." },
      { day: "Day 2", title: "Full Day Game Drive", description: "Full day exploring the reserve with morning and afternoon game drives." },
      { day: "Day 3", title: "Mara Exploration", description: "Optional hot air balloon safari. Visit a Maasai village. Evening game drive." },
      { day: "Day 4", title: "Return to Nairobi", description: "Morning game drive en route. Arrive Nairobi by evening." },
    ],
    included: ["Transport in 4x4 safari vehicle", "Professional safari guide", "Full board accommodation", "Park entry fees", "Game drives as per itinerary", "Bottled water"],
    excluded: ["International flights", "Visa fees", "Travel insurance", "Tips and gratuities", "Hot air balloon safari", "Personal expenses"],
  },
  {
    id: "diani-beach-escape",
    title: "Diani Beach Tropical Escape",
    category: "beach",
    duration: "5 Days / 4 Nights",
    price: "From KSh 127,400",
    image: "beach-holiday",
    shortDescription: "Relax on the pristine white sands of Diani Beach, Kenya's premier coastal paradise.",
    description: "Unwind at Diani Beach, consistently rated among Africa's best beaches. Crystal-clear turquoise waters, swaying palm trees, and world-class resorts await. Perfect for a romantic getaway or family vacation.",
    highlights: ["White sand beaches", "Snorkeling & diving", "Dolphin watching", "Wasini Island day trip", "Kisite Marine Park"],
    itinerary: [
      { day: "Day 1", title: "Arrival at Diani", description: "Transfer from Mombasa airport to your beach resort. Evening at leisure." },
      { day: "Day 2", title: "Beach & Water Sports", description: "Full day of beach activities, snorkeling, or diving excursions." },
      { day: "Day 3", title: "Wasini Island Excursion", description: "Full day trip to Wasini Island and Kisite Marine Park for dolphin watching." },
      { day: "Day 4", title: "Cultural & Leisure", description: "Visit Shimba Hills or enjoy spa treatments at the resort." },
      { day: "Day 5", title: "Departure", description: "Morning at leisure. Transfer to airport." },
    ],
    included: ["Airport transfers", "Beach resort accommodation", "Breakfast daily", "Wasini Island tour", "Snorkeling equipment"],
    excluded: ["Flights", "Lunch and dinner", "Travel insurance", "Personal expenses", "Optional activities"],
  },
  {
    id: "cultural-heritage-tour",
    title: "Kenya Cultural Heritage Tour",
    category: "cultural",
    duration: "6 Days / 5 Nights",
    price: "From KSh 188,500",
    image: "cultural-tour",
    shortDescription: "Discover the rich cultural heritage of Kenya's diverse communities and traditions.",
    description: "Journey through Kenya's cultural heartland, meeting the Maasai, Samburu, and other communities. Experience traditional dances, visit local markets, and gain deep insight into Kenya's living heritage.",
    highlights: ["Maasai Mara cultural immersion", "Traditional homestead visits", "Local market tours", "Traditional cuisine experiences", "Artisan craft workshops"],
    itinerary: [
      { day: "Day 1", title: "Nairobi Cultural Tour", description: "Visit the National Museum, Bomas of Kenya, and Kazuri Beads factory." },
      { day: "Day 2", title: "To Maasai Land", description: "Drive to Maasai community, welcome ceremony, and cultural exchange." },
      { day: "Day 3", title: "Maasai Experience", description: "Full day with Maasai community. Learn about traditions, livestock, and daily life." },
      { day: "Day 4", title: "Lake Nakuru Region", description: "Visit Lake Nakuru, explore local Kikuyu community." },
      { day: "Day 5", title: "Samburu Cultural Visit", description: "Travel to Samburu region for unique cultural experiences." },
      { day: "Day 6", title: "Return to Nairobi", description: "Morning activities and scenic drive back to Nairobi." },
    ],
    included: ["All ground transport", "Accommodation", "Meals as specified", "Cultural activity fees", "Professional guide", "Community donations"],
    excluded: ["Flights", "Visa fees", "Travel insurance", "Personal shopping", "Tips"],
  },
  {
    id: "mount-kenya-trek",
    title: "Mount Kenya Trekking Adventure",
    category: "adventure",
    duration: "5 Days / 4 Nights",
    price: "From KSh 218,400",
    image: "mount-kenya",
    shortDescription: "Conquer Africa's second-highest peak through stunning alpine landscapes.",
    description: "Challenge yourself with a trek up Mount Kenya, Africa's second-highest mountain. Experience dramatic changes in vegetation zones, stunning glacial landscapes, and the thrill of reaching Point Lenana at 4,985 meters.",
    highlights: ["Summit Point Lenana (4,985m)", "Alpine lakes and glaciers", "Diverse vegetation zones", "Professional mountain guides", "Stunning panoramic views"],
    itinerary: [
      { day: "Day 1", title: "Nanyuki to Old Moses Camp", description: "Drive to Sirimon Gate (2,650m), trek to Old Moses Camp (3,300m)." },
      { day: "Day 2", title: "To Shipton's Camp", description: "Trek through moorland to Shipton's Camp (4,200m)." },
      { day: "Day 3", title: "Acclimatization", description: "Short hikes for acclimatization around Shipton's Camp." },
      { day: "Day 4", title: "Summit Day", description: "Pre-dawn start to Point Lenana. Descend to Mackinder's Camp." },
      { day: "Day 5", title: "Descent", description: "Trek down to the gate. Drive back to Nanyuki/Nairobi." },
    ],
    included: ["Mountain guides and porters", "Camping equipment", "All meals on mountain", "Park fees", "Transport to/from gate"],
    excluded: ["Flights", "Personal trekking gear", "Travel insurance", "Tips", "Pre/post accommodation"],
  },
  {
    id: "amboseli-tsavo-combo",
    title: "Amboseli & Tsavo Safari Combo",
    category: "wildlife",
    duration: "6 Days / 5 Nights",
    price: "From KSh 245,700",
    image: "safari-jeep",
    shortDescription: "Two iconic parks in one trip — Amboseli's elephants with Kilimanjaro views and Tsavo's red elephants.",
    description: "Combine two of Kenya's most iconic national parks. See massive elephant herds against the backdrop of Mount Kilimanjaro in Amboseli, then explore the vast wilderness of Tsavo with its famous red elephants and diverse birdlife.",
    highlights: ["Kilimanjaro views from Amboseli", "Large elephant herds", "Tsavo's red elephants", "Mzima Springs", "Diverse ecosystems"],
    itinerary: [
      { day: "Day 1", title: "Nairobi to Amboseli", description: "Morning departure, arrive Amboseli for afternoon game drive." },
      { day: "Day 2", title: "Amboseli Full Day", description: "Full day game drives with Kilimanjaro backdrop." },
      { day: "Day 3", title: "Amboseli to Tsavo West", description: "Morning game drive, transfer to Tsavo West. Afternoon drive." },
      { day: "Day 4", title: "Tsavo West Exploration", description: "Visit Mzima Springs, Shetani Lava Flow. Game drives." },
      { day: "Day 5", title: "Tsavo East", description: "Transfer to Tsavo East. Explore Lugard Falls and Galana River." },
      { day: "Day 6", title: "Return to Nairobi", description: "Morning game drive, drive back to Nairobi." },
    ],
    included: ["Safari vehicle with guide", "Full board accommodation", "Park fees", "Game drives", "Bottled water"],
    excluded: ["Flights", "Visa", "Travel insurance", "Tips", "Personal items"],
  },
  {
    id: "luxury-safari-lodge",
    title: "Luxury Lodge Safari Experience",
    category: "custom",
    duration: "7 Days / 6 Nights",
    price: "From KSh 455,000",
    image: "safari-lodge",
    shortDescription: "The ultimate luxury safari with premium lodges, private game drives, and exclusive experiences.",
    description: "Indulge in Kenya's finest safari experience. Stay at award-winning luxury lodges, enjoy private game drives, bush dinners under the stars, and spa treatments in the wilderness. This is safari at its most refined.",
    highlights: ["Luxury lodge accommodation", "Private game drives", "Bush dinner under stars", "Spa in the wilderness", "Hot air balloon safari", "Champagne breakfast"],
    itinerary: [
      { day: "Day 1", title: "Arrival & Nairobi", description: "VIP airport meet and greet. Luxury hotel in Nairobi." },
      { day: "Day 2", title: "Fly to Masai Mara", description: "Charter flight to Mara. Afternoon private game drive." },
      { day: "Day 3", title: "Mara Luxury Experience", description: "Hot air balloon safari, champagne breakfast. Afternoon game drive." },
      { day: "Day 4", title: "Bush Dinner", description: "Morning drive, spa afternoon, bush dinner under the stars." },
      { day: "Day 5", title: "Fly to Amboseli", description: "Charter to Amboseli luxury lodge. Evening game drive." },
      { day: "Day 6", title: "Amboseli Exclusive", description: "Private game drive, Kilimanjaro views, farewell dinner." },
      { day: "Day 7", title: "Departure", description: "Charter back to Nairobi. VIP departure assistance." },
    ],
    included: ["Charter flights", "Luxury lodge accommodation", "All meals & drinks", "Private guide & vehicle", "Hot air balloon", "Spa treatments", "Park fees"],
    excluded: ["International flights", "Visa fees", "Travel insurance", "Tips", "Personal shopping"],
  },
];

export const categories = [
  { id: "all", label: "All Tours" },
  { id: "wildlife", label: "Wildlife Safaris" },
  { id: "beach", label: "Beach Holidays" },
  { id: "cultural", label: "Cultural Tours" },
  { id: "adventure", label: "Adventure" },
  { id: "custom", label: "Custom & Luxury" },
] as const;

export const testimonials = [
  {
    name: "Sarah & James Mitchell",
    location: "London, UK",
    text: "Blackwaters Safaris gave us the trip of a lifetime. Seeing the wildebeest migration in the Masai Mara was beyond words. Their attention to detail and warmth made us feel like family.",
    rating: 5,
    tour: "Masai Mara Wildlife Safari",
  },
  {
    name: "Hans & Maria Schneider",
    location: "Munich, Germany",
    text: "We've been on safaris in multiple African countries, and this was by far the best organized. Our guide Daniel was incredibly knowledgeable, and the luxury lodge exceeded all expectations.",
    rating: 5,
    tour: "Luxury Lodge Safari Experience",
  },
  {
    name: "Akiko Tanaka",
    location: "Tokyo, Japan",
    text: "The cultural heritage tour was deeply moving. Meeting the Maasai community and learning about their traditions was a highlight of my year. Truly transformative experience.",
    rating: 5,
    tour: "Kenya Cultural Heritage Tour",
  },
  {
    name: "Michael O'Brien",
    location: "New York, USA",
    text: "Summiting Mount Kenya was challenging but incredibly rewarding. The guides were professional and supportive throughout. The views from Point Lenana were spectacular!",
    rating: 5,
    tour: "Mount Kenya Trekking Adventure",
  },
];
