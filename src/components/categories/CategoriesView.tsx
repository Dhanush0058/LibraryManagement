import React, { useState } from 'react';
import { Layers, Plus, Tag } from 'lucide-react';
import { db } from '../../services/db';
import { Category } from '../../types';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CategoriesView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [refresh, setRefresh] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const categories = db.getCategories();
  const books = db.getBooks();

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setCode('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setCode(cat.code);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      error('Validation Error', 'Category name and unique code are required.');
      return;
    }

    try {
      db.saveCategory(
        {
          id: editingCategory?.id,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim(),
        },
        user
      );
      success(
        editingCategory ? 'Category Updated' : 'Category Created',
        `Category ${name} is active in library catalog.`
      );
      setIsModalOpen(false);
      setRefresh(r => r + 1);
    } catch (err: any) {
      error('Cannot Save Category', err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-700" />
            Medical Book Classifications & Categories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organizes pre-clinical, para-clinical, clinical, and reference medical collections
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={handleOpenAdd} className="text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Classification
        </Button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const matchingBooks = books.filter(b => b.category_id === cat.id);
          const totalCopies = matchingBooks.reduce((s, b) => s + (b.total_copies || 0), 0);

          return (
            <div
              key={cat.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {cat.code}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="text-xs text-slate-400 hover:text-teal-700 transition"
                  >
                    Edit
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mt-2">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>{matchingBooks.length} Titles Catalogued</span>
                <span className="font-semibold text-teal-800">{totalCopies} Copies</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Edit Category' : 'Create Medical Category'}
          subtitle="Configure category code and description"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Classification Name"
              placeholder="e.g. Critical Care & Emergency Medicine"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              label="Unique Classification Code"
              placeholder="e.g. CAT-CRIT-MED"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
            />
            <Textarea
              label="Description"
              placeholder="Scope of medical subjects under this category..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Category
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
