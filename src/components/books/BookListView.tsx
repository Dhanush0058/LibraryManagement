import React, { useState } from 'react';
import { 
  BookOpen, Plus, Search, Filter, Download, FileText, 
  Copy, Edit, Trash2, Layers
} from 'lucide-react';
import { db } from '../../services/db';
import { Book } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BookFormModal } from './BookFormModal';
import { BookCopiesModal } from './BookCopiesModal';
import { BookCsvModal } from './BookCsvModal';
import { exportToCsv, generateInventoryPdf } from '../../services/reports';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const BookListView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'low'>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCopiesOpen, setIsCopiesOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  const books = db.getBooks();
  const categories = db.getCategories();

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Filters
  const filteredBooks = books.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.subject && b.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.shelf_number && b.shelf_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || b.category_id === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'available') {
      matchesStock = (b.available_copies || 0) > 0;
    } else if (stockFilter === 'low') {
      matchesStock = (b.available_copies || 0) <= 1;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleDeleteBook = (b: Book) => {
    if (!window.confirm(`Are you sure you want to remove "${b.title}" from the catalog? This is irreversible.`)) {
      return;
    }
    try {
      db.deleteBook(b.id, user);
      success('Book Removed', `"${b.title}" has been deleted from catalog.`);
      triggerRefresh();
    } catch (err: any) {
      error('Cannot Delete Book', err.message);
    }
  };

  const handleExportCsv = () => {
    const exportData = filteredBooks.map(b => ({
      Title: b.title,
      ISBN: b.isbn,
      Author: b.author,
      Publisher: b.publisher,
      Edition: b.edition || '',
      Category: b.category?.name || 'General',
      Subject: b.subject || '',
      Shelf: b.shelf_number || '',
      Rack: b.rack_number || '',
      TotalCopies: b.total_copies || 0,
      AvailableCopies: b.available_copies || 0,
      PurchasePrice: b.purchase_price || 0,
      PurchaseDate: b.purchase_date || '',
    }));
    exportToCsv('ESIC_Medical_Books_Inventory', exportData);
    success('Inventory Exported', 'CSV file downloaded successfully.');
  };

  return (
    <div className="space-y-5">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-coral-600" />
            Medical Book Catalog & Physical Stock
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {books.length} titles catalogued • Real-time accession tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => generateInventoryPdf(filteredBooks)}
            className="text-xs"
          >
            <FileText className="w-3.5 h-3.5 mr-1 text-rose-600" /> Official PDF
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCsvOpen(true)}
            className="text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1 text-coral-500" /> Bulk CSV Import
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setActiveBook(null);
              setIsFormOpen(true);
            }}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add New Book
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN, subject, shelf..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-coral-500"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-coral-500 bg-white"
          >
            <option value="all">All Classifications</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-coral-500 bg-white"
          >
            <option value="all">All Stock Statuses</option>
            <option value="available">Available in Rack Only</option>
            <option value="low">Low / Zero Available Stock</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Book Details</th>
                <th className="px-3 py-3 text-left font-semibold">Author & Publisher</th>
                <th className="px-3 py-3 text-left font-semibold">Classification</th>
                <th className="px-3 py-3 text-left font-semibold">Location</th>
                <th className="px-3 py-3 text-center font-semibold">Copies (Avail / Total)</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No medical textbooks match your search filters.
                  </td>
                </tr>
              ) : (
                filteredBooks.map(book => {
                  const avail = book.available_copies || 0;
                  const total = book.total_copies || 0;

                  return (
                    <tr key={book.id} className="hover:bg-slate-50/70 transition">
                      {/* Book info */}
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-14 rounded-lg bg-charcoal-900 border border-parchment-200 overflow-hidden shadow-xs flex-shrink-0 relative group">
                            {book.cover_url ? (
                              <img
                                src={book.cover_url}
                                alt={book.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                  (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`${book.cover_url ? 'hidden' : ''} w-full h-full bg-gradient-to-b from-charcoal-800 to-charcoal-950 p-1 flex flex-col justify-between items-center text-center`}>
                              <span className="text-[8px] font-mono font-bold text-coral-400 uppercase tracking-tighter truncate w-full">
                                {book.subject?.substring(0, 4) || 'MED'}
                              </span>
                              <BookOpen className="w-3.5 h-3.5 text-parchment-300" />
                              <span className="w-full h-0.5 bg-coral-500 rounded-full"></span>
                            </div>
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-charcoal-900 line-clamp-1 text-xs hover:text-coral-600 transition" title={book.title}>
                              {book.title}
                            </h4>
                            <p className="text-[11px] font-mono text-charcoal-500 mt-0.5">ISBN: {book.isbn}</p>
                            {book.edition && (
                              <span className="text-[10px] text-coral-800 bg-coral-50 px-2.5 py-0.5 rounded-full border border-coral-200 font-semibold mt-1 inline-block">
                                {book.edition}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-3 py-3 text-slate-600">
                        <div className="truncate max-w-[170px]" title={book.author}>
                          <span className="font-medium text-slate-800">{book.author}</span>
                          <span className="block text-[11px] text-slate-500 truncate">{book.publisher}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3">
                        <Badge variant="purple">{book.category?.name || 'General'}</Badge>
                        {book.subject && (
                          <span className="block text-[10px] text-slate-500 mt-1 truncate max-w-[120px]">
                            {book.subject}
                          </span>
                        )}
                      </td>

                      {/* Shelf location */}
                      <td className="px-3 py-3 text-slate-600 font-mono text-[11px]">
                        <div>{book.shelf_number || 'Shelf unassigned'}</div>
                        <div className="text-slate-400 text-[10px]">{book.rack_number}</div>
                      </td>

                      {/* Physical Copies Stock */}
                      <td className="px-3 py-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              avail > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {avail}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-700 font-medium">{total}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {total - avail > 0 ? `${total - avail} borrowed` : 'all in stock'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage Copies */}
                          <button
                            onClick={() => {
                              setActiveBook(book);
                              setIsCopiesOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-coral-50 text-slate-700 hover:text-coral-700 text-[11px] font-medium transition"
                            title="Manage physical copies & accession numbers"
                          >
                            <Copy className="w-3 h-3 text-coral-500" />
                            <span>Copies</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setActiveBook(book);
                              setIsFormOpen(true);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Edit book details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteBook(book)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <BookFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          bookToEdit={activeBook}
          onSuccess={triggerRefresh}
        />
      )}

      {isCopiesOpen && activeBook && (
        <BookCopiesModal
          isOpen={isCopiesOpen}
          onClose={() => setIsCopiesOpen(false)}
          book={activeBook}
          onRefresh={triggerRefresh}
        />
      )}

      {isCsvOpen && (
        <BookCsvModal
          isOpen={isCsvOpen}
          onClose={() => setIsCsvOpen(false)}
          onSuccess={triggerRefresh}
        />
      )}
    </div>
  );
};
