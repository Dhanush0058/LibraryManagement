import React, { useState, useEffect } from 'react';
import { GraduationCap, Stethoscope } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Member, MemberType, MemberStatus } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
  onSuccess: () => void;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const departments = db.getDepartments();
  const settings = db.getSettings();

  const [memberType, setMemberType] = useState<MemberType>('student');
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [course, setCourse] = useState('MBBS');
  const [academicYear, setAcademicYear] = useState('1st Year');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<MemberStatus>('active');
  const [maxBorrowLimit, setMaxBorrowLimit] = useState('3');

  useEffect(() => {
    if (memberToEdit) {
      setMemberType(memberToEdit.member_type);
      setIdentifier(memberToEdit.identifier);
      setFullName(memberToEdit.full_name);
      setDepartmentId(memberToEdit.department_id);
      setCourse(memberToEdit.course || 'MBBS');
      setAcademicYear(memberToEdit.academic_year || '1st Year');
      setDesignation(memberToEdit.designation || '');
      setPhone(memberToEdit.phone);
      setEmail(memberToEdit.email);
      setStatus(memberToEdit.status);
      setMaxBorrowLimit(String(memberToEdit.max_borrow_limit));
    } else {
      setMemberType('student');
      setIdentifier('');
      setFullName('');
      setDepartmentId(departments[0]?.id || '');
      setCourse('MBBS');
      setAcademicYear('1st Year');
      setDesignation('');
      setPhone('');
      setEmail('');
      setStatus('active');
      setMaxBorrowLimit(String(settings.student_borrow_limit));
    }
  }, [memberToEdit, isOpen]);

  const handleTypeChange = (type: MemberType) => {
    setMemberType(type);
    if (!memberToEdit) {
      setMaxBorrowLimit(String(type === 'staff' ? settings.staff_borrow_limit : settings.student_borrow_limit));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !fullName.trim() || !phone.trim() || !email.trim()) {
      error('Validation Error', 'Identifier, Full Name, Phone, and Email are mandatory.');
      return;
    }

    try {
      db.saveMember(
        {
          id: memberToEdit ? memberToEdit.id : undefined,
          member_type: memberType,
          identifier: identifier.trim(),
          full_name: fullName.trim(),
          department_id: departmentId || departments[0]?.id,
          course: memberType === 'student' ? course : undefined,
          academic_year: memberType === 'student' ? academicYear : undefined,
          designation: memberType === 'staff' ? designation.trim() : undefined,
          phone: phone.trim(),
          email: email.trim(),
          status,
          max_borrow_limit: parseInt(maxBorrowLimit, 10) || 3,
        },
        user
      );

      success(
        memberToEdit ? 'Member Updated' : 'Member Registered',
        `${fullName} (${identifier}) has been saved in library roster.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Cannot Register Member', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Edit Library Membership' : 'Register New Member'}
      subtitle="ESIC Medical College & Hospital student or faculty record"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Member Type Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Membership Classification
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('student')}
              className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                memberType === 'student'
                  ? 'bg-coral-50 border-coral-500 text-coral-800 ring-1 ring-coral-500'
                  : 'bg-white border-parchment-200 text-charcoal-600 hover:bg-parchment-50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-coral-600" />
              <span>Student (MBBS / PG)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('staff')}
              className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                memberType === 'staff'
                  ? 'bg-coral-50 border-coral-500 text-coral-800 ring-1 ring-coral-500'
                  : 'bg-white border-parchment-200 text-charcoal-600 hover:bg-parchment-50'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-coral-600" />
              <span>Faculty / Hospital Staff</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={memberType === 'student' ? 'Student ID / Roll Number' : 'Employee ID'}
            placeholder={memberType === 'student' ? 'e.g. ESIC/MBBS/2023/042' : 'e.g. EMP-MED-104'}
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
          />

          <Input
            label="Full Name"
            placeholder={memberType === 'student' ? 'e.g. Rahul Sharma' : 'e.g. Dr. Priya Rao'}
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />

          <Select
            label="Medical Department"
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </Select>

          {memberType === 'student' ? (
            <>
              <Select
                label="Enrolled Medical Course"
                value={course}
                onChange={e => setCourse(e.target.value)}
              >
                <option value="MBBS">MBBS (Undergraduate)</option>
                <option value="MD (General Medicine)">MD (General Medicine)</option>
                <option value="MS (General Surgery)">MS (General Surgery)</option>
                <option value="MD (Pathology)">MD (Pathology)</option>
                <option value="MD (Physiology)">MD (Physiology)</option>
                <option value="B.Sc. Nursing">B.Sc. Nursing</option>
                <option value="Paramedical Diploma">Paramedical Diploma</option>
              </Select>

              <Select
                label="Academic Year"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
              >
                <option value="1st Year">1st Year (Phase I)</option>
                <option value="2nd Year">2nd Year (Phase II)</option>
                <option value="3rd Year (Part 1)">3rd Year (Phase III Part 1)</option>
                <option value="Final Year (Part 2)">Final Year (Phase III Part 2)</option>
                <option value="Internship (CRMI)">CRMI (Compulsory Rotatory Internship)</option>
                <option value="PG Resident">Postgraduate Resident</option>
              </Select>
            </>
          ) : (
            <Input
              label="Designation / Post"
              placeholder="e.g. Associate Professor / Senior Resident"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              required
            />
          )}

          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. +91 98490 12345"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />

          <Input
            label="Official Email Address"
            type="email"
            placeholder="name@esic.edu.in"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <Select
            label="Membership Status"
            value={status}
            onChange={e => setStatus(e.target.value as MemberStatus)}
          >
            <option value="active">Active (Eligible for borrowing)</option>
            <option value="suspended">Suspended (Borrowing restricted)</option>
            <option value="graduated">Graduated / Relieved</option>
          </Select>

          <Input
            label="Max Concurrent Book Loans"
            type="number"
            min="1"
            max="10"
            value={maxBorrowLimit}
            onChange={e => setMaxBorrowLimit(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {memberToEdit ? 'Save Member' : 'Register Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
