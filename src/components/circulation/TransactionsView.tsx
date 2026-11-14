import React, { useState } from 'react';
import { History, Search, Filter, Download, FileText } from 'lucide-react';
import { db } from '../../services/db';
import { BookIssue } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { exportToCsv, generateCirculationPdf } from '../../services/reports';
import { useToast } from '../../context/ToastContext';

export const TransactionsView: React.FC = () => {
  const { success } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned' | 'overdue' | 'lost'>('all');

  const issues = db.getAllIssues();

  const filteredIssues = issues.filter(i => {
    const matchesSearch =
      i.issue_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.copy?.accession_number && i.copy.accession_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.copy?.book?.title && i.copy.book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.member?.identifier && i.member.identifier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.member?.full_name && i.member.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = () => {
    const exportData = filteredIssues.map(i => ({
      IssueCode: i.issue_code,
      AccessionNumber: i.copy?.accession_number || '',
      BookTitle: i.copy?.book?.title || '',
      MemberID: i.member?.identifier || '',
      MemberName: i.member?.full_name || '',
      Department: i.member?.department?.name || '',
      IssueDate: i.issue_date,
      DueDate: i.due_date,
      ReturnDate: i.return_date || '',
      Status: i.status.toUpperCase(),
      OverdueDays: i.overdue_days || 0,
      FineAmount: i.fine_amount || 0,
      Remarks: i.remarks || ''
    }));
    exportToCsv('ESIC_Library_Transactions_Register', exportData);
    success('Export Complete', 'Circulation register CSV generated successfully.');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="info">Active Loan</Badge>;
      case 'overdue':
        return <Badge variant="danger">Overdue</Badge>;
      case 'returned':
        return <Badge variant="success">Returned</Badge>;
      case 'lost':
        return <Badge variant="danger">Marked Lost</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-coral-600" />
            Central Circulation Log & Transaction Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of all book issues, loan dates, return confirmations, and overdues
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCsv} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateCirculationPdf(filteredIssues)}
            className="text-xs"
          >
            <FileText className="w-3.5 h-3.5 mr-1 text-coral-600" /> Official PDF Register
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Issue Code, Accession No, Member ID, Book Title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-coral-500"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-coral-500 bg-white"
          >
            <option value="all">All Circulation Statuses</option>
            <option value="active">Active Loans</option>
            <option value="overdue">Overdue Books</option>
            <option value="returned">Returned & Closed</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Transaction ID</th>
                <th className="px-3 py-3 text-left font-semibold">Accession & Title</th>
                <th className="px-3 py-3 text-left font-semibold">Borrower</th>
                <th className="px-3 py-3 text-left font-semibold">Dates</th>
                <th className="px-3 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Fine Assessed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No transactions match your search.
                  </td>
                </tr>
              ) : (
                filteredIssues.map(issue => (
                  <tr key={issue.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      <div>{issue.issue_code}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Issued: {issue.issue_date}
                      </span>
                    </td>

                    <td className="px-3 py-3 max-w-xs">
                      <div className="font-mono text-[11px] font-semibold text-coral-700">
                        {issue.copy?.accession_number || 'N/A'}
                      </div>
                      <div className="font-medium text-slate-900 truncate" title={issue.copy?.book?.title}>
                        {issue.copy?.book?.title}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-800">{issue.member?.full_name}</div>
                      <div className="font-mono text-[11px] text-slate-500">{issue.member?.identifier}</div>
                    </td>

                    <td className="px-3 py-3 text-slate-600">
                      <div>
                        Due: <span className="font-semibold text-slate-800">{issue.due_date}</span>
                      </div>
                      {issue.return_date ? (
                        <div className="text-[11px] text-emerald-700">Returned: {issue.return_date}</div>
                      ) : (
                        issue.overdue_days && issue.overdue_days > 0 ? (
                          <div className="text-[11px] text-rose-600 font-bold">+{issue.overdue_days}d overdue</div>
                        ) : null
                      )}
                    </td>

                    <td className="px-3 py-3 text-center">
                      {getStatusBadge(issue.status)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {issue.fine_amount && issue.fine_amount > 0 ? (
                        <span className="font-bold text-rose-600">₹{issue.fine_amount.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
