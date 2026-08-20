/**
 * Balance composable types
 */

export interface UserBalance {
  user_id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  total_paid: number;
  total_owed: number;
  net_balance: number;
}

export interface SettlementTransaction {
  from_user_id: string;
  to_user_id: string;
  amount: number;
  from_user: {
    id: string;
    first_name: string;
    last_name: string;
  };
  to_user: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface HouseBalance {
  house_id: string;
  currency: string;
  user_balances: UserBalance[];
  settlement_transactions: SettlementTransaction[];
  total_expenses: number;
  is_balanced: boolean;
}
