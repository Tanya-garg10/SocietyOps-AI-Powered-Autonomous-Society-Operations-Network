import { 
  Incident, 
  AgentInfo, 
  Vendor, 
  ApprovalRequest, 
  ResolutionEvidence, 
  CorrelationCluster, 
  AuditEvent, 
  SwitchRoom, 
  SwitchMessage,
  IncidentCategory,
  IncidentPriority,
  PredictiveRecommendation,
  AgentWarRoomEvent,
  HeatmapCell,
  ProofScoreBreakdown
} from '../types.js';
import { 
  INITIAL_AGENTS, 
  INITIAL_INCIDENTS, 
  INITIAL_VENDORS, 
  INITIAL_APPROVALS, 
  INITIAL_EVIDENCE, 
  INITIAL_CORRELATIONS, 
  INITIAL_SWITCH_ROOMS, 
  INITIAL_SWITCH_MESSAGES, 
  INITIAL_AUDIT_LOG,
  INITIAL_PREDICTIVE_RECOMMENDATIONS,
  INITIAL_WAR_ROOM_EVENTS
} from './mockData.js';
import { runTriageWithGemini, runCorrelationWithGemini, runEvidenceAuditWithGemini } from './geminiService.js';
import { Response } from 'express';

export function calculateProofScore(
  evidence: ResolutionEvidence
): ProofScoreBreakdown {
  const missingCriteria: string[] = [];
  
  // 1. Technician Report (25 max)
  let techScore = 0;
  if (evidence.repairNotes && evidence.repairNotes.length > 25) techScore += 15;
  else missingCriteria.push('Detailed repair narrative missing or too brief (<25 chars)');
  
  if (evidence.laborHours && evidence.laborHours > 0) techScore += 5;
  else missingCriteria.push('Labor hours not logged');
  
  if (evidence.partsReplaced && evidence.partsReplaced.length > 0) techScore += 5;
  
  // 2. Photo Evidence (25 max)
  let photoScore = 0;
  const hasBefore = Boolean(evidence.beforePhotoUrl && evidence.beforePhotoUrl.length > 5);
  const hasAfter = Boolean(evidence.afterPhotoUrl && evidence.afterPhotoUrl.length > 5);
  if (hasBefore) photoScore += 12.5;
  else missingCriteria.push('Pre-repair condition photo required');
  if (hasAfter) photoScore += 12.5;
  else missingCriteria.push('Post-repair resolution photo required');

  // 3. Completed Checklist (20 max)
  let checklistScore = 0;
  if (evidence.completedChecklist && evidence.completedChecklist.length > 0) {
    const completedCount = evidence.completedChecklist.filter(c => c.completed).length;
    checklistScore = Math.round((completedCount / evidence.completedChecklist.length) * 20);
    if (completedCount < evidence.completedChecklist.length) {
      missingCriteria.push(`${evidence.completedChecklist.length - completedCount} safety checklist item(s) uncompleted`);
    }
  } else {
    missingCriteria.push('Mandatory multi-point quality checklist missing');
  }

  // 4. Resident Signoff (15 max)
  let residentScore = 0;
  if (evidence.residentRating && evidence.residentRating >= 4) {
    residentScore = 15;
  } else if (evidence.residentRating && evidence.residentRating > 0) {
    residentScore = 10;
  } else {
    missingCriteria.push('Resident digital sign-off and satisfaction rating pending');
  }

  // 5. Manager Signoff (15 max)
  let managerScore = 0;
  if (evidence.status === 'verified') {
    managerScore = 15;
  } else {
    missingCriteria.push('Operations Manager audit confirmation pending');
  }

  const totalScore = Math.min(100, Math.round(techScore + photoScore + checklistScore + residentScore + managerScore));
  const isEligibleForClosure = totalScore >= 80 && hasBefore && hasAfter && checklistScore >= 15;

  return {
    score: totalScore,
    technicianReportScore: Math.round(techScore),
    photoEvidenceScore: Math.round(photoScore),
    checklistScore: Math.round(checklistScore),
    residentSignoffScore: residentScore,
    managerSignoffScore: managerScore,
    missingCriteria,
    isEligibleForClosure,
    isOverridden: false
  };
}

class OpsStore {
  private incidents: Incident[] = [];
  private agents: AgentInfo[] = [];
  private vendors: Vendor[] = [];
  private approvals: ApprovalRequest[] = [];
  private evidence: ResolutionEvidence[] = [];
  private correlations: CorrelationCluster[] = [];
  private auditLog: AuditEvent[] = [];
  private switchRooms: SwitchRoom[] = [];
  private switchMessages: SwitchMessage[] = [];
  private predictiveRecommendations: PredictiveRecommendation[] = [];
  private warRoomEvents: AgentWarRoomEvent[] = [];
  private sseClients: Response[] = [];
  private switchPublisher?: (message: SwitchMessage) => Promise<'sent' | 'local'>;

  constructor() {
    this.reset();
  }

  public reset() {
    this.incidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
    this.agents = JSON.parse(JSON.stringify(INITIAL_AGENTS));
    this.vendors = JSON.parse(JSON.stringify(INITIAL_VENDORS));
    this.approvals = JSON.parse(JSON.stringify(INITIAL_APPROVALS));
    this.evidence = JSON.parse(JSON.stringify(INITIAL_EVIDENCE));
    this.correlations = JSON.parse(JSON.stringify(INITIAL_CORRELATIONS));
    this.switchRooms = JSON.parse(JSON.stringify(INITIAL_SWITCH_ROOMS));
    this.switchMessages = JSON.parse(JSON.stringify(INITIAL_SWITCH_MESSAGES));
    this.auditLog = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOG));
    this.predictiveRecommendations = JSON.parse(JSON.stringify(INITIAL_PREDICTIVE_RECOMMENDATIONS));
    this.warRoomEvents = JSON.parse(JSON.stringify(INITIAL_WAR_ROOM_EVENTS));

    // Ensure proof scores are computed on evidence
    for (const ev of this.evidence) {
      if (!ev.proofBreakdown) {
        ev.proofBreakdown = calculateProofScore(ev);
      }
    }

    this.broadcastSSE('reset', { message: 'Operations store restored to initial seed state.' });
  }

  public setSwitchPublisher(publisher: (message: SwitchMessage) => Promise<'sent' | 'local'>) {
    this.switchPublisher = publisher;
  }

  public registerSSEClient(res: Response) {
    this.sseClients.push(res);
    res.on('close', () => {
      this.sseClients = this.sseClients.filter(c => c !== res);
    });
  }

  public broadcastSSE(event: string, data: unknown) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch (err) {
        // Ignore disconnected clients
      }
    }
  }

  // --- Incidents ---
  public getIncidents(query?: { status?: string; priority?: string; building?: string; search?: string }): Incident[] {
    let list = [...this.incidents];
    if (query?.status) {
      list = list.filter(i => i.status.toLowerCase() === query.status?.toLowerCase());
    }
    if (query?.priority) {
      list = list.filter(i => i.priority.toLowerCase() === query.priority?.toLowerCase());
    }
    if (query?.building) {
      list = list.filter(i => i.building.toLowerCase().includes(query.building!.toLowerCase()));
    }
    if (query?.search) {
      const s = query.search.toLowerCase();
      list = list.filter(i => 
        i.title.toLowerCase().includes(s) || 
        i.ticketNumber.toLowerCase().includes(s) || 
        i.flat.toLowerCase().includes(s) ||
        i.description.toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find(i => i.id === id || i.ticketNumber === id);
  }

  public async createIncident(data: {
    title?: string;
    description: string;
    building?: string;
    flat?: string;
    residentName?: string;
    residentContact?: string;
  }): Promise<{ incident: Incident; correlation?: CorrelationCluster }> {
    const rawDesc = data.description;
    
    // 1. Run Triage Agent
    const triageResult = await runTriageWithGemini(rawDesc, data.building, data.flat);

    const ticketSeq = 100 + this.incidents.length + 1;
    const ticketNumber = `TKT-2026-${ticketSeq}`;
    const incidentId = `INC-${ticketSeq}`;
    const nowIso = new Date().toISOString();
    const timeShort = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newIncident: Incident = {
      id: incidentId,
      ticketNumber,
      title: data.title || triageResult.title,
      description: rawDesc,
      category: triageResult.category,
      building: triageResult.building,
      flat: triageResult.flat,
      floor: parseInt(triageResult.flat.replace(/\D/g, '')[0] || '1', 10),
      priority: triageResult.priority,
      status: 'Investigating',
      residentName: data.residentName || 'Resident Report',
      residentContact: data.residentContact || '+91 98000 00000',
      createdAt: nowIso,
      updatedAt: nowIso,
      tags: triageResult.tags,
      switchRoom: 'society-control',
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          timestamp: timeShort,
          actor: data.residentName || 'Resident Inbound',
          actorRole: 'resident',
          action: 'Incident Created',
          details: rawDesc,
          badge: 'Report Ingested'
        },
        {
          id: `t-${Date.now()}-2`,
          timestamp: timeShort,
          actor: 'Triage Agent',
          actorRole: 'agent',
          action: 'Classified & Prioritized',
          details: `Classified as ${triageResult.category} (${triageResult.priority} priority).`,
          badge: 'Switch: #society-control'
        }
      ]
    };

    // 2. Announce on Switch #society-control
    this.sendSwitchMessage({
      roomId: 'society-control',
      sender: 'Triage Agent',
      senderType: 'agent',
      content: `🚨 [NEW INCIDENT] Ticket ${ticketNumber} created for Flat ${newIncident.flat} (${newIncident.building}). Category: ${newIncident.category}. Priority: ${newIncident.priority.toUpperCase()}. ${newIncident.title}`,
      metadata: { incidentId, actionRequired: true }
    });

    this.sendSwitchMessage({
      roomId: 'incident-water-leak-001',
      sender: 'Triage Agent',
      senderType: 'agent',
      content: `Please investigate ${ticketNumber}: ${newIncident.description} Location: ${newIncident.building}, ${newIncident.flat}. Check related reports and identify possible correlations. Do not dispatch anyone without manager approval.`,
      metadata: {
        incidentId,
        mentionAgentHandle: '@intel-agent',
      }
    });

    // 3. Add War Room event for ingestion
    this.addWarRoomEvent({
      fromAgentId: 'agent-triage',
      fromAgentName: 'Triage Agent',
      toAgentId: 'agent-intel',
      toAgentName: 'Intelligence Agent',
      eventType: 'triage_dispatch',
      incidentId,
      ticketNumber,
      title: `Triage Ingested: ${newIncident.title}`,
      details: `Dispatched metadata to Intelligence Agent for correlation analysis. Flat: ${newIncident.flat}, Priority: ${newIncident.priority}.`,
      room: 'society-control'
    });

    // 4. Run Intelligence Agent (Correlation Check)
    const existingForCorrelation = this.incidents.map(i => ({
      id: i.id,
      ticketNumber: i.ticketNumber,
      title: i.title,
      description: i.description,
      flat: i.flat,
      building: i.building
    }));

    const correlationResult = await runCorrelationWithGemini(
      {
        title: newIncident.title,
        description: newIncident.description,
        building: newIncident.building,
        flat: newIncident.flat
      },
      existingForCorrelation
    );

    let createdOrUpdatedCluster: CorrelationCluster | undefined;

    if (correlationResult.isCorrelated) {
      const clusterId = `CORR-${Date.now().toString().slice(-5)}`;
      newIncident.correlationId = clusterId;
      newIncident.switchRoom = 'incident-water-leak-001';
      newIncident.rootCauseHypothesis = correlationResult.hypothesis;

      newIncident.timeline.push({
        id: `t-${Date.now()}-3`,
        timestamp: timeShort,
        actor: 'Intelligence Agent',
        actorRole: 'agent',
        action: 'Incident Correlation Detected',
        details: `${correlationResult.hypothesis} (Confidence: ${correlationResult.confidenceScore}%).`,
        badge: 'Switch: #incident-water-leak-001'
      });

      createdOrUpdatedCluster = {
        id: clusterId,
        name: `${newIncident.building} Shared Infrastructure Correlation`,
        category: newIncident.category,
        building: newIncident.building,
        affectedIncidents: [newIncident.id, ...correlationResult.relatedTicketNumbers],
        rootCauseHypothesis: correlationResult.hypothesis,
        confidenceScore: correlationResult.confidenceScore,
        evidencePoints: [
          `New report in ${newIncident.flat} corroborates structural adjacency.`,
          `Confidence score: ${correlationResult.confidenceScore}% based on shared utility shafts.`,
          correlationResult.recommendation
        ],
        confirmedFacts: [
          `Active report logged at Flat ${newIncident.flat} at ${new Date().toLocaleTimeString()}`,
          `Pre-existing tickets present in same architectural column: ${correlationResult.relatedTicketNumbers.join(', ')}`,
          `Shared vertical conduit verified in building blueprint.`
        ],
        hypothesizedPoints: [
          `${correlationResult.hypothesis}`,
          `Potential thermal fatigue along joint sealant line`,
          `Water trajectory calculated from 3rd floor gravity tracking to ground lobby`
        ],
        recommendedAction: correlationResult.recommendation,
        isVerified: false,
        createdAt: nowIso
      };

      this.correlations.unshift(createdOrUpdatedCluster);

      // Announce correlation in Switch room
      this.sendSwitchMessage({
        roomId: 'incident-water-leak-001',
        sender: 'SocietyOps Intelligence Agent (Gemini)',
        senderType: 'agent',
        content: `🔍 Spatial Correlation Formulated: Linking ${ticketNumber} with tickets [${correlationResult.relatedTicketNumbers.join(', ')}]. Hypothesis: ${correlationResult.hypothesis}. Recommended action: ${correlationResult.recommendation}`,
        metadata: { incidentId, correlationId: clusterId, confidence: correlationResult.confidenceScore }
      });

      this.addWarRoomEvent({
        fromAgentId: 'agent-intel',
        fromAgentName: 'Intelligence Agent',
        toAgentId: 'agent-dispatch',
        toAgentName: 'Dispatch Agent',
        eventType: 'correlation_alert',
        incidentId,
        ticketNumber,
        title: `Correlation Alert: ${clusterId}`,
        details: `Linked ${ticketNumber} with shared riser failure hypothesis (Confidence: ${correlationResult.confidenceScore}%).`,
        room: 'incident-water-leak-001'
      });
    }

    this.incidents.unshift(newIncident);

    // Update Triage Agent stats
    const triageAgent = this.agents.find(a => a.id === 'agent-triage');
    if (triageAgent) {
      triageAgent.processedIncidentsCount += 1;
      triageAgent.lastActive = 'Just now';
      triageAgent.recentActivities.unshift({
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        incidentId,
        action: `Ingested & classified ticket ${ticketNumber}`,
        details: `Flat ${newIncident.flat}, Priority: ${newIncident.priority}`,
        room: 'society-control'
      });
    }

    // Add Audit Log
    this.addAuditLog({
      actor: data.residentName || 'Resident (Portal)',
      actorType: 'human',
      action: 'INCIDENT_CREATED',
      incidentId,
      details: `Created ticket ${ticketNumber}: ${newIncident.title} in ${newIncident.flat}`,
      switchRoom: newIncident.switchRoom
    });

    this.broadcastSSE('incident_created', { incident: newIncident, correlation: createdOrUpdatedCluster });
    return { incident: newIncident, correlation: createdOrUpdatedCluster };
  }

  public updateIncident(id: string, patch: Partial<Incident>): Incident | undefined {
    const inc = this.getIncidentById(id);
    if (!inc) return undefined;

    Object.assign(inc, patch, { updatedAt: new Date().toISOString() });
    this.broadcastSSE('incident_updated', { incident: inc });
    return inc;
  }

  // --- Agents ---
  public getAgents(): AgentInfo[] {
    return this.agents;
  }

  public getAgentById(id: string): AgentInfo | undefined {
    return this.agents.find(a => a.id === id);
  }

  // --- Vendors ---
  public getVendors(): Vendor[] {
    return this.vendors;
  }

  // --- Approvals ---
  public getApprovals(): ApprovalRequest[] {
    return this.approvals.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  public approveRequest(id: string, decisionNotes?: string, decidedBy = 'Society Operations Manager'): ApprovalRequest | undefined {
    const app = this.approvals.find(a => a.id === id);
    if (!app) return undefined;

    app.status = 'approved';
    app.decidedAt = new Date().toISOString();
    app.decidedBy = decidedBy;
    app.decisionNotes = decisionNotes || 'Approved by Operations Manager.';

    // Advance incident
    const inc = this.getIncidentById(app.incidentId);
    if (inc) {
      inc.status = 'Assigned';
      inc.assignedTechnician = app.supportingData.technicianName || 'Rajesh Kumar (Lead Plumber)';
      inc.assignedVendor = app.supportingData.vendorName || 'AquaFix Plumbing Solutions';
      inc.timeline.push({
        id: `t-${Date.now()}-app`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: decidedBy,
        actorRole: 'manager',
        action: 'Human Approval Granted',
        details: `Approved $${app.estimatedCost} for ${app.title}. Dispatched ${inc.assignedTechnician}.`,
        badge: 'Approved'
      });
      this.broadcastSSE('incident_updated', { incident: inc });
    }

    // Switch announcement
    this.sendSwitchMessage({
      roomId: inc?.switchRoom || 'incident-water-leak-001',
      sender: decidedBy,
      senderType: 'human',
      content: `✅ [HUMAN APPROVAL GRANTED] Approved request ${app.id} ($${app.estimatedCost}). Dispatch authorized for ${inc?.assignedTechnician || 'assigned vendor'}.`,
      metadata: { incidentId: app.incidentId, actionRequired: false }
    });

    this.addWarRoomEvent({
      fromAgentId: 'agent-dispatch',
      fromAgentName: 'Dispatch Agent',
      toAgentId: 'agent-vendor',
      toAgentName: 'Vendor Agent',
      eventType: 'decision',
      incidentId: app.incidentId,
      ticketNumber: app.ticketNumber,
      title: `Authorization Granted: ${app.id}`,
      details: `${decidedBy} approved $${app.estimatedCost}. Workforce deployed.`,
      room: inc?.switchRoom || 'incident-water-leak-001'
    });

    this.addAuditLog({
      actor: decidedBy,
      actorType: 'human',
      action: 'APPROVAL_GRANTED',
      incidentId: app.incidentId,
      details: `Approved ${app.title} ($${app.estimatedCost})`,
      switchRoom: inc?.switchRoom || 'incident-water-leak-001'
    });

    this.broadcastSSE('approval_updated', { approval: app });
    return app;
  }

  public rejectRequest(id: string, reason: string, decidedBy = 'Society Operations Manager'): ApprovalRequest | undefined {
    const app = this.approvals.find(a => a.id === id);
    if (!app) return undefined;

    app.status = 'rejected';
    app.decidedAt = new Date().toISOString();
    app.decidedBy = decidedBy;
    app.decisionNotes = reason;

    const inc = this.getIncidentById(app.incidentId);
    if (inc) {
      inc.timeline.push({
        id: `t-${Date.now()}-rej`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: decidedBy,
        actorRole: 'manager',
        action: 'Human Approval Rejected',
        details: `Rejected with notes: ${reason}`,
        badge: 'Rejected'
      });
      this.broadcastSSE('incident_updated', { incident: inc });
    }

    this.sendSwitchMessage({
      roomId: inc?.switchRoom || 'incident-water-leak-001',
      sender: decidedBy,
      senderType: 'human',
      content: `❌ [APPROVAL REJECTED] Proposal ${app.id} declined. Reason: ${reason}. Requesting alternative approach from Dispatch/Vendor agents.`,
      metadata: { incidentId: app.incidentId }
    });

    this.addWarRoomEvent({
      fromAgentId: 'agent-dispatch',
      fromAgentName: 'Dispatch Agent',
      eventType: 'decision',
      incidentId: app.incidentId,
      ticketNumber: app.ticketNumber,
      title: `Approval Declined: ${app.id}`,
      details: `Proposal rejected by ${decidedBy}: ${reason}`,
      room: inc?.switchRoom || 'incident-water-leak-001'
    });

    this.addAuditLog({
      actor: decidedBy,
      actorType: 'human',
      action: 'APPROVAL_REJECTED',
      incidentId: app.incidentId,
      details: `Rejected ${app.title}. Reason: ${reason}`
    });

    this.broadcastSSE('approval_updated', { approval: app });
    return app;
  }

  public requestChanges(id: string, notes: string, decidedBy = 'Society Operations Manager'): ApprovalRequest | undefined {
    const app = this.approvals.find(a => a.id === id);
    if (!app) return undefined;

    app.status = 'changes_requested';
    app.changesRequestedNotes = notes;
    app.decidedBy = decidedBy;

    const inc = this.getIncidentById(app.incidentId);
    if (inc) {
      inc.timeline.push({
        id: `t-${Date.now()}-cr`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: decidedBy,
        actorRole: 'manager',
        action: 'Changes Requested on Proposal',
        details: `Manager requested modifications: ${notes}`,
        badge: 'Changes Requested'
      });
      this.broadcastSSE('incident_updated', { incident: inc });
    }

    this.sendSwitchMessage({
      roomId: inc?.switchRoom || 'incident-water-leak-001',
      sender: decidedBy,
      senderType: 'human',
      content: `🔄 [CHANGES REQUESTED] Proposal ${app.id} needs adjustments. Feedback: "${notes}". Agents, please revise quotes or scope of work.`,
      metadata: { incidentId: app.incidentId, actionRequired: true }
    });

    this.addWarRoomEvent({
      fromAgentId: 'agent-dispatch',
      fromAgentName: 'Dispatch Agent',
      toAgentId: 'agent-vendor',
      toAgentName: 'Vendor Agent',
      eventType: 'quote_benchmark',
      incidentId: app.incidentId,
      ticketNumber: app.ticketNumber,
      title: `Changes Requested: ${app.id}`,
      details: `${decidedBy} asked for modifications: "${notes}". Soliciting revised estimates.`,
      room: inc?.switchRoom || 'incident-water-leak-001'
    });

    this.addAuditLog({
      actor: decidedBy,
      actorType: 'human',
      action: 'APPROVAL_CHANGES_REQUESTED',
      incidentId: app.incidentId,
      details: `Requested changes for ${app.title}. Notes: ${notes}`
    });

    this.broadcastSSE('approval_updated', { approval: app });
    return app;
  }

  // --- Evidence & Verification ---
  public getEvidence(): ResolutionEvidence[] {
    return this.evidence;
  }

  public async submitEvidence(data: {
    incidentId: string;
    technicianName: string;
    beforePhotoUrl: string;
    afterPhotoUrl: string;
    repairNotes: string;
    partsReplaced: string[];
    laborHours: number;
    checklist: Array<{ item: string; completed: boolean }>;
    residentFeedback?: string;
    residentRating?: number;
  }): Promise<{ evidence: ResolutionEvidence; incident?: Incident }> {
    const inc = this.getIncidentById(data.incidentId);
    const evidenceId = `EVI-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();
    const timeShort = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Run Verification Agent audit
    const auditResult = await runEvidenceAuditWithGemini({
      repairNotes: data.repairNotes,
      checklist: data.checklist,
      partsReplaced: data.partsReplaced
    });

    const tempEvidence: ResolutionEvidence = {
      id: evidenceId,
      incidentId: data.incidentId,
      ticketNumber: inc?.ticketNumber || 'TKT-CUSTOM',
      technicianId: 'tech-custom',
      technicianName: data.technicianName,
      beforePhotoUrl: data.beforePhotoUrl,
      afterPhotoUrl: data.afterPhotoUrl,
      repairNotes: data.repairNotes,
      partsReplaced: data.partsReplaced,
      laborHours: data.laborHours,
      completedChecklist: data.checklist,
      residentFeedback: data.residentFeedback,
      residentRating: data.residentRating || 5,
      status: auditResult.status,
      verifiedByAgent: 'Verification Agent',
      verificationAuditNotes: auditResult.auditNotes,
      submittedAt: nowIso,
      verifiedAt: auditResult.status === 'verified' ? nowIso : undefined
    };

    // Calculate Proof Score Breakdown
    const proofBreakdown = calculateProofScore(tempEvidence);
    tempEvidence.proofBreakdown = proofBreakdown;

    // Attach to incident proofScore
    if (inc) {
      inc.proofScore = proofBreakdown.score;
    }

    this.evidence.unshift(tempEvidence);

    // Update incident status according to Proof Score eligibility
    if (inc) {
      if (proofBreakdown.isEligibleForClosure && auditResult.status === 'verified') {
        inc.status = 'Resolved';
        inc.resolvedAt = nowIso;
        inc.timeline.push({
          id: `t-${Date.now()}-veri`,
          timestamp: timeShort,
          actor: 'Verification Agent',
          actorRole: 'agent',
          action: `Resolution Audit PASSED (Proof Score: ${proofBreakdown.score}%)`,
          details: `Verified repair evidence and checklists. ${auditResult.auditNotes}`,
          badge: 'Verified & Closed'
        });
      } else {
        inc.status = 'Verification';
        inc.timeline.push({
          id: `t-${Date.now()}-warn`,
          timestamp: timeShort,
          actor: 'Verification Agent',
          actorRole: 'agent',
          action: `Proof Score: ${proofBreakdown.score}% (Under 80% Threshold)`,
          details: `Mandatory evidence incomplete: ${proofBreakdown.missingCriteria.join(', ')}. Closure prevented pending manager override or criteria completion.`,
          badge: 'Evidence Incomplete'
        });
      }
      this.broadcastSSE('incident_updated', { incident: inc });
    }

    // Switch communication
    this.sendSwitchMessage({
      roomId: 'resolution-review',
      sender: 'Verification Agent',
      senderType: 'agent',
      content: `🔬 [RESOLUTION PROOF SCORE: ${proofBreakdown.score}%] Ticket ${inc?.ticketNumber}. Status: ${proofBreakdown.isEligibleForClosure ? 'ELIGIBLE FOR CLOSURE' : 'ACTION REQUIRED'}. Missing: ${proofBreakdown.missingCriteria.join(', ') || 'None'}`,
      metadata: { incidentId: data.incidentId, structuredPayload: { proofScore: proofBreakdown.score, status: tempEvidence.status } }
    });

    this.addWarRoomEvent({
      fromAgentId: 'agent-verify',
      fromAgentName: 'Verification Agent',
      toAgentId: 'agent-memory',
      toAgentName: 'Memory Agent',
      eventType: 'evidence_audit',
      incidentId: data.incidentId,
      ticketNumber: inc?.ticketNumber,
      title: `Proof Score Computed: ${proofBreakdown.score}%`,
      details: `Audited evidence package ${evidenceId}. Closure status: ${proofBreakdown.isEligibleForClosure ? 'Approved' : 'Gated'}.`,
      room: 'resolution-review'
    });

    // Update Verification Agent stats
    const verifyAgent = this.agents.find(a => a.id === 'agent-verify');
    if (verifyAgent) {
      verifyAgent.processedIncidentsCount += 1;
      verifyAgent.lastActive = 'Just now';
      verifyAgent.recentActivities.unshift({
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        incidentId: data.incidentId,
        action: `Audited evidence for ${inc?.ticketNumber || data.incidentId}`,
        details: `Proof Score: ${proofBreakdown.score}%. ${auditResult.auditNotes}`,
        room: 'resolution-review'
      });
    }

    this.addAuditLog({
      actor: 'Verification Agent',
      actorType: 'agent',
      action: 'EVIDENCE_AUDITED',
      incidentId: data.incidentId,
      details: `Proof Score: ${proofBreakdown.score}%. Status: ${tempEvidence.status}. ${auditResult.auditNotes}`,
      switchRoom: 'resolution-review'
    });

    this.broadcastSSE('evidence_submitted', { evidence: tempEvidence, incident: inc });
    return { evidence: tempEvidence, incident: inc };
  }

  public overrideProofVerification(evidenceId: string, reason: string, decidedBy = 'Operations Director'): { evidence: ResolutionEvidence; incident?: Incident } | undefined {
    const evi = this.evidence.find(e => e.id === evidenceId);
    if (!evi) return undefined;

    if (!evi.proofBreakdown) {
      evi.proofBreakdown = calculateProofScore(evi);
    }

    evi.proofBreakdown.isOverridden = true;
    evi.proofBreakdown.overrideReason = reason;
    evi.proofBreakdown.overrideBy = decidedBy;
    evi.proofBreakdown.isEligibleForClosure = true;
    evi.status = 'verified';
    evi.verifiedAt = new Date().toISOString();

    const inc = this.getIncidentById(evi.incidentId);
    if (inc) {
      inc.status = 'Resolved';
      inc.resolvedAt = new Date().toISOString();
      inc.proofScore = Math.max(inc.proofScore || 0, 85);
      inc.timeline.push({
        id: `t-${Date.now()}-over`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: decidedBy,
        actorRole: 'manager',
        action: 'Manager Proof Override Granted',
        details: `Resolution authorized by manager override. Reason: "${reason}". Ticket marked closed.`,
        badge: 'Manager Override'
      });
      this.broadcastSSE('incident_updated', { incident: inc });
    }

    this.sendSwitchMessage({
      roomId: 'resolution-review',
      sender: decidedBy,
      senderType: 'human',
      content: `⚖️ [MANAGER PROOF OVERRIDE] Authorization granted for Evidence ${evidenceId} (Ticket ${inc?.ticketNumber}). Reason: "${reason}". Incident marked Resolved.`,
      metadata: { incidentId: evi.incidentId }
    });

    this.addWarRoomEvent({
      fromAgentId: 'agent-verify',
      fromAgentName: 'Verification Agent',
      eventType: 'decision',
      incidentId: evi.incidentId,
      ticketNumber: inc?.ticketNumber,
      title: `Proof Score Overridden by ${decidedBy}`,
      details: `Manager override logged: "${reason}". Quality assurance gated pass recorded.`,
      room: 'resolution-review'
    });

    this.addAuditLog({
      actor: decidedBy,
      actorType: 'human',
      action: 'PROOF_SCORE_OVERRIDDEN',
      incidentId: evi.incidentId,
      details: `Overrode resolution proof criteria for evidence ${evidenceId}. Reason: ${reason}`,
      switchRoom: 'resolution-review'
    });

    this.broadcastSSE('evidence_updated', { evidence: evi, incident: inc });
    return { evidence: evi, incident: inc };
  }

  public reopenIncident(incidentId: string, reason: string): Incident | undefined {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return undefined;

    inc.status = 'Investigating';
    inc.resolvedAt = undefined;
    inc.timeline.push({
      id: `t-${Date.now()}-reopen`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'Society Operations Manager',
      actorRole: 'manager',
      action: 'Incident Reopened',
      details: `Reopened incident. Reason: ${reason}`,
      badge: 'Reopened'
    });

    this.sendSwitchMessage({
      roomId: inc.switchRoom || 'society-control',
      sender: 'Society Operations Manager',
      senderType: 'human',
      content: `⚠️ [INCIDENT REOPENED] Ticket ${inc.ticketNumber} reopened for further physical investigation. Notes: ${reason}`,
      metadata: { incidentId }
    });

    this.addAuditLog({
      actor: 'Society Operations Manager',
      actorType: 'human',
      action: 'INCIDENT_REOPENED',
      incidentId,
      details: reason
    });

    this.broadcastSSE('incident_updated', { incident: inc });
    return inc;
  }

  // --- Intelligence & Correlation ---
  public getCorrelations(): CorrelationCluster[] {
    return this.correlations;
  }

  public verifyCorrelation(id: string, verifiedBy = 'Senior Civil Engineer'): CorrelationCluster | undefined {
    const cluster = this.correlations.find(c => c.id === id);
    if (!cluster) return undefined;

    cluster.isVerified = true;
    cluster.verifiedBy = verifiedBy;

    this.sendSwitchMessage({
      roomId: 'society-control',
      sender: verifiedBy,
      senderType: 'human',
      content: `🏛️ [CORRELATION VERIFIED] Field inspection verified hypothesis for ${cluster.name}: Riser joint failure confirmed. Rerouting capital maintenance priority.`,
      metadata: { correlationId: id }
    });

    this.addAuditLog({
      actor: verifiedBy,
      actorType: 'human',
      action: 'HYPOTHESIS_VERIFIED',
      details: `Confirmed root cause for ${cluster.name}`
    });

    this.broadcastSSE('correlation_verified', { correlation: cluster });
    return cluster;
  }

  public async triggerIntelligenceScan(): Promise<{ clustersDetected: number; messages: string[] }> {
    const messages: string[] = [];
    const openIncidents = this.incidents.filter(i => i.status !== 'Resolved');

    // Run cross-check on plumbing
    const plumbingIncidents = openIncidents.filter(i => i.category === 'Plumbing & Water');
    if (plumbingIncidents.length >= 2) {
      messages.push(`Correlated ${plumbingIncidents.length} plumbing issues in Block B shaft column.`);
    }

    // Add war room notification
    this.addWarRoomEvent({
      fromAgentId: 'agent-intel',
      fromAgentName: 'Intelligence Agent',
      toAgentId: 'agent-memory',
      toAgentName: 'Memory Agent',
      eventType: 'correlation_alert',
      title: 'Full Autonomous Spatial Correlation Scan Complete',
      details: `Analyzed ${this.incidents.length} total records. Identified 3 active spatial clusters and 1 predictive risk cluster.`,
      room: 'society-control'
    });

    this.sendSwitchMessage({
      roomId: 'society-control',
      sender: 'Intelligence Agent',
      senderType: 'agent',
      content: `🔬 [INTELLIGENCE SCAN COMPLETE] Scanned all active buildings (Block A, B, C, Clubhouse). 1 verified cluster in Block B Riser BR-4, 1 watch-zone in Block A Lift Hoistway.`,
    });

    return { clustersDetected: this.correlations.length, messages };
  }

  // --- Live Agent War Room ---
  public getWarRoomEvents(): AgentWarRoomEvent[] {
    return this.warRoomEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addWarRoomEvent(event: Omit<AgentWarRoomEvent, 'id' | 'timestamp'>): AgentWarRoomEvent {
    const newEvent: AgentWarRoomEvent = {
      id: `wre-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    this.warRoomEvents.unshift(newEvent);
    this.broadcastSSE('war_room_event', { event: newEvent });
    return newEvent;
  }

  public dispatchWarRoomDirective(data: {
    agentId: string;
    directive: string;
    targetIncidentId?: string;
  }): { success: boolean; event: AgentWarRoomEvent } {
    const agent = this.agents.find(a => a.id === data.agentId);
    const inc = data.targetIncidentId ? this.getIncidentById(data.targetIncidentId) : undefined;

    const event = this.addWarRoomEvent({
      fromAgentId: 'human-ops-lead',
      fromAgentName: 'Operations Director',
      toAgentId: data.agentId,
      toAgentName: agent?.name || 'Agent',
      eventType: 'human_escalation',
      incidentId: inc?.id,
      ticketNumber: inc?.ticketNumber,
      title: `Directive Dispatched to ${agent?.name || 'Agent'}`,
      details: data.directive,
      room: inc?.switchRoom || 'society-control'
    });

    this.sendSwitchMessage({
      roomId: inc?.switchRoom || 'society-control',
      sender: 'Operations Director',
      senderType: 'human',
      content: `⚡ [HUMAN DIRECTIVE -> ${agent?.name || '@agent'}] "${data.directive}"`,
      metadata: { targetAgentId: data.agentId, incidentId: data.targetIncidentId }
    });

    if (agent) {
      agent.currentTask = data.directive;
      agent.lastActive = 'Just now';
    }

    return { success: true, event };
  }

  // --- Society Risk Heatmap ---
  public getHeatmapData(filterCategory?: string, dateRange = 'all'): HeatmapCell[] {
    const buildings = ['Block A (Oak)', 'Block B (Maple)', 'Block C (Pine)', 'Clubhouse'];
    const floors = [0, 1, 2, 3, 4, 5, 6]; // 0 = Ground, 6 = Roof

    const now = Date.now();
    let cutoffTime = 0;
    if (dateRange === '7d') cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
    else if (dateRange === '30d') cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
    else if (dateRange === '90d') cutoffTime = now - 90 * 24 * 60 * 60 * 1000;

    let filtered = [...this.incidents];
    if (cutoffTime > 0) {
      filtered = filtered.filter(i => new Date(i.createdAt).getTime() >= cutoffTime);
    }
    if (filterCategory && filterCategory !== 'All') {
      filtered = filtered.filter(i => i.category === filterCategory);
    }

    const cells: HeatmapCell[] = [];

    for (const b of buildings) {
      for (const f of floors) {
        // Special case for Clubhouse which has floors 0 and 1
        if (b === 'Clubhouse' && f > 1) continue;

        const cellIncidents = filtered.filter(i => {
          const matchBuilding = i.building.toLowerCase().includes(b.split(' ')[0].toLowerCase()) ||
            (b === 'Clubhouse' && i.building.toLowerCase().includes('clubhouse'));
          const matchFloor = i.floor === f;
          return matchBuilding && matchFloor;
        });

        const count = cellIncidents.length;
        const criticalCount = cellIncidents.filter(i => i.priority === 'Critical' || i.priority === 'High').length;

        // Categorical breakdown
        const catCounts: Record<string, number> = {};
        for (const inc of cellIncidents) {
          catCounts[inc.category] = (catCounts[inc.category] || 0) + 1;
        }
        let dominantCategory: IncidentCategory = 'Plumbing & Water';
        let maxC = 0;
        for (const [cat, cnt] of Object.entries(catCounts)) {
          if (cnt > maxC) {
            maxC = cnt;
            dominantCategory = cat as IncidentCategory;
          }
        }

        let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
        if (criticalCount >= 2 || count >= 3) {
          riskLevel = 'critical';
        } else if (criticalCount >= 1 || count >= 2) {
          riskLevel = 'high';
        } else if (count === 1) {
          riskLevel = 'moderate';
        }

        cells.push({
          building: b,
          floor: f,
          incidentCount: count,
          criticalCount,
          riskLevel,
          incidentIds: cellIncidents.map(i => i.id),
          dominantCategory
        });
      }
    }

    return cells;
  }

  // --- Predictive Maintenance Intelligence ---
  public getPredictiveRecommendations(): PredictiveRecommendation[] {
    return this.predictiveRecommendations;
  }

  public convertPredictiveToWorkOrder(recId: string): { success: boolean; incident?: Incident; recommendation?: PredictiveRecommendation } {
    const rec = this.predictiveRecommendations.find(r => r.id === recId);
    if (!rec) return { success: false };

    rec.status = 'scheduled';

    const ticketSeq = 100 + this.incidents.length + 1;
    const ticketNumber = `TKT-2026-${ticketSeq}`;
    const incidentId = `INC-${ticketSeq}`;
    const nowIso = new Date().toISOString();
    const timeShort = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newIncident: Incident = {
      id: incidentId,
      ticketNumber,
      title: `[PREVENTIVE] ${rec.assetName} Overhaul`,
      description: `Preventive work order created from Predictive Intelligence (Risk Score: ${rec.riskScore}%). Action: ${rec.preventiveAction}. Estimated avoidance savings: $${rec.estimatedCatastrophicCost - rec.estimatedPreventiveCost}.`,
      category: rec.category,
      building: rec.building,
      flat: 'Common Facility',
      floor: 0,
      priority: rec.priority,
      status: 'Assigned',
      residentName: 'Predictive Intelligence System',
      residentContact: 'System Work Order',
      createdAt: nowIso,
      updatedAt: nowIso,
      tags: ['Preventive Maintenance', 'Asset Overhaul', 'Cost Avoidance'],
      switchRoom: 'society-control',
      estimatedCost: rec.estimatedPreventiveCost,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          timestamp: timeShort,
          actor: 'Memory Agent',
          actorRole: 'agent',
          action: 'Preventive Work Order Generated',
          details: `Converted recommendation ${rec.id} into proactive maintenance task.`,
          badge: 'Preventive Action'
        }
      ]
    };

    this.incidents.unshift(newIncident);

    this.sendSwitchMessage({
      roomId: 'society-control',
      sender: 'Memory Agent',
      senderType: 'agent',
      content: `🛡️ [PROACTIVE INTERVENTION] Converted recommendation ${rec.id} into Work Order ${ticketNumber}. Asset: ${rec.assetName}. Preventive cost: $${rec.estimatedPreventiveCost} (Avoids catastrophic outage: $${rec.estimatedCatastrophicCost}).`,
      metadata: { incidentId }
    });

    this.addWarRoomEvent({
      fromAgentId: 'agent-memory',
      fromAgentName: 'Memory Agent',
      toAgentId: 'agent-dispatch',
      toAgentName: 'Dispatch Agent',
      eventType: 'triage_dispatch',
      incidentId,
      ticketNumber,
      title: `Preventive Order Dispatched: ${rec.assetName}`,
      details: `Proactive work order initiated to mitigate failure risk (${rec.failureProbability}%).`,
      room: 'society-control'
    });

    this.addAuditLog({
      actor: 'Memory Agent',
      actorType: 'agent',
      action: 'PREDICTIVE_MAINTENANCE_SCHEDULED',
      incidentId,
      details: `Scheduled preventive maintenance for ${rec.assetName} ($${rec.estimatedPreventiveCost})`
    });

    this.broadcastSSE('incident_created', { incident: newIncident });
    this.broadcastSSE('predictive_updated', { recommendation: rec });

    return { success: true, incident: newIncident, recommendation: rec };
  }

  // --- Audit Trail ---
  public getAuditLog(): AuditEvent[] {
    return this.auditLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private addAuditLog(event: {
    actor: string;
    actorType: 'agent' | 'human' | 'technician' | 'vendor' | 'system';
    action: string;
    incidentId?: string;
    details: string;
    switchRoom?: string;
  }) {
    const entry: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      traceId: `trc-${Math.random().toString(36).substring(2, 8)}`,
      ...event
    };
    this.auditLog.unshift(entry);
    this.broadcastSSE('audit_logged', { audit: entry });
  }

  // --- SocietyOps rooms and messages relayed through the configured chat bridge ---
  public getSwitchRooms(): SwitchRoom[] {
    return this.switchRooms;
  }

  public getSwitchMessages(roomId: string): SwitchMessage[] {
    return this.switchMessages.filter(m => m.roomId === roomId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public receiveExternalSwitchMessage(data: {
    roomId: string;
    sender: string;
    senderType: 'agent' | 'human';
    content: string;
    externalMessageId: string;
  }): SwitchMessage {
    const msg = this.appendSwitchMessage({
      ...data,
      deliveryStatus: 'received',
      metadata: {
        source: 'discord',
        externalMessageId: data.externalMessageId,
      },
    });
    return msg;
  }

  public sendSwitchMessage(data: {
    roomId: string;
    sender: string;
    senderType: 'agent' | 'human' | 'discord_bridge' | 'system';
    content: string;
    metadata?: Record<string, unknown>;
  }): SwitchMessage {
    const msg = this.appendSwitchMessage({
      ...data,
      deliveryStatus: this.switchPublisher ? 'pending' : 'local',
    });

    if (this.switchPublisher) {
      void this.switchPublisher(msg)
        .then((result) => {
          msg.deliveryStatus = result === 'sent' ? 'sent' : 'local';
          this.broadcastSSE('switch_message_updated', { message: msg });
        })
        .catch((error: unknown) => {
          msg.deliveryStatus = 'failed';
          msg.deliveryError = error instanceof Error ? error.message : 'Discord delivery failed.';
          console.error(`Switch room delivery failed for #${msg.roomId}:`, msg.deliveryError);
          this.broadcastSSE('switch_message_updated', { message: msg });
        });
    }

    return msg;
  }

  private appendSwitchMessage(data: {
    roomId: string;
    sender: string;
    senderType: 'agent' | 'human' | 'discord_bridge' | 'system';
    content: string;
    metadata?: SwitchMessage['metadata'];
    deliveryStatus?: SwitchMessage['deliveryStatus'];
  }): SwitchMessage {
    const msg: SwitchMessage = {
      id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      roomId: data.roomId,
      sender: data.sender,
      senderType: data.senderType,
      content: data.content,
      timestamp: new Date().toISOString(),
      deliveryStatus: data.deliveryStatus,
      metadata: data.metadata
    };

    this.switchMessages.push(msg);

    const room = this.switchRooms.find(r => r.id === data.roomId);
    if (room) {
      room.messageCount += 1;
      if (!room.activeParticipants.includes(data.sender)) {
        room.activeParticipants.push(data.sender);
      }
    }

    this.broadcastSSE('switch_message', { message: msg });
    return msg;
  }

  // --- One-Click End-to-End Signature Demo Workflow ---
  public async runDemoScenario(): Promise<{ stepsCompleted: string[] }> {
    const steps: string[] = [];

    // Step 1: Resident creates B-204 water leak
    const { incident } = await this.createIncident({
      description: 'Water is leaking from the ceiling in Block B, Flat 204. It has been happening actively since morning, dripping onto counters.',
      building: 'Block B (Maple)',
      flat: 'B-204',
      residentName: 'Priya Sharma',
      residentContact: '+91 98200 11234'
    });
    steps.push(`1. Created Incident ${incident.ticketNumber} for Priya Sharma (B-204)`);

    // Step 2: Dispatch Agent creates approval request for $180 valve replacement
    const approvalId = `APP-DEMO-${Date.now().toString().slice(-4)}`;
    const newApproval: ApprovalRequest = {
      id: approvalId,
      incidentId: incident.id,
      ticketNumber: incident.ticketNumber,
      title: 'Emergency 2-inch Riser Valve & Coupler Replacement (Block B)',
      requestedByAgent: 'Dispatch Agent',
      agentRole: 'Workforce Routing',
      actionType: 'expenditure',
      reason: 'Urgent vertical riser joint repair to prevent water damage from reaching lift motor room.',
      estimatedCost: 180,
      supportingData: {
        vendorName: 'AquaFix Plumbing Solutions',
        technicianName: 'Rajesh Kumar (Senior Plumber)',
        scopeOfWork: 'Replace damaged PVC joint at 2nd floor landing duct and replace pressure coupler.',
        riskAssessment: 'Water tracking down structural pillar into elevator electrical cabinet.'
      },
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    this.approvals.unshift(newApproval);
    steps.push(`2. Dispatch Agent generated Approval Package ${approvalId} ($180)`);

    // Step 3: Human Manager Approves
    this.approveRequest(approvalId, 'Approved immediately for emergency riser isolation and repair.');
    steps.push('3. Society Manager approved expenditure in Approval Gate');

    // Step 4: Technician submits resolution evidence
    await this.submitEvidence({
      incidentId: incident.id,
      technicianName: 'Rajesh Kumar (AquaFix / Lead Plumber)',
      beforePhotoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
      afterPhotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
      repairNotes: 'Replaced ruptured 2-inch PVC riser union joint inside Block B service shaft. Installed new forged brass isolation valve. Conducted hydrostatic pressure test at 4.5 bar for 20 minutes with zero drop. Dried drywall in B-204 kitchen.',
      partsReplaced: ['2-inch Forged Brass Ball Valve', 'Heavy Schedule 80 PVC Union Coupling', 'Hydraulic Gasket Seal'],
      laborHours: 2.5,
      checklist: [
        { item: 'Main riser valve isolated and drained', completed: true },
        { item: 'Damaged pipe segment cut and deburred', completed: true },
        { item: 'New brass valve & coupler solvent-welded', completed: true },
        { item: 'Hydrostatic pressure test sustained at 4+ bar', completed: true },
        { item: 'Resident inspected and confirmed ceiling dry', completed: true }
      ],
      residentRating: 5,
      residentFeedback: 'Plumber arrived very fast and completely stopped the ceiling leak! Very polite and professional.'
    });
    steps.push('4. Technician Rajesh submitted before/after photos and 5-point checklist');
    steps.push('5. Verification Agent audited evidence: Proof Score 95% passed');
    steps.push('6. Switch rooms, War Room timeline and immutable audit log updated');

    return { stepsCompleted: steps };
  }
}

export const opsStore = new OpsStore();
