import React, { useState } from 'react';
import { 
  AlertCircle, Search, Filter, Download, FileText, 
  Send, Phone, Mail, Building 
} from 'lucide-react';
import { db } from '../../services/db';
import { BookIssue } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { exportToCsv, generateOverdueNoticePdf } from '../../services/reports';
import { useToast } from '../../context/ToastContext';

export const OverdueListView: React.FC = () => {
  const { success, info } = useToast();
  const departments = db.getDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState<'all' | 'lt7' | '7to14' | '14to30' | 'gt30'>('all');
  const [sortBy, setSortBy] = useState<'days_desc' | 'days_asc' | 'fine_desc'>('days_desc');

  const overdueIssues = db.getOverdueIssues();

  const filtered = overdueIssues.filter(iss => {
    const matchesSearch =
      iss.member?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.member?.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (iss.copy?.book?.title && iss.copy.book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (iss.copy?.accession_number && iss.copy.accession_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = deptFilter === 'all' || iss.member?.department_id === deptFilter;

    const days = iss.overdue_days || 0;
    let matchesDuration = true;
    if (durationFilter === 'lt7') matchesDuration = days < 7;
    else if (durationFilter === '7to14') matchesDuration = days >= 7 && days <= 14;
    else if (durationFilter === '14to30') matchesDuration = days > 14 && days <= 30;
    else if (durationFilter === 'gt30') matchesDuration = days > 30;

    return matchesSearch && matchesDept && matchesDuration;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const daysA = a.overdue_days || 0;
    const daysB = b.overdue_days || 0;
    const fineA = a.fine_amount || 0;
    const fineB = b.fine_amount || 0;

    if (sortBy === 'days_desc') return daysB - daysA;
    if (sortBy === 'days_asc') return daysA - daysB;
    if (sortBy === 'fine_desc') return fineB - fineA;
    return 0;
  });

  const totalOutstandingFine = sorted.reduce((s, i) => s + (i.fine_amount || 0), 0);

  const handleExportCsv = () => {
    const exportData = sorted.map(i => ({
      MemberID: i.member?.identifier || '',
      FullName: i.member?.full_name || '',
      Type: i.member?.member_type || '',
      Department: i.member?.department?.name || '',
      Phone: i.member?.phone || '',
      Email: i.member?.email || '',
      BookTitle: i.copy?.book?.title || '',
      AccessionNumber: i.copy?.accession_number || '',
      IssueDate: i.issue_date,
      DueDate: i.due_date,
      OverdueDays: i.overdue_days || 0,
      AssessedFine: i.fine_amount || 0,
    }));
    exportToCsv('ESIC_Overdue_Books_Report', exportData);
    success('Overdue Report Exported', 'CSV report downloaded.');
  };

  const handleSimulateNotice = (iss: BookIssue) => {
    info(
      'Notification Dispatch Ready',
      `Notice triggered for ${iss.member?.full_name} (${iss.member?.email}). Institutional SMS/Email gateway is simulated in demo mode.`
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Overdue Books & Retrieval Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active loans exceeding due dates • Automated institutional fine accrual
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCsv} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV Report
          </Button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <span className="text-xs font-semibold text-amber-900 uppercase">Total Overdue Loans</span>
          <p className="text-2xl font-bold text-amber-800 mt-1">{sorted.length} Books</p>
          <span className="text-[11px] text-amber-700">Immediate action required</span>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <span className="text-xs font-semibold text-rose-900 uppercase">Accumulated Fines</span>
          <p className="text-2xl font-bold text-rose-700 mt-1">₹{totalOutstandingFine.toFixed(2)}</p>
          <span className="text-[11px] text-rose-600">Pending circulation recovery</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-700 uppercase">Average Overdue Duration</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {sorted.length > 0
              ? Math.round(sorted.reduce((s, i) => s + (i.overdue_days || 0), 0) / sorted.length)
              : 0}{' '}
            Days
          </p>
          <span className="text-[11px] text-slate-500">From student & faculty loans</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student/doctor name, ID, book title, accession..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-coral-500"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-coral-500 bg-white"
          >
            <option value="all">All Medical Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={durationFilter}
            onChange={e => setDurationFilter(e.target.value as any)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-coral-500 bg-white"
          >
            <option value="all">All Durations</option>
            <option value="lt7">&lt; 7 Days</option>
            <option value="7to14">7 – 14 Days</option>
            <option value="14to30">14 – 30 Days</option>
            <option value="gt30">&gt; 30 Days Critical</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-coral-500 bg-white"
          >
            <option value="days_desc">Sort: Most Overdue</option>
            <option value="days_asc">Sort: Least Overdue</option>
            <option value="fine_desc">Sort: Highest Fine</option>
          </select>
        </div>
      </div>

      {/* Overdue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Borrower Information</th>
                <th className="px-3 py-3 text-left font-semibold">Book & Accession</th>
                <th className="px-3 py-3 text-left font-semibold">Due Date</th>
                <th className="px-3 py-3 text-center font-semibold">Days Elapsed</th>
                <th className="px-3 py-3 text-right font-semibold">Assessed Fine</th>
                <th className="px-4 py-3 text-right font-semibold">Formal Notices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No overdue books currently detected in library circulation.
                  </td>
                </tr>
              ) : (
                sorted.map(iss => {
                  const days = iss.overdue_days || 0;
                  const isHigh = days > 14;

                  return (
                    <tr key={iss.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{iss.member?.full_name}</div>
                        <div className="font-mono text-[11px] text-slate-500 mt-0.5">{iss.member?.identifier}</div>
                        <div className="text-[10px] text-slate-400">
                          {iss.member?.department?.name} • {iss.member?.phone}
                        </div>
                      </td>

                      <td className="px-3 py-3 max-w-xs">
                        <div className="font-mono text-[11px] font-bold text-coral-700">
                          {iss.copy?.accession_number}
                        </div>
                        <div className="font-medium text-slate-800 truncate" title={iss.copy?.book?.title}>
                          {iss.copy?.book?.title}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        <div className="font-semibold text-slate-800">{iss.due_date}</div>
                        <div className="text-[10px] text-slate-400">Borrowed: {iss.issue_date}</div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <Badge variant={isHigh ? 'danger' : 'warning'} className="font-bold">
                          +{days} Days
                        </Badge>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <span className="font-bold text-rose-600 text-sm">
                          ₹{(iss.fine_amount || 0).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => generateOverdueNoticePdf(iss)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-medium transition border border-amber-200"
                            title="Generate official printable overdue notice PDF"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                            <span>PDF Notice</span>
                          </button>

                          <button
                            onClick={() => handleSimulateNotice(iss)}
                            className="p-1.5 rounded text-slate-500 hover:text-coral-600 hover:bg-slate-100 transition"
                            title="Simulate SMS/Email notification dispatch"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
