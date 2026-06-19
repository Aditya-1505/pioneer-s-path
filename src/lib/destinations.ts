// Static destination knowledge used by the 60-second planner recommendation engine.
export type Destination = {
  name: string;
  slug: string;
  image: string;
  vibes: string[];
  priceFrom: number;
  highlights: string[];
  bestMonths: string[];
};

export const DESTINATIONS: Destination[] = [
  {
    name: "Manali",
    slug: "manali",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80",
    vibes: ["Mountains", "Adventure", "Nature", "Road Trips"],
    priceFrom: 12999,
    highlights: ["Solang Valley", "Old Manali cafes", "Atal Tunnel"],
    bestMonths: ["March", "April", "May", "June", "October", "November"],
  },
  {
    name: "Spiti Valley",
    slug: "spiti-valley",
    image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=900&q=80",
    vibes: ["Mountains", "Adventure", "Road Trips", "Spiritual"],
    priceFrom: 24999,
    highlights: ["Key Monastery", "Chandratal Lake", "Hikkim post office"],
    bestMonths: ["June", "July", "August", "September"],
  },
  {
    name: "Kerala",
    slug: "kerala",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80",
    vibes: ["Nature", "Luxury", "Spiritual"],
    priceFrom: 18999,
    highlights: ["Alleppey houseboat", "Munnar tea hills", "Ayurveda spa"],
    bestMonths: ["September", "October", "November", "December", "January", "February"],
  },
  {
    name: "Goa",
    slug: "goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
    vibes: ["Beaches", "Luxury", "Nature"],
    priceFrom: 14999,
    highlights: ["North Goa nightlife", "Sunset cruises", "Beach shacks"],
    bestMonths: ["November", "December", "January", "February", "March"],
  },
  {
    name: "Kashmir",
    slug: "kashmir",
    image: "https://images.unsplash.com/photo-1566837497312-7be4a47b1f8a?auto=format&fit=crop&w=900&q=80",
    vibes: ["Mountains", "Luxury", "Nature", "Spiritual"],
    priceFrom: 21999,
    highlights: ["Dal Lake shikara", "Gulmarg gondola", "Pahalgam meadows"],
    bestMonths: ["March", "April", "May", "June", "September", "October"],
  },
  {
    name: "Ladakh",
    slug: "ladakh",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=900&q=80",
    vibes: ["Mountains", "Adventure", "Road Trips", "Spiritual"],
    priceFrom: 27999,
    highlights: ["Pangong Lake", "Nubra dunes", "Khardung La pass"],
    bestMonths: ["June", "July", "August", "September"],
  },
];

const BUDGET_CEILING: Record<string, number> = {
  "Under ₹15k": 15000,
  "₹15k–₹30k": 30000,
  "₹30k–₹50k": 50000,
  "₹50k+": Infinity,
};

export function recommendDestinations(opts: {
  budget?: string;
  month?: string;
  vibe?: string;
}): Destination[] {
  const ceiling = opts.budget ? BUDGET_CEILING[opts.budget] ?? Infinity : Infinity;
  const scored = DESTINATIONS.map((d) => {
    let score = 0;
    if (opts.vibe && d.vibes.includes(opts.vibe)) score += 3;
    if (opts.month && d.bestMonths.includes(opts.month)) score += 2;
    if (d.priceFrom <= ceiling) score += 1;
    else score -= 2;
    return { d, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.d);
}
