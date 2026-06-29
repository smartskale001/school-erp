// src/pages/teacher/quizzes/TeacherQuizListPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyQuizzes, publishQuiz } from '../services/teacherquizService';
import { Card } from '@/core/components/Card';
import { Button } from '@/core/components/Button';
import { SectionHeader } from '@/core/components/SectionHeader';
import { Edit, Eye, Upload, Clock, Play, CheckCircle2, Users } from 'lucide-react';
import { useAuth } from '@/core/context/AuthContext';

export default function TeacherQuizListPage() {
  const { userProfile } = useAuth(); // Assuming this provides teacher info
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishingId, setPublishingId] = useState(null); // To track which quiz is being published

  useEffect(() => {
    let isMounted = true;

    // Fetch quizzes when component mounts
    getMyQuizzes()
      .then((data) => {
        if (isMounted) {
          // Sort quizzes: Drafts first, then Live/Completed, newest first within each group
          const sorted = data.sort((a, b) => {
            if (a.status === b.status) {
              // If statuses are the same, sort by creation date (newest first)
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // Otherwise, drafts come first
            if (a.status === 'draft') return -1;
            if (b.status === 'draft') return 1;
            return 0; // Maintain relative order for non-drafts
          });
          setQuizzes(sorted);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch quizzes:', err);
          setError('Failed to load your quizzes. Please try again.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handlePublishQuiz = async (quizId) => {
    if (publishingId) return; // Prevent double clicks
    setPublishingId(quizId);

    try {
      await publishQuiz(quizId);
      // Update local state optimistically or refetch
      setQuizzes(prev => prev.map(quiz => 
        quiz.id === quizId ? { ...quiz, status: 'live' } : quiz
      ));
    } catch (err) {
      console.error('Failed to publish quiz:', err);
      alert('Failed to publish quiz. Please ensure it has questions and try again.');
    } finally {
      setPublishingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Draft</span>;
      case 'live':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Live</span>;
      case 'completed': // Assuming this status exists eventually
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">Completed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  const getActionButtons = (quiz) => {
    const isPublishing = publishingId === quiz.id;
    
    if (quiz.status === 'draft') {
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)} // Navigate to edit page
            className="flex items-center gap-1"
          >
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handlePublishQuiz(quiz.id)}
            disabled={isPublishing}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
          >
            {isPublishing ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                Publishing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Publish
              </>
            )}
          </Button>
        </>
      );
    } else if (quiz.status === 'live') {
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/teacher/quizzes/${quiz.id}`)} // Navigate to view details/results page
            className="flex items-center gap-1"
          >
            <Eye className="w-4 h-4" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/teacher/quizzes/${quiz.id}/results`)} // Navigate to results page
            className="flex items-center gap-1"
          >
            <Users className="w-4 h-4" /> Results
          </Button>
        </>
      );
    } else { // Completed or other statuses
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/teacher/quizzes/${quiz.id}/results`)}
          className="flex items-center gap-1"
        >
          <CheckCircle2 className="w-4 h-4" /> Results
        </Button>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-12 text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Quizzes</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <SectionHeader
        title="My Quizzes"
        description="Manage your quizzes: create, edit, publish, and review results."
      />
      
      {/* Create New Quiz Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => navigate('/teacher/quizzes/create')} // Navigate to create page
        >
          Create New Quiz
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-red-500">⚠️</span>
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No quizzes created yet</p>
          <p className="text-sm mt-1">Get started by creating your first quiz!</p>
          <Button
            variant="primary"
            onClick={() => navigate('/teacher/quizzes/create')}
            className="mt-4"
          >
            Create Your First Quiz
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{quiz.title}</h3>
                    {getStatusBadge(quiz.status)}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <p><span className="font-medium">Subject:</span> {quiz.subjectId}</p>
                    <p><span className="font-medium">Class:</span> {quiz.classId} {quiz.section}</p>
                    <p><span className="font-medium">Duration:</span> {quiz.durationMinutes} mins</p>
                    <p><span className="font-medium">Scheduled:</span> {new Date(quiz.scheduledAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  {getActionButtons(quiz)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}