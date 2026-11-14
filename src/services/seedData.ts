import { 
  Profile, Department, Category, Member, Book, BookCopy, 
  BookIssue, Fine, FinePayment, Purchase, LibrarySettings, AuditLog 
} from '../types';

export const INITIAL_SETTINGS: LibrarySettings = {
  student_borrow_limit: 3,
  student_loan_days: 14,
  student_grace_period_days: 2,
  student_daily_fine: 5.00,
  student_max_fine: 300.00,
  staff_borrow_limit: 6,
  staff_loan_days: 30,
  staff_grace_period_days: 5,
  staff_daily_fine: 2.00,
  staff_max_fine: 200.00,
  lost_book_multiplier: 1.5,
  damaged_book_flat_fee: 150.00,
};

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'u-admin-001',
    email: 'admin@esic.edu.in',
    full_name: 'Dr. V. K. Sharma (Chief Librarian / Admin)',
    role: 'super_admin',
    is_active: true,
    phone: '+91 94401 23456',
    created_at: '2024-01-01T09:00:00Z',
  },
  {
    id: 'u-lib-002',
    email: 'librarian@esic.edu.in',
    full_name: 'Smt. P. Sunitha (Senior Library Assistant)',
    role: 'librarian',
    is_active: true,
    phone: '+91 98480 65432',
    created_at: '2024-01-15T10:00:00Z',
  }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Department of Anatomy', code: 'ANAT', type: 'academic_preclinical' },
  { id: 'dept-2', name: 'Department of Physiology', code: 'PHYS', type: 'academic_preclinical' },
  { id: 'dept-3', name: 'Department of Biochemistry', code: 'BIOC', type: 'academic_preclinical' },
  { id: 'dept-4', name: 'Department of Pathology', code: 'PATH', type: 'academic_paraclinical' },
  { id: 'dept-5', name: 'Department of Pharmacology', code: 'PHAR', type: 'academic_paraclinical' },
  { id: 'dept-6', name: 'Department of Microbiology', code: 'MICR', type: 'academic_paraclinical' },
  { id: 'dept-7', name: 'Department of General Medicine', code: 'GMED', type: 'clinical' },
  { id: 'dept-8', name: 'Department of General Surgery', code: 'GSUR', type: 'clinical' },
  { id: 'dept-9', name: 'Department of Obstetrics & Gynecology', code: 'OBGY', type: 'clinical' },
  { id: 'dept-10', name: 'Department of Pediatrics', code: 'PEDI', type: 'clinical' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Pre-Clinical Sciences', code: 'CAT-PRE', description: 'Human Anatomy, Physiology, Medical Biochemistry' },
  { id: 'cat-2', name: 'Para-Clinical Sciences', code: 'CAT-PARA', description: 'Pathology, Microbiology, Pharmacology, Forensic Medicine' },
  { id: 'cat-3', name: 'Clinical Medicine', code: 'CAT-CLIN', description: 'Internal Medicine, Cardiology, Neurology, Dermatology' },
  { id: 'cat-4', name: 'Surgical Specialties', code: 'CAT-SURG', description: 'General Surgery, Orthopaedics, ENT, Ophthalmology' },
  { id: 'cat-5', name: 'Maternal & Child Health', code: 'CAT-MCH', description: 'Pediatrics, Obstetrics and Gynaecology' },
  { id: 'cat-6', name: 'Reference & Medical Journals', code: 'CAT-REF', description: 'Medical Dictionaries, WHO Guidelines, Pharmacopoeia' },
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'Robbins and Cotran Pathologic Basis of Disease',
    isbn: '978-0323531139',
    author: 'Vinay Kumar, Abul K. Abbas, Jon C. Aster',
    publisher: 'Elsevier India',
    edition: '10th Edition (South Asia Edition)',
    publication_year: 2021,
    category_id: 'cat-2',
    subject: 'General & Systemic Pathology',
    language: 'English',
    shelf_number: 'Shelf B-04',
    rack_number: 'Rack 12',
    purchase_date: '2023-04-10',
    purchase_price: 3450.00,
    cover_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=400&q=80',
    description: 'Gold-standard reference for fundamental medical pathology with high-yield clinical correlations and morphology.',
    created_at: '2024-01-05T10:00:00Z',
  },
  {
    id: 'book-2',
    title: 'Guyton and Hall Textbook of Medical Physiology',
    isbn: '978-0323597128',
    author: 'John E. Hall, Michael E. Hall',
    publisher: 'Elsevier Health',
    edition: '14th Edition',
    publication_year: 2020,
    category_id: 'cat-1',
    subject: 'Human Physiology',
    language: 'English',
    shelf_number: 'Shelf A-02',
    rack_number: 'Rack 05',
    purchase_date: '2023-02-15',
    purchase_price: 2890.00,
    cover_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
    description: 'Comprehensive physiological concepts, homeostatic mechanisms, and cardiovascular-renal systems.',
    created_at: '2024-01-05T10:15:00Z',
  },
  {
    id: 'book-3',
    title: "BD Chaurasia's Human Anatomy: Regional & Applied (Vol 1-3)",
    isbn: '978-9388902748',
    author: 'B. D. Chaurasia',
    publisher: 'CBS Publishers & Distributors',
    edition: '8th Edition',
    publication_year: 2019,
    category_id: 'cat-1',
    subject: 'Gross Human Anatomy',
    language: 'English',
    shelf_number: 'Shelf A-01',
    rack_number: 'Rack 02',
    purchase_date: '2023-01-20',
    purchase_price: 1950.00,
    cover_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
    description: 'Standard dissection manual and regional anatomical illustrations for undergraduate medical students.',
    created_at: '2024-01-05T10:30:00Z',
  },
  {
    id: 'book-4',
    title: "Harrison's Principles of Internal Medicine",
    isbn: '978-1264268500',
    author: 'J. Larry Jameson, Anthony S. Fauci, Dennis L. Kasper',
    publisher: 'McGraw-Hill Education',
    edition: '21st Edition (2 Vol Set)',
    publication_year: 2022,
    category_id: 'cat-3',
    subject: 'Internal Medicine',
    language: 'English',
    shelf_number: 'Shelf C-01',
    rack_number: 'Rack 18',
    purchase_date: '2023-03-01',
    purchase_price: 12500.00,
    cover_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80',
    description: 'The premier authoritative medical reference worldwide for pathophysiology and clinical practice.',
    created_at: '2024-01-05T10:45:00Z',
  },
  {
    id: 'book-5',
    title: 'Essentials of Medical Pharmacology',
    isbn: '978-9352704996',
    author: 'K. D. Tripathi',
    publisher: 'Jaypee Brothers Medical Publishers',
    edition: '8th Edition',
    publication_year: 2019,
    category_id: 'cat-2',
    subject: 'Pharmacology & Therapeutics',
    language: 'English',
    shelf_number: 'Shelf B-02',
    rack_number: 'Rack 09',
    purchase_date: '2023-04-12',
    purchase_price: 1650.00,
    cover_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80',
    description: 'Core concepts in pharmacokinetics, pharmacodynamics, and clinical drug therapeutics in Indian healthcare.',
    created_at: '2024-01-05T11:00:00Z',
  },
  {
    id: 'book-6',
    title: "Bailey & Love's Short Practice of Surgery",
    isbn: '978-0367613662',
    author: 'P. Ronan O’Connell, Andrew W. McCaskie',
    publisher: 'CRC Press',
    edition: '28th Edition',
    publication_year: 2023,
    category_id: 'cat-4',
    subject: 'General & Operative Surgery',
    language: 'English',
    shelf_number: 'Shelf D-03',
    rack_number: 'Rack 24',
    purchase_date: '2023-06-18',
    purchase_price: 4800.00,
    cover_url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=400&q=80',
    description: 'Foundational surgical knowledge, operative techniques, trauma management and surgical oncology.',
    created_at: '2024-01-05T11:15:00Z',
  },
  {
    id: 'book-7',
    title: "DC Dutta's Textbook of Obstetrics",
    isbn: '978-9389587425',
    author: 'Hiralal Konar',
    publisher: 'Jaypee Brothers',
    edition: '9th Edition',
    publication_year: 2020,
    category_id: 'cat-5',
    subject: 'Obstetrics',
    language: 'English',
    shelf_number: 'Shelf E-01',
    rack_number: 'Rack 30',
    purchase_date: '2023-05-10',
    purchase_price: 1450.00,
    cover_url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=400&q=80',
    description: 'Comprehensive guide covering physiological pregnancy, labor, dystocia, and operative obstetrics.',
    created_at: '2024-01-05T11:30:00Z',
  }
];

export const INITIAL_COPIES: BookCopy[] = [
  // Robbins Pathology (4 copies: 3 available, 1 issued)
  { id: 'copy-1-1', book_id: 'book-1', accession_number: 'ESIC-PATH-2023-001', barcode: 'BC100101', status: 'available', shelf_location: 'Shelf B-04/R12', created_at: '2024-01-05T10:00:00Z' },
  { id: 'copy-1-2', book_id: 'book-1', accession_number: 'ESIC-PATH-2023-002', barcode: 'BC100102', status: 'available', shelf_location: 'Shelf B-04/R12', created_at: '2024-01-05T10:00:00Z' },
  { id: 'copy-1-3', book_id: 'book-1', accession_number: 'ESIC-PATH-2023-003', barcode: 'BC100103', status: 'issued', shelf_location: 'Shelf B-04/R12', created_at: '2024-01-05T10:00:00Z' },
  { id: 'copy-1-4', book_id: 'book-1', accession_number: 'ESIC-PATH-2023-004', barcode: 'BC100104', status: 'available', shelf_location: 'Shelf B-04/R12', created_at: '2024-01-05T10:00:00Z' },

  // Guyton Physiology (3 copies: 2 available, 1 overdue)
  { id: 'copy-2-1', book_id: 'book-2', accession_number: 'ESIC-PHYS-2023-001', barcode: 'BC100201', status: 'available', shelf_location: 'Shelf A-02/R05', created_at: '2024-01-05T10:15:00Z' },
  { id: 'copy-2-2', book_id: 'book-2', accession_number: 'ESIC-PHYS-2023-002', barcode: 'BC100202', status: 'issued', shelf_location: 'Shelf A-02/R05', created_at: '2024-01-05T10:15:00Z' },
  { id: 'copy-2-3', book_id: 'book-2', accession_number: 'ESIC-PHYS-2023-003', barcode: 'BC100203', status: 'available', shelf_location: 'Shelf A-02/R05', created_at: '2024-01-05T10:15:00Z' },

  // BD Chaurasia (5 copies: 4 available, 1 damaged)
  { id: 'copy-3-1', book_id: 'book-3', accession_number: 'ESIC-ANAT-2023-001', barcode: 'BC100301', status: 'available', shelf_location: 'Shelf A-01/R02', created_at: '2024-01-05T10:30:00Z' },
  { id: 'copy-3-2', book_id: 'book-3', accession_number: 'ESIC-ANAT-2023-002', barcode: 'BC100302', status: 'available', shelf_location: 'Shelf A-01/R02', created_at: '2024-01-05T10:30:00Z' },
  { id: 'copy-3-3', book_id: 'book-3', accession_number: 'ESIC-ANAT-2023-003', barcode: 'BC100303', status: 'available', shelf_location: 'Shelf A-01/R02', created_at: '2024-01-05T10:30:00Z' },
  { id: 'copy-3-4', book_id: 'book-3', accession_number: 'ESIC-ANAT-2023-004', barcode: 'BC100304', status: 'damaged', condition_notes: 'Spine split in dissection lab usage', shelf_location: 'Repair Rack', created_at: '2024-01-05T10:30:00Z' },
  { id: 'copy-3-5', book_id: 'book-3', accession_number: 'ESIC-ANAT-2023-005', barcode: 'BC100305', status: 'available', shelf_location: 'Shelf A-01/R02', created_at: '2024-01-05T10:30:00Z' },

  // Harrison's (2 copies: 1 available, 1 issued to faculty)
  { id: 'copy-4-1', book_id: 'book-4', accession_number: 'ESIC-GMED-2023-001', barcode: 'BC100401', status: 'available', shelf_location: 'Shelf C-01/R18', created_at: '2024-01-05T10:45:00Z' },
  { id: 'copy-4-2', book_id: 'book-4', accession_number: 'ESIC-GMED-2023-002', barcode: 'BC100402', status: 'issued', shelf_location: 'Shelf C-01/R18', created_at: '2024-01-05T10:45:00Z' },

  // Tripathi Pharmacology (3 copies)
  { id: 'copy-5-1', book_id: 'book-5', accession_number: 'ESIC-PHAR-2023-001', barcode: 'BC100501', status: 'available', shelf_location: 'Shelf B-02/R09', created_at: '2024-01-05T11:00:00Z' },
  { id: 'copy-5-2', book_id: 'book-5', accession_number: 'ESIC-PHAR-2023-002', barcode: 'BC100502', status: 'available', shelf_location: 'Shelf B-02/R09', created_at: '2024-01-05T11:00:00Z' },
  { id: 'copy-5-3', book_id: 'book-5', accession_number: 'ESIC-PHAR-2023-003', barcode: 'BC100503', status: 'available', shelf_location: 'Shelf B-02/R09', created_at: '2024-01-05T11:00:00Z' },

  // Bailey & Love Surgery (2 copies)
  { id: 'copy-6-1', book_id: 'book-6', accession_number: 'ESIC-GSUR-2023-001', barcode: 'BC100601', status: 'available', shelf_location: 'Shelf D-03/R24', created_at: '2024-01-05T11:15:00Z' },
  { id: 'copy-6-2', book_id: 'book-6', accession_number: 'ESIC-GSUR-2023-002', barcode: 'BC100602', status: 'available', shelf_location: 'Shelf D-03/R24', created_at: '2024-01-05T11:15:00Z' },

  // Dutta Obstetrics (2 copies)
  { id: 'copy-7-1', book_id: 'book-7', accession_number: 'ESIC-OBGY-2023-001', barcode: 'BC100701', status: 'available', shelf_location: 'Shelf E-01/R30', created_at: '2024-01-05T11:30:00Z' },
  { id: 'copy-7-2', book_id: 'book-7', accession_number: 'ESIC-OBGY-2023-002', barcode: 'BC100702', status: 'available', shelf_location: 'Shelf E-01/R30', created_at: '2024-01-05T11:30:00Z' }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    member_type: 'student',
    identifier: 'ESIC/MBBS/2022/014',
    full_name: 'Ananya Reddy',
    department_id: 'dept-4',
    course: 'MBBS',
    academic_year: '3rd Year (Part 1)',
    phone: '+91 98491 11223',
    email: 'ananya.reddy@student.esic.edu.in',
    status: 'active',
    max_borrow_limit: 3,
    registration_date: '2022-09-01',
    created_at: '2022-09-01T09:00:00Z',
  },
  {
    id: 'mem-2',
    member_type: 'student',
    identifier: 'ESIC/MBBS/2023/048',
    full_name: 'Mohammed Faizan',
    department_id: 'dept-2',
    course: 'MBBS',
    academic_year: '2nd Year',
    phone: '+91 99882 33445',
    email: 'faizan.m@student.esic.edu.in',
    status: 'active',
    max_borrow_limit: 3,
    registration_date: '2023-09-15',
    created_at: '2023-09-15T11:20:00Z',
  },
  {
    id: 'mem-3',
    member_type: 'student',
    identifier: 'ESIC/MBBS/2021/082',
    full_name: 'K. Sai Krishna',
    department_id: 'dept-7',
    course: 'MBBS',
    academic_year: 'Final Year (Part 2)',
    phone: '+91 91234 56780',
    email: 'saikrishna.k@student.esic.edu.in',
    status: 'active',
    max_borrow_limit: 3,
    registration_date: '2021-08-20',
    created_at: '2021-08-20T10:00:00Z',
  },
  {
    id: 'mem-4',
    member_type: 'staff',
    identifier: 'EMP-MED-201',
    full_name: 'Dr. Ramesh Chandra (Professor & HOD)',
    department_id: 'dept-7',
    designation: 'Professor & HOD',
    phone: '+91 94412 88990',
    email: 'ramesh.chandra@faculty.esic.edu.in',
    status: 'active',
    max_borrow_limit: 6,
    registration_date: '2020-05-10',
    created_at: '2020-05-10T08:30:00Z',
  },
  {
    id: 'mem-5',
    member_type: 'staff',
    identifier: 'EMP-SUR-108',
    full_name: 'Dr. Sneha Latha (Assistant Professor)',
    department_id: 'dept-8',
    designation: 'Assistant Professor',
    phone: '+91 98765 43210',
    email: 'sneha.latha@faculty.esic.edu.in',
    status: 'active',
    max_borrow_limit: 6,
    registration_date: '2021-11-01',
    created_at: '2021-11-01T14:00:00Z',
  },
  {
    id: 'mem-6',
    member_type: 'student',
    identifier: 'ESIC/MBBS/2023/102',
    full_name: 'V. Keerthana',
    department_id: 'dept-1',
    course: 'MBBS',
    academic_year: '1st Year',
    phone: '+91 97001 55667',
    email: 'keerthana.v@student.esic.edu.in',
    status: 'suspended',
    max_borrow_limit: 3,
    registration_date: '2023-10-01',
    created_at: '2023-10-01T10:00:00Z',
  }
];

export const INITIAL_ISSUES: BookIssue[] = [
  {
    id: 'issue-1',
    issue_code: 'ISS-2024-001',
    copy_id: 'copy-1-3',
    member_id: 'mem-1',
    issued_by: 'u-admin-001',
    issue_date: '2024-10-25',
    due_date: '2024-11-08',
    status: 'active',
    remarks: 'Issued for clinical pathology posting.',
    created_at: '2024-10-25T11:00:00Z',
  },
  {
    id: 'issue-2',
    issue_code: 'ISS-2024-002',
    copy_id: 'copy-2-2',
    member_id: 'mem-2',
    issued_by: 'u-lib-002',
    issue_date: '2024-10-10',
    due_date: '2024-10-24', // Past due date -> Overdue
    status: 'overdue',
    remarks: 'Pre-exam preparation issue.',
    created_at: '2024-10-10T14:30:00Z',
  },
  {
    id: 'issue-3',
    issue_code: 'ISS-2024-003',
    copy_id: 'copy-4-2',
    member_id: 'mem-4',
    issued_by: 'u-admin-001',
    issue_date: '2024-10-15',
    due_date: '2024-11-14',
    status: 'active',
    remarks: 'Postgraduate seminar preparation.',
    created_at: '2024-10-15T09:45:00Z',
  }
];

export const INITIAL_FINES: Fine[] = [
  {
    id: 'fine-1',
    issue_id: 'issue-2',
    member_id: 'mem-2',
    amount: 95.00,
    balance_amount: 45.00,
    status: 'partially_paid',
    created_at: '2024-10-25T00:00:00Z',
  }
];

export const INITIAL_PAYMENTS: FinePayment[] = [
  {
    id: 'pay-1',
    receipt_no: 'RCP-2024-089',
    fine_id: 'fine-1',
    member_id: 'mem-2',
    amount_paid: 50.00,
    payment_method: 'cash',
    payment_reference: 'CASH-REC-1089',
    received_by: 'u-lib-002',
    payment_date: '2024-10-28T12:30:00Z',
    remarks: 'Partial cash payment received at library circulation desk.',
    created_at: '2024-10-28T12:30:00Z',
  }
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'pur-1',
    invoice_number: 'INV-MED-2024-041',
    supplier_name: 'Universal Medical Book Distributors, Hyderabad',
    purchase_date: '2024-01-15',
    total_amount: 45800.00,
    received_by: 'u-admin-001',
    remarks: 'Annual procurement of MBBS 2nd and 3rd year textbooks.',
    items: [
      { id: 'pi-1', purchase_id: 'pur-1', book_id: 'book-1', title: 'Robbins Pathologic Basis of Disease', isbn: '978-0323531139', copies_count: 5, cost_per_copy: 3450, total_cost: 17250 },
      { id: 'pi-2', purchase_id: 'pur-1', book_id: 'book-5', title: 'Essentials of Medical Pharmacology', isbn: '978-9352704996', copies_count: 8, cost_per_copy: 1650, total_cost: 13200 },
      { id: 'pi-3', purchase_id: 'pur-1', book_id: 'book-6', title: "Bailey & Love Surgery", isbn: '978-0367613662', copies_count: 3, cost_per_copy: 4800, total_cost: 14400 }
    ],
    created_at: '2024-01-15T15:00:00Z',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    user_id: 'u-admin-001',
    user_email: 'admin@esic.edu.in',
    action: 'SYSTEM_BOOTSTRAP',
    entity: 'SYSTEM',
    details: { message: 'LibraCare initialized for ESIC Medical College & Hospital, Sangareddy' },
    created_at: '2024-01-01T09:00:00Z',
  },
  {
    id: 'log-2',
    user_id: 'u-admin-001',
    user_email: 'admin@esic.edu.in',
    action: 'ISSUE_BOOK',
    entity: 'BOOK_ISSUE',
    entity_id: 'issue-1',
    details: { copy: 'ESIC-PATH-2023-003', student: 'ESIC/MBBS/2022/014' },
    created_at: '2024-10-25T11:00:00Z',
  },
  {
    id: 'log-3',
    user_id: 'u-lib-002',
    user_email: 'librarian@esic.edu.in',
    action: 'RECORD_FINE_PAYMENT',
    entity: 'FINE_PAYMENT',
    entity_id: 'pay-1',
    details: { receipt: 'RCP-2024-089', amount: 50.00, member: 'ESIC/MBBS/2023/048' },
    created_at: '2024-10-28T12:30:00Z',
  }
];
