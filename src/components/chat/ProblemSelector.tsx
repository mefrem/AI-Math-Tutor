/**
 * ProblemSelector component
 * Allows students to select a problem to work on
 */

'use client';

import { VALIDATION_PROBLEMS } from '@/data/problems';
import type { MathProblem } from '@/data/problems';

interface ProblemSelectorProps {
  onSelectProblem: (problem: MathProblem) => void;
  disabled?: boolean;
}

export function ProblemSelector({
  onSelectProblem,
  disabled = false,
}: ProblemSelectorProps) {
  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">
        Select a problem to work on:
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {VALIDATION_PROBLEMS.map((problem) => (
          <button
            key={problem.id}
            onClick={() => onSelectProblem(problem)}
            disabled={disabled}
            className="p-4 text-left border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">
                {problem.type.replace('-', ' ')}
              </span>
              <span className="text-xs text-gray-400">{problem.difficulty}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{problem.content}</p>
            {problem.description && (
              <p className="text-xs text-gray-500 mt-1">{problem.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

