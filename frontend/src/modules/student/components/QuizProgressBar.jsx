/**
 * QuizProgressBar.jsx
 *
 * Shows "Question X of Y" plus a horizontal progress bar.
 *
 * Props:
 *   - current : number (0-indexed)
 *   - total   : number
 */
import React from 'react';

export default function QuizProgressBar({ current, total }) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900">
          Question {current + 1} of {total}
        </span>
        <span className="text-gray-400">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
