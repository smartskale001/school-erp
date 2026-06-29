/**
 * QuestionCard.jsx
 *
 * Renders a single quiz question based on its type.
 *
 * Props:
 *   - question : object { id, questionType, questionText, options, marks }
 *   - answer   : string | undefined  — the student's current saved answer
 *   - onAnswer : (questionId, value) => void  — called when student selects/types
 *
 * Question types handled:
 *   - mcq_single : radio buttons (one option from the list)
 *   - true_false : two radio buttons labelled True / False
 *   - fill_blank : free-text <input>
 */
import React from 'react';

export default function QuestionCard({ question, answer, onAnswer }) {
  /** Fire the parent callback when the user picks a value */
  const handleSelect = (value) => {
    onAnswer(question.id, value);
  };

  // ── Fill-in-the-blank ────────────────────────────────────────────────
  if (question.questionType === 'fill_blank') {
    return (
      <div className="space-y-3">
        <p className="text-gray-800 leading-relaxed">{question.questionText}</p>
        <input
          type="text"
          defaultValue={answer || ''}
          onBlur={(e) => handleSelect(e.target.value)}
          placeholder="Type your answer…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
    );
  }

  // ── Build option list — true_false gets synthetic options ────────────
  const options =
    question.questionType === 'true_false'
      ? [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' },
        ]
      : question.options || [];

  return (
    <div className="space-y-3">
      <p className="text-gray-800 leading-relaxed">{question.questionText}</p>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = answer === opt.id;

          return (
            <label
              key={opt.id}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <input
                type="radio"
                name={`q_${question.id}`}
                value={opt.id}
                checked={isSelected}
                onChange={() => handleSelect(opt.id)}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">{opt.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
