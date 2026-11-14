# LibraCare — ESIC Central Library Management System
### ESIC Medical College and Hospital, Sangareddy, Telangana, India

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/Dhanush0058/LibraryManagement)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Tailwind%20%7C%20Supabase-teal)](https://github.com/Dhanush0058/LibraryManagement)
[![Security](https://img.shields.io/badge/Security-RLS%20%26%20RBAC%20Enforced-navy)](https://github.com/Dhanush0058/LibraryManagement)

A centralized, production-quality library management platform developed for the library of **ESIC Medical College and Hospital, Sangareddy, Telangana**. Engineered specifically for presentation to institutional library authorities, this first phase is an **Authority-Only System** (Super Administrator and Circulation Librarian roles) ensuring strict governance over medical inventory, physical accession numbering, student and faculty circulation, overdue compliance, and financial fee collections.

---

## Key Features

- **Accession-Level Inventory**: Every physical copy has an individual unique accession number (e.g. `ESIC-PATH-2023-001`, `ESIC-ANAT-2024-002`). Real-time status tracking across `available`, `issued`, `damaged`, `lost`, and `withdrawn`.
- **Preclinical, Paraclinical & Clinical Classifications**: Categorized by medical departments (Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Microbiology, General Medicine, General Surgery, OBG, Pediatrics).
- **Student & Faculty Circulation Desk**:
  - Member verification with borrowing quota enforcement (MBBS students: 3 books, Faculty: 6 books).
  - Configurable return due dates (14-day student loans, 30-day faculty loans).
  - Issue code generation and loan ledger.
- **Automated Fine & Overdue Policy Engine**:
  - Overdue days and grace period deduction.
  - Daily fine calculation and maximum fine caps.
  - Damage repair fees and lost book replacement multipliers.
  - Cash/Online fine collection with computerized PDF receipt generation.
  - Authorized fine waivers reserved strictly for Super Administrator with mandatory audit justification.
- **Executive Reporting & Export**:
  - Export all registers (Inventory, Circulation, Overdue, Collections, Purchases) to CSV.
  - Formatted institutional PDF reports with official ESIC Medical College header and signatory blocks.
  - Individual student/staff formal overdue retrieval notice PDF generation.
- **Stock Acquisitions & Purchases**:
  - Supplier procurement manifests and invoice management.
  - Automatic accession number generation upon inward stock confirmation.
- **Institutional Security & Audit Trail**:
  - Immutable audit logs capturing staff email, timestamp, operation details, and IP address.
  - Account provisioning, activation, and deactivation.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Forms & Validation**: React Hook Form, Zod
- **Document Generation**: jsPDF, jsPDF-AutoTable, PapaParse
- **Database & Backend**: PostgreSQL 15+, Supabase with Row Level Security (RLS) policies
- **Dual Presentation Engine**: Works seamlessly both against live Supabase PostgreSQL or locally in full-fidelity presentation demo mode with localStorage persistence.

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Dhanush0058/LibraryManagement.git
cd LibraryManagement
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: Real credentials are hidden and excluded from Git via `.gitignore`)*

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Verification Suite
Verify all 10 acceptance workflows (Circulation, Fines, Accession tracking, State persistence):
```bash
npx tsx scripts/verify-workflows.ts
```

### 6. Production Build
```bash
npm run build
```

---

## Demonstration Credentials (Authority Portal)

| Role | Email | Password | Scope of Authority |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@esic.edu.in` | `admin123` *(or 1-click switcher)* | Unrestricted institutional access, staff provisioning, fine waiver approval, policy settings |
| **Librarian** | `librarian@esic.edu.in` | `demoPass123` *(or 1-click switcher)* | Operational circulation desk, book issues/returns, cataloging, fine collection |

*Note: Phase 1 is an Authority-Only System. Students do not have public login access in this phase.*

---

## Database Migration & Schema

SQL migration and seed scripts are available in the `supabase/` directory:
- `supabase/migrations/001_libracare_schema.sql` — Tables, indexes, views, and RLS policies
- `supabase/seed.sql` — Medical departments, textbook catalog, faculty and student demo rosters

---

## License

Institutional use — ESIC Medical College and Hospital, Sangareddy. All rights reserved.
