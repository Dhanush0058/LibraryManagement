import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { db } from '../../services/db';
import { LibrarySettings } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LibrarySettingsView: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [settings, setSettings] = useState<LibrarySettings>(() => db.getSettings());

  if (!isSuperAdmin) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center">
        <ShieldAlert className="w-12 h-12 mx-auto text-red-600 mb-2" />
        <h3 className="text-base font-bold text-red-900">Access Restricted</h3>
        <p className="text-xs text-red-700 mt-1">
          Only Super Administrator has authorization to alter institutional circulation policies and fine rules.
        </p>
      </div>
    );
  }

  const handleChange = (field: keyof LibrarySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.updateSettings(settings, user);
      success(
        'Policy Updated',
        'Circulation loan limits and fine computation settings saved in library database.'
      );
    } catch (err: any) {
      error('Cannot Update Settings', err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-coral-600" />
            Library Circulation & Fine Policies
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable operational parameters for ESIC Medical College & Hospital Library
          </p>
        </div>
        <Badge variant="warning">Proposed Policy Configuration</Badge>
      </div>

      {/* Institutional Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Institutional Policy Notice for Presentation</h4>
          <p className="mt-0.5 text-amber-800">
            The rules below represent the recommended operational baseline for medical colleges. These
            rates and durations are marked as <strong>Proposed</strong> until formally ratified by the
            Library Committee and Dean of ESIC Medical College, Sangareddy. All figures are dynamically
            applied across the circulation engine.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Student Policy Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              🎓 MBBS Undergraduate & Postgraduate Student Rules
            </h3>
            <span className="text-[11px] text-coral-700 bg-coral-50 px-2 py-0.5 rounded font-semibold border border-coral-200">
              Student Category
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Borrowing Limit (Books)"
              type="number"
              min="1"
              max="10"
              value={settings.student_borrow_limit}
              onChange={e => handleChange('student_borrow_limit', e.target.value)}
              helperText="Default max concurrent physical copies"
              required
            />

            <Input
              label="Loan Period (Days)"
              type="number"
              min="1"
              max="90"
              value={settings.student_loan_days}
              onChange={e => handleChange('student_loan_days', e.target.value)}
              helperText="Standard borrowing duration"
              required
            />

            <Input
              label="Grace Period (Days)"
              type="number"
              min="0"
              max="15"
              value={settings.student_grace_period_days}
              onChange={e => handleChange('student_grace_period_days', e.target.value)}
              helperText="Days before overdue fine begins"
              required
            />

            <Input
              label="Daily Overdue Fine (₹ INR)"
              type="number"
              step="0.5"
              min="0"
              value={settings.student_daily_fine}
              onChange={e => handleChange('student_daily_fine', e.target.value)}
              helperText="Chargeable per overdue day"
              required
            />

            <Input
              label="Maximum Fine Cap (₹ INR)"
              type="number"
              min="0"
              value={settings.student_max_fine}
              onChange={e => handleChange('student_max_fine', e.target.value)}
              helperText="Upper ceiling per book transaction"
              required
            />
          </div>
        </div>

        {/* Staff & Faculty Policy Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              👨‍⚕️ Doctors, Faculty & Hospital Staff Rules
            </h3>
            <span className="text-[11px] text-coral-700 bg-coral-50 px-2 py-0.5 rounded font-semibold border border-coral-200">
              Staff Category
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Borrowing Limit (Books)"
              type="number"
              min="1"
              max="15"
              value={settings.staff_borrow_limit}
              onChange={e => handleChange('staff_borrow_limit', e.target.value)}
              helperText="Allowed concurrent book copies"
              required
            />

            <Input
              label="Loan Period (Days)"
              type="number"
              min="1"
              max="120"
              value={settings.staff_loan_days}
              onChange={e => handleChange('staff_loan_days', e.target.value)}
              helperText="Standard faculty loan duration"
              required
            />

            <Input
              label="Grace Period (Days)"
              type="number"
              min="0"
              max="30"
              value={settings.staff_grace_period_days}
              onChange={e => handleChange('staff_grace_period_days', e.target.value)}
              helperText="Grace days before penalty"
              required
            />

            <Input
              label="Daily Overdue Fine (₹ INR)"
              type="number"
              step="0.5"
              min="0"
              value={settings.staff_daily_fine}
              onChange={e => handleChange('staff_daily_fine', e.target.value)}
              helperText="Fine per overdue day"
              required
            />

            <Input
              label="Maximum Fine Cap (₹ INR)"
              type="number"
              min="0"
              value={settings.staff_max_fine}
              onChange={e => handleChange('staff_max_fine', e.target.value)}
              helperText="Maximum capping per faculty loan"
              required
            />
          </div>
        </div>

        {/* Book Loss & Damage Policy Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">
              📖 Lost Book Replacement & Physical Damage Liabilities
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lost Book Cost Multiplier"
              type="number"
              step="0.1"
              min="1"
              value={settings.lost_book_multiplier}
              onChange={e => handleChange('lost_book_multiplier', e.target.value)}
              helperText="Applied on original book purchase price (e.g. 1.5x covers procurement overhead)"
              required
            />

            <Input
              label="Damaged Book Flat Repair Fee (₹ INR)"
              type="number"
              min="0"
              value={settings.damaged_book_flat_fee}
              onChange={e => handleChange('damaged_book_flat_fee', e.target.value)}
              helperText="Institutional rebinding & restoration charge"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" size="lg" className="font-semibold text-sm">
            <Save className="w-4 h-4 mr-2" /> Save & Apply Institutional Policies
          </Button>
        </div>
      </form>
    </div>
  );
};
