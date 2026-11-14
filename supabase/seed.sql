-- ====================================================================
-- SEED DATA FOR ESIC MEDICAL COLLEGE & HOSPITAL LIBRARY
-- ====================================================================

-- 1. DEPARTMENTS
INSERT INTO departments (id, name, code, type) VALUES
('d1000000-0000-0000-0000-000000000001', 'Department of Anatomy', 'ANAT', 'academic_preclinical'),
('d1000000-0000-0000-0000-000000000002', 'Department of Physiology', 'PHYS', 'academic_preclinical'),
('d1000000-0000-0000-0000-000000000003', 'Department of Biochemistry', 'BIOC', 'academic_preclinical'),
('d1000000-0000-0000-0000-000000000004', 'Department of Pathology', 'PATH', 'academic_paraclinical'),
('d1000000-0000-0000-0000-000000000005', 'Department of Pharmacology', 'PHAR', 'academic_paraclinical'),
('d1000000-0000-0000-0000-000000000006', 'Department of Microbiology', 'MICR', 'academic_paraclinical'),
('d1000000-0000-0000-0000-000000000007', 'Department of General Medicine', 'GMED', 'clinical'),
('d1000000-0000-0000-0000-000000000008', 'Department of General Surgery', 'GSUR', 'clinical'),
('d1000000-0000-0000-0000-000000000009', 'Department of Obstetrics & Gynecology', 'OBGY', 'clinical'),
('d1000000-0000-0000-0000-000000000010', 'Department of Pediatrics', 'PEDI', 'clinical')
ON CONFLICT (code) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (id, name, code, description) VALUES
('c1000000-0000-0000-0000-000000000001', 'Pre-Clinical Sciences', 'CAT-PRE', 'Human Anatomy, Physiology, Medical Biochemistry'),
('c1000000-0000-0000-0000-000000000002', 'Para-Clinical Sciences', 'CAT-PARA', 'Pathology, Microbiology, Pharmacology, Forensic Medicine'),
('c1000000-0000-0000-0000-000000000003', 'Clinical Medicine', 'CAT-CLIN-MED', 'Internal Medicine, Cardiology, Neurology, Dermatology'),
('c1000000-0000-0000-0000-000000000004', 'Surgical Specialties', 'CAT-SURG', 'General Surgery, Orthopaedics, ENT, Ophthalmology'),
('c1000000-0000-0000-0000-000000000005', 'Maternal & Child Health', 'CAT-MCH', 'Pediatrics, Obstetrics and Gynaecology'),
('c1000000-0000-0000-0000-000000000006', 'Reference & Medical Journals', 'CAT-REF', 'Encyclopedias, Medical Dictionaries, WHO Guidelines')
ON CONFLICT (code) DO NOTHING;

-- 3. LIBRARY SETTINGS (Configurable Institutional Fine & Circulation Policy)
INSERT INTO library_settings (id, key, value, description) VALUES
('s1000000-0000-0000-0000-000000000001', 'student_borrow_limit', '3', 'Maximum physical books a student can hold simultaneously'),
('s1000000-0000-0000-0000-000000000002', 'student_loan_days', '14', 'Default loan duration in days for students'),
('s1000000-0000-0000-0000-000000000003', 'student_grace_period_days', '2', 'Grace period after due date before overdue fines are levied (Proposed)'),
('s1000000-0000-0000-0000-000000000004', 'student_daily_fine', '5.00', 'Fine per overdue day in INR for students (Proposed)'),
('s1000000-0000-0000-0000-000000000005', 'student_max_fine', '300.00', 'Maximum capping on overdue fine per book for students (Proposed)'),
('s1000000-0000-0000-0000-000000000006', 'staff_borrow_limit', '6', 'Maximum physical books a faculty/staff member can hold'),
('s1000000-0000-0000-0000-000000000007', 'staff_loan_days', '30', 'Default loan duration in days for faculty/staff'),
('s1000000-0000-0000-0000-000000000008', 'staff_grace_period_days', '5', 'Grace period after due date for faculty/staff (Proposed)'),
('s1000000-0000-0000-0000-000000000009', 'staff_daily_fine', '2.00', 'Fine per overdue day in INR for staff (Proposed)'),
('s1000000-0000-0000-0000-000000000010', 'staff_max_fine', '200.00', 'Maximum fine capping for staff (Proposed)'),
('s1000000-0000-0000-0000-000000000011', 'lost_book_multiplier', '1.5', 'Multiplier applied on book purchase price for lost book replacement'),
('s1000000-0000-0000-0000-000000000012', 'damaged_book_flat_fee', '150.00', 'Flat binding or repair fee for damaged returns')
ON CONFLICT (key) DO NOTHING;
