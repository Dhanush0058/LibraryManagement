import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { Book, BookIssue, Fine, FinePayment, Purchase, Member } from '../types';

export const INSTITUTION_INFO = {
  name: 'ESIC MEDICAL COLLEGE AND HOSPITAL',
  location: 'SANGAREDDY, TELANGANA, INDIA',
  department: 'CENTRAL MEDICAL LIBRARY & KNOWLEDGE RESOURCE CENTRE',
};

// CSV Export Helper
export function exportToCsv(filename: string, data: any[]): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate Inventory PDF
export function generateInventoryPdf(books: Book[]): void {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(INSTITUTION_INFO.name, 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(INSTITUTION_INFO.location, 105, 21, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(INSTITUTION_INFO.department, 105, 27, { align: 'center' });
  doc.line(14, 30, 196, 30);

  doc.setFontSize(12);
  doc.text('CENTRAL BOOK INVENTORY REPORT', 14, 37);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()} | Total Titles: ${books.length}`, 14, 43);

  const tableData = books.map((b, index) => [
    index + 1,
    b.title,
    b.author,
    b.category?.name || 'General',
    b.shelf_number || 'N/A',
    b.total_copies || 0,
    b.available_copies || 0,
    b.purchase_price ? `₹${b.purchase_price}` : '—'
  ]);

  autoTable(doc, {
    startY: 48,
    head: [['#', 'Book Title', 'Author', 'Category', 'Shelf', 'Total', 'Avail', 'Price']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 60 },
      2: { cellWidth: 35 },
      3: { cellWidth: 28 },
      4: { cellWidth: 18 },
      5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 12, halign: 'center' },
      7: { cellWidth: 18, halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  if (finalY < 270) {
    doc.setFontSize(9);
    doc.text('Prepared by: Library Staff', 14, finalY);
    doc.text('Verified by: Chief Librarian / Officer-in-Charge', 130, finalY);
  }

  doc.save(`ESIC_Library_Inventory_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Generate Active Circulation Report PDF
export function generateCirculationPdf(issues: BookIssue[]): void {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(INSTITUTION_INFO.name, 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(INSTITUTION_INFO.location, 105, 21, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('ACTIVE BOOK CIRCULATION & LOAN REGISTER', 105, 27, { align: 'center' });
  doc.line(14, 30, 196, 30);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Active Transactions: ${issues.length} | Date: ${new Date().toLocaleDateString()}`, 14, 36);

  const tableData = issues.map((i, idx) => [
    idx + 1,
    i.issue_code,
    i.copy?.accession_number || 'N/A',
    i.copy?.book?.title || 'Unknown Title',
    `${i.member?.full_name} (${i.member?.identifier})`,
    i.issue_date,
    i.due_date,
    i.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['#', 'Issue ID', 'Accession No', 'Book Title', 'Issued To', 'Issue Date', 'Due Date', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 24 },
      2: { cellWidth: 28 },
      3: { cellWidth: 45 },
      4: { cellWidth: 38 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
      7: { cellWidth: 16 }
    }
  });

  doc.save(`ESIC_Active_Circulation_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Generate Overdue Notice PDF for a Member
export function generateOverdueNoticePdf(issue: BookIssue): void {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(INSTITUTION_INFO.name, 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(INSTITUTION_INFO.location, 105, 26, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRAL MEDICAL LIBRARY - FORMAL OVERDUE NOTICE', 105, 32, { align: 'center' });
  doc.line(14, 36, 196, 36);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Notice Ref: NOT/${new Date().getFullYear()}/${issue.issue_code}`, 14, 45);
  doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 150, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('TO:', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${issue.member?.full_name}`, 14, 62);
  doc.text(`Roll / Employee ID: ${issue.member?.identifier}`, 14, 68);
  doc.text(`Department: ${issue.member?.department?.name || 'ESIC Medical College'}`, 14, 74);
  doc.text(`Phone / Email: ${issue.member?.phone} | ${issue.member?.email}`, 14, 80);

  doc.setFont('helvetica', 'bold');
  doc.text('SUBJECT: NOTICE FOR OVERDUE LIBRARY BOOK RETRIEVAL & FINE CLEARANCE', 14, 92);

  doc.setFont('helvetica', 'normal');
  const bodyText = `This is to bring to your immediate notice that the undermentioned institutional library book borrowed under your membership account has exceeded its allocated loan period. You are requested to return the book to the Central Library circulation counter immediately to prevent further compounding of overdue fines.`;
  doc.text(doc.splitTextToSize(bodyText, 180), 14, 100);

  autoTable(doc, {
    startY: 115,
    head: [['Particulars', 'Details']],
    body: [
      ['Transaction Reference', issue.issue_code],
      ['Book Title', issue.copy?.book?.title || 'Unknown Title'],
      ['Author(s)', issue.copy?.book?.author || 'N/A'],
      ['Accession Number', issue.copy?.accession_number || 'N/A'],
      ['Date of Borrowing', issue.issue_date],
      ['Due Date for Return', issue.due_date],
      ['Overdue Days Elapsed', `${issue.overdue_days || 0} Days`],
      ['Accumulated Overdue Fine', `INR ₹${(issue.fine_amount || 0).toFixed(2)} (Subject to current policy)`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 120 }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 25;
  doc.text('Authorized Signatory', 145, finalY);
  doc.setFont('helvetica', 'bold');
  doc.text('Librarian / Library In-Charge', 145, finalY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('ESIC Medical College & Hospital, Sangareddy', 145, finalY + 12);

  doc.save(`Overdue_Notice_${issue.member?.identifier.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`);
}

// Generate Fine Payment Receipt PDF
export function generatePaymentReceiptPdf(payment: FinePayment, member: Member, fine: Fine): void {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(INSTITUTION_INFO.name, 105, 18, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(INSTITUTION_INFO.location, 105, 24, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRAL LIBRARY - OFFICIAL FINE PAYMENT RECEIPT', 105, 30, { align: 'center' });
  doc.line(14, 34, 196, 34);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt No: ${payment.receipt_no}`, 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date & Time: ${new Date(payment.payment_date).toLocaleString()}`, 130, 42);

  autoTable(doc, {
    startY: 48,
    head: [['Item Description', 'Detail']],
    body: [
      ['Member Roll / Emp ID', member.identifier],
      ['Member Full Name', member.full_name],
      ['Department', member.department?.name || 'ESIC Medical College'],
      ['Payment Reference ID', payment.payment_reference || 'N/A'],
      ['Mode of Payment', payment.payment_method.toUpperCase()],
      ['Amount Paid', `INR ₹${payment.amount_paid.toFixed(2)}`],
      ['Remaining Fine Balance', `INR ₹${fine.balance_amount.toFixed(2)}`],
      ['Status of Fine', fine.status.toUpperCase()],
      ['Received By Staff ID', payment.received_by || 'Circulation Desk Staff']
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold' },
      1: { cellWidth: 115 }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 25;
  doc.setFontSize(9);
  doc.text('This is a computer-generated institutional library receipt.', 14, finalY);
  doc.text('Authorized Circulation Officer Stamp/Sign', 130, finalY);

  doc.save(`Receipt_${payment.receipt_no}.pdf`);
}
