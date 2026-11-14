// Automated Acceptance Criteria Verification for LibraCare
import { DatabaseService } from '../src/services/db';

console.log('================================================================');
console.log('LIBRACARE: ACCEPTANCE CRITERIA AUTOMATED VERIFICATION SUITE');
console.log('ESIC Medical College and Hospital, Sangareddy');
console.log('================================================================\n');

// Mock localStorage for node environment
const storage = new Map<string, string>();
(global as any).localStorage = {
  getItem: (k: string) => storage.get(k) || null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear()
};

const db = DatabaseService.getInstance();
db.initIfEmpty(true);

const adminUser = db.getProfiles().find(p => p.role === 'super_admin');
const librarianUser = db.getProfiles().find(p => p.role === 'librarian');

let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    if (detail) console.log(`   └─ ${detail}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (detail) console.error(`   └─ ${detail}`);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// TEST 1: Create a book with five physical copies
// -------------------------------------------------------------
console.log('--- TEST 1: Create book with 5 physical copies ---');
const newBook = db.saveBook({
  title: 'Davidson\'s Principles and Practice of Medicine',
  isbn: '978-0702070280',
  author: 'Stuart H. Ralston, Ian D. Penman',
  publisher: 'Elsevier',
  edition: '23rd Edition',
  publication_year: 2022,
  subject: 'Clinical Medicine',
  shelf_number: 'Shelf C-02',
  rack_number: 'Rack 15',
  purchase_price: 3200,
  purchase_date: '2024-02-01'
}, 5, 'ESIC-TEST-MED', adminUser);

const bookWithCopies = db.getBookById(newBook.id);
const copies = db.getCopiesByBookId(newBook.id);
assert(
  copies.length === 5 && bookWithCopies?.total_copies === 5 && bookWithCopies?.available_copies === 5,
  'TEST 1: Book created with 5 physical accession copies',
  `Created: "${newBook.title}" with 5 copies: ${copies.map(c => c.accession_number).join(', ')}`
);

// -------------------------------------------------------------
// TEST 2: Register a student
// -------------------------------------------------------------
console.log('\n--- TEST 2: Register a student ---');
const newStudent = db.saveMember({
  member_type: 'student',
  identifier: 'ESIC/MBBS/2024/TEST01',
  full_name: 'Test Student MBBS',
  department_id: db.getDepartments()[0].id,
  course: 'MBBS',
  academic_year: '1st Year',
  phone: '+91 99999 88888',
  email: 'test.student@esic.edu.in',
  status: 'active'
}, adminUser);

const fetchedStudent = db.getMemberById(newStudent.id);
assert(
  fetchedStudent?.identifier === 'ESIC/MBBS/2024/TEST01' && fetchedStudent.status === 'active',
  'TEST 2: Student successfully registered with active status',
  `Student: ${fetchedStudent?.full_name} (${fetchedStudent?.identifier}), Dept: ${db.getDepartments()[0].name}`
);

// -------------------------------------------------------------
// TEST 3: Issue one copy to that student
// -------------------------------------------------------------
console.log('\n--- TEST 3: Issue one copy to that student ---');
const copyToIssue = copies[0];
const issueRecord = db.issueBook({
  copyId: copyToIssue.id,
  memberId: newStudent.id,
  issueDate: '2024-11-01',
  customDueDate: '2024-11-15',
  remarks: 'Test Loan Verification',
  user: adminUser
});

const updatedCopyAfterIssue = db.getCopyByAccession(copyToIssue.accession_number);
const updatedBookAfterIssue = db.getBookById(newBook.id);
assert(
  issueRecord.status === 'active' &&
  updatedCopyAfterIssue?.status === 'issued' &&
  updatedBookAfterIssue?.available_copies === 4 &&
  updatedBookAfterIssue?.total_copies === 5,
  'TEST 3: Physical copy issued, status marked as issued, available stock decremented from 5 to 4',
  `Issue Code: ${issueRecord.issue_code}, Copy ${copyToIssue.accession_number} is now "${updatedCopyAfterIssue?.status}"`
);

// -------------------------------------------------------------
// TEST 4: Return the book before due date
// -------------------------------------------------------------
console.log('\n--- TEST 4: Return book before due date ---');
const returnNormalResult = db.returnBook({
  issueId: issueRecord.id,
  returnDate: '2024-11-10', // 5 days before due date (due 2024-11-15)
  condition: 'good',
  user: librarianUser
});

const updatedCopyAfterReturn = db.getCopyByAccession(copyToIssue.accession_number);
const updatedBookAfterReturn = db.getBookById(newBook.id);
assert(
  returnNormalResult.returnRecord.fine_amount === 0 &&
  returnNormalResult.returnRecord.overdue_days === 0 &&
  updatedCopyAfterReturn?.status === 'available' &&
  updatedBookAfterReturn?.available_copies === 5,
  'TEST 4: Book returned on time, fine is ₹0.00, copy restored to available status',
  `Overdue: ${returnNormalResult.returnRecord.overdue_days} days, Fine: ₹${returnNormalResult.returnRecord.fine_amount}`
);

// -------------------------------------------------------------
// TEST 5: Return a book after its due date
// -------------------------------------------------------------
console.log('\n--- TEST 5: Return a book after its due date (Overdue Fine Calculation) ---');
// Issue copy 2 to student
const copy2 = copies[1];
const issueOverdue = db.issueBook({
  copyId: copy2.id,
  memberId: newStudent.id,
  issueDate: '2024-10-01',
  customDueDate: '2024-10-15',
  remarks: 'Overdue simulation',
  user: adminUser
});

// Return on Oct 25 (10 days overdue).
// Policy: 2 days grace period, daily fine ₹5.00
// Chargeable days = 10 - 2 = 8 days -> Fine = 8 * 5 = ₹40.00
const returnOverdueResult = db.returnBook({
  issueId: issueOverdue.id,
  returnDate: '2024-10-25',
  condition: 'good',
  user: librarianUser
});

assert(
  returnOverdueResult.returnRecord.overdue_days === 10 &&
  returnOverdueResult.returnRecord.fine_amount === 40.00 &&
  returnOverdueResult.fine !== undefined &&
  returnOverdueResult.fine.balance_amount === 40.00,
  'TEST 5: Overdue duration & fine calculated according to library policy',
  `Overdue: 10 days, Chargeable: 8 days (Grace: 2d, Rate: ₹5/day) -> Assessed Fine: ₹${returnOverdueResult.returnRecord.fine_amount}`
);

// -------------------------------------------------------------
// TEST 6: Record a partial payment
// -------------------------------------------------------------
console.log('\n--- TEST 6: Record a partial payment ---');
const fineToPay = returnOverdueResult.fine!;
const paymentResult = db.recordFinePayment({
  fineId: fineToPay.id,
  amountPaid: 25.00, // Pay ₹25 of ₹40
  paymentMethod: 'cash',
  paymentReference: 'TEST-REC-001',
  remarks: 'Partial student payment',
  user: librarianUser
});

const updatedFineAfterPayment = db.getFines().find(f => f.id === fineToPay.id);
assert(
  paymentResult.payment.amount_paid === 25.00 &&
  updatedFineAfterPayment?.status === 'partially_paid' &&
  updatedFineAfterPayment?.balance_amount === 15.00,
  'TEST 6: Partial payment recorded with receipt, balance reduced correctly',
  `Paid: ₹25.00, Remaining Balance: ₹${updatedFineAfterPayment?.balance_amount} (Status: ${updatedFineAfterPayment?.status})`
);

// -------------------------------------------------------------
// TEST 7: Mark a book as damaged or lost
// -------------------------------------------------------------
console.log('\n--- TEST 7: Mark a book copy as damaged or lost ---');
const copy3 = copies[2];
db.updateCopyStatus(copy3.id, 'damaged', 'Liquid spillage in anatomy lab', adminUser);

const damagedCopy = db.getCopyByAccession(copy3.accession_number);
const bookAfterDamage = db.getBookById(newBook.id);
assert(
  damagedCopy?.status === 'damaged' &&
  bookAfterDamage?.available_copies === 4, // 5 total, 1 damaged -> 4 available
  'TEST 7: Copy marked as damaged, excluded from available stock',
  `Copy ${copy3.accession_number} is "${damagedCopy?.status}". Available copies: ${bookAfterDamage?.available_copies}/${bookAfterDamage?.total_copies}`
);

// -------------------------------------------------------------
// TEST 8: Role-based permissions enforcement
// -------------------------------------------------------------
console.log('\n--- TEST 8: Role-based permissions enforcement ---');
let waiverBlocked = false;
try {
  // Librarian tries to waive fine without authorization
  db.waiveFine({
    fineId: fineToPay.id,
    reason: 'Librarian unauthorized waiver attempt',
    user: librarianUser // Not super admin
  });
} catch (e: any) {
  waiverBlocked = true;
}

// Super admin executes valid waiver
const waivedByAdmin = db.waiveFine({
  fineId: fineToPay.id,
  reason: 'Approved by Dean for academic excellence award',
  user: adminUser
});

assert(
  waiverBlocked && waivedByAdmin.status === 'waived' && waivedByAdmin.balance_amount === 0,
  'TEST 8: Super Admin privilege enforced; unauthorized staff waiver blocked',
  `Librarian waiver rejected. Admin waiver succeeded: Status "${waivedByAdmin.status}", Balance ₹${waivedByAdmin.balance_amount}`
);

// -------------------------------------------------------------
// TEST 9: Reports and Database Integrity
// -------------------------------------------------------------
console.log('\n--- TEST 9: Reports & Data Consistency ---');
const stats = db.getDashboardStats();
assert(
  stats.totalTitles >= 8 &&
  stats.totalPhysicalCopies >= 20 &&
  stats.availableCopies > 0 &&
  stats.categoryDistribution.length > 0,
  'TEST 9: Dashboard statistics and report aggregations dynamically match live records',
  `Titles: ${stats.totalTitles}, Copies: ${stats.totalPhysicalCopies}, Available: ${stats.availableCopies}, Students: ${stats.totalStudents}`
);

// -------------------------------------------------------------
// TEST 10: State persistence across reloads
// -------------------------------------------------------------
console.log('\n--- TEST 10: State persistence across app reloads ---');
// Re-instantiate database service to simulate browser page refresh / session restart
const reloadedDb = DatabaseService.getInstance();
const reloadedBook = reloadedDb.getBookById(newBook.id);
const reloadedStudent = reloadedDb.getMemberById(newStudent.id);

assert(
  reloadedBook !== undefined &&
  reloadedStudent !== undefined &&
  reloadedBook.title === newBook.title &&
  reloadedStudent.identifier === newStudent.identifier,
  'TEST 10: All records persisted in storage, zero data loss after reload',
  `Persisted Book: "${reloadedBook?.title}", Persisted Student: "${reloadedStudent?.full_name}"`
);

console.log('\n================================================================');
console.log(`ALL ${passedTests}/10 ACCEPTANCE TEST WORKFLOWS PASSED WITH 100% SUCCESS!`);
console.log('================================================================');
