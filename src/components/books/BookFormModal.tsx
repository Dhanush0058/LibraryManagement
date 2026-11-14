import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Book } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
  onSuccess: () => void;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  bookToEdit,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const categories = db.getCategories();

  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [edition, setEdition] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState('English');
  const [shelfNumber, setShelfNumber] = useState('');
  const [rackNumber, setRackNumber] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');

  // Initial copies creation (when adding new title)
  const [initialCopies, setInitialCopies] = useState('1');
  const [accessionPrefix, setAccessionPrefix] = useState('ESIC-MED-2024');

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title || '');
      setIsbn(bookToEdit.isbn || '');
      setAuthor(bookToEdit.author || '');
      setPublisher(bookToEdit.publisher || '');
      setEdition(bookToEdit.edition || '');
      setPublicationYear(bookToEdit.publication_year ? String(bookToEdit.publication_year) : '');
      setCategoryId(bookToEdit.category_id || (categories[0]?.id ?? ''));
      setSubject(bookToEdit.subject || '');
      setLanguage(bookToEdit.language || 'English');
      setShelfNumber(bookToEdit.shelf_number || '');
      setRackNumber(bookToEdit.rack_number || '');
      setPurchasePrice(bookToEdit.purchase_price ? String(bookToEdit.purchase_price) : '');
      setPurchaseDate(bookToEdit.purchase_date || '');
      setCoverUrl(bookToEdit.cover_url || '');
      setDescription(bookToEdit.description || '');
    } else {
      setTitle('');
      setIsbn('');
      setAuthor('');
      setPublisher('');
      setEdition('');
      setPublicationYear(String(new Date().getFullYear()));
      setCategoryId(categories[0]?.id || '');
      setSubject('');
      setLanguage('English');
      setShelfNumber('');
      setRackNumber('');
      setPurchasePrice('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setCoverUrl('');
      setDescription('');
      setInitialCopies('2');
      setAccessionPrefix(`ESIC-MED-${new Date().getFullYear()}`);
    }
  }, [bookToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !isbn.trim() || !author.trim() || !publisher.trim()) {
      error('Validation Error', 'Title, ISBN, Author, and Publisher are required fields.');
      return;
    }

    try {
      const bookData: Partial<Book> = {
        id: bookToEdit ? bookToEdit.id : undefined,
        title: title.trim(),
        isbn: isbn.trim(),
        author: author.trim(),
        publisher: publisher.trim(),
        edition: edition.trim(),
        publication_year: publicationYear ? parseInt(publicationYear, 10) : undefined,
        category_id: categoryId,
        subject: subject.trim(),
        language: language.trim(),
        shelf_number: shelfNumber.trim(),
        rack_number: rackNumber.trim(),
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : 0,
        purchase_date: purchaseDate,
        cover_url: coverUrl.trim() || undefined,
        description: description.trim(),
      };

      const copiesCount = bookToEdit ? 0 : parseInt(initialCopies, 10) || 0;
      db.saveBook(bookData, copiesCount, accessionPrefix, user);

      success(
        bookToEdit ? 'Book Updated' : 'Book Registered',
        `${title} has been successfully saved in catalog.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Cannot Save Book', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bookToEdit ? 'Edit Medical Textbook' : 'Register New Medical Book'}
      subtitle="Cataloging record in ESIC Central Medical Library"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Book Title"
              placeholder="e.g. Robbins & Cotran Pathologic Basis of Disease"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <Input
            label="ISBN / ISSN"
            placeholder="e.g. 978-0323531139"
            value={isbn}
            onChange={e => setIsbn(e.target.value)}
            required
          />

          <Input
            label="Author(s)"
            placeholder="e.g. Vinay Kumar, Abul K. Abbas"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            required
          />

          <Input
            label="Publisher"
            placeholder="e.g. Elsevier Health / Jaypee Brothers"
            value={publisher}
            onChange={e => setPublisher(e.target.value)}
            required
          />

          <Input
            label="Edition"
            placeholder="e.g. 10th South Asia Edition"
            value={edition}
            onChange={e => setEdition(e.target.value)}
          />

          <Input
            label="Publication Year"
            type="number"
            placeholder="e.g. 2023"
            value={publicationYear}
            onChange={e => setPublicationYear(e.target.value)}
          />

          <Select
            label="Medical Classification / Category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </Select>

          <Input
            label="Medical Subject"
            placeholder="e.g. Pathology / Anatomy / Pediatrics"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />

          <Input
            label="Language"
            placeholder="e.g. English"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          />

          <Input
            label="Shelf Number"
            placeholder="e.g. Shelf B-04"
            value={shelfNumber}
            onChange={e => setShelfNumber(e.target.value)}
          />

          <Input
            label="Rack Number"
            placeholder="e.g. Rack 12"
            value={rackNumber}
            onChange={e => setRackNumber(e.target.value)}
          />

          <Input
            label="Purchase Date"
            type="date"
            value={purchaseDate}
            onChange={e => setPurchaseDate(e.target.value)}
          />

          <Input
            label="Purchase Price (₹ INR)"
            type="number"
            step="0.01"
            placeholder="e.g. 3450.00"
            value={purchasePrice}
            onChange={e => setPurchasePrice(e.target.value)}
          />

          <div className="md:col-span-2">
            <Input
              label="Cover Image URL (Optional)"
              placeholder="https://..."
              value={coverUrl}
              onChange={e => setCoverUrl(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Description / Abstract"
              placeholder="Brief summary of clinical content or topics covered..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Initial Copies section for new books */}
        {!bookToEdit && (
          <div className="p-4 bg-teal-50/60 rounded-lg border border-teal-200 mt-2 space-y-3">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wide">
              Initial Physical Stock Setup
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Number of Physical Copies to Inward"
                type="number"
                min="0"
                max="50"
                value={initialCopies}
                onChange={e => setInitialCopies(e.target.value)}
                helperText="Auto-generates individual physical accession records"
              />
              <Input
                label="Accession Number Prefix"
                placeholder="e.g. ESIC-PATH-2024"
                value={accessionPrefix}
                onChange={e => setAccessionPrefix(e.target.value)}
                helperText="e.g. ESIC-PATH-2024-001, -002, etc."
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {bookToEdit ? 'Save Changes' : 'Register Book & Inward Copies'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
