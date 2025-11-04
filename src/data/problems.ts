/**
 * Hardcoded math problems for validation testing
 * These problems are used to validate Socratic tutoring engine
 */

export interface MathProblem {
  id: string;
  type: 'arithmetic' | 'algebra' | 'word-problem';
  content: string;
  expectedAnswer: string; // For validation only, not shown to students
  difficulty: 'easy' | 'medium' | 'hard';
  description?: string;
}

/**
 * Problem 1: Arithmetic
 * "What is 24 + 37?"
 */
export const PROBLEM_1_ARITHMETIC: MathProblem = {
  id: 'problem-1',
  type: 'arithmetic',
  content: 'What is 24 + 37?',
  expectedAnswer: '61',
  difficulty: 'easy',
  description: 'Basic arithmetic addition problem',
};

/**
 * Problem 2: Algebra
 * "Solve for x: 2x + 5 = 13"
 */
export const PROBLEM_2_ALGEBRA: MathProblem = {
  id: 'problem-2',
  type: 'algebra',
  content: 'Solve for x: 2x + 5 = 13',
  expectedAnswer: 'x = 4',
  difficulty: 'medium',
  description: 'Linear equation solving',
};

/**
 * Problem 3: Word Problem
 * "Sarah has 12 apples. She gives 1/3 of them to her friend. How many apples does she have left?"
 */
export const PROBLEM_3_WORD_PROBLEM: MathProblem = {
  id: 'problem-3',
  type: 'word-problem',
  content:
    'Sarah has 12 apples. She gives 1/3 of them to her friend. How many apples does she have left?',
  expectedAnswer: '8 apples',
  difficulty: 'medium',
  description: 'Multi-step word problem with fractions',
};

/**
 * All validation problems
 */
export const VALIDATION_PROBLEMS: MathProblem[] = [
  PROBLEM_1_ARITHMETIC,
  PROBLEM_2_ALGEBRA,
  PROBLEM_3_WORD_PROBLEM,
];

/**
 * Get problem by ID
 */
export function getProblemById(id: string): MathProblem | undefined {
  return VALIDATION_PROBLEMS.find((problem) => problem.id === id);
}

/**
 * Get problems by type
 */
export function getProblemsByType(
  type: MathProblem['type']
): MathProblem[] {
  return VALIDATION_PROBLEMS.filter((problem) => problem.type === type);
}

