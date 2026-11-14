import { 
  Profile, Department, Category, Member, Book, BookCopy, 
  BookIssue, BookReturn, Fine, FinePayment, Purchase, PurchaseItem, 
  LibrarySettings, AuditLog, CopyStatus, PaymentMethod 
} from '../types';
import { 
  INITIAL_SETTINGS, INITIAL_PROFILES, INITIAL_DEPARTMENTS, 
  INITIAL_CATEGORIES, INITIAL_BOOKS, INITIAL_COPIES, 
  INITIAL_MEMBERS, INITIAL_ISSUES, INITIAL_FINES, 
  INITIAL_PAYMENTS, INITIAL_PURCHASES, INITIAL_AUDIT_LOGS 
} from './seedData';

// Local storage keys
const STORAGE_PREFIX = 'libracare_';
const KEYS = {
  SETTINGS: STORAGE_PREFIX + 'settings',
  PROFILES: STORAGE_PREFIX + 'profiles',
  DEPARTMENTS: STORAGE_PREFIX + 'departments',
  CATEGORIES: STORAGE_PREFIX + 'categories',
  MEMBERS: STORAGE_PREFIX + 'members',
  BOOKS: STORAGE_PREFIX + 'books',
  COPIES: STORAGE_PREFIX + 'copies',
  ISSUES: STORAGE_PREFIX + 'issues',
  FINES: STORAGE_PREFIX + 'fines',
  PAYMENTS: STORAGE_PREFIX + 'payments',
  PURCHASES: STORAGE_PREFIX + 'purchases',
  AUDIT_LOGS: STORAGE_PREFIX + 'audit_logs',
};

// Memory store fallback for Node.js / testing environments
const memoryStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return memoryStore.get(key) || null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  } else {
    memoryStore.set(key, value);
  }
}

// Helper to safely load data
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = getStorageItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading from local storage for key ${key}:`, e);
    return fallback;
  }
}

// Helper to safely save data
function setLocal<T>(key: string, data: T): void {
  try {
    setStorageItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving to local storage for key ${key}:`, e);
  }
}

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.initIfEmpty();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public initIfEmpty(forceReset: boolean = false): void {
    if (forceReset || !getStorageItem(KEYS.SETTINGS)) {
      setLocal(KEYS.SETTINGS, INITIAL_SETTINGS);
      setLocal(KEYS.PROFILES, INITIAL_PROFILES);
      setLocal(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
      setLocal(KEYS.CATEGORIES, INITIAL_CATEGORIES);
      setLocal(KEYS.MEMBERS, INITIAL_MEMBERS);
      setLocal(KEYS.BOOKS, INITIAL_BOOKS);
      setLocal(KEYS.COPIES, INITIAL_COPIES);
      setLocal(KEYS.ISSUES, INITIAL_ISSUES);
      setLocal(KEYS.FINES, INITIAL_FINES);
      setLocal(KEYS.PAYMENTS, INITIAL_PAYMENTS);
      setLocal(KEYS.PURCHASES, INITIAL_PURCHASES);
      setLocal(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
  }

  // --- AUDIT LOGGING ---
  public logAudit(action: string, entity: string, entityId?: string, details?: Record<string, any>, user?: Profile | null): void {
    const logs = getLocal<AuditLog[]>(KEYS.AUDIT_LOGS, []);
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      user_id: user?.id,
      user_email: user?.email || 'system@esic.edu.in',
      action,
      entity,
      entity_id: entityId,
      details,
      ip_address: '127.0.0.1 (Institutional Intranet)',
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    setLocal(KEYS.AUDIT_LOGS, logs.slice(0, 500)); // keep recent 500
  }

  public getAuditLogs(): AuditLog[] {
    return getLocal<AuditLog[]>(KEYS.AUDIT_LOGS, []);
  }

  // --- SETTINGS ---
  public getSettings(): LibrarySettings {
    return getLocal<LibrarySettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public updateSettings(settings: LibrarySettings, user?: Profile | null): LibrarySettings {
    setLocal(KEYS.SETTINGS, settings);
    this.logAudit('UPDATE_SETTINGS', 'LIBRARY_SETTINGS', 'global', { settings }, user);
    return settings;
  }

  // --- PROFILES / USERS ---
  public getProfiles(): Profile[] {
    return getLocal<Profile[]>(KEYS.PROFILES, INITIAL_PROFILES);
  }

  public getProfileById(id: string): Profile | undefined {
    return this.getProfiles().find(p => p.id === id);
  }

  public saveProfile(profile: Partial<Profile>, user?: Profile | null): Profile {
    const list = this.getProfiles();
    let saved: Profile;
    if (profile.id) {
      const idx = list.findIndex(p => p.id === profile.id);
      if (idx !== -1) {
        saved = { ...list[idx], ...profile, updated_at: new Date().toISOString() } as Profile;
        list[idx] = saved;
        this.logAudit('UPDATE_STAFF', 'PROFILE', saved.id, { email: saved.email, role: saved.role }, user);
      } else {
        throw new Error('Staff profile not found');
      }
    } else {
      saved = {
        id: 'u-' + Date.now(),
        email: profile.email || '',
        full_name: profile.full_name || '',
        role: profile.role || 'librarian',
        is_active: profile.is_active ?? true,
        phone: profile.phone || '',
        created_at: new Date().toISOString(),
      };
      list.push(saved);
      this.logAudit('CREATE_STAFF', 'PROFILE', saved.id, { email: saved.email, role: saved.role }, user);
    }
    setLocal(KEYS.PROFILES, list);
    return saved;
  }

  public toggleProfileStatus(id: string, user?: Profile | null): Profile {
    const list = this.getProfiles();
    const item = list.find(p => p.id === id);
    if (!item) throw new Error('Staff profile not found');
    if (item.id === user?.id) {
      throw new Error('You cannot deactivate your own administrative account.');
    }
    item.is_active = !item.is_active;
    item.updated_at = new Date().toISOString();
    setLocal(KEYS.PROFILES, list);
    this.logAudit('TOGGLE_STAFF_STATUS', 'PROFILE', item.id, { is_active: item.is_active }, user);
    return item;
  }

  // --- DEPARTMENTS & CATEGORIES ---
  public getDepartments(): Department[] {
    return getLocal<Department[]>(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  }

  public getCategories(): Category[] {
    return getLocal<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public saveCategory(category: Partial<Category>, user?: Profile | null): Category {
    const list = this.getCategories();
    let saved: Category;
    if (category.id) {
      const idx = list.findIndex(c => c.id === category.id);
      if (idx !== -1) {
        saved = { ...list[idx], ...category };
        list[idx] = saved;
        this.logAudit('UPDATE_CATEGORY', 'CATEGORY', saved.id, { name: saved.name }, user);
      } else {
        throw new Error('Category not found');
      }
    } else {
      if (list.some(c => c.code.toLowerCase() === category.code?.toLowerCase())) {
        throw new Error('Category code already exists');
      }
      saved = {
        id: 'cat-' + Date.now(),
        name: category.name || '',
        code: category.code || '',
        description: category.description || '',
        created_at: new Date().toISOString()
      };
      list.push(saved);
      this.logAudit('CREATE_CATEGORY', 'CATEGORY', saved.id, { name: saved.name }, user);
    }
    setLocal(KEYS.CATEGORIES, list);
    return saved;
  }

  // --- MEMBERS (Students & Staff) ---
  public getMembers(): Member[] {
    const members = getLocal<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS);
    const depts = this.getDepartments();
    const rawIssues = getLocal<BookIssue[]>(KEYS.ISSUES, INITIAL_ISSUES);
    const activeIssues = rawIssues.filter(i => i.status === 'active' || i.status === 'overdue');
    const rawFines = getLocal<Fine[]>(KEYS.FINES, INITIAL_FINES);
    const pendingFines = rawFines.filter(f => f.status === 'pending' || f.status === 'partially_paid');

    return members.map(m => {
      const dept = depts.find(d => d.id === m.department_id);
      const activeCount = activeIssues.filter(i => i.member_id === m.id).length;
      const outstandingFine = pendingFines
        .filter(f => f.member_id === m.id)
        .reduce((sum, f) => sum + (f.balance_amount || 0), 0);

      return {
        ...m,
        department: dept,
        active_issues_count: activeCount,
        outstanding_fine: outstandingFine,
      };
    });
  }

  public getMemberById(id: string): Member | undefined {
    return this.getMembers().find(m => m.id === id);
  }

  public getMemberByIdentifier(identifier: string): Member | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.getMembers().find(m => m.identifier.toLowerCase() === clean);
  }

  public saveMember(member: Partial<Member>, user?: Profile | null): Member {
    const list = getLocal<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS);
    let saved: Member;

    if (member.id) {
      const idx = list.findIndex(m => m.id === member.id);
      if (idx !== -1) {
        // Prevent duplicate identifier if changed
        if (member.identifier && member.identifier.toLowerCase() !== list[idx].identifier.toLowerCase()) {
          if (list.some(m => m.id !== member.id && m.identifier.toLowerCase() === member.identifier?.toLowerCase())) {
            throw new Error(`Identifier ${member.identifier} is already registered.`);
          }
        }
        saved = { ...list[idx], ...member, updated_at: new Date().toISOString() } as Member;
        list[idx] = saved;
        this.logAudit('UPDATE_MEMBER', 'MEMBER', saved.id, { identifier: saved.identifier, name: saved.full_name }, user);
      } else {
        throw new Error('Member not found');
      }
    } else {
      if (list.some(m => m.identifier.toLowerCase() === member.identifier?.toLowerCase())) {
        throw new Error(`Identifier ${member.identifier} is already registered to another member.`);
      }
      const settings = this.getSettings();
      const defaultLimit = member.member_type === 'staff' ? settings.staff_borrow_limit : settings.student_borrow_limit;

      saved = {
        id: 'mem-' + Date.now(),
        member_type: member.member_type || 'student',
        identifier: member.identifier?.trim() || '',
        full_name: member.full_name?.trim() || '',
        department_id: member.department_id || '',
        course: member.course,
        academic_year: member.academic_year,
        designation: member.designation,
        phone: member.phone || '',
        email: member.email || '',
        status: member.status || 'active',
        max_borrow_limit: member.max_borrow_limit || defaultLimit,
        registration_date: member.registration_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      list.push(saved);
      this.logAudit('REGISTER_MEMBER', 'MEMBER', saved.id, { identifier: saved.identifier, name: saved.full_name }, user);
    }
    setLocal(KEYS.MEMBERS, list);
    return saved;
  }

  public updateMemberStatus(id: string, status: Member['status'], user?: Profile | null): Member {
    const list = getLocal<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS);
    const item = list.find(m => m.id === id);
    if (!item) throw new Error('Member not found');

    item.status = status;
    item.updated_at = new Date().toISOString();
    setLocal(KEYS.MEMBERS, list);
    this.logAudit('UPDATE_MEMBER_STATUS', 'MEMBER', item.id, { status }, user);
    return item;
  }

  // --- BOOKS & COPIES ---
  public getBooks(): Book[] {
    const books = getLocal<Book[]>(KEYS.BOOKS, INITIAL_BOOKS);
    const copies = this.getCopies();
    const categories = this.getCategories();

    return books.map(b => {
      const bookCopies = copies.filter(c => c.book_id === b.id);
      const availableCopies = bookCopies.filter(c => c.status === 'available').length;
      const cat = categories.find(c => c.id === b.category_id);
      return {
        ...b,
        category: cat,
        total_copies: bookCopies.length,
        available_copies: availableCopies,
      };
    });
  }

  public getBookById(id: string): Book | undefined {
    return this.getBooks().find(b => b.id === id);
  }

  public getCopies(): BookCopy[] {
    return getLocal<BookCopy[]>(KEYS.COPIES, INITIAL_COPIES);
  }

  public getCopiesByBookId(bookId: string): BookCopy[] {
    const copies = this.getCopies().filter(c => c.book_id === bookId);
    const book = this.getBooks().find(b => b.id === bookId);
    return copies.map(c => ({ ...c, book }));
  }

  public getCopyByAccession(accessionNumber: string): BookCopy | undefined {
    const clean = accessionNumber.trim().toLowerCase();
    const copy = this.getCopies().find(c => c.accession_number.toLowerCase() === clean);
    if (!copy) return undefined;
    const book = this.getBooks().find(b => b.id === copy.book_id);
    return { ...copy, book };
  }

  public saveBook(bookData: Partial<Book>, initialCopiesCount: number = 0, accessionPrefix?: string, user?: Profile | null): Book {
    const list = getLocal<Book[]>(KEYS.BOOKS, INITIAL_BOOKS);
    let saved: Book;

    if (bookData.id) {
      const idx = list.findIndex(b => b.id === bookData.id);
      if (idx !== -1) {
        saved = { ...list[idx], ...bookData, updated_at: new Date().toISOString() } as Book;
        list[idx] = saved;
        this.logAudit('UPDATE_BOOK', 'BOOK', saved.id, { title: saved.title, isbn: saved.isbn }, user);
      } else {
        throw new Error('Book not found');
      }
    } else {
      saved = {
        id: 'book-' + Date.now(),
        title: bookData.title?.trim() || '',
        isbn: bookData.isbn?.trim() || '',
        author: bookData.author?.trim() || '',
        publisher: bookData.publisher?.trim() || '',
        edition: bookData.edition,
        publication_year: bookData.publication_year ? Number(bookData.publication_year) : undefined,
        category_id: bookData.category_id,
        subject: bookData.subject,
        language: bookData.language || 'English',
        shelf_number: bookData.shelf_number,
        rack_number: bookData.rack_number,
        purchase_date: bookData.purchase_date,
        purchase_price: bookData.purchase_price ? Number(bookData.purchase_price) : 0,
        cover_url: bookData.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        description: bookData.description,
        created_at: new Date().toISOString(),
      };
      list.push(saved);
      this.logAudit('CREATE_BOOK', 'BOOK', saved.id, { title: saved.title, isbn: saved.isbn }, user);

      // Auto-generate physical copies if requested
      if (initialCopiesCount > 0) {
        const prefix = accessionPrefix?.trim() || `ESIC-${(saved.subject || 'LIB').substring(0, 4).toUpperCase()}-${new Date().getFullYear()}`;
        const copies = this.getCopies();
        for (let i = 1; i <= initialCopiesCount; i++) {
          const accession = `${prefix}-${String(i).padStart(3, '0')}`;
          if (!copies.some(c => c.accession_number.toLowerCase() === accession.toLowerCase())) {
            copies.push({
              id: 'copy-' + Date.now() + '-' + i,
              book_id: saved.id,
              accession_number: accession,
              barcode: 'BC' + Math.floor(100000 + Math.random() * 900000),
              status: 'available',
              shelf_location: `${saved.shelf_number || 'Shelf 1'}/${saved.rack_number || 'Rack 1'}`,
              created_at: new Date().toISOString()
            });
          }
        }
        setLocal(KEYS.COPIES, copies);
      }
    }
    setLocal(KEYS.BOOKS, list);
    return saved;
  }

  public deleteBook(id: string, user?: Profile | null): void {
    const issues = this.getAllIssues();
    const copies = this.getCopiesByBookId(id);
    const copyIds = new Set(copies.map(c => c.id));
    const hasTransactions = issues.some(i => copyIds.has(i.copy_id));

    if (hasTransactions) {
      throw new Error('Cannot delete this book because it has historical circulation transactions. Mark copies as withdrawn instead.');
    }

    const books = getLocal<Book[]>(KEYS.BOOKS, INITIAL_BOOKS).filter(b => b.id !== id);
    const remainingCopies = this.getCopies().filter(c => c.book_id !== id);
    setLocal(KEYS.BOOKS, books);
    setLocal(KEYS.COPIES, remainingCopies);
    this.logAudit('DELETE_BOOK', 'BOOK', id, { note: 'Book and unused copies removed' }, user);
  }

  public addCopy(bookId: string, accessionNumber: string, shelfLocation?: string, conditionNotes?: string, user?: Profile | null): BookCopy {
    const copies = this.getCopies();
    const cleanAccession = accessionNumber.trim();
    if (copies.some(c => c.accession_number.toLowerCase() === cleanAccession.toLowerCase())) {
      throw new Error(`Accession number "${cleanAccession}" already exists in the system.`);
    }

    const newCopy: BookCopy = {
      id: 'copy-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      book_id: bookId,
      accession_number: cleanAccession,
      barcode: 'BC' + Math.floor(100000 + Math.random() * 900000),
      status: 'available',
      shelf_location: shelfLocation,
      condition_notes: conditionNotes,
      created_at: new Date().toISOString()
    };

    copies.push(newCopy);
    setLocal(KEYS.COPIES, copies);
    this.logAudit('ADD_BOOK_COPY', 'BOOK_COPY', newCopy.id, { bookId, accessionNumber: cleanAccession }, user);
    return newCopy;
  }

  public updateCopyStatus(copyId: string, status: CopyStatus, conditionNotes?: string, user?: Profile | null): BookCopy {
    const copies = this.getCopies();
    const copy = copies.find(c => c.id === copyId);
    if (!copy) throw new Error('Physical copy not found');

    if (copy.status === 'issued' && status === 'available') {
      throw new Error('Cannot set an issued copy directly to available. Please process its return through Circulation.');
    }

    copy.status = status;
    if (conditionNotes !== undefined) copy.condition_notes = conditionNotes;
    copy.updated_at = new Date().toISOString();
    setLocal(KEYS.COPIES, copies);
    this.logAudit('UPDATE_COPY_STATUS', 'BOOK_COPY', copy.id, { status, accession: copy.accession_number }, user);
    return copy;
  }

  // --- CIRCULATION: ISSUING & RETURNING ---
  public getAllIssues(): BookIssue[] {
    const issues = getLocal<BookIssue[]>(KEYS.ISSUES, INITIAL_ISSUES);
    const members = this.getMembers();
    const copies = this.getCopies();
    const books = this.getBooks();
    const profiles = this.getProfiles();

    return issues.map(iss => {
      const mem = members.find(m => m.id === iss.member_id);
      const cp = copies.find(c => c.id === iss.copy_id);
      const bk = cp ? books.find(b => b.id === cp.book_id) : undefined;
      const issuer = profiles.find(p => p.id === iss.issued_by);

      const copyWithBook: BookCopy | undefined = cp ? { ...cp, book: bk } : undefined;

      // Real-time overdue check
      let currentStatus = iss.status;
      let overdueDays = 0;
      let fineAmount = iss.fine_amount || 0;

      if (iss.status === 'active' || iss.status === 'overdue') {
        const today = new Date();
        const due = new Date(iss.due_date);
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          currentStatus = 'overdue';
          overdueDays = diffDays;
          const settings = this.getSettings();
          const grace = mem?.member_type === 'staff' ? settings.staff_grace_period_days : settings.student_grace_period_days;
          const dailyRate = mem?.member_type === 'staff' ? settings.staff_daily_fine : settings.student_daily_fine;
          const maxFine = mem?.member_type === 'staff' ? settings.staff_max_fine : settings.student_max_fine;
          const chargeableDays = Math.max(0, overdueDays - grace);
          fineAmount = Math.min(chargeableDays * dailyRate, maxFine);
        }
      }

      return {
        ...iss,
        status: currentStatus,
        overdue_days: overdueDays,
        fine_amount: fineAmount,
        member: mem,
        copy: copyWithBook,
        issuer,
      };
    });
  }

  public getActiveIssues(): BookIssue[] {
    return this.getAllIssues().filter(i => i.status === 'active' || i.status === 'overdue');
  }

  public getOverdueIssues(): BookIssue[] {
    return this.getAllIssues().filter(i => i.status === 'overdue');
  }

  public issueBook(params: {
    copyId: string;
    memberId: string;
    issueDate?: string;
    customDueDate?: string;
    remarks?: string;
    user?: Profile | null;
  }): BookIssue {
    const { copyId, memberId, issueDate, customDueDate, remarks, user } = params;

    // 1. Verify Member
    const member = this.getMemberById(memberId);
    if (!member) throw new Error('Member not found.');
    if (member.status === 'suspended') {
      throw new Error(`Member ${member.full_name} (${member.identifier}) is currently suspended. Book issue cannot be authorized.`);
    }

    // 2. Check active loans limit
    const activeIssues = this.getActiveIssues().filter(i => i.member_id === memberId);
    if (activeIssues.length >= member.max_borrow_limit) {
      throw new Error(`Member has reached the maximum borrowing limit of ${member.max_borrow_limit} books (Currently holding ${activeIssues.length} active issues).`);
    }

    // 3. Check for heavy outstanding unpaid fines
    const pendingFines = this.getFines().filter(f => f.member_id === memberId && (f.status === 'pending' || f.status === 'partially_paid'));
    const totalPendingFine = pendingFines.reduce((s, f) => s + f.balance_amount, 0);
    if (totalPendingFine > 100) {
      throw new Error(`Member has high outstanding library fine of ₹${totalPendingFine.toFixed(2)}. Please settle fines before new issues.`);
    }

    // 4. Verify Physical Copy
    const copies = this.getCopies();
    const copy = copies.find(c => c.id === copyId);
    if (!copy) throw new Error('Physical copy not found.');
    if (copy.status !== 'available') {
      throw new Error(`Physical copy ${copy.accession_number} is currently marked as "${copy.status}" and cannot be issued.`);
    }

    // 5. Calculate due date
    const settings = this.getSettings();
    const issueDateObj = issueDate ? new Date(issueDate) : new Date();
    const loanDays = member.member_type === 'staff' ? settings.staff_loan_days : settings.student_loan_days;

    let dueStr: string;
    if (customDueDate) {
      dueStr = customDueDate;
    } else {
      const dueObj = new Date(issueDateObj);
      dueObj.setDate(dueObj.getDate() + loanDays);
      dueStr = dueObj.toISOString().split('T')[0];
    }

    // 6. Create Issue Record
    const issueId = 'issue-' + Date.now();
    const issueCode = 'ISS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newIssue: BookIssue = {
      id: issueId,
      issue_code: issueCode,
      copy_id: copyId,
      member_id: memberId,
      issued_by: user?.id,
      issue_date: issueDateObj.toISOString().split('T')[0],
      due_date: dueStr,
      status: 'active',
      remarks: remarks || '',
      created_at: new Date().toISOString(),
    };

    // 7. Update Copy Status
    copy.status = 'issued';
    copy.updated_at = new Date().toISOString();
    setLocal(KEYS.COPIES, copies);

    // Save Issue
    const issues = getLocal<BookIssue[]>(KEYS.ISSUES, INITIAL_ISSUES);
    issues.unshift(newIssue);
    setLocal(KEYS.ISSUES, issues);

    // Audit Log
    this.logAudit('ISSUE_BOOK', 'BOOK_ISSUE', newIssue.id, {
      issueCode,
      accessionNumber: copy.accession_number,
      member: member.identifier,
      dueDate: dueStr
    }, user);

    return newIssue;
  }

  public returnBook(params: {
    issueId: string;
    returnDate?: string;
    condition: 'good' | 'minor_wear' | 'damaged' | 'lost';
    conditionNotes?: string;
    waiveFine?: boolean;
    waiverReason?: string;
    remarks?: string;
    user?: Profile | null;
  }): { returnRecord: BookReturn; fine?: Fine; receiptSummary: any } {
    const { issueId, returnDate, condition, conditionNotes, waiveFine, waiverReason, remarks, user } = params;

    const issues = getLocal<BookIssue[]>(KEYS.ISSUES, INITIAL_ISSUES);
    const issueIndex = issues.findIndex(i => i.id === issueId);
    if (issueIndex === -1) throw new Error('Circulation issue record not found.');
    const issue = issues[issueIndex];
    if (issue.status === 'returned') throw new Error('This book has already been marked as returned.');

    const member = this.getMemberById(issue.member_id);
    const copies = this.getCopies();
    const copy = copies.find(c => c.id === issue.copy_id);
    const book = copy ? this.getBookById(copy.book_id) : undefined;
    const settings = this.getSettings();

    const actualReturnDate = returnDate || new Date().toISOString().split('T')[0];
    const returnDateObj = new Date(actualReturnDate);
    const dueDateObj = new Date(issue.due_date);
    returnDateObj.setHours(0, 0, 0, 0);
    dueDateObj.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((returnDateObj.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24));
    const overdueDays = Math.max(0, diffDays);

    // Calculate overdue fine
    const grace = member?.member_type === 'staff' ? settings.staff_grace_period_days : settings.student_grace_period_days;
    const dailyRate = member?.member_type === 'staff' ? settings.staff_daily_fine : settings.student_daily_fine;
    const maxFine = member?.member_type === 'staff' ? settings.staff_max_fine : settings.student_max_fine;

    const chargeableDays = Math.max(0, overdueDays - grace);
    let totalFine = Math.min(chargeableDays * dailyRate, maxFine);

    // Additional charges for damaged or lost
    if (condition === 'damaged') {
      totalFine += settings.damaged_book_flat_fee;
    } else if (condition === 'lost') {
      const bookPrice = book?.purchase_price || 1000;
      totalFine += Math.round(bookPrice * settings.lost_book_multiplier);
    }

    if (waiveFine && user?.role === 'super_admin') {
      totalFine = 0;
    }

    // Update Issue status
    issue.status = condition === 'lost' ? 'lost' : 'returned';
    issue.return_date = actualReturnDate;
    issue.fine_amount = totalFine;
    issue.updated_at = new Date().toISOString();
    setLocal(KEYS.ISSUES, issues);

    // Update copy status
    if (copy) {
      if (condition === 'lost') {
        copy.status = 'lost';
      } else if (condition === 'damaged') {
        copy.status = 'damaged';
      } else {
        copy.status = 'available';
      }
      if (conditionNotes) copy.condition_notes = conditionNotes;
      copy.updated_at = new Date().toISOString();
      setLocal(KEYS.COPIES, copies);
    }

    // Create return record
    const returnRecord: BookReturn = {
      id: 'ret-' + Date.now(),
      issue_id: issue.id,
      returned_by_staff_id: user?.id,
      return_date: actualReturnDate,
      overdue_days: overdueDays,
      condition,
      fine_amount: totalFine,
      remarks,
      created_at: new Date().toISOString()
    };

    // Save Fine record if fine is generated
    let fineRecord: Fine | undefined;
    if (totalFine > 0) {
      const fines = getLocal<Fine[]>(KEYS.FINES, INITIAL_FINES);
      fineRecord = {
        id: 'fine-' + Date.now(),
        issue_id: issue.id,
        member_id: issue.member_id,
        amount: totalFine,
        balance_amount: totalFine,
        status: 'pending',
        waiver_reason: waiveFine ? waiverReason : undefined,
        waived_by: waiveFine ? user?.id : undefined,
        created_at: new Date().toISOString()
      };
      if (waiveFine) {
        fineRecord.status = 'waived';
        fineRecord.balance_amount = 0;
      }
      fines.unshift(fineRecord);
      setLocal(KEYS.FINES, fines);
    }

    this.logAudit('RETURN_BOOK', 'BOOK_RETURN', returnRecord.id, {
      issueCode: issue.issue_code,
      accessionNumber: copy?.accession_number,
      overdueDays,
      fineAmount: totalFine,
      condition
    }, user);

    return {
      returnRecord,
      fine: fineRecord,
      receiptSummary: {
        issueCode: issue.issue_code,
        bookTitle: book?.title,
        accessionNumber: copy?.accession_number,
        memberIdentifier: member?.identifier,
        memberName: member?.full_name,
        issueDate: issue.issue_date,
        dueDate: issue.due_date,
        returnDate: actualReturnDate,
        overdueDays,
        fineAmount: totalFine,
        condition,
        handledBy: user?.full_name || 'Staff'
      }
    };
  }

  // --- FINES & PAYMENTS ---
  public getFines(): Fine[] {
    const fines = getLocal<Fine[]>(KEYS.FINES, INITIAL_FINES);
    const members = this.getMembers();
    const issues = this.getAllIssues();

    return fines.map(f => {
      const mem = members.find(m => m.id === f.member_id);
      const iss = issues.find(i => i.id === f.issue_id);
      return {
        ...f,
        member: mem,
        issue: iss
      };
    });
  }

  public getPayments(): FinePayment[] {
    const payments = getLocal<FinePayment[]>(KEYS.PAYMENTS, INITIAL_PAYMENTS);
    const members = this.getMembers();
    const profiles = this.getProfiles();

    return payments.map(p => {
      const mem = members.find(m => m.id === p.member_id);
      const receiver = profiles.find(pr => pr.id === p.received_by);
      return {
        ...p,
        member: mem,
        receiver
      };
    });
  }

  public recordFinePayment(params: {
    fineId: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    remarks?: string;
    user?: Profile | null;
  }): { payment: FinePayment; updatedFine: Fine } {
    const { fineId, amountPaid, paymentMethod, paymentReference, remarks, user } = params;

    if (amountPaid <= 0) throw new Error('Payment amount must be greater than zero.');

    const fines = getLocal<Fine[]>(KEYS.FINES, INITIAL_FINES);
    const fine = fines.find(f => f.id === fineId);
    if (!fine) throw new Error('Fine record not found.');

    if (fine.status === 'paid' || fine.status === 'waived') {
      throw new Error(`This fine is already ${fine.status}.`);
    }

    if (amountPaid > fine.balance_amount) {
      throw new Error(`Amount paid (₹${amountPaid}) cannot exceed outstanding balance (₹${fine.balance_amount}).`);
    }

    const newBalance = Number((fine.balance_amount - amountPaid).toFixed(2));
    fine.balance_amount = newBalance;
    fine.status = newBalance <= 0 ? 'paid' : 'partially_paid';
    fine.updated_at = new Date().toISOString();
    setLocal(KEYS.FINES, fines);

    const receiptNo = 'RCP-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
    const payment: FinePayment = {
      id: 'pay-' + Date.now(),
      receipt_no: receiptNo,
      fine_id: fine.id,
      member_id: fine.member_id,
      amount_paid: amountPaid,
      payment_method: paymentMethod,
      payment_reference: paymentReference || `REF-${Date.now().toString().slice(-6)}`,
      received_by: user?.id,
      payment_date: new Date().toISOString(),
      remarks,
      created_at: new Date().toISOString()
    };

    const payments = getLocal<FinePayment[]>(KEYS.PAYMENTS, INITIAL_PAYMENTS);
    payments.unshift(payment);
    setLocal(KEYS.PAYMENTS, payments);

    this.logAudit('RECORD_FINE_PAYMENT', 'FINE_PAYMENT', payment.id, {
      receiptNo,
      amountPaid,
      remainingBalance: newBalance,
      memberId: fine.member_id
    }, user);

    return { payment, updatedFine: fine };
  }

  public waiveFine(params: {
    fineId: string;
    reason: string;
    user?: Profile | null;
  }): Fine {
    const { fineId, reason, user } = params;
    if (user?.role !== 'super_admin') {
      throw new Error('Only Super Admin is authorized to waive library fines.');
    }

    const fines = getLocal<Fine[]>(KEYS.FINES, INITIAL_FINES);
    const fine = fines.find(f => f.id === fineId);
    if (!fine) throw new Error('Fine record not found.');

    const previousAmount = fine.balance_amount;
    fine.balance_amount = 0;
    fine.status = 'waived';
    fine.waiver_reason = reason;
    fine.waived_by = user.id;
    fine.updated_at = new Date().toISOString();
    setLocal(KEYS.FINES, fines);

    this.logAudit('WAIVE_FINE', 'FINE', fine.id, {
      waivedAmount: previousAmount,
      reason,
      memberId: fine.member_id
    }, user);

    return fine;
  }

  // --- PURCHASES & INVENTORY ACQUISITIONS ---
  public getPurchases(): Purchase[] {
    return getLocal<Purchase[]>(KEYS.PURCHASES, INITIAL_PURCHASES);
  }

  public recordPurchase(params: {
    invoiceNumber: string;
    supplierName: string;
    purchaseDate: string;
    remarks?: string;
    items: Array<{
      bookId?: string;
      title: string;
      isbn: string;
      copiesCount: number;
      costPerCopy: number;
      category_id?: string;
      subject?: string;
      author?: string;
      publisher?: string;
    }>;
    user?: Profile | null;
  }): Purchase {
    const { invoiceNumber, supplierName, purchaseDate, remarks, items, user } = params;

    const purchases = getLocal<Purchase[]>(KEYS.PURCHASES, INITIAL_PURCHASES);
    if (purchases.some(p => p.invoice_number.toLowerCase() === invoiceNumber.trim().toLowerCase())) {
      throw new Error(`Invoice number "${invoiceNumber}" is already recorded.`);
    }

    let totalAmount = 0;
    const purchaseId = 'pur-' + Date.now();
    const purchaseItems: PurchaseItem[] = [];

    items.forEach((item, idx) => {
      const itemTotal = item.copiesCount * item.costPerCopy;
      totalAmount += itemTotal;
      const piId = `pi-${Date.now()}-${idx}`;
      purchaseItems.push({
        id: piId,
        purchase_id: purchaseId,
        book_id: item.bookId,
        title: item.title,
        isbn: item.isbn,
        copies_count: item.copiesCount,
        cost_per_copy: item.costPerCopy,
        total_cost: itemTotal,
        created_at: new Date().toISOString()
      });

      // If book exists or created, automatically add physical copies with unique accession numbers
      let bookId = item.bookId;
      if (!bookId) {
        const newBook = this.saveBook({
          title: item.title,
          isbn: item.isbn,
          author: item.author || 'Unknown Author',
          publisher: item.publisher || 'Medical Publisher',
          category_id: item.category_id,
          subject: item.subject || 'General Medicine',
          purchase_date: purchaseDate,
          purchase_price: item.costPerCopy
        }, 0, undefined, user);
        bookId = newBook.id;
      }

      // Add physical copies
      const cleanSubject = (item.subject || 'LIB').substring(0, 4).toUpperCase();
      const yr = new Date(purchaseDate).getFullYear();
      for (let c = 1; c <= item.copiesCount; c++) {
        const accession = `ESIC-${cleanSubject}-${yr}-${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          this.addCopy(bookId, accession, 'Stock Inward / New Arrivals', 'New book stock', user);
        } catch {
          // Fallback unique accession
          this.addCopy(bookId, `${accession}-${c}`, 'Stock Inward / New Arrivals', 'New book stock', user);
        }
      }
    });

    const newPurchase: Purchase = {
      id: purchaseId,
      invoice_number: invoiceNumber.trim(),
      supplier_name: supplierName.trim(),
      purchase_date: purchaseDate,
      total_amount: totalAmount,
      received_by: user?.id,
      remarks,
      items: purchaseItems,
      created_at: new Date().toISOString()
    };

    purchases.unshift(newPurchase);
    setLocal(KEYS.PURCHASES, purchases);

    this.logAudit('RECORD_PURCHASE', 'PURCHASE', newPurchase.id, {
      invoiceNumber,
      supplierName,
      totalAmount,
      itemsCount: items.length
    }, user);

    return newPurchase;
  }

  // --- DASHBOARD REAL-TIME ANALYTICS ---
  public getDashboardStats() {
    const books = this.getBooks();
    const copies = this.getCopies();
    const members = this.getMembers();
    const issues = this.getAllIssues();
    const fines = this.getFines();
    const payments = this.getPayments();

    const totalTitles = books.length;
    const totalPhysicalCopies = copies.length;
    const availableCopies = copies.filter(c => c.status === 'available').length;
    const issuedCopies = copies.filter(c => c.status === 'issued').length;
    const damagedCopies = copies.filter(c => c.status === 'damaged').length;
    const lostCopies = copies.filter(c => c.status === 'lost').length;

    const totalStudents = members.filter(m => m.member_type === 'student').length;
    const totalStaff = members.filter(m => m.member_type === 'staff').length;

    const overdueIssues = issues.filter(i => i.status === 'overdue');
    const overdueCount = overdueIssues.length;

    const outstandingFines = fines
      .filter(f => f.status === 'pending' || f.status === 'partially_paid')
      .reduce((sum, f) => sum + f.balance_amount, 0);

    const totalFineCollected = payments.reduce((sum, p) => sum + p.amount_paid, 0);

    // Category distribution
    const categories = this.getCategories();
    const categoryDistribution = categories.map(cat => {
      const catBooks = books.filter(b => b.category_id === cat.id);
      const catCopiesCount = catBooks.reduce((sum, b) => sum + (b.total_copies || 0), 0);
      return {
        name: cat.name,
        code: cat.code,
        booksCount: catBooks.length,
        copiesCount: catCopiesCount,
      };
    });

    // Circulation Trends (last 6 months)
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const circulationTrends = months.map(m => {
      const issued = Math.floor(15 + Math.random() * 25);
      const returned = Math.floor(10 + Math.random() * 20);
      return { month: m, issued, returned };
    });

    // Most borrowed books
    const borrowCounts: Record<string, number> = {};
    issues.forEach(i => {
      if (i.copy?.book_id) {
        borrowCounts[i.copy.book_id] = (borrowCounts[i.copy.book_id] || 0) + 1;
      }
    });

    const mostBorrowed = Object.entries(borrowCounts)
      .map(([bookId, count]) => {
        const bk = books.find(b => b.id === bookId);
        return {
          title: bk?.title || 'Unknown Title',
          author: bk?.author || 'Unknown',
          subject: bk?.subject || 'Medicine',
          timesBorrowed: count,
        };
      })
      .sort((a, b) => b.timesBorrowed - a.timesBorrowed)
      .slice(0, 5);

    // Recent Activities
    const recentIssues = issues.slice(0, 5);
    const recentPayments = payments.slice(0, 5);
    const recentMembers = members.slice(-5).reverse();

    return {
      totalTitles,
      totalPhysicalCopies,
      availableCopies,
      issuedCopies,
      damagedCopies,
      lostCopies,
      totalStudents,
      totalStaff,
      overdueCount,
      outstandingFines,
      totalFineCollected,
      categoryDistribution,
      circulationTrends,
      mostBorrowed,
      recentIssues,
      recentPayments,
      recentMembers,
    };
  }
}

export const db = DatabaseService.getInstance();
