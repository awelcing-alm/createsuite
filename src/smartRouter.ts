/**
 * Smart task routing and complexity analysis
 */

export type WorkflowType = 'trivial' | 'simple' | 'complex' | 'team';

export interface RouterResult {
  recommended: WorkflowType;
  confidence: number;
  reasoning: string;
}

/**
 * Analyze task description complexity using keyword heuristics.
 *
 * @param description - The task description to analyze
 * @returns Recommended workflow type
 */
export function analyzeComplexity(description: string): WorkflowType {
  const normalized = description.toLowerCase();

  const teamKeywords = [
    'multi-agent',
    'multiple agents',
    'cross-team',
    'coordinate',
    'coordination',
    'parallel',
    'handoff',
    'convoy'
  ];

  const complexKeywords = [
    'architecture',
    'refactor',
    'migration',
    'distributed',
    'integration',
    'performance',
    'security',
    'scalability'
  ];

  const trivialKeywords = [
    'typo',
    'rename',
    'small fix',
    'quick fix',
    'docs',
    'readme'
  ];

  if (teamKeywords.some(keyword => normalized.includes(keyword))) {
    return 'team';
  }

  if (complexKeywords.some(keyword => normalized.includes(keyword))) {
    return 'complex';
  }

  if (trivialKeywords.some(keyword => normalized.includes(keyword))) {
    return 'trivial';
  }

  return 'simple';
}

/**
 * Routes tasks to an appropriate workflow type based on description analysis.
 */
export class SmartRouter {
  constructor() {}

  /**
   * Route task description to a recommended workflow.
   *
   * @param description - Combined task title and description
   * @returns Routing recommendation with confidence and reasoning
   */
  route(description: string): RouterResult {
    const defaultResult: RouterResult = {
      recommended: 'simple',
      confidence: 0.7,
      reasoning: 'Default routing - task complexity analysis pending'
    };

    const normalized = description.trim();
    if (!normalized) {
      return defaultResult;
    }

    const recommended = analyzeComplexity(normalized);

    if (recommended === 'simple') {
      return defaultResult;
    }

    if (recommended === 'trivial') {
      return {
        recommended,
        confidence: 0.8,
        reasoning: 'Detected lightweight task indicators'
      };
    }

    if (recommended === 'complex') {
      return {
        recommended,
        confidence: 0.82,
        reasoning: 'Detected high-complexity implementation indicators'
      };
    }

    return {
      recommended: 'team',
      confidence: 0.86,
      reasoning: 'Detected collaboration and coordination indicators'
    };
  }
}
