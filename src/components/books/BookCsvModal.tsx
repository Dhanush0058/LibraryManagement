import React, { useState } from 'react';
import Papa from 'papaparse';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UploadCloud, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface BookCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookCsvModal: React.FC<BookCsvModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [csvData, setCsvData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadSampleTemplate = () => {
    const sampleRows = [
      {
        title: "Gray's Anatomy: The Anatomical Basis of Clinical Practice",
        isbn: "978-0702077050",
        author: "Susan Standring",
        publisher: "Elsevier",
        edition: "42nd Edition",
        publication_year: "2020",
        subject: "Gross Anatomy",
        shelf_number: "Shelf A-03",
        rack_number: "Rack 04",
        purchase_price: "14500",
        copies_count: "3",
        accession_prefix: "ESIC-ANAT-2024"
      },
      {
        title: "Kucers' The Use of Antibiotics",
        isbn: "978-1498747950",
        author: "M. Lindsay Grayson",
        publisher: "CRC Press",
        edition: "7th Edition",
        publication_year: "2017",
        subject: "Pharmacology & Infectious Disease",
        shelf_number: "Shelf B-01",
        rack_number: "Rack 08",
        purchase_price: "22000",
        copies_count: "2",
        accession_prefix: "ESIC-PHAR-2024"
      }
    ];

    const csv = Papa.unparse(sampleRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ESIC_Book_Import_Template.csv';
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
          setPreviewError('Failed to parse CSV file. Please verify formatting.');
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
      let importedCount = 0;
      csvData.forEach((row: any) => {
        if (!row.title || !row.isbn || !row.author) return;

        const copiesCount = parseInt(row.copies_count, 10) || 1;
        const prefix = row.accession_prefix || `ESIC-BULK-${new Date().getFullYear()}`;

        db.saveBook(
          {
            title: row.title.trim(),
            isbn: row.isbn.trim(),
            author: row.author.trim(),
            publisher: row.publisher?.trim() || 'Medical Publishing',
            edition: row.edition?.trim(),
            publication_year: row.publication_year ? parseInt(row.publication_year, 10) : undefined,
            subject: row.subject?.trim() || 'General Medicine',
            shelf_number: row.shelf_number?.trim(),
            rack_number: row.rack_number?.trim(),
            purchase_price: row.purchase_price ? parseFloat(row.purchase_price) : 0,
            purchase_date: new Date().toISOString().split('T')[0],
          },
          copiesCount,
          prefix,
          user
        );
        importedCount++;
      });

      success('Bulk Import Complete', `Successfully imported ${importedCount} medical books and created accession stock.`);
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
      title="Bulk Import Medical Books via CSV"
      subtitle="Batch upload titles and physical accession copies into catalog"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Step 1: Download Template */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <h4 className="text-xs font-semibold text-slate-800">1. Download CSV Template</h4>
            <p className="text-[11px] text-slate-500">Includes columns: title, isbn, author, publisher, copies_count, etc.</p>
          </div>
          <Button size="sm" variant="outline" onClick={downloadSampleTemplate}>
            <Download className="w-3.5 h-3.5 mr-1" /> Template.csv
          </Button>
        </div>

        {/* Step 2: Upload Area */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-coral-500 transition-colors">
          <UploadCloud className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-medium text-slate-700">Select or drop your filled CSV file here</p>
          <p className="text-[11px] text-slate-400 mt-0.5">UTF-8 encoded .csv files only</p>
          <label className="mt-3 inline-block">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
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

        {/* Preview parsed data */}
        {csvData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-coral-700 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-coral-500" />
                Parsed {csvData.length} records ready for import
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-1.5 text-left">Title</th>
                    <th className="px-3 py-1.5 text-left">ISBN</th>
                    <th className="px-3 py-1.5 text-left">Author</th>
                    <th className="px-3 py-1.5 text-center">Copies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {csvData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-1.5 font-medium text-slate-800 max-w-[200px] truncate">{row.title}</td>
                      <td className="px-3 py-1.5 font-mono text-slate-500">{row.isbn}</td>
                      <td className="px-3 py-1.5 text-slate-600 truncate">{row.author}</td>
                      <td className="px-3 py-1.5 text-center font-bold text-coral-600">{row.copies_count || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            Import {csvData.length > 0 ? `${csvData.length} Titles` : 'Data'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
