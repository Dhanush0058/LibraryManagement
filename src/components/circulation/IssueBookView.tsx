import React, { useState } from 'react';
import { 
  BookUp, Search, UserCheck, CheckCircle2, AlertTriangle, 
  Calendar, ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { db } from '../../services/db';
import { Member, BookCopy, Book } from '../../types';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface IssueBookViewProps {
  preselectedMember?: Member | null;
  onSuccessNavigate?: (tab: string) => void;
}

export const IssueBookView: React.FC<IssueBookViewProps> = ({
  preselectedMember,
  onSuccessNavigate,
}) => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const settings = db.getSettings();

  // Step 1: Member Search & Selection
  const [memberQuery, setMemberQuery] = useState(preselectedMember?.identifier || '');
  const [selectedMember, setSelectedMember] = useState<Member | null>(preselectedMember || null);

  // Step 2: Book / Copy Search & Selection
  const [copyQuery, setCopyQuery] = useState('');
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);

  // Step 3: Dates & Remarks
  const todayStr = new Date().toISOString().split('T')[0];
  const [issueDate, setIssueDate] = useState(todayStr);

  // Calculate default due date
  const computeDefaultDue = (mem: Member | null, issDate: string) => {
    const loanDays = mem?.member_type === 'staff' ? settings.staff_loan_days : settings.student_loan_days;
    const d = new Date(issDate);
    d.setDate(d.getDate() + loanDays);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState(() => computeDefaultDue(preselectedMember || null, todayStr));
  const [remarks, setRemarks] = useState('');
  const [lastIssuedReceipt, setLastIssuedReceipt] = useState<any | null>(null);

  // Search Member
  const handleSearchMember = () => {
    if (!memberQuery.trim()) return;
    const member = db.getMemberByIdentifier(memberQuery.trim());
    if (member) {
      setSelectedMember(member);
      setDueDate(computeDefaultDue(member, issueDate));
      if (member.status === 'suspended') {
        warning('Suspended Member', `${member.full_name} is suspended. Cannot issue books.`);
      }
    } else {
      error('Member Not Found', `No member matches identifier "${memberQuery}".`);
    }
  };

  // Search Copy by Accession Number
  const handleSearchCopy = () => {
    if (!copyQuery.trim()) return;
    const copy = db.getCopyByAccession(copyQuery.trim());
    if (copy) {
      if (copy.status !== 'available') {
        error('Copy Unavailable', `Physical copy ${copy.accession_number} is currently "${copy.status.toUpperCase()}".`);
        return;
      }
      setSelectedCopy(copy);
    } else {
      error('Copy Not Found', `No physical copy found for accession number "${copyQuery}".`);
    }
  };

  // Confirm Issue Transaction
  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      error('Validation Error', 'Please select and verify an authorized member.');
      return;
    }
    if (!selectedCopy) {
      error('Validation Error', 'Please select an available physical book copy.');
      return;
    }

    try {
      const issue = db.issueBook({
        copyId: selectedCopy.id,
        memberId: selectedMember.id,
        issueDate,
        customDueDate: dueDate,
        remarks,
        user,
      });

      success(
        'Book Loan Confirmed',
        `Accession ${selectedCopy.accession_number} issued to ${selectedMember.full_name}. Issue code: ${issue.issue_code}`
      );

      setLastIssuedReceipt({
        issueCode: issue.issue_code,
        member: selectedMember,
        copy: selectedCopy,
        book: selectedCopy.book,
        issueDate,
        dueDate,
        staffName: user?.full_name || 'Staff'
      });

      // Clear form
      setSelectedCopy(null);
      setCopyQuery('');
      setRemarks('');
      // Reload member to update quota
      const updatedMem = db.getMemberById(selectedMember.id);
      if (updatedMem) setSelectedMember(updatedMem);
    } catch (err: any) {
      error('Issue Authorization Failed', err.message);
    }
  };

  const isMemberEligible =
    selectedMember &&
    selectedMember.status === 'active' &&
    (selectedMember.active_issues_count || 0) < selectedMember.max_borrow_limit;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-parchment-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
            <BookUp className="w-5 h-5 text-coral-600" />
            Circulation Desk — Issue Book
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Strict accession barcode verification, eligibility checks, and loan logging
          </p>
        </div>
        <Badge variant="info">Workflow Policy Enforced</Badge>
      </div>

      {/* Success Receipt Banner if just issued */}
      {lastIssuedReceipt && (
        <div className="bg-coral-50 border border-coral-200 rounded-2xl p-5 shadow-xs animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-coral-600" />
              <h3 className="font-bold text-coral-800 text-sm">Issue Transaction Complete</h3>
            </div>
            <button
              onClick={() => setLastIssuedReceipt(null)}
              className="text-xs text-coral-600 hover:text-charcoal-950 font-medium"
            >
              Dismiss
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-charcoal-500 block">Issue Reference:</span>
              <span className="font-mono font-bold text-charcoal-900">{lastIssuedReceipt.issueCode}</span>
            </div>
            <div>
              <span className="text-charcoal-500 block">Book Title:</span>
              <span className="font-semibold text-charcoal-900 truncate block">{lastIssuedReceipt.book?.title}</span>
            </div>
            <div>
              <span className="text-charcoal-500 block">Accession Number:</span>
              <span className="font-mono font-semibold text-coral-700">{lastIssuedReceipt.copy?.accession_number}</span>
            </div>
            <div>
              <span className="text-charcoal-500 block">Return Due Date:</span>
              <span className="font-bold text-amber-700">{lastIssuedReceipt.dueDate}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Issue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Member Verification */}
        <div className="bg-white rounded-2xl border border-parchment-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-parchment-200 pb-3">
            <h3 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-coral-100 text-coral-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              Verify Borrower Membership
            </h3>
            {selectedMember && (
              <Badge variant={selectedMember.status === 'active' ? 'success' : 'danger'}>
                {selectedMember.status.toUpperCase()}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter Student Roll No or Employee ID..."
              value={memberQuery}
              onChange={e => setMemberQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchMember())}
            />
            <Button size="sm" variant="primary" onClick={handleSearchMember} className="flex-shrink-0">
              <Search className="w-3.5 h-3.5 mr-1" /> Search
            </Button>
          </div>

          {/* Member Card Details */}
          {selectedMember ? (
            <div className="p-4 rounded-xl bg-parchment-50 border border-parchment-200 space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-charcoal-900 text-sm">{selectedMember.full_name}</h4>
                  <p className="font-mono text-charcoal-600">{selectedMember.identifier}</p>
                </div>
                <Badge variant={selectedMember.member_type === 'student' ? 'purple' : 'info'}>
                  {selectedMember.member_type === 'student' ? 'Student' : 'Staff / Faculty'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-charcoal-600">
                <div>
                  <span className="text-charcoal-400 block">Department:</span>
                  <span className="font-semibold text-charcoal-800">{selectedMember.department?.name}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block">Role / Year:</span>
                  <span className="font-semibold text-charcoal-800">
                    {selectedMember.member_type === 'student'
                      ? `${selectedMember.course} (${selectedMember.academic_year})`
                      : selectedMember.designation}
                  </span>
                </div>
              </div>

              {/* Loan limit indicator */}
              <div className="pt-2 border-t border-parchment-200 flex items-center justify-between text-xs">
                <span>
                  Quota Used:{' '}
                  <strong className="text-charcoal-900">
                    {selectedMember.active_issues_count || 0} / {selectedMember.max_borrow_limit}
                  </strong>
                </span>
                {isMemberEligible ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Eligible to Borrow
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Quota Exhausted or Suspended
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-charcoal-400 text-xs border border-dashed border-parchment-300 rounded-xl bg-parchment-50/50">
              Search by Roll No (e.g. <code>ESIC/MBBS/2022/014</code>) or Employee ID (e.g. <code>EMP-MED-201</code>).
            </div>
          )}
        </div>

        {/* Step 2: Book Accession Copy Verification */}
        <div className="bg-white rounded-2xl border border-parchment-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-parchment-200 pb-3">
            <h3 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-coral-100 text-coral-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              Select Physical Copy (Accession)
            </h3>
            {selectedCopy && (
              <Badge variant="success">Copy Available</Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter unique Accession No (e.g. ESIC-PATH-2023-001)..."
              value={copyQuery}
              onChange={e => setCopyQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchCopy())}
            />
            <Button size="sm" variant="primary" onClick={handleSearchCopy} className="flex-shrink-0">
              <Search className="w-3.5 h-3.5 mr-1" /> Search
            </Button>
          </div>

          {/* Copy Details */}
          {selectedCopy ? (
            <div className="p-4 rounded-xl bg-parchment-50 border border-parchment-200 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-coral-700 uppercase font-bold tracking-wider">Accession Number</span>
                <h4 className="font-mono font-bold text-charcoal-900 text-sm">{selectedCopy.accession_number}</h4>
              </div>

              <div className="pt-1">
                <span className="text-[10px] text-charcoal-400 uppercase font-bold">Textbook Title</span>
                <p className="font-semibold text-charcoal-800 text-xs mt-0.5">{selectedCopy.book?.title}</p>
                <p className="text-[11px] text-charcoal-500">{selectedCopy.book?.author} • ISBN: {selectedCopy.book?.isbn}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-charcoal-600 pt-1 border-t border-parchment-200">
                <div>
                  <span className="text-charcoal-400 block">Shelf Location:</span>
                  <span className="font-mono text-charcoal-800">{selectedCopy.shelf_location || 'General Stack'}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block">Condition:</span>
                  <span className="text-charcoal-800">{selectedCopy.condition_notes || 'Good'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-charcoal-400 text-xs border border-dashed border-parchment-300 rounded-xl bg-parchment-50/50">
              Scan barcode or enter accession number (e.g. <code>ESIC-PATH-2023-001</code>).
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Dates & Confirmation */}
      <form onSubmit={handleConfirmIssue} className="bg-white rounded-2xl border border-parchment-200 shadow-2xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-charcoal-900 flex items-center gap-2 border-b border-parchment-200 pb-3">
          <span className="w-5 h-5 rounded-full bg-coral-100 text-coral-700 text-xs font-bold flex items-center justify-center">
            3
          </span>
          Issue Schedule & Confirmation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Issue Date"
            type="date"
            value={issueDate}
            onChange={e => {
              setIssueDate(e.target.value);
              setDueDate(computeDefaultDue(selectedMember, e.target.value));
            }}
            required
          />

          <Input
            label="Due Date for Return"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            helperText={
              selectedMember?.member_type === 'staff'
                ? `Faculty policy: ${settings.staff_loan_days} days loan`
                : `Student policy: ${settings.student_loan_days} days loan`
            }
            required
          />

          <div className="sm:col-span-2">
            <Input
              label="Transaction Remarks / Lab Posting (Optional)"
              placeholder="e.g. Issued for Clinical Anatomy postings / Internal Exam Prep"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-parchment-200">
          <div className="text-xs text-charcoal-500">
            Authorized by: <strong className="text-charcoal-800">{user?.full_name || 'Staff'}</strong>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!selectedMember || !selectedCopy || !isMemberEligible}
            className="text-sm font-bold shadow-md shadow-coral-500/25"
          >
            <BookUp className="w-4 h-4 mr-2" />
            Authorize & Issue Book Copy
          </Button>
        </div>
      </form>
    </div>
  );
};
