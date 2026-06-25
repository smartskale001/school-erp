import { ArrowLeft, Users, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { Input } from '@/core/components/Input';
import { SectionHeader } from '@/core/components/SectionHeader';

import { sectionsService } from '../services/sectionsService';

export default function ClassSectionDetailPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classTeacherId, setClassTeacherId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sec, teacherList] = await Promise.all([
        sectionsService.get(sectionId),
        apiRequest(API_ENDPOINTS.teachers.list).catch(() => []),
      ]);
      setSection(sec);
      setClassTeacherId(sec.classTeacherId || '');
      setCapacity(String(sec.capacity ?? ''));
      setTeachers(Array.isArray(teacherList) ? teacherList : []);
    } catch {
      setError('Failed to load this class-section.');
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      // Homeroom is managed from the Rooms tab — not sent here.
      await sectionsService.update(sectionId, {
        classTeacherId: classTeacherId || null,
        capacity: parseInt(capacity) || 1,
      });
      await load();
      setSaved(true);
    } catch (e) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-400 py-10 text-center">Loading…</div>;
  }

  if (!section) {
    return (
      <div>
        <button onClick={() => navigate('/class-management')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="text-sm text-red-600">{error || 'Class-section not found.'}</div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate('/class-management')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={15} /> Back to Class Management
      </button>

      <SectionHeader
        className="mb-4"
        title={`${section.className} - ${section.name}`}
        description="Assign the class teacher and capacity for this section (homeroom is managed in Rooms)"
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {saved && (
        <div className="mb-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <CheckCircle2 size={15} /> Saved.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class Teacher</label>
            <select
              value={classTeacherId}
              onChange={(e) => setClassTeacherId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">— No class teacher —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Homeroom</label>
            <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700">
              {section.roomName || <span className="text-gray-400">No homeroom</span>}
            </div>
            <p className="text-xs text-gray-400 mt-1">Managed from the Rooms tab.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <Input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 40"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {/* Roster */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-purple-500" />
            <span className="font-semibold text-gray-800">Students</span>
            <span className="ml-auto text-sm text-gray-500">
              {section.studentCount} / {section.capacity}
            </span>
          </div>
          {section.students?.length ? (
            <ul className="space-y-1.5 max-h-80 overflow-auto">
              {section.students.map((st) => (
                <li key={st.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-1.5">
                  <span className="text-gray-700">{st.name}</span>
                  <span className="text-xs text-gray-400">{st.studentId}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-400 text-center py-6">No students in this section yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
