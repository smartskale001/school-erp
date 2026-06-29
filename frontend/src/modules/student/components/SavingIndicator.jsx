/**
 * SavingIndicator.jsx
 *
 * A small inline badge that appears when an answer is being saved.
 * Disappears once the save request completes.
 *
 * Props:
 *   - saving : boolean
 */
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function SavingIndicator({ saving }) {
  if (!saving) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-blue-600">
      <Loader2 className="w-3 h-3 animate-spin" />
      Saving…
    </span>
  );
}
