import type { RepoResult } from './github';

export interface ScoredRepo extends RepoResult {
  scores: {
    requirementFit: number;   // does it implement what the user asked for? (weight 0.40)
    effortToAdapt: number;    // how easy to add missing pieces? (weight 0.30)
    codeReadability: number;  // clean structure, small surface area (weight 0.20)
    trustSignals: number;     // README, activity, runnable as-is (weight 0.10)
    composite: number;
  };
  explanation: string;
  whyLearnFrom: string;
}

export interface SearchFilters {
  language: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  platform: string;
  scale: string;
  purpose: string;
  projectContext: string;
  query: string;
}

export interface BobExplanation {
  overview: string;
  architecture: string;
  keyPatterns: Array<{ name: string; explanation: string }>;
  whereToStart: string;
  learningValue: string;
  bobNote: string;
}
