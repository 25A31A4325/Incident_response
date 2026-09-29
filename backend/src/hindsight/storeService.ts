import db from '../db/database';
import { HindsightMemoryService, MemoryRecord } from './memoryService';
import { v4 as uuidv4 } from 'uuid';

export interface StoreIncidentInput {
  incidentId: string;
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

export interface StoreResult {
  success: boolean;
  hindsightId: string;
  stored: boolean;
  message: string;
}

/**
 * Handles storing resolved incident knowledge into Hindsight (Vectorize)
 * and recording the storage in the local DB.
 */
export class StoreService {
  private memoryService: HindsightMemoryService;

  constructor(memoryService: HindsightMemoryService) {
    this.memoryService = memoryService;
  }

  async storeResolution(input: StoreIncidentInput): Promise<StoreResult> {
    const memoryRecord: MemoryRecord = {
      id: `mem-${input.incidentId}-${Date.now()}`,
      title: input.title,
      service: input.service,
      severity: input.severity,
      description: input.description,
      rootCause: input.rootCause,
      resolution: input.resolution,
      failedApproaches: input.failedApproaches,
      resolutionTimeMinutes: input.resolutionTimeMinutes,
      outcome: input.outcome,
      engineerFeedback: input.engineerFeedback,
      createdAt: input.createdAt,
    };

    let hindsightId: string;
    let stored = false;

    try {
      hindsightId = await this.memoryService.store(memoryRecord);
      stored = true;
    } catch (e: any) {
      console.error('[StoreService] Failed to store in Hindsight:', e?.message);
      hindsightId = `local-${uuidv4()}`;
      stored = false;
    }

    // Record the memory in local DB
    try {
      db.prepare(
        `INSERT INTO memories (id, incident_id, memory_type, content, hindsight_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        memoryRecord.id,
        input.incidentId,
        'resolution',
        JSON.stringify({
          title: input.title,
          service: input.service,
          rootCause: input.rootCause,
          resolution: input.resolution,
        }),
        hindsightId,
        new Date().toISOString()
      );

      // Mark incident as stored in Hindsight
      db.prepare(
        `UPDATE incidents SET hindsight_stored = 1 WHERE id = ?`
      ).run(input.incidentId);
    } catch (dbErr: any) {
      console.error('[StoreService] DB update error:', dbErr?.message);
    }

    return {
      success: true,
      hindsightId,
      stored,
      message: stored
        ? `Memory stored in Hindsight: ${hindsightId}`
        : `Memory stored locally (Hindsight unavailable): ${hindsightId}`,
    };
  }
}
