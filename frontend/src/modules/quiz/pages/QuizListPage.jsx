import { Plus, Eye, CheckCircle2, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getMyQuizzes } from '../services/quizService';

import { Button } from '@/core/components/Button';
import { Card } from '@/core/components/Card';
import { SectionHeader } from '@/core/components/SectionHeader';


const statusConfig = {
  draft: { label: 'Draft', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  live: { label: 'Live', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-gray-600 bg-gray-100' },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default function QuizListPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyQuizzes()
      .then(setQuizzes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <SectionHeader
        title="My Quizzes"
        description="Create and manage quizzes for your classes"
        action={
          <Button onClick={() => navigate('/quizzes/create')}>
            <Plus className="w-4 h-4 mr-1" />
            Create Quiz
          </Button>
        }
      />

      {quizzes.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No quizzes yet</p>
          <p className="text-sm mt-1">Create your first quiz to get started</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/quizzes/${quiz.id}`)}
            >
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                <p className="text-sm text-gray-500">
                  {quiz.classId} · Section {quiz.section} · {quiz.subjectId}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={quiz.status} />
                <Eye className="w-4 h-4 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}