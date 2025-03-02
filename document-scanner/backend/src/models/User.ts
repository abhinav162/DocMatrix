export interface User {
  id?: number;
  username: string;
  password_hash: string;
  salt: string;
  role: 'user' | 'admin';
  daily_credits_used: number;
  last_reset_date: string;
  created_at?: string;
}

export type UserCreationParams = Omit<User, 'id' | 'created_at'>;
export type UserUpdateParams = Partial<Omit<User, 'id' | 'created_at'>>;
