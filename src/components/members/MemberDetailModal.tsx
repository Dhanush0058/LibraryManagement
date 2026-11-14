import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Member } from '../../types';
import { db } from '../../services/db';
import { BookOpen, IndianRupee, Clock, Mail, Phone, Building } from 'lucide-react';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onIssueBookClick?: (member: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  member,
  onIssueBookClick,
}) => {
  const issues = db.getAllIssues().filter(i => i.member_id === member.id);
  const activeIssues = issues.filter(i => i.status === 'active' || i.status === 'overdue');
  const pastIssues = issues.filter(i => i.status === 'returned' || i.status === 'lost');
  const fines = db.getFines().filter(f => f.member_id === member.id);
  const outstandingFine = fines
    .filter(f => f.status === 'pending' || f.status === 'partially_paid')
    .reduce((s, f) => s + f.balance_amount, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${member.full_name} — Member Card`}
      subtitle={`ID: ${member.identifier} • ${member.member_type.toUpperCase()}`}
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Profile Card Header */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Institutional Details</span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{member.full_name}</h4>
            <p className="font-mono text-slate-600">{member.identifier}</p>
            <div className="flex items-center gap-1.5 text-slate-600 mt-2">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{member.department?.name || 'Department'}</span>
            </div>
            {member.member_type === 'student' ? (
              <p className="text-slate-500 mt-0.5">
                {member.course} • {member.academic_year}
              </p>
            ) : (
              <p className="text-slate-500 mt-0.5">{member.designation}</p>
            )}
          </div>

          <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
            <span className="text-[10px] uppercase font-bold text-slate-400">Contact & Loan Eligibility</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{member.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Quota Used:</span>
                <span className="font-bold text-slate-800">
                  {activeIssues.length} / {member.max_borrow_limit} Books
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Fine Dues:</span>
                <span className={`font-bold ${outstandingFine > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹{outstandingFine.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Currently Issued Books */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-teal-700" /> Currently Issued Books ({activeIssues.length})
          </h4>
          {activeIssues.length === 0 ? (
            <p className="text-slate-400 bg-white p-3 rounded-lg border border-slate-100 text-center italic">
              No books currently on loan.
            </p>
          ) : (
            <div className="space-y-2">
              {activeIssues.map(iss => (
                <div key={iss.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 text-xs">
                      {iss.copy?.book?.title || 'Book Title'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-slate-500">
                      <span className="font-mono text-[11px] text-teal-800">
                        Acc: {iss.copy?.accession_number}
                      </span>
                      <span>•</span>
                      <span>Borrowed: {iss.issue_date}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">Due: {iss.due_date}</span>
                    </div>
                  </div>
                  <Badge variant={iss.status === 'overdue' ? 'danger' : 'info'}>
                    {iss.status === 'overdue' ? `Overdue (+${iss.overdue_days}d)` : 'Active Loan'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historical Circulation */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Past Returned Books ({pastIssues.length})
          </h4>
          {pastIssues.length === 0 ? (
            <p className="text-slate-400 bg-white p-3 rounded-lg border border-slate-100 text-center italic">
              No historical return transactions recorded yet.
            </p>
          ) : (
            <div className="max-h-36 overflow-y-auto space-y-1.5">
              {pastIssues.map(iss => (
                <div key={iss.id} className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="truncate max-w-[260px] text-slate-700 font-medium">
                    {iss.copy?.book?.title}
                  </span>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>Returned: {iss.return_date}</span>
                    <Badge variant="success">Returned</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {member.status === 'active' && activeIssues.length < member.max_borrow_limit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                if (onIssueBookClick) onIssueBookClick(member);
              }}
            >
              Issue Book to Member
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
