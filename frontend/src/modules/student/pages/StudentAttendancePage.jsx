import React from 'react';
import { CalendarCheck, ClipboardCheck, Download } from 'lucide-react';
import { Card } from '@/core/components/Card';
import { SectionHeader } from '@/core/components/SectionHeader';

const attendanceSummary = {
  totalClasses: 220,
  present: 198,
  absent: 12,
  leave: 10,
  percentage: 90
};

const monthlyAttendance = [
  { month: "January", percentage: 92 },
  { month: "February", percentage: 88 },
  { month: "March", percentage: 91 },
  { month: "April", percentage: 87 },
  { month: "May", percentage: 94 }
];

const subjectWiseAttendance = [
  { subject: "Mathematics", attendance: 95 },
  { subject: "Science", attendance: 89 },
  { subject: "English", attendance: 93 },
  { subject: "Computer", attendance: 90 },
  { subject: "Social Science", attendance: 85 }
];

function getStatusInfo(percentage) {
  if (percentage >= 85) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' };
  if (percentage >= 75) return { label: 'Good', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' };
  return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' };
}

export default function StudentAttendancePage() {
  const overallStatus = getStatusInfo(attendanceSummary.percentage);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <SectionHeader 
          title="My Attendance"
          description="Track your academic attendance and performance"
        />
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          <Download size={16} />
          Download Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm flex flex-col justify-between">
          <div className="text-gray-500 text-sm font-medium mb-1">Attendance</div>
          <div className="flex items-end gap-2">
            <div className={`text-3xl font-bold ${overallStatus.color}`}>
              {attendanceSummary.percentage}%
            </div>
          </div>
          <div className={`mt-2 text-xs font-semibold px-2 py-1 inline-block rounded-full w-max ${overallStatus.bg} ${overallStatus.color}`}>
            {overallStatus.label}
          </div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Total Classes</div>
          <div className="text-3xl font-bold text-gray-900">{attendanceSummary.totalClasses}</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm border-b-4 border-emerald-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Present Days</div>
          <div className="text-3xl font-bold text-emerald-600">{attendanceSummary.present}</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm border-b-4 border-red-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Absent Days</div>
          <div className="text-3xl font-bold text-red-600">{attendanceSummary.absent}</div>
          <div className="text-xs text-gray-400 mt-1">Leaves: {attendanceSummary.leave}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Attendance */}
        <Card className="p-5 col-span-1 lg:col-span-1 bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarCheck size={18} className="text-blue-600" />
            Monthly Progress
          </h2>
          <div className="space-y-4">
            {monthlyAttendance.map((item, idx) => {
              const status = getStatusInfo(item.percentage);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.month}</span>
                    <span className={`font-semibold ${status.color}`}>{item.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${status.bar}`} 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Subject-wise Attendance */}
        <Card className="col-span-1 lg:col-span-2 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-blue-600" />
              Subject-wise Attendance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Subject</th>
                  <th className="p-4 font-semibold">Attendance %</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjectWiseAttendance.map((item, idx) => {
                  const status = getStatusInfo(item.attendance);
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-900">
                        {item.subject}
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-700">
                        {item.attendance}%
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
