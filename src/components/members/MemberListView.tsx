import React, { useState } from 'react';
import { 
  Users, Plus, Search, Filter, Download, UserCheck, 
  UserX, BookOpen, Layers, Edit, Eye 
} from 'lucide-react';
import { db } from '../../services/db';
import { Member, MemberType, MemberStatus } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MemberFormModal } from './MemberFormModal';
import { MemberDetailModal } from './MemberDetailModal';
import { MemberCsvModal } from './MemberCsvModal';
import { exportToCsv } from '../../services/reports';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface MemberListViewProps {
  onIssueBookToMember?: (member: Member) => void;
}

export const MemberListView: React.FC<MemberListViewProps> = ({ onIssueBookToMember }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [refresh, setRefresh] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | MemberType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  const members = db.getMembers();

  const triggerRefresh = () => setRefresh(r => r + 1);

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.department?.name && m.department.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || m.member_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleStatus = (m: Member) => {
    const newStatus: MemberStatus = m.status === 'active' ? 'suspended' : 'active';
    try {
      db.updateMemberStatus(m.id, newStatus, user);
      success(
        'Status Changed',
        `${m.full_name} membership is now ${newStatus.toUpperCase()}.`
      );
      triggerRefresh();
    } catch (err: any) {
      error('Cannot Update Status', err.message);
    }
  };

  const handleExportCsv = () => {
    const exportData = filteredMembers.map(m => ({
      Identifier: m.identifier,
      FullName: m.full_name,
      Type: m.member_type.toUpperCase(),
      Department: m.department?.name || '',
      Course: m.course || '',
      AcademicYear: m.academic_year || '',
      Designation: m.designation || '',
      Phone: m.phone,
      Email: m.email,
      Status: m.status.toUpperCase(),
      ActiveIssues: m.active_issues_count || 0,
      OutstandingFine: m.outstanding_fine || 0,
      RegistrationDate: m.registration_date,
    }));
    exportToCsv('ESIC_Library_Members_Roster', exportData);
    success('Members Exported', 'CSV roster downloaded successfully.');
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            Student & Faculty Membership Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional borrowing privileges, loan quotas, and fine ledgers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCsv} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsCsvOpen(true)} className="text-xs">
            <Layers className="w-3.5 h-3.5 mr-1 text-teal-600" /> Bulk CSV Import
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setActiveMember(null);
              setIsFormOpen(true);
            }}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Register Member
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Roll No, Employee ID, Name, Department, Phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
          >
            <option value="all">All Member Types</option>
            <option value="student">Students (MBBS / PG)</option>
            <option value="staff">Staff & Faculty</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Borrowers</option>
            <option value="suspended">Suspended Memberships</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Member Identifier</th>
                <th className="px-3 py-3 text-left font-semibold">Full Name & Contact</th>
                <th className="px-3 py-3 text-left font-semibold">Department & Academic Role</th>
                <th className="px-3 py-3 text-center font-semibold">Active Loans / Limit</th>
                <th className="px-3 py-3 text-right font-semibold">Dues / Fine</th>
                <th className="px-3 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No members match your criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => {
                  const isSuspended = member.status === 'suspended';
                  const activeCount = member.active_issues_count || 0;
                  const dues = member.outstanding_fine || 0;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        <div>{member.identifier}</div>
                        <Badge
                          variant={member.member_type === 'student' ? 'purple' : 'info'}
                          className="mt-1 text-[10px]"
                        >
                          {member.member_type === 'student' ? 'Student' : 'Faculty / Staff'}
                        </Badge>
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900">{member.full_name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{member.phone}</div>
                        <div className="text-[10px] text-slate-400">{member.email}</div>
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        <div className="font-medium text-slate-800">{member.department?.name || 'Department'}</div>
                        {member.member_type === 'student' ? (
                          <div className="text-[11px] text-teal-800 font-medium">
                            {member.course} • {member.academic_year}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500">{member.designation}</div>
                        )}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span
                          className={`font-bold ${
                            activeCount >= member.max_borrow_limit ? 'text-amber-600' : 'text-slate-800'
                          }`}
                        >
                          {activeCount}
                        </span>
                        <span className="text-slate-400"> / {member.max_borrow_limit}</span>
                        {activeCount >= member.max_borrow_limit && (
                          <span className="block text-[10px] text-amber-700 font-medium">Quota Full</span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-right">
                        <span
                          className={`font-semibold ${
                            dues > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'
                          }`}
                        >
                          ₹{dues.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <Badge variant={isSuspended ? 'danger' : 'success'}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Member Card */}
                          <button
                            onClick={() => {
                              setActiveMember(member);
                              setIsDetailOpen(true);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition"
                            title="View member card & loans"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setActiveMember(member);
                              setIsFormOpen(true);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Edit member details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Reactivate */}
                          <button
                            onClick={() => handleToggleStatus(member)}
                            className={`p-1 rounded transition ${
                              isSuspended
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title={isSuspended ? 'Reactivate membership' : 'Suspend membership'}
                          >
                            {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
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

      {/* Modals */}
      {isFormOpen && (
        <MemberFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          memberToEdit={activeMember}
          onSuccess={triggerRefresh}
        />
      )}

      {isDetailOpen && activeMember && (
        <MemberDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          member={activeMember}
          onIssueBookClick={onIssueBookToMember}
        />
      )}

      {isCsvOpen && (
        <MemberCsvModal
          isOpen={isCsvOpen}
          onClose={() => setIsCsvOpen(false)}
          onSuccess={triggerRefresh}
        />
      )}
    </div>
  );
};
