// src/pages/student/quizzes/StudentQuizResultPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizResult } from '../services/studentquizService';
import { Card } from '@/core/components/Card';
import { Button } from '@/core/components/Button';
import { CheckCircle2, XCircle, Clock, ArrowLeft, Trophy } from 'lucide-react';

export default function StudentQuizResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === Fetch quiz result ===
  useEffect(() => {
    let isMounted = true;

    getQuizResult(id)
      .then((data) => {
        if (!isMounted) return;
        setResult(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to fetch result:', err);
        setError('Failed to load quiz result. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  // === Calculate percentage and performance ===
  const percentage = result ? Math.round((result.score / result.total) * 100) : 0;
  
  const getPerformanceColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceMessage = () => {
    if (percentage >= 80) return 'Excellent work! 🎉';
    if (percentage >= 60) return 'Good job! 👍';
    if (percentage >= 40) return 'Keep practicing! 💪';
    return 'Don\'t give up! Try again next time. 📚';
  };

  const getPerformanceIcon = () => {
    if (percentage >= 60) return <Trophy className="w-16 h-16 text-yellow-500" />;
    return <CheckCircle2 className="w-16 h-16 text-gray-400" />;
  };

  // === Format date ===
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // === Loading State ===
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // === Error State ===
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-12 text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/student/quizzes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
        </Card>
      </div>
    );
  }

  // === No Result ===
  if (!result) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-12 text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Result Found</h2>
          <p className="text-gray-600 mb-6">This quiz hasn't been submitted yet.</p>
          <Button onClick={() => navigate('/student/quizzes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
        </Card>
      </div>
    );
  }

  // === Result Display ===
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Success Card */}
      <Card className="p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          {getPerformanceIcon()}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
          <p className={`text-lg font-semibold ${getPerformanceColor()}`}>
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Score Display */}
        <div className="py-6 border-y border-gray-200">
          <div className="text-6xl font-bold text-gray-900 mb-2">
            <span className={getPerformanceColor()}>{result.score}</span>
            <span className="text-3xl text-gray-400"> / {result.total}</span>
          </div>
          <div className={`text-2xl font-semibold ${getPerformanceColor()}`}>
            {percentage}%
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Score
            </span>
            <span className="font-semibold text-gray-900">
              {result.score} / {result.total}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Submitted At
            </span>
            <span className="font-semibold text-gray-900">
              {formatDate(result.submittedAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate('/student/quizzes')}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Quiz Submitted Successfully</h3>
            <p className="text-sm text-blue-700">
              Your answers have been recorded and your score has been calculated. 
              You can review your performance above.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}