import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Send, CheckCircle2, HelpCircle, Type, Check } from 'lucide-react';
import { Button } from '@/core/components/Button';
import { Card } from '@/core/components/Card';
import { Input } from '@/core/components/Input';
import { SectionHeader } from '@/core/components/SectionHeader';
import { toast } from 'sonner';
import { getQuizById, addQuestion, publishQuiz } from '../services/teacherquizService';

const questionTypeLabels = {
  mcq_single: { label: 'MCQ', icon: HelpCircle },
  true_false: { label: 'True/False', icon: Check },
  fill_blank: { label: 'Fill in the Blank', icon: Type },
};

export default function QuizDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [qForm, setQForm] = useState({
    questionType: 'mcq_single',
    questionText: '',
    options: [],
    correctAnswer: '',
    marks: 1,
  });

  useEffect(() => {
    getQuizById(id)
      .then(setQuiz)
      .catch(() => toast.error('Quiz not found'))
      .finally(() => setLoading(false));
  }, [id]);

  function handlePublish() {
    setPublishing(true);
    publishQuiz(id)
      .then(() => {
        toast.success('Quiz published!');
        navigate('/quizzes');
      })
      .catch(() => toast.error('Failed to publish'))
      .finally(() => setPublishing(false));
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    try {
      const updated = await addQuestion(id, qForm);
      setQuiz((prev) => ({
        ...prev,
        questions: [...(prev.questions || []), updated],
      }));
      setQForm({ questionType: 'mcq_single', questionText: '', options: [], correctAnswer: '', marks: 1 });
      setShowForm(false);
      toast.success('Question added');
    } catch {
      toast.error('Failed to add question');
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center text-gray-500">
        <p>Quiz not found</p>
        <Button variant="outline" onClick={() => navigate('/quizzes')} className="mt-3">Back to Quizzes</Button>
      </div>
    );
  }

  const isDraft = quiz.status === 'draft';

  function QuestionCard({ q, index }) {
    const typeInfo = questionTypeLabels[q.questionType] || questionTypeLabels.mcq_single;
    const Icon = typeInfo.icon;
    return (
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-gray-400 mt-0.5">#{index + 1}</span>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                <Icon className="w-3 h-3" />
                {typeInfo.label}
              </span>
              <span className="text-xs text-gray-400">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-gray-900">{q.questionText}</p>
            {q.options && q.options.length > 0 && (
              <div className="space-y-1 pl-2">
                {q.options.map((opt) => (
                  <p key={opt.id} className={`text-sm ${opt.id === q.correctAnswer ? 'text-emerald-700 font-medium' : 'text-gray-600'}`}>
                    {opt.id}. {opt.text}
                  </p>
                ))}
              </div>
            )}
            {q.correctAnswer && !q.options && (
              <p className="text-sm text-emerald-700">Answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/quizzes')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <SectionHeader title={quiz.title} description={`${quiz.classId} · Section ${quiz.section} · ${quiz.subjectId}`} />
      </div>

      <Card className="p-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Status</p>
          <p className={`font-medium capitalize ${quiz.status === 'live' ? 'text-emerald-700' : 'text-yellow-700'}`}>{quiz.status}</p>
        </div>
        <div>
          <p className="text-gray-500">Scheduled</p>
          <p className="font-medium">{new Date(quiz.scheduledAt).toLocaleDateString()} {new Date(quiz.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div>
          <p className="text-gray-500">Duration</p>
          <p className="font-medium">{quiz.durationMinutes} min</p>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Questions {quiz.questions ? `(${quiz.questions.length})` : ''}
          </h2>
          {isDraft && (
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Question
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="p-4 border-emerald-200 bg-emerald-50/50">
            <form onSubmit={handleAddQuestion} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    value={qForm.questionType}
                    onChange={(e) => setQForm({ ...qForm, questionType: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="mcq_single">MCQ</option>
                    <option value="true_false">True / False</option>
                    <option value="fill_blank">Fill in the Blank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Marks</label>
                  <Input type="number" min={0.5} step={0.5} value={qForm.marks} onChange={(e) => setQForm({ ...qForm, marks: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                <textarea
                  value={qForm.questionText}
                  onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[60px]"
                  required
                />
              </div>
              {qForm.questionType !== 'fill_blank' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Answer</label>
                  <Input value={qForm.correctAnswer} onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })} placeholder="e.g. A (for MCQ) or True/False" required />
                </div>
              )}
              {qForm.questionType === 'fill_blank' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Accepted answers (comma-separated)</label>
                  <Input value={qForm.correctAnswer} onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })} placeholder="e.g. H2O,Water,Hydrogen Oxide" />
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save Question</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {(!quiz.questions || quiz.questions.length === 0) && !showForm && (
          <Card className="p-8 text-center text-gray-400">
            <HelpCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No questions yet</p>
          </Card>
        )}

        {quiz.questions?.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i} />
        ))}
      </div>

      {isDraft && quiz.questions && quiz.questions.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handlePublish} disabled={publishing}>
            <Send className="w-4 h-4 mr-1" />
            {publishing ? 'Publishing...' : 'Publish Quiz'}
          </Button>
        </div>
      )}
    </div>
  );
}