import React, { useMemo, useState } from 'react';

import HomeworkAttachmentInput from './HomeworkAttachmentInput';
import SectionMultiSelect from './SectionMultiSelect';

const initial = { title: '', description: '', topic: '', priority: 'medium', submissionType: 'both', classId: '', subjectId: '', sectionIds: [], deadline: '' };

export default function HomeworkForm({ context, onSubmit, submitting }) {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const classes = useMemo(() => [...new Map(context.map((item) => [item.classId, { id: item.classId, name: item.className }])).values()], [context]);
  const subjects = context.filter((item) => item.classId === form.classId).reduce((items, item) => items.some((value) => value.subjectId === item.subjectId) ? items : [...items, item], []);
  const sections = context.filter((item) => item.classId === form.classId && item.subjectId === form.subjectId).map((item) => item.section);
  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const selectClass = (classId) => setForm((previous) => ({ ...previous, classId, subjectId: '', sectionIds: [] }));
  const selectSubject = (subjectId) => setForm((previous) => ({ ...previous, subjectId, sectionIds: [] }));
  const submit = async (event) => {
    event.preventDefault();
    if (!form.sectionIds.length) return;
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, key === 'sectionIds' ? JSON.stringify(value) : key === 'deadline' ? new Date(value).toISOString() : value));
    if (file) payload.append('attachment', file);
    await onSubmit(payload);
    setForm(initial); setFile(null);
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm font-medium text-gray-700">Class<select required value={form.classId} onChange={(event) => selectClass(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 p-2"><option value="">Select class</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Subject<select required disabled={!form.classId} value={form.subjectId} onChange={(event) => selectSubject(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 p-2"><option value="">Select subject</option>{subjects.map((item) => <option key={item.subjectId} value={item.subjectId}>{item.subjectName}</option>)}</select></label>
      </div>
      <div><p className="text-sm font-medium text-gray-700 mb-2">Sections</p><SectionMultiSelect sections={sections} value={form.sectionIds} onChange={(sectionIds) => update('sectionIds', sectionIds)} /></div>
      <label className="block text-sm font-medium text-gray-700">Title<input required value={form.title} onChange={(event) => update('title', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 p-2" /></label>
      <label className="block text-sm font-medium text-gray-700">Topic<input value={form.topic} onChange={(event) => update('topic', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 p-2" /></label>
      <label className="block text-sm font-medium text-gray-700">Instructions<textarea required rows={4} value={form.description} onChange={(event) => update('description', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 p-2" /></label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="text-sm font-medium text-gray-700">Priority<select value={form.priority} onChange={(event) => update('priority', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 p-2"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        <label className="text-sm font-medium text-gray-700">Submission type<select value={form.submissionType} onChange={(event) => update('submissionType', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 p-2"><option value="text">Text</option><option value="file">File</option><option value="both">Text or file</option></select></label>
        <label className="text-sm font-medium text-gray-700">Deadline<input required type="datetime-local" value={form.deadline} onChange={(event) => update('deadline', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 p-2" /></label>
      </div>
      <HomeworkAttachmentInput file={file} onChange={setFile} />
      <button disabled={submitting || !form.sectionIds.length} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{submitting ? 'Publishing…' : 'Publish homework'}</button>
    </form>
  );
}
