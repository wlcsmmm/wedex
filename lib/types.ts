export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      weddings: {
        Row: {
          id: string
          name: string
          date: string | null
          total_budget: number
          venue_tier: VenueTier | null
          guest_count: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['weddings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['weddings']['Insert']>
      }
      wedding_members: {
        Row: {
          id: string
          wedding_id: string
          user_id: string
          role: MemberRole
          display_name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['wedding_members']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['wedding_members']['Insert']>
      }
      budgets: {
        Row: {
          id: string
          wedding_id: string
          category: WeddingCategory
          allocated_amount: number
          allocated_pct: number | null
        }
        Insert: Omit<Database['public']['Tables']['budgets']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['budgets']['Insert']>
      }
      vendors: {
        Row: {
          id: string
          wedding_id: string
          name: string
          category: WeddingCategory
          total_quoted: number
          total_nett: number | null
          funded_by: FundedBy
          notes: string | null
          status: VendorStatus
          payment_strategy: PaymentStrategy[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vendors']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vendors']['Insert']>
      }
      expenses: {
        Row: {
          id: string
          wedding_id: string
          vendor_id: string | null
          amount: number
          currency: string
          merchant_name: string | null
          category: WeddingCategory | null
          card_id: string | null
          payment_type: PaymentType | null
          funded_by: FundedBy
          source: ExpenseSource
          matched_payment_index: number | null
          confidence: number | null
          date: string
          notes: string | null
          receipt_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
      credit_cards: {
        Row: {
          id: string
          wedding_id: string
          member_id: string
          card_type_id: string
          nickname: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['credit_cards']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['credit_cards']['Insert']>
      }
      card_types: {
        Row: {
          id: string
          name: string
          bank: string
          reward_type: RewardType
          program: RewardProgram | null
          reward_rules: RewardRule[]
          fallback_rate: number
          image_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['card_types']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['card_types']['Insert']>
      }
      ang_baos: {
        Row: {
          id: string
          wedding_id: string
          table_number: number | null
          amount: number
          guest_tier: GuestTier | null
          is_projection: boolean
          logged_at: string
        }
        Insert: Omit<Database['public']['Tables']['ang_baos']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['ang_baos']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ─── Domain types ──────────────────────────────────────────────────────────────

export type VenueTier = 'luxury_hotel' | 'premium_hotel' | 'restaurant' | 'garden' | 'other'
export type MemberRole = 'owner' | 'partner' | 'bride_family' | 'groom_family'
export type VendorStatus = 'active' | 'fully_paid' | 'cancelled'
export type FundedBy = 'couple' | 'bride_family' | 'groom_family' | 'other'
export type PaymentType = 'deposit' | 'installment' | 'balance' | 'full'
export type PaymentStatus = 'planned' | 'paid' | 'overdue'
export type ExpenseSource = 'manual' | 'voice' | 'receipt' | 'email'
export type RewardType = 'miles' | 'cashback'
export type RewardProgram = 'krisflyer' | 'asiamiles' | 'thankyou'
export type GuestTier = 'close_family' | 'extended_family' | 'friend' | 'colleague'
export type WeddingCategory =
  | 'venue_banquet'
  | 'bridal_attire'
  | 'photography'
  | 'videography'
  | 'decor_florals'
  | 'hair_makeup'
  | 'rings_jewelry'
  | 'wedding_car'
  | 'dowry_guodali'
  | 'invitations_stationery'
  | 'entertainment'
  | 'favors_gifts'
  | 'misc_buffer'

export interface PaymentStrategy {
  index: number
  amount: number
  due_date: string | null
  type: PaymentType
  card_id: string | null
  status: PaymentStatus
  paid_date: string | null
  actual_card_id: string | null
  miles_earned: number | null
  expense_id: string | null
}

export interface RewardRule {
  categories: string[]
  rate: number
  channel?: string
  cap?: number
  min_spend?: number
}

// ─── Convenience row aliases ───────────────────────────────────────────────────

export type Wedding = Database['public']['Tables']['weddings']['Row']
export type WeddingMember = Database['public']['Tables']['wedding_members']['Row']
export type Budget = Database['public']['Tables']['budgets']['Row']
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type CreditCard = Database['public']['Tables']['credit_cards']['Row']
export type CardType = Database['public']['Tables']['card_types']['Row']
export type AngBao = Database['public']['Tables']['ang_baos']['Row']

// ─── API types ─────────────────────────────────────────────────────────────────

export interface ParseVendorResult {
  vendor_name: string | null
  category: WeddingCategory | null
  total_quoted: number | null
  is_plus_plus: boolean
  deposit_amount: number | null
  deposit_paid: boolean
  card_used: string | null
  payment_notes: string | null
  confidence: number
}
