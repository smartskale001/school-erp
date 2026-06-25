import { UserPlus, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { SectionHeader } from '@/core/components/SectionHeader';
import { sectionsService } from '@/modules/class-management/services/sectionsService';

import { studentsService } from '../services/studentsService';

const EMPTY_FORM = {
  fullName: '',
  dateOfBirth: '',
  sectionId: '',
  gender: '',
  rollNo: '',
  admissionDate: '',
  email: '',
  guardianName: '',
  guardianPhone: '',
  guardianEmail: '',
  contactPhone: '',
  address: '',
  bloodGroup: '',
};

const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
const inputCls =
  'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none';

function Field({ label, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

export default function StudentEnrollmentPage() {
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    sectionsService
      .list()
      .then((data) => setSections(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load class-sections.'));
  }, []);

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // Build a payload that omits empty optional fields (the strict backend
  // ValidationPipe rejects empty values for typed optional fields like email).
  const buildPayload = () => {
    const payload = {
      fullName: form.fullName.trim(),
      dateOfBirth: form.dateOfBirth,
      sectionId: form.sectionId,
    };
    const optional = {
      gender: form.gender,
      admissionDate: form.admissionDate,
      email: form.email.trim(),
      guardianName: form.guardianName.trim(),
      guardianPhone: form.guardianPhone.trim(),
      guardianEmail: form.guardianEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      address: form.address.trim(),
      bloodGroup: form.bloodGroup.trim(),
    };
    Object.entries(optional).forEach(([k, v]) => {
      if (v) payload[k] = v;
    });
    if (form.rollNo !== '') payload.rollNo = Number(form.rollNo);
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setSubmitting(true);
    try {
      const res = await studentsService.create(buildPayload());
      setResult(res);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || 'Failed to enroll student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <SectionHeader
        className="mb-4"
        title="Enroll Student"
        description="Admit a new student — the system issues a permanent Admission Number and login."
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {result && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-2">
            <CheckCircle2 size={18} /> {result.fullName} enrolled successfully
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-emerald-900">
            <div>
              <span className="text-emerald-700">Admission Number:</span>{' '}
              <span className="font-mono font-semibold">{result.admissionNo}</span>
            </div>
            <div>
              <span className="text-emerald-700">Roll Number:</span>{' '}
              <span className="font-semibold">{result.rollNo}</span>
            </div>
            <div>
              <span className="text-emerald-700">Class / Section:</span>{' '}
              <span className="font-semibold">{result.className} - {result.section}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-700">Temp password:</span>{' '}
              <span className="font-mono font-semibold">{result.tempPassword}</span>
              <button
                type="button"
                title="Copy"
                onClick={() => navigator.clipboard?.writeText(result.tempPassword)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <Copy size={13} />
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-emerald-700">
            The student logs in with the Admission Number and this password, and must change it on
            first login.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-5"
      >
        {/* Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name *">
            <input className={inputCls} value={form.fullName} onChange={setField('fullName')} required />
          </Field>
          <Field label="Date of Birth *">
            <input type="date" className={inputCls} value={form.dateOfBirth} onChange={setField('dateOfBirth')} required />
          </Field>
          <Field label="Class - Section *">
            <select className={inputCls} value={form.sectionId} onChange={setField('sectionId')} required>
              <option value="">-- Select section --</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.className} - {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Roll Number">
            <input type="number" min="1" placeholder="Auto-assigned if blank" className={inputCls} value={form.rollNo} onChange={setField('rollNo')} />
          </Field>
          <Field label="Gender">
            <select className={inputCls} value={form.gender} onChange={setField('gender')}>
              <option value="">-- Select --</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Admission Date">
            <input type="date" className={inputCls} value={form.admissionDate} onChange={setField('admissionDate')} />
          </Field>
          <Field label="Blood Group">
            <input placeholder="e.g. O+" className={inputCls} value={form.bloodGroup} onChange={setField('bloodGroup')} />
          </Field>
          <Field label="Student Email">
            <input type="email" className={inputCls} value={form.email} onChange={setField('email')} />
          </Field>
        </div>

        {/* Guardian / contact */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Guardian &amp; Contact
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Guardian Name">
              <input className={inputCls} value={form.guardianName} onChange={setField('guardianName')} />
            </Field>
            <Field label="Guardian Phone">
              <input className={inputCls} value={form.guardianPhone} onChange={setField('guardianPhone')} />
            </Field>
            <Field label="Guardian Email">
              <input type="email" className={inputCls} value={form.guardianEmail} onChange={setField('guardianEmail')} />
            </Field>
            <Field label="Contact Phone">
              <input className={inputCls} value={form.contactPhone} onChange={setField('contactPhone')} />
            </Field>
            <Field label="Address" className="md:col-span-2">
              <textarea rows={2} className={inputCls} value={form.address} onChange={setField('address')} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            <UserPlus size={18} />
            {submitting ? 'Enrolling…' : 'Enroll Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
