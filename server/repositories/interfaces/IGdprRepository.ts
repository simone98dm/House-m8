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
    avatar_url: string | null;
    birthdate: string | null;
    bio: string | null;
    is_smoker: boolean | null;
    gender: string | null;
    birthplace: string | null;
    nationality: string | null;
    occupation_type: string | null;
    study_field: string | null;
    job_title: string | null;
    languages: string[] | null;
    pets: string | null;
    telephone: string | null;
    instagram: string | null;
    twitter: string | null;
    tiktok: string | null;
    linkedin: string | null;
    profile_pictures: string[] | null;
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
  bulletin_notes: Array<{
    id: string;
    house_id: string;
    message: string;
    dismiss_date: string | null;
    created_at: string;
  }>;
  reports: Array<{
    id: string;
    house_id: string;
    description: string;
    created_at: string;
    read_at: string | null;
    solved_at: string | null;
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
    resetTokensCleared: number;
    gdprRequestsCleared: number;
  }>;
}
