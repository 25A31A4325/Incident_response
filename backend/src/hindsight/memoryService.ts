import axios from 'axios';
import { DEMO_INCIDENTS } from '../demo/demoData';

export interface MemoryResult {
  id: string;
  title: string;
  service: string;
  rootCause: string;
  resolution: string;
  failedApproaches: string;
  resolutionTimeMinutes: number;
  outcome: string;
  createdAt: string;
  similarity: number;
  source: 'hindsight' | 'demo';
}

export interface MemoryRecord {
  id: string;
  title: string;
  service: string;
  severity: string;
  description: string;
  rootCause: string;
  resolution: string;
  failedApproaches: string;
  resolutionTimeMinutes: number;
  outcome: string;
  engineerFeedback: string;
  createdAt: string;
}

export class HindsightMemoryService {
  private apiKey: string;
  private projectId: string;
  private pipelineId: string;
  private baseUrl: string;
  private isConfigured: boolean;

  constructor() {
    this.apiKey = process.env.VECTORIZE_API_KEY || '';
    this.projectId = process.env.VECTORIZE_PROJECT_ID || '';
    this.pipelineId = process.env.VECTORIZE_PIPELINE_ID || '';
    this.baseUrl = 'https://api.vectorize.io/v1';
    this.isConfigured = !!(this.apiKey && this.projectId && this.pipelineId);

    if (this.isConfigured) {
      console.log('[Hindsight] Connected to Vectorize Hindsight API');
    } else {
      console.log('[Hindsight] Running in demo mode (no Vectorize credentials)');
    }
  }

  isLive(): boolean {
    return this.isConfigured;
  }

  async recall(query: string, topK: number = 5): Promise<MemoryResult[]> {
    if (!this.isConfigured) {
      return this.getDemoMemories(query, topK);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/org/${this.projectId}/pipelines/${this.pipelineId}/retrieve`,
        { question: query, numResults: topK },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const mapped = this.mapVectorizeResults(response.data);
      if (mapped.length === 0) {
        console.log('[Hindsight] No results from Vectorize, using demo memories as fallback');
        return this.getDemoMemories(query, topK);
      }
      return mapped;
    } catch (e: any) {
      console.error('[Hindsight] Recall error:', e?.message || e);
      return this.getDemoMemories(query, topK);
    }
  }

  async store(memory: MemoryRecord): Promise<string> {
    if (!this.isConfigured) {
      console.log('[Hindsight] Demo mode: would store memory:', memory.title);
      return 'demo-' + Date.now();
    }

    try {
      const content = this.formatMemoryContent(memory);
      await axios.post(
        `${this.baseUrl}/org/${this.projectId}/pipelines/${this.pipelineId}/documents`,
        {
          documents: [
            {
              id: memory.id,
              content: content,
              metadata: {
                type: 'incident',
                title: memory.title,
                service: memory.service,
                severity: memory.severity,
                rootCause: memory.rootCause,
                resolution: memory.resolution,
                failedApproaches: memory.failedApproaches,
                resolutionTimeMinutes: memory.resolutionTimeMinutes,
                outcome: memory.outcome,
                engineerFeedback: memory.engineerFeedback,
                createdAt: memory.createdAt,
              },
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log(`[Hindsight] Stored memory: ${memory.id}`);
      return memory.id;
    } catch (e: any) {
      console.error('[Hindsight] Store error:', e?.message || e);
      throw new Error(`Failed to store memory in Hindsight: ${e?.message}`);
    }
  }

  private formatMemoryContent(memory: MemoryRecord): string {
    return [
      `INCIDENT: ${memory.title}`,
      `SERVICE: ${memory.service}`,
      `SEVERITY: ${memory.severity}`,
      `DESCRIPTION: ${memory.description}`,
      `ROOT CAUSE: ${memory.rootCause}`,
      `RESOLUTION: ${memory.resolution}`,
      `FAILED APPROACHES: ${memory.failedApproaches || 'None documented'}`,
      `RESOLUTION TIME: ${memory.resolutionTimeMinutes} minutes`,
      `OUTCOME: ${memory.outcome}`,
      `FEEDBACK: ${memory.engineerFeedback || 'N/A'}`,
      `DATE: ${memory.createdAt}`,
    ].join('\n');
  }

  getDemoMemories(query: string, topK: number = 5): MemoryResult[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower
      .split(/\s+/)
      .filter(k => k.length > 3)
      .slice(0, 20);

    if (keywords.length === 0) {
      // Return top N most recent if no keywords
      return DEMO_INCIDENTS.slice(0, topK).map(inc => ({
        id: inc.id,
        title: inc.title,
        service: inc.service,
        rootCause: inc.rootCause,
        resolution: inc.resolution,
        failedApproaches: inc.failedApproaches,
        resolutionTimeMinutes: inc.resolutionTimeMinutes,
        outcome: inc.outcome,
        createdAt: inc.createdAt,
        similarity: 0.65,
        source: 'demo' as const,
      }));
    }

    const scored = DEMO_INCIDENTS.map(inc => {
      const searchText = [
        inc.title,
        inc.description,
        inc.rootCause,
        inc.resolution,
        inc.service,
        inc.errorMessage || '',
      ]
        .join(' ')
        .toLowerCase();

      const score = keywords.reduce((acc, keyword) => {
        if (searchText.includes(keyword)) acc += 1;
        // Bonus for title/root cause matches
        if (inc.title.toLowerCase().includes(keyword)) acc += 0.5;
        if (inc.rootCause.toLowerCase().includes(keyword)) acc += 0.5;
        return acc;
      }, 0);

      return { ...inc, score };
    })
      .filter(i => i.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored.map(inc => ({
      id: inc.id,
      title: inc.title,
      service: inc.service,
      rootCause: inc.rootCause,
      resolution: inc.resolution,
      failedApproaches: inc.failedApproaches,
      resolutionTimeMinutes: inc.resolutionTimeMinutes,
      outcome: inc.outcome,
      createdAt: inc.createdAt,
      similarity: Math.min(0.98, 0.65 + inc.score * 0.08),
      source: 'demo' as const,
    }));
  }

  private mapVectorizeResults(data: any): MemoryResult[] {
    const docs = data?.documents || data?.results || data?.chunks || [];
    return docs.map((doc: any) => ({
      id: doc.id || doc.documentId || `vec-${Date.now()}`,
      title: doc.metadata?.title || doc.title || 'Historical Incident',
      service: doc.metadata?.service || doc.service || 'Unknown',
      rootCause: doc.metadata?.rootCause || doc.rootCause || doc.content?.substring(0, 200) || '',
      resolution: doc.metadata?.resolution || doc.resolution || '',
      failedApproaches: doc.metadata?.failedApproaches || doc.failedApproaches || '',
      resolutionTimeMinutes: Number(doc.metadata?.resolutionTimeMinutes || doc.resolutionTimeMinutes || 0),
      outcome: doc.metadata?.outcome || doc.outcome || '',
      createdAt: doc.metadata?.createdAt || doc.createdAt || new Date().toISOString(),
      similarity: Number(doc.score || doc.similarity || doc.relevanceScore || 0.8),
      source: 'hindsight' as const,
    }));
  }
}
