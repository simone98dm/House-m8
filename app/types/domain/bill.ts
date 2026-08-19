/**
 * Bill domain types
 */

import type { User } from './user';

export enum BillPeriod {
  MONTHLY = 1,
  BIMONTHLY = 2,
  SEMIANNUAL = 6,
  ANNUAL = 12,
}

export interface Bill {
  id: string;
  house_id: string;
  description: string;
  monthly_cost: BillPeriod;
  payment_period: number; // Billing period in months (1, 2, 6, or 12)
  next_due_date: string;
  created_by: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  currency?: string;
  creator?: User;
  documents?: BillDocument[];
  // Legacy fields for backward compatibility
  title?: string;
  amount?: string;
  due_date?: string | null;
  paid?: boolean;
  paid_at?: string | null;
  category?: string | null;
}

export interface BillDocument {
  id: string;
  bill_id: string;
  filename: string;
  url: string;
  file_size?: number | null;
  mime_type?: string | null;
  uploaded_at: string;
}
