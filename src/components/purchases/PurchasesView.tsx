import React, { useState } from 'react';
import { ShoppingCart, Plus, Search, Trash2, CheckCircle2, Eye } from 'lucide-react';
import { db } from '../../services/db';
import { Purchase } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const PurchasesView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [refresh, setRefresh] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // New Purchase Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  // Items
  const [items, setItems] = useState<
    Array<{
      title: string;
      isbn: string;
      copiesCount: number;
      costPerCopy: number;
      subject: string;
    }>
  >([
    {
      title: '',
      isbn: '',
      copiesCount: 2,
      costPerCopy: 1500,
      subject: 'Pathology',
    },
  ]);

  const purchases = db.getPurchases();
  const triggerRefresh = () => setRefresh(r => r + 1);

  const filteredPurchases = purchases.filter(p => {
    return (
      p.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.remarks && p.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        title: '',
        isbn: '',
        copiesCount: 2,
        costPerCopy: 1000,
        subject: 'General Medicine',
      },
    ]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItemRow = (idx: number, field: string, val: any) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleOpenNew = () => {
    setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setSupplierName('Universal Medical Publishers, Hyderabad');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setItems([
      {
        title: '',
        isbn: '',
        copiesCount: 3,
        costPerCopy: 2500,
        subject: 'General Medicine',
      },
    ]);
    setIsModalOpen(true);
  };

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim() || !supplierName.trim()) {
      error('Validation Error', 'Invoice number and supplier name are required.');
      return;
    }

    const invalid = items.some(i => !i.title.trim() || !i.isbn.trim() || i.copiesCount <= 0);
    if (invalid) {
      error('Incomplete Items', 'All invoice item rows must have title, ISBN, and valid copies count.');
      return;
    }

    try {
      const purchase = db.recordPurchase({
        invoiceNumber,
        supplierName,
        purchaseDate,
        remarks,
        items,
        user,
      });

      success(
        'Stock Inward Confirmed',
        `Invoice ${purchase.invoice_number} saved. Total ${items.reduce((s, i) => s + i.copiesCount, 0)} physical copies accessioned into stock.`
      );
      setIsModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      error('Cannot Record Purchase', err.message);
    }
  };

  const totalInvoiceAmount = items.reduce((s, i) => s + i.copiesCount * i.costPerCopy, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-teal-700" />
            Book Acquisitions & Inward Stock Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Procurement invoices, supplier manifests, and auto-accession numbering
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={handleOpenNew} className="text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Record New Acquisition
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice number, supplier name, or procurement remarks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Invoice Number</th>
                <th className="px-3 py-3 text-left font-semibold">Supplier / Distributor</th>
                <th className="px-3 py-3 text-left font-semibold">Purchase Date</th>
                <th className="px-3 py-3 text-center font-semibold">Titles / Copies</th>
                <th className="px-3 py-3 text-right font-semibold">Total Amount</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No acquisition records recorded yet.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(purchase => {
                  const titlesCount = purchase.items?.length || 0;
                  const totalCopies = purchase.items?.reduce((s, i) => s + (i.copies_count || 0), 0) || 0;

                  return (
                    <tr key={purchase.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {purchase.invoice_number}
                        {purchase.remarks && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">
                            {purchase.remarks}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3 font-medium text-slate-800">
                        {purchase.supplier_name}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {purchase.purchase_date}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <Badge variant="info">
                          {titlesCount} Titles • {totalCopies} Copies
                        </Badge>
                      </td>

                      <td className="px-3 py-3 text-right font-bold text-slate-900">
                        ₹{purchase.total_amount.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedPurchase(purchase)}
                          className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium hover:underline text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Manifest
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manifest Detail Modal */}
      {selectedPurchase && (
        <Modal
          isOpen={Boolean(selectedPurchase)}
          onClose={() => setSelectedPurchase(null)}
          title={`Purchase Manifest — ${selectedPurchase.invoice_number}`}
          subtitle={`Supplier: ${selectedPurchase.supplier_name} • Date: ${selectedPurchase.purchase_date}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Title</th>
                    <th className="px-3 py-2 text-left font-semibold">ISBN</th>
                    <th className="px-3 py-2 text-center font-semibold">Copies</th>
                    <th className="px-3 py-2 text-right font-semibold">Cost / Unit</th>
                    <th className="px-3 py-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {selectedPurchase.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium text-slate-900">{item.title}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">{item.isbn}</td>
                      <td className="px-3 py-2 text-center font-bold text-teal-800">{item.copies_count}</td>
                      <td className="px-3 py-2 text-right text-slate-600">₹{item.cost_per_copy}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">₹{item.total_cost}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold">
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-right">
                      Grand Total:
                    </td>
                    <td className="px-3 py-2 text-right text-teal-900">
                      ₹{selectedPurchase.total_amount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedPurchase(null)}>
                Close Manifest
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Acquisition Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record New Stock Acquisition"
          subtitle="Physical accession units will be automatically created in catalog"
          maxWidth="4xl"
        >
          <form onSubmit={handleSubmitPurchase} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Invoice Number"
                placeholder="e.g. INV-2024-099"
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                required
              />

              <Input
                label="Book Supplier / Distributor"
                placeholder="e.g. MedTech Book Distributors"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                required
              />

              <Input
                label="Invoice Date"
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                required
              />
            </div>

            {/* Line items */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Textbook Inward Items
                </h4>
                <Button type="button" size="sm" variant="outline" onClick={addItemRow} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="col-span-4">
                      <input
                        placeholder="Book Title..."
                        value={item.title}
                        onChange={e => updateItemRow(idx, 'title', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white"
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        placeholder="ISBN..."
                        value={item.isbn}
                        onChange={e => updateItemRow(idx, 'isbn', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white font-mono text-[11px]"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Copies"
                        value={item.copiesCount}
                        onChange={e => updateItemRow(idx, 'copiesCount', parseInt(e.target.value, 10) || 1)}
                        className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white text-center font-bold"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.costPerCopy}
                        onChange={e => updateItemRow(idx, 'costPerCopy', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white text-right"
                        required
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-900">
              <span>Total Procurement Investment:</span>
              <span className="text-base font-bold">₹{totalInvoiceAmount.toFixed(2)}</span>
            </div>

            <Input
              label="Invoice Remarks"
              placeholder="e.g. Approved under Annual Medical Library Procurement Grant 2024"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Inward Stock & Generate Accessions
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
