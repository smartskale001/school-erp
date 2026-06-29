import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../services/teacherquizService';
import { Card } from '@/core/components/Card';
import { Button } from '@/core/components/Button';
import { Input } from '@/core/components/Input';
import { useEffect } from 'react';
import {Label} from '../components/Label'
import { Calendar, Clock, Hash, BookOpen, Building2, GraduationCap, HelpCircle, AlertCircle } from 'lucide-react';

export default function TeacherCreateQuizPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    scheduledDate: '', // Format: YYYY-MM-DD
    startTime: '',     // Format: HH:MM
    durationMinutes: 30, // Default to 30 minutes
    classId: '',
    section: '',
    subjectId: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showHelp, setShowHelp] = useState({});
  // State to hold the minimum allowed date for the date picker
  const [minDate, setMinDate] = useState(''); 

  // Calculate and set the minimum date (today) on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // e.g., "2026-06-29"
    setMinDate(today);
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear specific field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validations
    if (!formData.title.trim()) newErrors.title = 'Please enter a title for your quiz.';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Please select the date the quiz should become available.';
    if (!formData.startTime) newErrors.startTime = 'Please select the time the quiz should become available.';
    if (!formData.durationMinutes || formData.durationMinutes <= 0) newErrors.durationMinutes = 'Duration must be a positive number (e.g., 15, 30, 60).';
    if (!formData.classId.trim()) newErrors.classId = 'Please specify the class (e.g., Class 10, Grade 9).';
    if (!formData.section.trim()) newErrors.section = 'Please specify the section (e.g., A, B, C).';
    if (!formData.subjectId.trim()) newErrors.subjectId = 'Please specify the subject (e.g., Mathematics, Physics).';

    // Advanced validation: Check if scheduled time is in the past relative to NOW
    if (formData.scheduledDate && formData.startTime) {
        const selectedDateTime = new Date(`${formData.scheduledDate}T${formData.startTime}:00`);
        const now = new Date();
        
        // Check if the selected time is before the current time *AND* the date is today
        // Or if the selected date is in the past
        if (selectedDateTime <= now) {
            newErrors.scheduledDate = 'Scheduled date and time cannot be in the past.';
            newErrors.startTime = 'Scheduled date and time cannot be in the past.';
        }
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.focus();
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      const quizData = {
        title: formData.title,
        scheduledDate: formData.scheduledDate,
        startTime: formData.startTime,
        durationMinutes: parseInt(formData.durationMinutes, 10),
        classId: formData.classId,
        section: formData.section,
        subjectId: formData.subjectId,
      };

      const response = await createQuiz(quizData);
      console.log('Quiz created successfully:', response);

      if (response && response.id) {
         navigate(`/teacher/quizzes/${response.id}/edit`);
      } else {
         navigate('/teacher/quizzes');
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
      setApiError(err.message || 'Sorry, we couldn\'t create the quiz. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/teacher/quizzes');
  };

  const toggleHelp = (fieldName) => {
    setShowHelp(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      

      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">⚠️</span>
            <div>
              <h3 className="font-medium text-red-800">Creation Failed</h3>
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      <Card className="p-6 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-base font-semibold text-gray-900">
                <Hash className="inline w-4 h-4 mr-1" />
                Quiz Title *
              </Label>
              <button
                type="button"
                onClick={() => toggleHelp('title')}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Chapter 5 Review: The American Revolution"
              className={`text-lg ${errors.title ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
            />
            {showHelp.title && (
              <p className="text-xs text-gray-500 italic">Enter a clear and descriptive name for your quiz.</p>
            )}
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Scheduled Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="scheduledDate" className="font-medium text-gray-800">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Scheduled Date *
                </Label>
                <button
                  type="button"
                  onClick={() => toggleHelp('scheduledDate')}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              {/* Apply minDate here to disable past dates */}
              <Input
                id="scheduledDate"
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={minDate} // <-- This enforces the minimum selectable date
                className={errors.scheduledDate ? 'border-red-500 ring-red-500' : 'border-gray-300'}
              />
              {showHelp.scheduledDate && (
                <p className="text-xs text-gray-500 italic">Students will be able to see and join the quiz from this date and time onwards.</p>
              )}
              {errors.scheduledDate && <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="startTime" className="font-medium text-gray-800">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Start Time *
                </Label>
                <button
                  type="button"
                  onClick={() => toggleHelp('startTime')}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ? 'border-red-500 ring-red-500' : 'border-gray-300'}
              />
              {showHelp.startTime && (
                <p className="text-xs text-gray-500 italic">Specify the time of day when the quiz becomes available (e.g., 09:00 AM).</p>
              )}
              {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="durationMinutes" className="font-medium text-gray-800">
                <Clock className="inline w-4 h-4 mr-1" />
                Quiz Duration (Minutes) *
              </Label>
              <button
                type="button"
                onClick={() => toggleHelp('durationMinutes')}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min="1"
              max="360" // Optional: cap duration
              value={formData.durationMinutes}
              onChange={handleChange}
              className={errors.durationMinutes ? 'border-red-500 ring-red-500' : 'border-gray-300'}
            />
             {showHelp.durationMinutes && (
              <p className="text-xs text-gray-500 italic">How long should students have to complete the quiz? (Minimum: 1 minute)</p>
            )}
            {errors.durationMinutes && <p className="mt-1 text-sm text-red-600">{errors.durationMinutes}</p>}
          </div>

          {/* Class, Section, Subject */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="classId" className="font-medium text-gray-800">
                  <Building2 className="inline w-4 h-4 mr-1" />
                  Class ID *
                </Label>
                <button
                  type="button"
                  onClick={() => toggleHelp('classId')}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <Input
                id="classId"
                name="classId"
                type="text"
                value={formData.classId}
                onChange={handleChange}
                placeholder="e.g., Class 10, Grade 9"
                className={errors.classId ? 'border-red-500 ring-red-500' : 'border-gray-300'}
              />
               {showHelp.classId && (
              <p className="text-xs text-gray-500 italic">Identify the specific class this quiz is for.</p>
            )}
              {errors.classId && <p className="mt-1 text-sm text-red-600">{errors.classId}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="section" className="font-medium text-gray-800">
                  <GraduationCap className="inline w-4 h-4 mr-1" />
                  Section *
                </Label>
                <button
                  type="button"
                  onClick={() => toggleHelp('section')}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <Input
                id="section"
                name="section"
                type="text"
                value={formData.section}
                onChange={handleChange}
                placeholder="e.g., A, B, C"
                className={errors.section ? 'border-red-500 ring-red-500' : 'border-gray-300'}
              />
               {showHelp.section && (
              <p className="text-xs text-gray-500 italic">Specify the section within the class.</p>
            )}
              {errors.section && <p className="mt-1 text-sm text-red-600">{errors.section}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="subjectId" className="font-medium text-gray-800">
                  <BookOpen className="inline w-4 h-4 mr-1" />
                  Subject ID *
                </Label>
                <button
                  type="button"
                  onClick={() => toggleHelp('subjectId')}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <Input
                id="subjectId"
                name="subjectId"
                type="text"
                value={formData.subjectId}
                onChange={handleChange}
                placeholder="e.g., Mathematics, Physics"
                className={errors.subjectId ? 'border-red-500 ring-red-500' : 'border-gray-300'}
              />
               {showHelp.subjectId && (
              <p className="text-xs text-gray-500 italic">Indicate the subject area of the quiz.</p>
            )}
              {errors.subjectId && <p className="mt-1 text-sm text-red-600">{errors.subjectId}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-6 py-2.5 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="px-6 py-2.5 font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
                  Creating Quiz...
                </>
              ) : (
                'Create Draft Quiz'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}