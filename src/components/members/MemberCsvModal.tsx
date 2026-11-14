import React, { useState } from 'react';
import Papa from 'papaparse';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UploadCloud, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface MemberCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MemberCsvModal: React.FC<MemberCsvModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [csvData, setCsvData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadSampleTemplate = () => {
    const sampleRows = [
      {
        member_type: 'student',
        identifier: 'ESIC/MBBS/2024/001',
        full_name: 'Pooja Verma',
        department_code: 'ANAT',
        course: 'MBBS',
        academic_year: '1st Year',
        designation: '',
        phone: '+91 98499 12345',
        email: 'pooja.verma@student.esic.edu.in',
        max_borrow_limit: '3'
      },
      {
        member_type: 'staff',
        identifier: 'EMP-PATH-102',
        full_name: 'Dr. Suresh Babu',
        department_code: 'PATH',
        course: '',
        academic_year: '',
        designation: 'Associate Professor',
        phone: '+91 94401 98765',
        email: 'suresh.babu@faculty.esic.edu.in',
        max_borrow_limit: '6'
      }
    ];

    const csv = Papa.unparse(sampleRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ESIC_Members_Import_Template.csv';
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setPreviewError('Failed to parse CSV file. Please verify columns and formatting.');
          return;
        }
        setPreviewError(null);
        setCsvData(results.data);
      },
      error: (err) => {
        setPreviewError(err.message);
      }
    });
  };

  const handleImport = () => {
    if (csvData.length === 0) return;
    setIsProcessing(true);

    try {
      const depts = db.getDepartments();
      let importedCount = 0;

      csvData.forEach((row: any) => {
        if (!row.identifier || !row.full_name || !row.email) return;

        // Match department by code or fallback to first department
        const targetDept = depts.find(d => d.code.toUpperCase() === (row.department_code || '').trim().toUpperCase()) || depts[0];

        db.saveMember(
          {
            member_type: row.member_type?.toLowerCase() === 'staff' ? 'staff' : 'student',
            identifier: row.identifier.trim(),
            full_name: row.full_name.trim(),
            department_id: targetDept.id,
            course: row.course?.trim() || 'MBBS',
            academic_year: row.academic_year?.trim() || '1st Year',
            designation: row.designation?.trim(),
            phone: row.phone?.trim() || '+91 00000 00000',
            email: row.email.trim(),
            status: 'active',
            max_borrow_limit: parseInt(row.max_borrow_limit, 10) || 3,
          },
          user
        );
        importedCount++;
      });

      success('Import Succeeded', `Registered ${importedCount} student and faculty members into library directory.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Import Interrupted', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Students & Staff Members"
      subtitle="Register multiple ESIC institutional library memberships from CSV"
      maxWidth="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <h4 className="text-xs font-semibold text-slate-800">1. Download CSV Template</h4>
            <p className="text-[11px] text-slate-500">Columns: member_type, identifier, full_name, department_code, etc.</p>
          </div>
          <Button size="sm" variant="outline" onClick={downloadSampleTemplate}>
            <Download className="w-3.5 h-3.5 mr-1" /> Template.csv
          </Button>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-coral-500 transition-colors">
          <UploadCloud className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-medium text-slate-700">Select your member roster CSV</p>
          <label className="mt-3 inline-block">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            <span className="cursor-pointer inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs">
              Browse CSV File
            </span>
          </label>
        </div>

        {previewError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{previewError}</span>
          </div>
        )}

        {csvData.length > 0 && (
          <div className="p-2.5 bg-coral-50 border border-coral-200 rounded-lg flex items-center gap-2 text-xs text-coral-700">
            <CheckCircle className="w-4 h-4 text-coral-500" />
            <span>Parsed {csvData.length} member records ready for import</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={csvData.length === 0 || isProcessing}
            isLoading={isProcessing}
            onClick={handleImport}
          >
            Import Members
          </Button>
        </div>
      </div>
    </Modal>
  );
};
