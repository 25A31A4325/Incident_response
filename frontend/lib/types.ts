// TypeScript types for IncidentMind AI

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Open' | 'Investigating' | 'Resolved' | 'Partial';
export type Environment = 'Production' | 'Staging' | 'Development';
export type ResolutionResult = 'Resolved' | 'Partial' | 'Unresolved';
export type FeedbackRating = 'Yes' | 'Partially' | 'No';

export interface Incident {
  id: string;
  title: string;
  service: string;
  environment: Environment;
  severity: Severity;
  status: Status;
  timestamp: string;
  errorMessage?: string;
  logsDescription?: string;
  rootCause?: string;
  resolution?: string;
  failedApproaches?: string;
  resolutionTime?: number; // minutes
  resolutionResult?: ResolutionResult;
  feedbackRating?: FeedbackRating;
  investigationResult?: InvestigationResult;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentInput {
  title: string;
  service: string;
  environment: Environment;
  severity: Severity;
  timestamp: string;
  errorMessage?: string;
  logsDescription?: string;
}

export interface Memory {
  id: string;
  incidentId: string;
  title: string;
  service: string;
  severity: Severity;
  rootCause: string;
  resolution: string;
  failedApproaches?: string[];
  resolutionTime: number;
  outcome: 'Success' | 'Partial' | 'Failed';
  timestamp: string;
  similarity?: number;
  tags?: string[];
}

export interface MemoryResult {
  memories: Memory[];
  totalCount: number;
  source: 'live' | 'demo';
}

export interface InvestigationResult {
  summary: string;
  likelyCauses: string[];
  investigationSteps: string[];
  recommendedActions: string[];
  warnings: string[];
  whyThisRecommendation: string;
  confidenceScore: number; // 0-100
  memoriesUsed: Memory[];
  memoryCount: number;
  source: 'live' | 'demo';
}

export interface ResolutionInput {
  rootCause: string;
  resolution: string;
  failedApproaches?: string;
  result: ResolutionResult;
  resolutionTime: number;
  feedbackRating: FeedbackRating;
}

export interface AgentResponse {
  recommendation: InvestigationResult;
  memories: Memory[];
}

export interface Analytics {
  totalIncidents: number;
  resolvedIncidents: number;
  avgResolutionTime: number;
  memoryCount: number;
  knowledgeGrowth: number;
  incidentsByMonth: { month: string; count: number }[];
  rootCauseDistribution: { name: string; value: number; color: string }[];
  resolutionTimeByService: { service: string; avgTime: number }[];
  memoryGrowthOverTime: { month: string; memories: number }[];
  severityDistribution: { severity: string; count: number }[];
}

export interface DemoResult {
  step1: {
    incident: Incident;
    investigation: InvestigationResult;
    memories: Memory[];
  };
  step2: {
    incident: Incident;
    investigation: InvestigationResult;
    memories: Memory[];
  };
}

export interface Pattern {
  id: string;
  title: string;
  description: string;
  frequency: number;
  confidence: number;
  services: string[];
  tags: string[];
}

export interface TimelineEntry {
  interaction: number;
  label: string;
  date: string;
  status: 'Generic' | 'Memory-Aware' | 'Experienced' | 'Expert';
  quote: string;
  memoriesFound: number;
  color: string;
}
