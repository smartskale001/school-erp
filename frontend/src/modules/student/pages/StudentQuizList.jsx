// src/pages/student/quizzes/StudentQuizListPage.jsx
import { Play, Clock, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentQuizzes, joinQuiz } from '../services/studentquizService';
import { Card } from '@/core/components/Card';
import { SectionHeader } from '@/core/components/SectionHeader';
import { Button } from '@/core/components/Button';
import { useAuth } from '@/core/context/AuthContext';

export default function StudentQuizListPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);

  // === Fetch quizzes with attempt status ===
  useEffect(() => {
    let isMounted = true;
    
    getStudentQuizzes()
      .then((data) => {
        if (isMounted) setQuizzes(data || []);
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch quizzes:', err);
          setError('Failed to load quizzes. Please refresh the page.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // === Handle Quiz Action ===
  const handleQuizAction = async (quiz) => {
    if (actionId) return; // Prevent double-click
    
    setActionId(quiz.id);
    setError(null);

    try {
      // If not started, join first
      if (!quiz.attemptStatus) {
        await joinQuiz(quiz.id, {
          rollNumber: userProfile.rollNo?.toString(),
          studentName: userProfile.fullName,
        });
      }
      
      // Navigate to quiz attempt page
      navigate(`/student/quizzes/${quiz.id}`);
    } catch (err) {
      console.error('Failed to access quiz:', err);
      
      // Handle "already joined" case
      if (err.response?.status === 400 || err.message?.includes('already')) {
        navigate(`/student/quizzes/${quiz.id}`);
        return;
      }
      
      setError('Failed to access quiz. Please try again.');
      setActionId(null);
    }
  };

  // === Handle View Result ===
  const handleViewResult = (quizId) => {
    navigate(`/student/quizzes/${quizId}/result`);
  };

  // === Get Button Config Based on Status ===
  const getButtonConfig = (quiz) => {
    const isActioning = actionId === quiz.id;
    
    if (quiz.attemptStatus === 'submitted') {
      return {
        text: 'View Result',
        icon: <CheckCircle2 className="w-4 h-4" />,
        variant: 'outline',
        disabled: false,
        onClick: () => handleViewResult(quiz.id),
        className: 'border-green-500 text-green-700 hover:bg-green-50',
      };
    }
    
    if (quiz.attemptStatus === 'in_progress') {
      return {
        text: isActioning ? 'Loading...' : 'Resume Quiz',
        icon: isActioning ? (
          <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
        ) : (
          <ArrowRight className="w-4 h-4" />
        ),
        variant: 'primary',
        disabled: isActioning,
        onClick: () => handleQuizAction(quiz),
        className: 'bg-yellow-500 hover:bg-yellow-600',
      };
    }
    
    // Not started
    return {
      text: isActioning ? 'Joining...' : 'Start Quiz',
      icon: isActioning ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
      ) : (
        <Play className="w-4 h-4 fill-current" />
      ),
      variant: 'primary',
      disabled: isActioning,
      onClick: () => handleQuizAction(quiz),
      className: '',
    };
  };

  // === Get Status Badge ===
  const getStatusBadge = (quiz) => {
    if (quiz.attemptStatus === 'submitted') {
      return (
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
          COMPLETED
        </span>
      );
    }
    
    if (quiz.attemptStatus === 'in_progress') {
      return (
        <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          IN PROGRESS
        </span>
      );
    }
    
    return (
      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
        LIVE
      </span>
    );
  };

  // === Loading State ===
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
        title="Available Quizzes"
        description="Browse and take live quizzes available for your class"
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {quizzes.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No live quizzes available</p>
          <p className="text-sm mt-1">Check back later for new quizzes from your teachers</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => {
            const buttonConfig = getButtonConfig(quiz);
            const isSubmitted = quiz.attemptStatus === 'submitted';
            const isInProgress = quiz.attemptStatus === 'in_progress';
            
            return (
              <Card
                key={quiz.id}
                className={`p-5 flex flex-col justify-between transition-all border-l-4 ${
                  isSubmitted 
                    ? 'border-l-green-500 bg-green-50/30' 
                    : isInProgress 
                    ? 'border-l-yellow-500 bg-yellow-50/30' 
                    : 'border-l-blue-500 hover:shadow-md cursor-pointer'
                }`}
                onClick={() => !isSubmitted && handleQuizAction(quiz)}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-lg ${
                      isSubmitted ? 'text-gray-700' : 'text-gray-900 group-hover:text-blue-600'
                    } transition-colors`}>
                      {quiz.title}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Subject: {quiz.subjectId}</p>
                    <p>Class: {quiz.classId} · Section: {quiz.section}</p>
                    <p>Duration: {quiz.durationMinutes} minutes</p>
                    {quiz.submittedAt && (
                      <p className="text-xs text-green-600">
                        Submitted: {new Date(quiz.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  {getStatusBadge(quiz)}
                  <Button
                    variant={buttonConfig.variant}
                    disabled={buttonConfig.disabled}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      buttonConfig.onClick();
                    }}
                    className={`flex items-center gap-1 text-sm font-medium ${buttonConfig.className}`}
                    size="sm"
                  >
                    {buttonConfig.text} {buttonConfig.icon}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}