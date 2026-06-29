/**
 * QuizNavigation.jsx
 *
 * Bottom navigation bar for the quiz player.
 * Shows Previous / (Next OR Submit) buttons depending on current index.
 *
 * Props:
 *   - onPrev       : () => void
 *   - onNext       : () => void
 *   - onSubmit     : () => void
 *   - currentIndex : number  (0-indexed)
 *   - total        : number
 *   - disabled     : boolean (true while submitting)
 */
import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/core/components/Button';

export default function QuizNavigation({
  onPrev,
  onNext,
  onSubmit,
  currentIndex,
  total,
  disabled,
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= total - 1;

  return (
    <div className="flex items-center justify-between">
      {/* ── Previous ─────────────────────────────────────────── */}
      <Button variant="outline" onClick={onPrev} disabled={isFirst || disabled}>
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      {/* ── Next or Submit ───────────────────────────────────── */}
      <div className="flex gap-2">
        {!isLast ? (
          <Button onClick={onNext} disabled={disabled}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button variant="primary" onClick={onSubmit} disabled={disabled}>
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
}
