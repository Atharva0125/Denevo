export interface Commitment {
  id: string;
  user_id: string;
  raw_text: string;
  person: string;
  action: string;
  due_date: string;
  due_time?: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  notes?: string | null;
  created_at: string;
}