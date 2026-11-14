export type UserRole = 'super_admin' | 'librarian';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  type: 'academic_preclinical' | 'academic_paraclinical' | 'clinical' | 'hospital_support' | 'administrative';
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at?: string;
}

export type MemberType = 'student' | 'staff';
export type MemberStatus = 'active' | 'suspended' | 'graduated' | 'relieved';

export interface Member {
  id: string;
  member_type: MemberType;
  identifier: string; // Roll number or Employee ID
  full_name: string;
  department_id: string;
  department?: Department;
  course?: string; // MBBS, MD, MS, DNB, etc.
  academic_year?: string; // 1st Year, 2nd Year, etc.
  designation?: string; // Professor, Asst Prof, Sr Resident, etc.
  phone: string;
  email: string;
  status: MemberStatus;
  max_borrow_limit: number;
  registration_date: string;
  created_at: string;
  updated_at?: string;
  active_issues_count?: number;
  outstanding_fine?: number;
}

export type CopyStatus = 'available' | 'issued' | 'damaged' | 'lost' | 'withdrawn';

export interface Book {
  id: string;
  title: string;
  isbn: string;
  author: string;
  publisher: string;
  edition?: string;
  publication_year?: number;
  category_id?: string;
  category?: Category;
  subject?: string;
  language?: string;
  shelf_number?: string;
  rack_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  cover_url?: string;
  description?: string;
  total_copies?: number;
  available_copies?: number;
  created_at: string;
  updated_at?: string;
}

export interface BookCopy {
  id: string;
  book_id: string;
  book?: Book;
  accession_number: string;
  barcode?: string;
  status: CopyStatus;
  condition_notes?: string;
  shelf_location?: string;
  created_at: string;
  updated_at?: string;
}

export type IssueStatus = 'active' | 'returned' | 'overdue' | 'lost';

export interface BookIssue {
  id: string;
  issue_code: string;
  copy_id: string;
  copy?: BookCopy;
  member_id: string;
  member?: Member;
  issued_by?: string;
  issuer?: Profile;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: IssueStatus;
  remarks?: string;
  overdue_days?: number;
  fine_amount?: number;
  created_at: string;
  updated_at?: string;
}

export interface BookReturn {
  id: string;
  issue_id: string;
  returned_by_staff_id?: string;
  return_date: string;
  overdue_days: number;
  condition: 'good' | 'minor_wear' | 'damaged' | 'lost';
  fine_amount: number;
  remarks?: string;
  created_at: string;
}

export type FineStatus = 'pending' | 'partially_paid' | 'paid' | 'waived';

export interface Fine {
  id: string;
  issue_id: string;
  issue?: BookIssue;
  member_id: string;
  member?: Member;
  amount: number;
  balance_amount: number;
  status: FineStatus;
  waiver_reason?: string;
  waived_by?: string;
  created_at: string;
  updated_at?: string;
}

export type PaymentMethod = 'cash' | 'online' | 'cheque' | 'dd';

export interface FinePayment {
  id: string;
  receipt_no: string;
  fine_id: string;
  fine?: Fine;
  member_id: string;
  member?: Member;
  amount_paid: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
  received_by?: string;
  receiver?: Profile;
  payment_date: string;
  remarks?: string;
  created_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  book_id?: string;
  title: string;
  isbn?: string;
  copies_count: number;
  cost_per_copy: number;
  total_cost: number;
  created_at?: string;
}

export interface Purchase {
  id: string;
  invoice_number: string;
  supplier_name: string;
  purchase_date: string;
  total_amount: number;
  received_by?: string;
  remarks?: string;
  items?: PurchaseItem[];
  created_at: string;
}

export interface LibrarySettings {
  student_borrow_limit: number;
  student_loan_days: number;
  student_grace_period_days: number;
  student_daily_fine: number;
  student_max_fine: number;
  staff_borrow_limit: number;
  staff_loan_days: number;
  staff_grace_period_days: number;
  staff_daily_fine: number;
  staff_max_fine: number;
  lost_book_multiplier: number;
  damaged_book_flat_fee: number;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}
