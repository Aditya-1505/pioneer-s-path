// Central brand + contact configuration for The Pioneer Tours
export const BRAND = {
  name: "The Pioneer Tours",
  tagline: "Curated Journeys. Hassle-Free Memories.",
  phone: "+919876543210",
  phoneDisplay: "+91 98765 43210",
  whatsapp: "919876543210",
  email: "hello@thepioneertours.com",
  address: "2nd Floor, Mall Road, Manali, Himachal Pradesh 175131, India",
  upiId: "thepioneertours@upi",
} as const;

export type NavItem = { label: string; to?: string; children?: { label: string; to: string }[] };

export const NAV_LINKS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Tours", to: "/tours" },
//  { label: "Plan My Trip", to: "/custom-planner" },
  { label: "Surprise Trips", to: "/surprise-planner" },
  {
    label: "Travel Diaries",
    children: [
      { label: "Gallery", to: "/gallery" },
      { label: "Blog", to: "/blog" },
    ],
  },
  // { label: "FAQ", to: "/faq" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function waLink(message: string) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const TRAVEL_VIBES = [
  "Mountains", "Beaches", "Spiritual", "Adventure", "Nature", "Luxury", "Road Trips",
] as const;

export const BUDGETS = ["Under ₹15k", "₹15k–₹30k", "₹30k–₹50k", "₹50k+"] as const;
export const GROUP_TYPES = ["Solo", "Couple", "Family", "Friends"] as const;
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
