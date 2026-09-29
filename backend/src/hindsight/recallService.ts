import db from '../db/database';
import { HindsightMemoryService, MemoryResult } from './memoryService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles recalling relevant memories for a given incident query.
 * Combines Hindsight API results with local DB memory records.
 */
export class RecallService {
  private memoryService: HindsightMemoryService;

  constructor(memoryService: HindsightMemoryService) {
    this.memoryService = memoryService;
  }

  async recallForIncident(
    incidentTitle: string,
    description: string,
    service: string,
    errorMessage?: string
  ): Promise<MemoryResult[]> {
    // Build a rich query for semantic search
    const queryParts = [incidentTitle, description];
    if (service) queryParts.push(`service: ${service}`);
    if (errorMessage) queryParts.push(errorMessage.substring(0, 200));

    const query = queryParts.join('. ');

    const memories = await this.memoryService.recall(query, 5);

    // Also check local DB for recently stored incidents (not in Hindsight yet)
    const localMemories = this.getLocalMemories(service, incidentTitle);

    // Merge: Hindsight results take priority, local fills gaps
    const combined = [...memories];
    for (const local of localMemories) {
      if (!combined.find(m => m.id === local.id)) {
        combined.push(local);
      }
    }

    return combined.slice(0, 6);
  }

  async recallByQuery(query: string, topK: number = 5): Promise<MemoryResult[]> {
    return this.memoryService.recall(query, topK);
  }

  private getLocalMemories(service: string, title: string): MemoryResult[] {
    try {
      const rows = db
        .prepare(
          `SELECT id, title, service, root_cause, resolution,
                  failed_approaches, resolution_time_minutes, engineer_feedback,
                  created_at
           FROM incidents
           WHERE status = 'resolved'
             AND hindsight_stored = 0
             AND (service = ? OR title LIKE ?)
           ORDER BY created_at DESC
           LIMIT 3`
        )
        .all(service, `%${title.split(' ')[0]}%`) as any[];

      return rows.map(row => ({
        id: row.id,
        title: row.title,
        service: row.service,
        rootCause: row.root_cause || '',
        resolution: row.resolution || '',
        failedApproaches: row.failed_approaches || '',
        resolutionTimeMinutes: row.resolution_time_minutes || 0,
        outcome: row.engineer_feedback || '',
        createdAt: row.created_at,
        similarity: 0.72,
        source: 'demo' as const,
      }));
    } catch {
      return [];
    }
  }
}
