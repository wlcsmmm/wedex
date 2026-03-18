import type { WeddingCategory, VenueTier } from './types'

export const WEDDING_CATEGORIES: WeddingCategory[] = [
  'venue_banquet',
  'bridal_attire',
  'photography',
  'videography',
  'decor_florals',
  'hair_makeup',
  'rings_jewelry',
  'wedding_car',
  'dowry_guodali',
  'invitations_stationery',
  'entertainment',
  'favors_gifts',
  'misc_buffer',
]

export const CATEGORY_LABELS: Record<WeddingCategory, string> = {
  venue_banquet: 'Venue & Banquet',
  bridal_attire: 'Bridal Attire',
  photography: 'Photography',
  videography: 'Videography',
  decor_florals: 'Décor & Florals',
  hair_makeup: 'Hair & Makeup',
  rings_jewelry: 'Rings & Jewelry',
  wedding_car: 'Wedding Car',
  dowry_guodali: 'Dowry / Guo Da Li',
  invitations_stationery: 'Invitations',
  entertainment: 'Entertainment',
  favors_gifts: 'Favors & Gifts',
  misc_buffer: 'Misc / Buffer',
}

export const BUDGET_BENCHMARKS: Record<VenueTier, Record<WeddingCategory, number>> = {
  luxury_hotel: {
    venue_banquet: 0.50, bridal_attire: 0.08, photography: 0.06,
    videography: 0.04, decor_florals: 0.06, hair_makeup: 0.03,
    rings_jewelry: 0.06, wedding_car: 0.01, dowry_guodali: 0.06,
    invitations_stationery: 0.02, entertainment: 0.02, favors_gifts: 0.02, misc_buffer: 0.04,
  },
  premium_hotel: {
    venue_banquet: 0.45, bridal_attire: 0.10, photography: 0.07,
    videography: 0.04, decor_florals: 0.06, hair_makeup: 0.04,
    rings_jewelry: 0.07, wedding_car: 0.01, dowry_guodali: 0.06,
    invitations_stationery: 0.02, entertainment: 0.02, favors_gifts: 0.02, misc_buffer: 0.04,
  },
  restaurant: {
    venue_banquet: 0.38, bridal_attire: 0.12, photography: 0.08,
    videography: 0.05, decor_florals: 0.07, hair_makeup: 0.04,
    rings_jewelry: 0.07, wedding_car: 0.01, dowry_guodali: 0.07,
    invitations_stationery: 0.03, entertainment: 0.02, favors_gifts: 0.02, misc_buffer: 0.04,
  },
  garden: {
    venue_banquet: 0.35, bridal_attire: 0.10, photography: 0.09,
    videography: 0.05, decor_florals: 0.10, hair_makeup: 0.04,
    rings_jewelry: 0.07, wedding_car: 0.01, dowry_guodali: 0.06,
    invitations_stationery: 0.03, entertainment: 0.03, favors_gifts: 0.02, misc_buffer: 0.05,
  },
  other: {
    venue_banquet: 0.40, bridal_attire: 0.10, photography: 0.08,
    videography: 0.04, decor_florals: 0.07, hair_makeup: 0.04,
    rings_jewelry: 0.07, wedding_car: 0.01, dowry_guodali: 0.06,
    invitations_stationery: 0.02, entertainment: 0.02, favors_gifts: 0.02, misc_buffer: 0.05,
  },
}

export const SG_CARD_TYPES = [
  {
    name: 'DBS Altitude Visa',
    bank: 'DBS',
    reward_type: 'miles' as const,
    program: 'krisflyer' as const,
    reward_rules: [
      { categories: ['*'], rate: 1.2, channel: 'any' },
      { categories: ['*'], rate: 2.0, channel: 'online' },
    ],
    fallback_rate: 1.2,
    image_url: null,
  },
  {
    name: 'UOB PRVI Miles',
    bank: 'UOB',
    reward_type: 'miles' as const,
    program: 'krisflyer' as const,
    reward_rules: [
      { categories: ['*'], rate: 1.4, channel: 'any' },
    ],
    fallback_rate: 1.4,
    image_url: null,
  },
  {
    name: "DBS Woman's World",
    bank: 'DBS',
    reward_type: 'miles' as const,
    program: 'krisflyer' as const,
    reward_rules: [
      { categories: ['*'], rate: 4.0, channel: 'online', cap: 2000 },
      { categories: ['*'], rate: 0.4, channel: 'any' },
    ],
    fallback_rate: 0.4,
    image_url: null,
  },
  {
    name: 'HSBC Revolution',
    bank: 'HSBC',
    reward_type: 'miles' as const,
    program: 'krisflyer' as const,
    reward_rules: [
      { categories: ['dining', 'entertainment', 'online'], rate: 4.0, cap: 1000 },
      { categories: ['*'], rate: 0.4 },
    ],
    fallback_rate: 0.4,
    image_url: null,
  },
  {
    name: 'AMEX KrisFlyer',
    bank: 'AMEX',
    reward_type: 'miles' as const,
    program: 'krisflyer' as const,
    reward_rules: [
      { categories: ['*'], rate: 1.1, channel: 'any' },
      { categories: ['*'], rate: 2.0, channel: 'overseas' },
    ],
    fallback_rate: 1.1,
    image_url: null,
  },
  {
    name: 'Citi PremierMiles',
    bank: 'Citi',
    reward_type: 'miles' as const,
    program: 'krisflyer' as const,
    reward_rules: [
      { categories: ['*'], rate: 1.2, channel: 'any' },
      { categories: ['*'], rate: 2.0, channel: 'overseas' },
    ],
    fallback_rate: 1.2,
    image_url: null,
  },
  {
    name: 'OCBC 365',
    bank: 'OCBC',
    reward_type: 'cashback' as const,
    program: null,
    reward_rules: [
      { categories: ['dining'], rate: 6.0, cap: 800 },
      { categories: ['groceries'], rate: 3.0, cap: 800 },
      { categories: ['*'], rate: 0.3 },
    ],
    fallback_rate: 0.3,
    image_url: null,
  },
  {
    name: 'UOB One',
    bank: 'UOB',
    reward_type: 'cashback' as const,
    program: null,
    reward_rules: [
      { categories: ['*'], rate: 3.33, min_spend: 500 },
      { categories: ['*'], rate: 0.3 },
    ],
    fallback_rate: 0.3,
    image_url: null,
  },
]

export const GST_RATE = 0.09 // 9% GST in Singapore (as of 2024)
