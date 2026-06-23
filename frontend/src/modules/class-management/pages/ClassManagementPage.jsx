import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Home, ChevronRight, AlertCircle } from 'lucide-react';
import { SectionHeader } from '@/core/components/SectionHeader';
import { sectionsService } from '../services/sectionsService';

export default function ClassManagementPage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    sectionsService
      .list()
      .then((data) => setSections(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load class-sections.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <SectionHeader
        className="mb-4"
        title="Class Management"
        description="Manage every class-section — assign class teachers, homerooms and view student counts"
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-400 py-10 text-center">Loading…</div>
      ) : sections.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-12 border border-dashed border-gray-200 rounded-xl">
          No class-sections yet. Create classes &amp; sections from the Classes page first.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => navigate(`/class-management/${encodeURIComponent(s.id)}`)}
              className="text-left bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{s.className} - {s.name}</div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <UserCheck size={14} className="text-emerald-600" />
                  {s.classTeacherName || <span className="text-gray-400">No class teacher</span>}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Home size={14} className="text-blue-500" />
                  {s.roomName || <span className="text-gray-400">No homeroom</span>}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={14} className="text-purple-500" />
                  {s.studentCount} / {s.capacity} students
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
