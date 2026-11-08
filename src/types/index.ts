import { ResearchPaper } from '../data/samplePapers';

export type ActiveTab =
  | 'dashboard'
  | 'explorer'
  | 'analyzer'
  | 'comparison'
  | 'literature-review'
  | 'qa'
  | 'library';

export interface TopicExplorationResult {
  topicSummary: string;
  primaryResearchQuestions: Array<{
    question: string;
    rationale: string;
    difficultyLevel: 'Foundational' | 'Advanced' | 'Frontier' | string;
  }>;
  keywordsAndSearchQueries: {
    primaryKeywords: string[];
    booleanQueryGoogleScholar: string;
    booleanQueryArxivAcmIeee: string;
    meshOrDomainTaxonomyTerms: string[];
  };
  subtopics: Array<{
    title: string;
    category: string;
    description: string;
    openProblems: string;
  }>;
  explorationPlan: Array<{
    phase: string;
    title: string;
    objectives: string[];
    recommendedMilestone: string;
    estimatedTimeWeeks: string;
  }>;
  prominentDatabasesAndVenues: {
    suggestedVenues: string[];
    benchmarkDatasets: string[];
  };
}

export interface PaperAnalysisResult {
  title: string;
  authors: string[];
  publicationYearOrDate: string;
  fieldOfStudy: string;
  abstractSummary: string;
  objective: {
    coreProblem: string;
    researchHypothesis: string;
    targetApplication: string;
  };
  methodology: {
    overview: string;
    keyTechniques: string[];
    modelArchitectureOrFramework: string;
    experimentalSetupAndHardware: string;
    datasetsUsed: string[];
    evaluationMetrics: string[];
  };
  findings: {
    keyTakeaways: string[];
    quantitativeResults: Array<{
      metric: string;
      score: string;
      baselineComparison: string;
    }>;
    practicalImplications: string;
  };
  limitations: Array<{
    category: string;
    description: string;
    severity: 'Low' | 'Moderate' | 'Critical' | string;
  }>;
  researchGapAndFutureWork: {
    unaddressedGaps: string[];
    suggestedFutureResearch: string[];
  };
  groundedCitationsFound: Array<{
    citationText: string;
    contextInPaper: string;
  }>;
}

export interface PaperComparisonResult {
  synthesisTitle: string;
  executiveOverview: string;
  comparisonDimensions: Array<{
    dimension: string;
    paperValues: Array<{
      paperId: string;
      paperTitle: string;
      summary: string;
      concreteEvidence: string;
    }>;
  }>;
  consensusAndConvergence: Array<{
    theme: string;
    description: string;
    agreementLevel: string;
  }>;
  divergentFindingsAndDebates: Array<{
    disputePoint: string;
    perspectiveA: string;
    perspectiveB: string;
    underlyingReason: string;
  }>;
  methodologicalTradeoffs: Array<{
    approachA: string;
    approachB: string;
    tradeoffDescription: string;
    recommendedContext: string;
  }>;
  consolidatedResearchGaps: Array<{
    gapTitle: string;
    whyItRemainsOpen: string;
    crossPollinationOpportunity: string;
  }>;
}

export interface LiteratureReviewResult {
  reviewTitle: string;
  abstractAndScope: string;
  primaryThemes: Array<{
    themeName: string;
    summary: string;
    groundedSynthesis: string;
    contributingPapers: string[];
  }>;
  methodologicalEvolution: {
    summary: string;
    dominantParadigms: string[];
    experimentalStandards: string;
  };
  conflictingResultsAndDebates: Array<{
    controversy: string;
    supportingEvidenceA: string;
    supportingEvidenceB: string;
    scholarlyImplication: string;
  }>;
  criticalResearchGaps: Array<{
    gapName: string;
    description: string;
    significance: string;
    potentialMethodologicalSolution: string;
  }>;
  futureResearchAgenda: Array<{
    hypothesisOrQuestion: string;
    proposedApproach: string;
    expectedImpact: string;
  }>;
  groundedReferences: Array<{
    paperTitle: string;
    keyContributionToReview: string;
  }>;
}

export interface QAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  evidenceFound?: boolean;
  confidenceLevel?: string;
  citations?: Array<{
    paperTitle: string;
    pageOrSection: string;
    quotedExcerpt: string;
  }>;
  suggestedFollowUps?: string[];
}
