// src/pages/teacher/quizzes/TeacherQuizEditPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, addQuestion, publishQuiz } from '../services/teacherquizService';
import { Card } from '@/core/components/Card';
import { Button } from '@/core/components/Button';
import { Input } from '@/core/components/Input';
import { Textarea} from '@/core/components/Textarea';

// --- Placeholder components if yours don't exist ---

const Label = ({ children, className = '', ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
    {children}
  </label>
);


const Select = ({ className = '', ...props }) => (
  <select
    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    {...props}
  />
);
// --- END PLACEHOLDER COMPONENTS ---
import { Plus, Save, Eye, AlertCircle, Hash, Clock, BookOpen, Building2, GraduationCap, Edit } from 'lucide-react';

export default function TeacherQuizEditPage() {
  const { id } = useParams(); // Quiz ID from URL params
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState('');
  const [publishing, setPublishing] = useState(false);

  // State for the new question form
  const [newQuestion, setNewQuestion] = useState({
    questionType: 'mcq_single', // Default type
    questionText: '',
    options: [{ id: 'A', text: '' }, { id: 'B', text: '' }], // Start with 2 options for MCQ
    correctAnswer: '',
    marks: 1,
  });

  // State for form errors
  const [questionErrors, setQuestionErrors] = useState({});

  // Fetch quiz details on component mount
  useEffect(() => {
    let isMounted = true;

    getQuizById(id)
      .then((data) => {
        if (isMounted) {
          // Ensure questions array exists
          data.questions = data.questions || [];
          setQuiz(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch quiz:', err);
          setError('Failed to load quiz details. Please try again.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  // Validate new question form
  const validateNewQuestion = () => {
    const errors = {};
    if (!newQuestion.questionText.trim()) errors.questionText = 'Question text is required.';
    if (!['mcq_single', 'true_false', 'fill_blank'].includes(newQuestion.questionType)) errors.questionType = 'Invalid question type.';
    if (newQuestion.questionType === 'mcq_single') {
      // Validate MCQ options: at least 2, all non-empty, unique IDs (ID uniqueness assumed by fixed A, B, C, etc.)
      const validOptions = newQuestion.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) errors.options = 'At least 2 options are required for MCQ.';
      if (!newQuestion.correctAnswer) errors.correctAnswer = 'Correct answer is required for MCQ.';
      if (!newQuestion.options.some(opt => opt.id === newQuestion.correctAnswer)) errors.correctAnswer = 'Correct answer must match one of the option IDs.';
    } else if (newQuestion.questionType === 'true_false') {
        if (!['true', 'false'].includes(newQuestion.correctAnswer)) errors.correctAnswer = 'Correct answer must be "true" or "false".';
    } else if (newQuestion.questionType === 'fill_blank') {
        if (!newQuestion.correctAnswer.trim()) errors.correctAnswer = 'Correct answer is required for Fill in the Blank.';
    }
    if (!newQuestion.marks || newQuestion.marks <= 0) errors.marks = 'Marks must be a positive number.';

    setQuestionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle adding a new option for MCQ
  const addOption = () => {
    if (newQuestion.options.length >= 6) return; // Limit options (optional)
    const nextId = String.fromCharCode(65 + newQuestion.options.length); // A, B, C, ...
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, { id: nextId, text: '' }]
    }));
  };

  // Handle removing an option for MCQ
  const removeOption = (indexToRemove) => {
    if (newQuestion.options.length <= 2) return; // Keep at least 2 options
    const removedId = newQuestion.options[indexToRemove].id;
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, index) => index !== indexToRemove),
      correctAnswer: prev.correctAnswer === removedId ? '' : prev.correctAnswer
    }));
  };

  // Handle changes in the new question form
  const handleNewQuestionChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('optionText-')) {
      const index = parseInt(name.split('-')[1], 10);
      setNewQuestion(prev => ({
        ...prev,
        options: prev.options.map((opt, idx) =>
          idx === index ? { ...opt, text: value } : opt
        )
      }));
    } else if (name.startsWith('optionId-')) {
      const index = parseInt(name.split('-')[1], 10);
      setNewQuestion(prev => ({
        ...prev,
        options: prev.options.map((opt, idx) =>
          idx === index ? { ...opt, id: value } : opt
        )
      }));
    } else {
      setNewQuestion(prev => ({ ...prev, [name]: value }));
      // Clear specific error when user starts typing
      if (questionErrors[name]) {
        setQuestionErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  // Handle submitting the new question form
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateNewQuestion()) {
      return;
    }

    try {
      // Prepare question data for API call
      const questionData = {
        questionType: newQuestion.questionType,
        questionText: newQuestion.questionText,
        // Only send options for MCQ types
        options: newQuestion.questionType === 'mcq_single' ? newQuestion.options : undefined,
        correctAnswer: newQuestion.correctAnswer,
        marks: parseFloat(newQuestion.marks), // Ensure it's a number
      };

      const response = await addQuestion(id, questionData); // Pass quiz ID and question data
      console.log('Question added successfully:', response);

      // Optimistically update the local state
      setQuiz(prevQuiz => ({
        ...prevQuiz,
        questions: [...prevQuiz.questions, response] // Add new question to the list
      }));

      // Reset the form
      setNewQuestion({
        questionType: 'mcq_single',
        questionText: '',
        options: [{ id: 'A', text: '' }, { id: 'B', text: '' }],
        correctAnswer: '',
        marks: 1,
      });
      setQuestionErrors({});

    } catch (err) {
      console.error('Failed to add question:', err);
      setApiError(err.message || 'Sorry, we couldn\'t add the question. Please try again.');
    }
  };

  // Handle publishing the quiz
  const handlePublish = async () => {
    if (publishing || !quiz || quiz.status !== 'draft') return; // Guard clause
    setApiError('');
    setPublishing(true);

    try {
      await publishQuiz(id); // Call publish service
      // Update local state optimistically
      setQuiz(prev => ({ ...prev, status: 'live' }));
      // Optionally navigate back to the list after successful publish
      // navigate('/teacher/quizzes');
    } catch (err) {
      console.error('Failed to publish quiz:', err);
      setApiError(err.message || 'Sorry, we couldn\'t publish the quiz. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  // Handle cancel (go back to list)
  const handleCancel = () => {
    navigate('/quizzes');
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
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/quizzes')}>Go Back to Quizzes</Button>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-red-500">
        <p>Quiz not found.</p>
        <Button onClick={() => navigate('/quizzes')}>Go Back to Quizzes</Button>
      </div>
    );
  }

  // Determine if the quiz can be published (has questions)
  const canPublish = quiz.questions && quiz.questions.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Edit className="w-6 h-6" /> {/* Assuming you have an Edit icon */}
              Editing Quiz: {quiz.title}
            </h1>
            <p className="opacity-90 mt-1">Status: <span className="font-semibold">{quiz.status}</span></p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePublish}
              disabled={!canPublish || publishing || quiz.status !== 'draft'} // Disable if not draft or no questions or publishing
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
                  Publishing...
                </>
              ) : (
                'Publish Quiz'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">⚠️</span>
            <div>
              <h3 className="font-medium text-red-800">Action Failed</h3>
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Details Card */}
      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quiz Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quiz-title"><Hash className="inline w-4 h-4 mr-1" /> Title</Label>
            <Input id="quiz-title" value={quiz.title} readOnly className="bg-gray-100" />
          </div>
          <div>
            <Label htmlFor="quiz-duration"><Clock className="inline w-4 h-4 mr-1" /> Duration (minutes)</Label>
            <Input id="quiz-duration" value={quiz.durationMinutes} readOnly className="bg-gray-100" />
          </div>
          <div>
            <Label htmlFor="quiz-class"><Building2 className="inline w-4 h-4 mr-1" /> Class</Label>
            <Input id="quiz-class" value={quiz.classId} readOnly className="bg-gray-100" />
          </div>
          <div>
            <Label htmlFor="quiz-section"><GraduationCap className="inline w-4 h-4 mr-1" /> Section</Label>
            <Input id="quiz-section" value={quiz.section} readOnly className="bg-gray-100" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="quiz-subject"><BookOpen className="inline w-4 h-4 mr-1" /> Subject</Label>
            <Input id="quiz-subject" value={quiz.subjectId} readOnly className="bg-gray-100" />
          </div>
        </div>
      </Card>

      {/* Add Question Card */}
      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Question</h2>
        <form onSubmit={handleAddQuestion} className="space-y-4">
          {/* Question Type */}
          <div>
            <Label htmlFor="questionType">Question Type *</Label>
            <Select
              id="questionType"
              name="questionType"
              value={newQuestion.questionType}
              onChange={handleNewQuestionChange}
              className={questionErrors.questionType ? 'border-red-500' : ''}
            >
              <option value="mcq_single">Multiple Choice (Single Answer)</option>
              <option value="true_false">True/False</option>
              <option value="fill_blank">Fill in the Blank</option>
            </Select>
            {questionErrors.questionType && <p className="mt-1 text-sm text-red-600">{questionErrors.questionType}</p>}
          </div>

          {/* Question Text */}
          <div>
            <Label htmlFor="questionText">Question Text *</Label>
            <Textarea
              id="questionText"
              name="questionText"
              value={newQuestion.questionText}
              onChange={handleNewQuestionChange}
              placeholder="Enter the question text here..."
              rows={3}
              className={questionErrors.questionText ? 'border-red-500' : ''}
            />
            {questionErrors.questionText && <p className="mt-1 text-sm text-red-600">{questionErrors.questionText}</p>}
          </div>

          {/* Options (for MCQ only) */}
          {newQuestion.questionType === 'mcq_single' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Options *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption} disabled={newQuestion.options.length >= 6}>
                  <Plus className="w-4 h-4 mr-1" /> Add Option
                </Button>
              </div>
              {newQuestion.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="text"
                    name={`optionId-${index}`} // Unique name for ID
                    value={option.id}
                    onChange={handleNewQuestionChange} // This won't be used for ID changes in this impl
                    className="w-16 text-center bg-gray-100" // Fixed width, read-only style
                    readOnly // Make ID read-only or manage ID changes separately if needed
                  />
                  <Input
                    type="text"
                    name={`optionText-${index}`} // Unique name for text
                    value={option.text}
                    onChange={handleNewQuestionChange}
                    placeholder={`Option ${option.id} text`}
                    className={questionErrors.options ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={newQuestion.options.length <= 2}
                    className="text-red-500 hover:text-red-700"
                  >
                    × {/* Simple remove button */}
                  </Button>
                </div>
              ))}
              {questionErrors.options && <p className="mt-1 text-sm text-red-600">{questionErrors.options}</p>}
            </div>
          )}

          {/* Correct Answer */}
          <div>
            <Label htmlFor="correctAnswer">
              {newQuestion.questionType === 'mcq_single' ? 'Correct Option ID *' :
               newQuestion.questionType === 'true_false' ? 'Correct Answer (true/false) *' :
               'Correct Answer *'}
            </Label>
            {newQuestion.questionType === 'mcq_single' ? (
              <Select
                id="correctAnswer"
                name="correctAnswer"
                value={newQuestion.correctAnswer}
                onChange={handleNewQuestionChange}
                className={questionErrors.correctAnswer ? 'border-red-500' : ''}
              >
                <option value="">Select the correct option</option>
                {newQuestion.options.map((opt, idx) => (
                  <option key={idx} value={opt.id}>{opt.id}: {opt.text}</option>
                ))}
              </Select>
            ) : newQuestion.questionType === 'true_false' ? (
              <Select
                id="correctAnswer"
                name="correctAnswer"
                value={newQuestion.correctAnswer}
                onChange={handleNewQuestionChange}
                className={questionErrors.correctAnswer ? 'border-red-500' : ''}
              >
                <option value="">Select true or false</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </Select>
            ) : (
              <Input
                type="text"
                id="correctAnswer"
                name="correctAnswer"
                value={newQuestion.correctAnswer}
                onChange={handleNewQuestionChange}
                placeholder="Enter the exact correct answer"
                className={questionErrors.correctAnswer ? 'border-red-500' : ''}
              />
            )}
            {questionErrors.correctAnswer && <p className="mt-1 text-sm text-red-600">{questionErrors.correctAnswer}</p>}
          </div>

          {/* Marks */}
          <div>
            <Label htmlFor="marks">Marks *</Label>
            <Input
              type="number"
              id="marks"
              name="marks"
              min="0.5"
              step="0.5"
              value={newQuestion.marks}
              onChange={handleNewQuestionChange}
              className={questionErrors.marks ? 'border-red-500' : ''}
            />
            {questionErrors.marks && <p className="mt-1 text-sm text-red-600">{questionErrors.marks}</p>}
          </div>

          {/* Add Question Button */}
          <div className="pt-4">
            <Button type="submit" variant="secondary" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </form>
      </Card>

        {/* Existing Questions List */}
      {quiz.questions && quiz.questions.length > 0 && (
        <Card className="p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Existing Questions ({quiz.questions.length})</h2>
          <div className="space-y-4">
            {quiz.questions.map((q, index) => (
              <Card key={q.id} className="p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{q.questionType}</span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="font-medium">{q.questionText}</p>
                    {q.options && q.options.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Options:</strong>
                        <ul className="list-disc list-inside ml-4">
                          {q.options.map((opt, idx) => (
                            <li key={idx}>{opt.id}. {opt.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Publish Hint if no questions */}
      {!canPublish && quiz.status === 'draft' && (
         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5 mr-2" />
            <div>
                <h3 className="font-medium text-yellow-800">Cannot Publish Yet</h3>
                <p className="text-sm text-yellow-700">You need to add at least one question to the quiz before you can publish it.</p>
            </div>
        </div>
      )}
    </div>
  );
}