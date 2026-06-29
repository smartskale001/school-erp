/**
 * QuizTimer.jsx
 *
 * Countdown timer for a quiz.
 *
 * Props:
 *   - durationMinutes : number | null  — total quiz duration (null = no timer)
 *   - running         : boolean        — true while the quiz is in 'playing' state
 *   - onTimeUp        : () => void     — called when the countdown reaches 0
 *
 * Data flow:
 *   1. Receives durationMinutes from parent (set after startQuiz succeeds).
 *   2. Internally ticks down every second using setInterval.
 *   3. Calls onTimeUp (usually handleSubmit) when it hits 0.
 *   4. Resets whenever durationMinutes changes (e.g. a new quiz is started).
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';

/** Format seconds → "m:ss" */
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function QuizTimer({ durationMinutes, running, onTimeUp }) {
  /** seconds remaining */
  const [timeLeft, setTimeLeft] = useState(null);

  /** Keep a ref to onTimeUp so the interval always calls the latest callback */
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  /** Reset the timer whenever a new duration is provided */
  useEffect(() => {
    if (durationMinutes != null) {
      setTimeLeft(durationMinutes * 60);
    } else {
      setTimeLeft(null);
    }
  }, [durationMinutes]);

  /** Countdown interval */
  useEffect(() => {
    if (timeLeft == null || !running) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          // Defer the call so React state updates settle first
          setTimeout(() => onTimeUpRef.current(), 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft == null, running]);

  if (timeLeft == null) return null;

  const isUrgent = timeLeft < 60;

  return (
    <div
      className={`flex items-center gap-1 text-sm font-medium ${
        isUrgent ? 'text-red-600' : 'text-gray-600'
      }`}
    >
      <Clock className="w-4 h-4" />
      {formatTime(timeLeft)}
    </div>
  );
}
