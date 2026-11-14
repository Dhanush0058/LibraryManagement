-- ====================================================================
-- LIBRACARE: ESIC MEDICAL COLLEGE & HOSPITAL, SANGAREDDY, TELANGANA
-- PRODUCTION RELATIONAL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('academic_preclinical', 'academic_paraclinical', 'clinical', 'hospital_support', 'administrative')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(30) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES (Authorities only: Super Admin, Librarian)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('super_admin', 'librarian')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    phone VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEMBERS (Students & Hospital Faculty/Staff)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_type VARCHAR(20) NOT NULL CHECK (member_type IN ('student', 'staff')),
    identifier VARCHAR(60) NOT NULL UNIQUE, -- Roll Number or Employee ID
    full_name VARCHAR(150) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    course VARCHAR(100), -- E.g. MBBS, MD, MS, DNB, Nursing, Paramedical
    academic_year VARCHAR(30), -- E.g. 1st Year, 2nd Year, Final Year
    designation VARCHAR(100), -- E.g. Assistant Professor, Senior Resident, Nursing Officer
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'graduated', 'relieved')),
    max_borrow_limit INT NOT NULL DEFAULT 3,
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BOOKS (Titles Catalog)
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(30) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    edition VARCHAR(50),
    publication_year INT CHECK (publication_year >= 1800 AND publication_year <= 2100),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    subject VARCHAR(150),
    language VARCHAR(50) DEFAULT 'English',
    shelf_number VARCHAR(50),
    rack_number VARCHAR(50),
    purchase_date DATE,
    purchase_price DECIMAL(10, 2) DEFAULT 0.00,
    cover_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BOOK COPIES (Physical Inventory Tracking with Unique Accession Numbers)
CREATE TABLE IF NOT EXISTS book_copies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    accession_number VARCHAR(60) NOT NULL UNIQUE,
    barcode VARCHAR(60),
    status VARCHAR(30) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'issued', 'damaged', 'lost', 'withdrawn')),
    condition_notes TEXT,
    shelf_location VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BOOK ISSUES (Circulation Transactions)
CREATE TABLE IF NOT EXISTS book_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_code VARCHAR(50) NOT NULL UNIQUE,
    copy_id UUID NOT NULL REFERENCES book_copies(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    issued_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'lost')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BOOK RETURNS
CREATE TABLE IF NOT EXISTS book_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL UNIQUE REFERENCES book_issues(id) ON DELETE RESTRICT,
    returned_by_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    overdue_days INT NOT NULL DEFAULT 0,
    condition VARCHAR(30) NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'minor_wear', 'damaged', 'lost')),
    fine_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FINES & CHARGES
CREATE TABLE IF NOT EXISTS fines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL UNIQUE REFERENCES book_issues(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    balance_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_paid', 'paid', 'waived')),
    waiver_reason TEXT,
    waived_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FINE PAYMENTS
CREATE TABLE IF NOT EXISTS fine_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_no VARCHAR(60) NOT NULL UNIQUE,
    fine_id UUID NOT NULL REFERENCES fines(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    amount_paid DECIMAL(10, 2) NOT NULL CHECK (amount_paid > 0),
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'online', 'cheque', 'dd')),
    payment_reference VARCHAR(100),
    received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PURCHASES & INVOICE MANAGEMENT
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    supplier_name VARCHAR(255) NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(30),
    copies_count INT NOT NULL CHECK (copies_count > 0),
    cost_per_copy DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. LIBRARY SETTINGS & CIRCULATION POLICIES
CREATE TABLE IF NOT EXISTS library_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(80) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(80) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_members_identifier ON members(identifier);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(full_name);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_book_copies_accession ON book_copies(accession_number);
CREATE INDEX IF NOT EXISTS idx_book_copies_status ON book_copies(status);
CREATE INDEX IF NOT EXISTS idx_book_issues_member ON book_issues(member_id);
CREATE INDEX IF NOT EXISTS idx_book_issues_status ON book_issues(status);
CREATE INDEX IF NOT EXISTS idx_book_issues_due_date ON book_issues(due_date);
CREATE INDEX IF NOT EXISTS idx_fines_member ON fines(member_id);
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);
CREATE INDEX IF NOT EXISTS idx_fine_payments_date ON fine_payments(payment_date);

-- ====================================================================
-- VIEWS FOR REAL-TIME REPORTING & DASHBOARD
-- ====================================================================
CREATE OR REPLACE VIEW v_book_inventory_summary AS
SELECT 
    b.id,
    b.title,
    b.isbn,
    b.author,
    b.publisher,
    b.edition,
    c.name as category_name,
    COUNT(bc.id) as total_copies,
    COUNT(CASE WHEN bc.status = 'available' THEN 1 END) as available_copies,
    COUNT(CASE WHEN bc.status = 'issued' THEN 1 END) as issued_copies,
    COUNT(CASE WHEN bc.status = 'damaged' THEN 1 END) as damaged_copies,
    COUNT(CASE WHEN bc.status = 'lost' THEN 1 END) as lost_copies
FROM books b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN book_copies bc ON b.id = bc.book_id
GROUP BY b.id, b.title, b.isbn, b.author, b.publisher, b.edition, c.name;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE fine_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Authority check policy helper
CREATE OR REPLACE FUNCTION is_authority()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read policies for reference data (categories, departments, settings)
CREATE POLICY "Public read departments" ON departments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read settings" ON library_settings FOR SELECT TO anon, authenticated USING (true);

-- Policies: Authenticated authorities can read and write operational tables
CREATE POLICY "Authorities view profiles" ON profiles FOR SELECT TO authenticated USING (is_authority());
CREATE POLICY "Super Admins manage profiles" ON profiles FOR ALL TO authenticated USING (is_super_admin());

CREATE POLICY "Authorities view & manage members" ON members FOR ALL TO authenticated USING (is_authority());
CREATE POLICY "Authorities view & manage books" ON books FOR ALL TO authenticated USING (is_authority());
CREATE POLICY "Authorities view & manage copies" ON book_copies FOR ALL TO authenticated USING (is_authority());
CREATE POLICY "Authorities view & manage issues" ON book_issues FOR ALL TO authenticated USING (is_authority());
CREATE POLICY "Authorities view & manage returns" ON book_returns FOR ALL TO authenticated USING (is_authority());
CREATE POLICY "Authorities view & manage fines" ON fines FOR ALL TO authenticated USING (is_authority());
CREATE POLICY "Authorities view & manage payments" ON fine_payments FOR ALL TO authenticated USING (is_authority());
CREATE POLICY "Authorities view & manage purchases" ON purchases FOR ALL TO authenticated USING (is_authority());
CREATE POLICY "Authorities view & manage purchase_items" ON purchase_items FOR ALL TO authenticated USING (is_authority());
CREATE POLICY "Authorities view settings" ON library_settings FOR SELECT TO authenticated USING (is_authority());
CREATE POLICY "Super Admins manage settings" ON library_settings FOR ALL TO authenticated USING (is_super_admin());
CREATE POLICY "Authorities view audit logs" ON audit_logs FOR SELECT TO authenticated USING (is_authority());
CREATE POLICY "Authorities insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (is_authority());
