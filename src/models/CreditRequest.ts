export interface CreditRequest {
  id?: number;
  user_id: number;
  requested_amount: number;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  timestamp?: string;
}

export type CreditRequestCreationParams = Omit<CreditRequest, 'id' | 'timestamp'>;
export type CreditRequestUpdateParams = Partial<Omit<CreditRequest, 'id' | 'timestamp'>>;
