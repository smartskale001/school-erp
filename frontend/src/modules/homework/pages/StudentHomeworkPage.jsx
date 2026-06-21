import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { homeworkService } from '../services/homeworkService';

export default function StudentHomeworkPage() {
  const [items, setItems] = useState([]); const [error, setError] = useState('');
  useEffect(() => { homeworkService.getStudentHomework().then(setItems).catch((err) => setError(err.message)); }, []);
  return <div className="mx-auto max-w-5xl space-y-5"><div><h1 className="text-2xl font-bold">Homework</h1><p className="text-sm text-gray-500">Your class homework and deadlines.</p></div>{error && <p className="rounded bg-red-50 p-3 text-red-700">{error}</p>}<div className="grid gap-4">{!items.length && <p className="rounded-xl border bg-white p-8 text-center text-gray-500">No homework assigned.</p>}{items.map((item) => <Link key={item.assignment.id} to={`/student/homework/${item.assignment.id}`} className="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300"><div className="flex justify-between gap-4"><div><h2 className="font-bold">{item.homework.title}</h2><p className="mt-1 text-sm text-gray-500">{item.homework.subjectName} · {item.homework.teacherName}</p></div><span className={`h-fit rounded-full px-2 py-1 text-xs font-semibold ${item.isSubmissionOpen ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>{item.isSubmissionOpen ? item.submissionStatus.replace('_', ' ') : 'Deadline passed'}</span></div><p className="mt-3 text-sm">Due {new Date(item.assignment.deadline).toLocaleString()}</p></Link>)}</div></div>;
}
