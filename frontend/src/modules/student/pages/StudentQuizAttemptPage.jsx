import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Save, Loader2 } from 'lucide-react';
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getStudentQuizDetail, 
  startQuiz, 
  saveAnswer, 
  submitQuiz 
} from '../services/studentquizService';
import { Card } from '@/core/components/Card';
import { Button } from '@/core/components/Button';

export default function StudentQuizAttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState('loading'); // 'loading' | 'detail' | 'playing'
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [savingQuestionId, setSavingQuestionId] = useState(null);

  const answersRef = useRef(answers);
  const isSubmittingRef = useRef(false);
  const saveTimeoutRef = useRef({});

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // === 1. Load quiz details ===
  useEffect(() => {
    let isMounted = true;
    getStudentQuizDetail(id)
      .then((data) => {
        if (!isMounted) return;
        setQuiz(data);
        const sorted = [...(data.questions || [])].sort((a, b) => a.orderIndex - b.orderIndex);
        setQuestions(sorted);
        setStatus('detail');
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load quiz:', err);
        setStatus('error');
      });
    return () => { isMounted = false; };
  }, [id]);

  // === 2. Start / Resume Quiz ===
  const handleStart = async () => {
    try {
      // Call backend /start endpoint
      const response = await startQuiz(id);
      
      // ✅ FIX: Calculate remaining time based on backend's startedAt
      const startedAtTime = new Date(response.startedAt).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startedAtTime) / 1000);
      const totalSeconds = quiz.durationMinutes * 60;
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);
      
      setTimeLeft(remaining);
      setStatus('playing');

      // If time already ran out while they were away, auto-submit immediately
      if (remaining <= 0) {
        handleSubmit(true);
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
      alert('Failed to start quiz. Please try again.');
    }
  };

  // === 3. Timer Logic ===
  useEffect(() => {
    if (status !== 'playing' || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [status, timeLeft > 0]);

  // === 4. Auto-submit when time runs out ===
  useEffect(() => {
    if (status === 'playing' && timeLeft === 0 && !isSubmittingRef.current) {
      handleSubmit(true);
    }
  }, [timeLeft, status]);

  // === 5. Save answer (debounced) ===
  const saveAnswerDebounced = useCallback(async (questionId, value) => {
    if (saveTimeoutRef.current[questionId]) {
      clearTimeout(saveTimeoutRef.current[questionId]);
    }
    setSavingQuestionId(questionId);

    saveTimeoutRef.current[questionId] = setTimeout(async () => {
      try {
        await saveAnswer(id, questionId, { givenAnswer: value });
        setLastSaved(new Date());
      } catch (err) {
        console.error('Failed to save answer:', err);
      } finally {
        setSavingQuestionId(null);
      }
    }, 800);
  }, [id]);

  // === 6. Handle answer change ===
  const handleAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    saveAnswerDebounced(questionId, value);
  }, [saveAnswerDebounced]);

  // === 7. Navigation ===
  const goPrev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1)), [questions.length]);

  // === 8. Submit handler ===
  const handleSubmit = useCallback(async (isAuto = false) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await submitQuiz(id);
      navigate(`/student/quizzes/${id}/result`);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit quiz. Please try again.');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [id, navigate]);

  // === 9. Cleanup ===
  useEffect(() => {
    return () => {
      Object.values(saveTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // === Derived state ===
  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [timeLeft]);

  const isTimeLow = timeLeft <= 60 && timeLeft > 0;

  // === RENDER ===
  if (status === 'loading') return <div className="p-8 text-center">Loading quiz...</div>;

  if (status === 'detail' && quiz) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p>Duration: {quiz.durationMinutes} minutes</p>
          <p>Questions: {questions.length}</p>
          <Button onClick={handleStart} className="w-full mt-4">
            Start / Resume Quiz
          </Button>
        </Card>
      </div>
    );
  }

  if (status === 'playing' && currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <div className="flex items-center gap-4">
            <span>{answeredCount} answered</span>
            <span className={`flex items-center gap-1 font-mono ${isTimeLow ? 'text-red-600 font-bold animate-pulse' : ''}`}>
              <Clock className="w-4 h-4" />
              {formattedTime}
            </span>
          </div>
        </div>

        {/* ✅ FIX: Visual save indicator instead of disabling inputs */}
        <div className="h-4 text-xs text-gray-500 flex items-center gap-1">
          {savingQuestionId === currentQuestion.id ? (
            <span className="text-blue-600 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          ) : lastSaved ? (
            <span className="text-green-600 flex items-center gap-1">
              <Save className="w-3 h-3" /> Saved
            </span>
          ) : null}
        </div>

        {/* Question Card */}
        <Card className="p-6">
          <p className="text-lg mb-4 font-medium">{currentQuestion.questionText}</p>

          {/* ✅ FIX: Removed 'disabled' prop from all inputs so they don't freeze */}
          {currentQuestion.questionType === 'fill_blank' ? (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              placeholder="Type your answer..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ) : currentQuestion.questionType === 'true_false' ? (
            <div className="space-y-2">
              {['true', 'false'].map((opt) => (
                <label key={opt} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name={`q-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] === opt}
                    onChange={() => handleAnswer(currentQuestion.id, opt)}
                  />
                  <span>{opt === 'true' ? 'True' : 'False'}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(currentQuestion.options && currentQuestion.options.length > 0
                ? currentQuestion.options
                : [{ id: 'missing', text: '⚠️ No options provided' }]
              ).map((opt) => (
                <label key={opt.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name={`q-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] === opt.id}
                    onChange={() => handleAnswer(currentQuestion.id, opt.id)}
                    disabled={opt.id === 'missing'}
                  />
                  <span>{opt.text}</span>
                </label>
              ))}
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            Marks: {parseFloat(currentQuestion.marks) || 0}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>

          {currentIndex < questions.length - 1 ? (
            <Button onClick={goNext}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="primary" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
              <CheckCircle2 className="w-4 h-4 mr-1" /> 
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <div className="p-8 text-center text-red-500">Error loading quiz.</div>;
}