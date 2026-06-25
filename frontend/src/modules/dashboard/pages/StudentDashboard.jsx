import { CalendarDays, ClipboardList, CheckCircle, Clock, MapPin } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Card } from '@/core/components/Card';
import { SectionHeader } from '@/core/components/SectionHeader';
import { useAuth } from '@/core/context/AuthContext';
import {
  getPeriodsFromSlots,
  getWorkingDays,
  normalizeGridsForPeriods,
} from '@/modules/timetable/periodUtils';
import { getStudentTimetable } from '@/modules/timetable/services/timetableService';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState([]);          // today's filled periods
  const [status, setStatus] = useState('');        // empty-state message
  const todayShort = DAY_SHORT[new Date().getDay()];

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getStudentTimetable();
        if (!active) return;
        if (!res || !res.grids || !res.classId) {
          setStatus('No published timetable yet.');
          setToday([]);
          return;
        }
        const periods = getPeriodsFromSlots();
        const days = getWorkingDays();
        const grid = normalizeGridsForPeriods(res.grids, periods, days)[res.classId];
        const dayIndex = days.indexOf(todayShort);

        if (!grid || dayIndex === -1) {
          setStatus('No classes scheduled today.');
          setToday([]);
          return;
        }

        const list = [];
        periods.forEach((period, pi) => {
          if (period.break) return;
          const cell = grid[pi]?.[dayIndex];
          if (cell && (cell.type === 'filled' || cell.type === 'proxy')) {
            list.push({
              key: `${pi}`,
              time: period.time,
              label: period.label,
              subject: cell.subject,
              teacher: cell.teacher,
              room: cell.room,
              isProxy: cell.type === 'proxy',
            });
          }
        });
        setToday(list);
        setStatus(list.length ? '' : 'No classes scheduled today.');
      } catch {
        if (active) {
          setStatus('Could not load your timetable. Please try again later.');
          setToday([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [todayShort]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <SectionHeader
        title={`Welcome back, ${userProfile?.fullName || 'Student'}!`}
        description="Here is your overview for today."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-sm flex items-center gap-4 border-l-4 border-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Student ID</div>
            <div className="text-lg font-semibold text-gray-900">{userProfile?.studentId || 'N/A'}</div>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-sm flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CalendarDays size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Class</div>
            <div className="text-lg font-semibold text-gray-900">{userProfile?.className || 'N/A'}</div>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-sm flex items-center gap-4 border-l-4 border-amber-500">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Section</div>
            <div className="text-lg font-semibold text-gray-900">{userProfile?.section || 'N/A'}</div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h2 className="text-lg font-semibold text-gray-800">My Timetable</h2>
            <span className="text-sm text-gray-500">Today ({todayShort})</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : today.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <CalendarDays size={48} className="text-gray-300 mb-3" />
              <p>{status || 'No classes scheduled today.'}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {today.map((slot) => (
                <li key={slot.key} className="flex items-center gap-4 py-3">
                  <div className="flex items-center gap-2 w-32 shrink-0 text-sm text-gray-500">
                    <Clock size={14} className="text-gray-400" />
                    <span>{slot.time || slot.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {slot.subject}
                      {slot.isProxy && (
                        <span className="text-[10px] uppercase tracking-wide bg-yellow-100 text-yellow-700 rounded px-1.5 py-0.5">
                          Proxy
                        </span>
                      )}
                    </div>
                    {slot.teacher && <div className="text-sm text-gray-500 truncate">{slot.teacher}</div>}
                  </div>
                  {slot.room && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
                      <MapPin size={14} className="text-gray-400" />
                      {slot.room}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
