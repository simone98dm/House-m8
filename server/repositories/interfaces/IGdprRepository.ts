export interface GdprRequest {
  id: string;
  user_id: string;
  type: 'export' | 'deletion' | 'deletion_cancelled';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  requested_at: string;
  completed_at: string | null;
  scheduled_for: string | null;
}

export interface UserExportData {
  exported_at: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
    terms_accepted_at: string | null;
    consent_version: string | null;
  };
  houses: Array<{
    id: string;
    name: string;
    role: string;
    joined_at: string;
    left_at: string | null;
  }>;
  expenses: Array<{
    id: string;
    description: string;
    total_amount: number;
    currency: string;
    created_at: string;
    my_share: number;
    is_paid: boolean;
  }>;
  bills: Array<{
    id: string;
    description: string;
    monthly_cost: number;
    currency: string;
    created_at: string;
    active: boolean;
  }>;
  comments_received: Array<{
    rating: number;
    text: string;
    created_at: string;
  }>;
  gdpr_requests: Array<{
    type: string;
    status: string;
    requested_at: string;
    completed_at: string | null;
  }>;
}

export interface IGdprRepository {
  softDeleteUser(
    userId: string,
  ): Promise<{ scheduledFor: Date; cancelToken: string }>;
  cancelDeletion(cancelToken: string, userId?: string): Promise<boolean>;
  pseudonymizeUser(userId: string): Promise<boolean>;
  getPendingDeletions(): Promise<Array<{ userId: string; deletedAt: Date }>>;
  exportUserData(userId: string): Promise<UserExportData>;
  runScheduledCleanup(): Promise<{
    pseudonymized: number;
    tokensCleared: number;
    invitationsCleared: number;
  }>;
}
