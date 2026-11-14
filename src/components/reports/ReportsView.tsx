import React, { useState } from 'react';
import { 
  BarChart3, Download, FileText, Calendar, Filter, 
  BookOpen, Users, IndianRupee, Layers 
} from 'lucide-react';
import { db } from '../../services/db';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  generateInventoryPdf, 
  generateCirculationPdf, 
  exportToCsv,
  INSTITUTION_INFO 
} from '../../services/reports';
import { useToast } from '../../context/ToastContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportsView: React.FC = () => {
  const { success } = useToast();
  const [selectedReport, setSelectedReport] = useState<
    | 'inventory'
    | 'available'
    | 'issued'
    | 'overdue'
    | 'fines'
    | 'departments'
    | 'damaged_lost'
    | 'purchases'
  >('inventory');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const books = db.getBooks();
  const copies = db.getCopies();
  const members = db.getMembers();
  const issues = db.getAllIssues();
  const fines = db.getFines();
  const payments = db.getPayments();
  const purchases = db.getPurchases();
  const departments = db.getDepartments();

  // Export current report to CSV
  const handleExportCsv = () => {
    switch (selectedReport) {
      case 'inventory': {
        const data = books.map(b => ({
          Title: b.title,
          ISBN: b.isbn,
          Author: b.author,
          Category: b.category?.name || 'General',
          TotalCopies: b.total_copies || 0,
          Available: b.available_copies || 0,
          Price: b.purchase_price || 0,
        }));
        exportToCsv('ESIC_Total_Inventory_Report', data);
        break;
      }
      case 'available': {
        const availCopies = copies.filter(c => c.status === 'available');
        const data = availCopies.map(c => ({
          Accession: c.accession_number,
          Title: c.book?.title,
          Location: c.shelf_location || 'Stacks',
          Condition: c.condition_notes || 'Good'
        }));
        exportToCsv('ESIC_Available_Copies_Report', data);
        break;
      }
      case 'issued': {
        const active = issues.filter(i => i.status === 'active' || i.status === 'overdue');
        const data = active.map(i => ({
          Code: i.issue_code,
          Accession: i.copy?.accession_number,
          Book: i.copy?.book?.title,
          Borrower: i.member?.full_name,
          ID: i.member?.identifier,
          IssueDate: i.issue_date,
          DueDate: i.due_date,
        }));
        exportToCsv('ESIC_Active_Issues_Report', data);
        break;
      }
      case 'overdue': {
        const overdue = issues.filter(i => i.status === 'overdue');
        const data = overdue.map(i => ({
          Borrower: i.member?.full_name,
          ID: i.member?.identifier,
          Book: i.copy?.book?.title,
          Accession: i.copy?.accession_number,
          DueDate: i.due_date,
          OverdueDays: i.overdue_days,
          Fine: i.fine_amount
        }));
        exportToCsv('ESIC_Overdue_Report', data);
        break;
      }
      case 'fines': {
        const data = fines.map(f => ({
          Member: f.member?.full_name,
          ID: f.member?.identifier,
          TotalFine: f.amount,
          BalanceDue: f.balance_amount,
          Status: f.status
        }));
        exportToCsv('ESIC_Fines_Ledger_Report', data);
        break;
      }
      case 'damaged_lost': {
        const items = copies.filter(c => c.status === 'damaged' || c.status === 'lost');
        const data = items.map(c => ({
          Accession: c.accession_number,
          Title: c.book?.title,
          Status: c.status.toUpperCase(),
          Notes: c.condition_notes || ''
        }));
        exportToCsv('ESIC_Damaged_Lost_Stock_Report', data);
        break;
      }
      default:
        break;
    }
    success('Report Exported', 'CSV report downloaded.');
  };

  // Export current report to PDF
  const handleExportPdf = () => {
    if (selectedReport === 'inventory') {
      generateInventoryPdf(books);
      return;
    }
    if (selectedReport === 'issued') {
      generateCirculationPdf(issues.filter(i => i.status === 'active' || i.status === 'overdue'));
      return;
    }

    // Generic Institutional Report Generator
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(INSTITUTION_INFO.name, 105, 16, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(INSTITUTION_INFO.location, 105, 22, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(`EXECUTIVE REPORT: ${selectedReport.toUpperCase().replace('_', ' ')}`, 105, 28, { align: 'center' });
    doc.line(14, 32, 196, 32);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date of Generation: ${new Date().toLocaleString()}`, 14, 38);

    if (selectedReport === 'overdue') {
      const overdue = issues.filter(i => i.status === 'overdue');
      const body = overdue.map((o, idx) => [
        idx + 1,
        o.member?.full_name || '',
        o.member?.identifier || '',
        o.copy?.book?.title || '',
        o.due_date,
        `${o.overdue_days}d`,
        `₹${(o.fine_amount || 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 44,
        head: [['#', 'Member Name', 'Roll/ID', 'Book Title', 'Due Date', 'Elapsed', 'Fine Due']],
        body,
        theme: 'grid',
        headStyles: { fillColor: [180, 83, 9] }
      });
    } else if (selectedReport === 'departments') {
      const body = departments.map((d, idx) => {
        const memCount = members.filter(m => m.department_id === d.id).length;
        const activeLoans = issues.filter(i => (i.status === 'active' || i.status === 'overdue') && i.member?.department_id === d.id).length;
        return [idx + 1, d.name, d.code, memCount, activeLoans];
      });

      autoTable(doc, {
        startY: 44,
        head: [['#', 'Department Name', 'Code', 'Total Members', 'Active Book Loans']],
        body,
        theme: 'grid',
        headStyles: { fillColor: [15, 118, 110] }
      });
    } else {
      generateInventoryPdf(books);
      return;
    }

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text('Prepared by: Library Administration', 14, finalY);
    doc.text('Approved by: Library Committee / Dean', 130, finalY);

    doc.save(`ESIC_${selectedReport}_Report.pdf`);
    success('PDF Generated', 'Official executive report PDF downloaded.');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-coral-600" />
            Institutional Reports & Analytics Suite
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade operational intelligence, inventory registers, and compliance ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCsv} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
          <Button size="sm" variant="primary" onClick={handleExportPdf} className="text-xs">
            <FileText className="w-3.5 h-3.5 mr-1" /> Official PDF Report
          </Button>
        </div>
      </div>

      {/* Report Categories Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
        {[
          { key: 'inventory', label: 'Total Catalog Inventory', count: books.length },
          { key: 'available', label: 'Available Shelf Stock', count: copies.filter(c => c.status === 'available').length },
          { key: 'issued', label: 'Active Circulation Loans', count: issues.filter(i => i.status === 'active' || i.status === 'overdue').length },
          { key: 'overdue', label: 'Overdue Retrievals', count: issues.filter(i => i.status === 'overdue').length },
          { key: 'fines', label: 'Fines & Recovery Ledger', count: fines.length },
          { key: 'departments', label: 'Departmental Borrowing', count: departments.length },
          { key: 'damaged_lost', label: 'Damaged & Lost Stock', count: copies.filter(c => c.status === 'damaged' || c.status === 'lost').length },
          { key: 'purchases', label: 'Stock Acquisition History', count: purchases.length },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setSelectedReport(item.key as any)}
            className={`p-2.5 rounded-lg text-left transition ${
              selectedReport === item.key
                ? 'bg-white text-coral-800 font-bold shadow-xs border border-coral-200'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span className="block truncate">{item.label}</span>
            <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block">
              {item.count} Records
            </span>
          </button>
        ))}
      </div>

      {/* Report Content Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm capitalize">
              {selectedReport.replace('_', ' ')} Executive Report
            </h3>
            <p className="text-xs text-slate-500">Live real-time calculated records from database</p>
          </div>
          <Badge variant="info">Verified Data</Badge>
        </div>

        {/* Dynamic Display based on report */}
        {selectedReport === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">Book Title</th>
                  <th className="px-3 py-2 text-left">Author</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-center">Total Copies</th>
                  <th className="px-3 py-2 text-center">Available</th>
                  <th className="px-3 py-2 text-right">Unit Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map(b => (
                  <tr key={b.id}>
                    <td className="px-3 py-2 font-medium text-slate-900">{b.title}</td>
                    <td className="px-3 py-2 text-slate-600">{b.author}</td>
                    <td className="px-3 py-2 text-slate-600">{b.category?.name}</td>
                    <td className="px-3 py-2 text-center font-bold text-slate-800">{b.total_copies}</td>
                    <td className="px-3 py-2 text-center font-bold text-emerald-700">{b.available_copies}</td>
                    <td className="px-3 py-2 text-right">₹{b.purchase_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'departments' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-center">Registered Members</th>
                  <th className="px-3 py-2 text-center">Active Loans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map(d => {
                  const memCount = members.filter(m => m.department_id === d.id).length;
                  const activeCount = issues.filter(
                    i => (i.status === 'active' || i.status === 'overdue') && i.member?.department_id === d.id
                  ).length;
                  return (
                    <tr key={d.id}>
                      <td className="px-3 py-2 font-medium text-slate-900">{d.name}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{d.code}</td>
                      <td className="px-3 py-2 text-center font-bold text-slate-800">{memCount}</td>
                      <td className="px-3 py-2 text-center font-bold text-coral-700">{activeCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'damaged_lost' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">Accession Number</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-left">Condition / Incident Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {copies.filter(c => c.status === 'damaged' || c.status === 'lost').map(c => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-mono font-bold text-coral-800">{c.accession_number}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{c.book?.title}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={c.status === 'lost' ? 'danger' : 'warning'}>
                        {c.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{c.condition_notes || 'Reported during circulation'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport !== 'inventory' && selectedReport !== 'departments' && selectedReport !== 'damaged_lost' && (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
            Detailed breakdown available for export in official CSV and PDF formats above.
          </div>
        )}
      </div>
    </div>
  );
};
