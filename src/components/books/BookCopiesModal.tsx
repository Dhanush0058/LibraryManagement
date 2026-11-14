import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Book, BookCopy, CopyStatus } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Tag, AlertTriangle } from 'lucide-react';

interface BookCopiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onRefresh: () => void;
}

export const BookCopiesModal: React.FC<BookCopiesModalProps> = ({
  isOpen,
  onClose,
  book,
  onRefresh,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const copies = db.getCopiesByBookId(book.id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [accessionNumber, setAccessionNumber] = useState('');
  const [shelfLocation, setShelfLocation] = useState(
    book.shelf_number ? `${book.shelf_number} / ${book.rack_number || 'Rack 1'}` : ''
  );
  const [conditionNotes, setConditionNotes] = useState('');

  const [editingCopyId, setEditingCopyId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<CopyStatus>('available');
  const [editNotes, setEditNotes] = useState('');

  const handleAddCopy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessionNumber.trim()) {
      error('Validation Error', 'Accession number is required.');
      return;
    }
    try {
      db.addCopy(book.id, accessionNumber, shelfLocation, conditionNotes, user);
      success('Copy Registered', `Accession number ${accessionNumber} added to stock.`);
      setAccessionNumber('');
      setConditionNotes('');
      setShowAddForm(false);
      onRefresh();
    } catch (err: any) {
      error('Cannot Add Copy', err.message);
    }
  };

  const handleUpdateStatus = (copyId: string) => {
    try {
      db.updateCopyStatus(copyId, newStatus, editNotes, user);
      success('Status Updated', `Physical copy status changed to ${newStatus}.`);
      setEditingCopyId(null);
      onRefresh();
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  const getStatusBadge = (status: CopyStatus) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">Available</Badge>;
      case 'issued':
        return <Badge variant="info">On Loan</Badge>;
      case 'damaged':
        return <Badge variant="warning">Damaged</Badge>;
      case 'lost':
        return <Badge variant="danger">Lost</Badge>;
      case 'withdrawn':
        return <Badge variant="default">Withdrawn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Physical Copies — ${book.title}`}
      subtitle={`ISBN: ${book.isbn} • Total Registered Copies: ${copies.length}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <span className="text-xs font-semibold text-slate-700">Accession Register</span>
            <p className="text-[11px] text-slate-500">Each physical book has a distinct institutional accession number</p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {showAddForm ? 'Cancel' : 'Add Physical Copy'}
          </Button>
        </div>

        {/* Add Copy Form */}
        {showAddForm && (
          <form onSubmit={handleAddCopy} className="p-4 bg-teal-50/50 rounded-lg border border-teal-200 space-y-3">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Register New Accession Unit
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Unique Accession Number"
                placeholder="e.g. ESIC-ANAT-2024-009"
                value={accessionNumber}
                onChange={e => setAccessionNumber(e.target.value)}
                required
              />
              <Input
                label="Physical Shelf Location"
                placeholder="e.g. Shelf A-01 / Rack 02"
                value={shelfLocation}
                onChange={e => setShelfLocation(e.target.value)}
              />
            </div>
            <Input
              label="Initial Condition / Notes"
              placeholder="e.g. Brand new hardbound copy"
              value={conditionNotes}
              onChange={e => setConditionNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Save Physical Copy
              </Button>
            </div>
          </form>
        )}

        {/* Copies Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Accession Number</th>
                <th className="px-3 py-2 text-left font-semibold">Barcode</th>
                <th className="px-3 py-2 text-left font-semibold">Location</th>
                <th className="px-3 py-2 text-left font-semibold">Condition</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {copies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                    No physical copies registered for this title yet.
                  </td>
                </tr>
              ) : (
                copies.map(copy => {
                  const isEditing = editingCopyId === copy.id;
                  return (
                    <tr key={copy.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-3 py-2.5 font-mono font-semibold text-slate-900">
                        {copy.accession_number}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-500">
                        {copy.barcode || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {copy.shelf_location || 'General Stacks'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 max-w-[150px] truncate" title={copy.condition_notes}>
                        {copy.condition_notes || 'Good'}
                      </td>
                      <td className="px-3 py-2.5">
                        {getStatusBadge(copy.status)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {copy.status === 'issued' ? (
                          <span className="text-[11px] text-slate-400 italic">Issued (In Circulation)</span>
                        ) : isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <select
                              value={newStatus}
                              onChange={e => setNewStatus(e.target.value as CopyStatus)}
                              className="text-xs border rounded px-1.5 py-1 bg-white"
                            >
                              <option value="available">Available</option>
                              <option value="damaged">Damaged</option>
                              <option value="lost">Lost</option>
                              <option value="withdrawn">Withdrawn</option>
                            </select>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleUpdateStatus(copy.id)}
                              className="text-xs px-2 py-1"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingCopyId(null)}
                              className="text-xs px-1.5 py-1"
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingCopyId(copy.id);
                              setNewStatus(copy.status);
                              setEditNotes(copy.condition_notes || '');
                            }}
                            className="text-teal-700 hover:text-teal-900 font-medium text-xs hover:underline"
                          >
                            Update Status
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1 text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Physical copies with historical loans cannot be deleted to preserve audit integrity.
          </span>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
