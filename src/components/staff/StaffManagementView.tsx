import React, { useState } from 'react';
import { UserCheck, Plus, Shield, UserX, Mail, Phone, Lock } from 'lucide-react';
import { db } from '../../services/db';
import { Profile, UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const StaffManagementView: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { success, error, warning } = useToast();
  const [refresh, setRefresh] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('librarian');
  const [phone, setPhone] = useState('');

  const profiles = db.getProfiles();
  const triggerRefresh = () => setRefresh(r => r + 1);

  if (!isSuperAdmin) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center">
        <Shield className="w-12 h-12 mx-auto text-red-600 mb-2" />
        <h3 className="text-base font-bold text-red-900">Access Restricted</h3>
        <p className="text-xs text-red-700 mt-1">
          Only Super Administrator has authorization to view and manage library staff accounts.
        </p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setEmail('');
    setFullName('');
    setRole('librarian');
    setPhone('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = (p: Profile) => {
    try {
      db.toggleProfileStatus(p.id, user);
      success(
        'Staff Status Updated',
        `${p.full_name} is now ${p.is_active ? 'Deactivated' : 'Activated'}.`
      );
      triggerRefresh();
    } catch (err: any) {
      error('Operation Blocked', err.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      error('Validation Error', 'Email and Full Name are mandatory.');
      return;
    }

    try {
      db.saveProfile(
        {
          id: editingStaff ? editingStaff.id : undefined,
          email: email.trim().toLowerCase(),
          full_name: fullName.trim(),
          role,
          phone: phone.trim(),
        },
        user
      );

      success(
        editingStaff ? 'Staff Profile Updated' : 'Staff Registered',
        `${fullName} is configured with ${role} permissions.`
      );
      setIsModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      error('Cannot Save Staff', err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-700" />
            Library Staff & Authority Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based privilege assignment, account provisioning, and access controls
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={handleOpenAdd} className="text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Provision Staff Account
        </Button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Staff Authority</th>
                <th className="px-3 py-3 text-left font-semibold">Official Email</th>
                <th className="px-3 py-3 text-left font-semibold">Role & Permissions</th>
                <th className="px-3 py-3 text-center font-semibold">Account Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {profiles.map(p => {
                const isCurrent = p.id === user?.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {p.full_name}
                        {isCurrent && (
                          <span className="text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded font-bold border border-teal-200">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{p.phone || 'Phone unassigned'}</div>
                    </td>

                    <td className="px-3 py-3 font-mono text-slate-700">
                      {p.email}
                    </td>

                    <td className="px-3 py-3">
                      <Badge variant={p.role === 'super_admin' ? 'purple' : 'info'}>
                        {p.role === 'super_admin' ? 'Super Admin' : 'Librarian'}
                      </Badge>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {p.role === 'super_admin' ? 'Unrestricted Authority' : 'Circulation & Cataloging'}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-center">
                      <Badge variant={p.is_active ? 'success' : 'danger'}>
                        {p.is_active ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {!isCurrent ? (
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`text-xs font-semibold ${
                            p.is_active ? 'text-rose-600 hover:underline' : 'text-emerald-700 hover:underline'
                          }`}
                        >
                          {p.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Self (Protected)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Staff Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Provision Library Authority Account"
          subtitle="Grant institutional access to library staff member"
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Staff Full Name"
              placeholder="e.g. Srikanth V. (Assistant Librarian)"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />

            <Input
              label="Official Institutional Email"
              type="email"
              placeholder="name@esic.edu.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <Select
              label="Authority Role"
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
            >
              <option value="librarian">Librarian (Circulation, Returns, Cataloging)</option>
              <option value="super_admin">Super Administrator (Full System Configuration)</option>
            </Select>

            <Input
              label="Contact Phone"
              placeholder="+91 98490 00000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Provision Account
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
