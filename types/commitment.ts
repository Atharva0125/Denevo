export interface Commitment {
  id: string;
  user_id: string;
  person: string;
  action: string;
  due_date: string;
  due_time: string | null;
  priority: 'none' | 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  raw_text?: string | null;
  created_at: string;
}