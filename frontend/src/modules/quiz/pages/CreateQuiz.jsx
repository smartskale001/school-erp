import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/core/components/Button';
import { Card } from '@/core/components/Card';
import { Input } from '@/core/components/Input';
import { SectionHeader } from '@/core/components/SectionHeader';
import { toast } from 'sonner';
import { createQuiz } from '../services/quizService';

const classes = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'];
const sections = ['A','B','C'];
const subjects = ['Mathematics','Science','English','Hindi','Physics','Chemistry','Biology','Social Studies','Computer','EVS'];

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    classId: '',
    section: '',
    subjectId: '',
    scheduledDate: '',
    startTime: '',
    durationMinutes: 30,
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }


  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const quiz = await createQuiz(form);
      toast.success('Quiz created!');
      navigate(`/quizzes/${quiz.id}`);
    } catch {
      toast.error('Failed to create quiz');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <SectionHeader
        title="Create Quiz"
        description="Fill in the details to create a new draft quiz"
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Science Chapter 3 Quiz"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={form.classId}
                onChange={(e) => update('classId', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select class</option>
                {classes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                value={form.section}
                onChange={(e) => update('section', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select section</option>
                {sections.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={form.subjectId}
                onChange={(e) => update('subjectId', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => update('scheduledDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => update('startTime', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
              <Input
                type="number"
                min={5}
                max={180}
                value={form.durationMinutes}
                onChange={(e) => update('durationMinutes', Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Quiz'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/quizzes')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}