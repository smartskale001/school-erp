// src/pages/teacher/quizzes/TeacherQuizResultPage.jsx (or TeacherQuizResultsPage.jsx if you renamed it)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizResults } from '../services/teacherQuizService'; // Assuming you add this function to the service
import { Card } from '@/core/components/Card';
import { Button } from '@/core/components/Button';
// --- Remove Table import ---
// import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/core/components/Table'; // Assuming you have these
import { SectionHeader } from '@/core/components/SectionHeader';
import { getQuizById } from '../services/teacherQuizService'; // Re-use getQuizById to get quiz title
import { AlertCircle, ArrowLeft, GraduationCap, BarChart3 } from 'lucide-react';

export default function TeacherQuizResultPage() { // Or TeacherQuizResultsPage
  const { id: quizId } = useParams(); // Get quiz ID from URL params
  const navigate = useNavigate();

  const [quizDetails, setQuizDetails] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch quiz details to get the title
        const quiz = await getQuizById(quizId);
        if (isMounted) {
          setQuizDetails(quiz);
        }

        // Fetch results for the quiz
        const resultsData = await getQuizResults(quizId); // You'll need to add getQuizResults to your service
        if (isMounted) {
          // Sort results by submission time (newest first) or score (highest first)
          // Example: Sort by score descending, then by submittedAt ascending
          resultsData.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score; // Higher scores first
            }
            return new Date(a.submittedAt) - new Date(b.submittedAt); // Earlier submissions first for same score
          });
          setResults(resultsData);
        }
      } catch (err) {
        console.error('Failed to fetch quiz results:', err);
        if (isMounted) {
          setError('Failed to load quiz results. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [quizId]);

  const handleBackToList = () => {
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleBackToList}>Go Back to Quizzes</Button>
        </Card>
      </div>
    );
  }

  if (!quizDetails) {
     return (
      <div className="max-w-4xl mx-auto p-6 text-center text-red-500">
        <p>Quiz details not found.</p>
        <Button onClick={handleBackToList}>Go Back to Quizzes</Button>
      </div>
    );
  }

  // Calculate summary statistics if results exist
  const summaryStats = results.length > 0 ? {
    totalSubmissions: results.length,
    averageScore: (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(2),
    maxScore: Math.max(...results.map(r => r.score)),
    minScore: Math.min(...results.map(r => r.score)),
    totalPossible: results.length > 0 ? results[0].total : 0, // Assuming all submissions have the same total
  } : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Results for: {quizDetails.title}
          </h1>

        </div>
        <Button
          variant="outline"
          onClick={handleBackToList}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </Button>
      </div>

      {summaryStats && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Summary Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-xl font-bold text-gray-900">{summaryStats.totalSubmissions}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-xl font-bold text-gray-900">{summaryStats.averageScore}/{summaryStats.totalPossible}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Highest Score</p>
              <p className="text-xl font-bold text-green-600">{summaryStats.maxScore}/{summaryStats.totalPossible}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Lowest Score</p>
              <p className="text-xl font-bold text-red-600">{summaryStats.minScore}/{summaryStats.totalPossible}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Results</h2>
        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No results yet. Students may still be taking the quiz or haven't submitted.</p>
        ) : (
          <div className="overflow-x-auto">
            {/* --- Replace Table with standard HTML --- */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => {
                  const percentage = ((result.score / result.total) * 100).toFixed(2);
                  return (
                    <tr key={result.attemptId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.rollNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{result.score}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          percentage >= 80 ? 'bg-green-100 text-green-800' :
                          percentage >= 60 ? 'bg-blue-100 text-blue-800' :
                          percentage >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(result.submittedAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}