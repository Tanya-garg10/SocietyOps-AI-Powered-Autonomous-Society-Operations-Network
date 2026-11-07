export type IncidentPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus = 
  | 'Reported' 
  | 'Investigating' 
  | 'Awaiting Approval' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Verification' 
  | 'Resolved';

export type IncidentCategory = 
  | 'Plumbing & Water' 
  | 'Electrical & Power' 
  | 'Elevators & Lifts' 
  | 'Civil & Structural' 
  | 'Security & Access' 
  | 'Fire & Safety' 
  | 'HVAC & Ventilation';

export interface Incident {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: IncidentCategory;
  building: string;
  flat: string;
  floor: number;
  priority: IncidentPriority;
  status: IncidentStatus;
  residentName: string;
  residentContact: string;
  assignedTechnician?: string;
  assignedVendor?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  switchRoom: string;
  correlationId?: string;
  estimatedCost?: number;
  rootCauseHypothesis?: string;
  proofScore?: number;
  timeline: {
    id: string;
    timestamp: string;
    actor: string;
    actorRole: 'resident' | 'agent' | 'manager' | 'technician' | 'vendor';
    action: string;
    details: string;
    badge?: string;
  }[];
}

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'idle' | 'analyzing' | 'collaborating' | 'waiting_approval' | 'active';
  switchHandle: string;
  responsibility: string;
  systemPrompt: string;
  currentTask: string;
  processedIncidentsCount: number;
  lastActive: string;
  capabilities: string[];
  recentActivities: {
    id: string;
    timestamp: string;
    incidentId?: string;
    action: string;
    details: string;
    room: string;
  }[];
}

export interface Vendor {
  id: string;
  name: string;
  category: IncidentCategory;
  contactPerson: string;
  phone: string;
  email: string;
  rating: number;
  totalJobs: number;
  slaMinutes: number;
  availability: 'Available' | 'Busy' | 'On Call' | 'Offline';
  baseRate: number;
  verifiedLicense: boolean;
  insuranceActive: boolean;
  badges: string[];
}

export interface ApprovalRequest {
  id: string;
  incidentId: string;
  ticketNumber: string;
  title: string;
  requestedByAgent: string;
  agentRole: string;
  actionType: 'technician_dispatch' | 'vendor_selection' | 'expenditure' | 'critical_closure';
  reason: string;
  estimatedCost: number;
  supportingData: {
    vendorName?: string;
    technicianName?: string;
    scopeOfWork: string;
    riskAssessment?: string;
    alternativesConsidered?: string[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
  changesRequestedNotes?: string;
}

export interface ProofScoreBreakdown {
  score: number; // 0 - 100
  technicianReportScore: number; // max 25
  photoEvidenceScore: number; // max 25
  checklistScore: number; // max 20
  residentSignoffScore: number; // max 15
  managerSignoffScore: number; // max 15
  missingCriteria: string[];
  isEligibleForClosure: boolean;
  isOverridden?: boolean;
  overrideReason?: string;
  overrideBy?: string;
}

export interface ResolutionEvidence {
  id: string;
  incidentId: string;
  ticketNumber: string;
  technicianId: string;
  technicianName: string;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  repairNotes: string;
  partsReplaced: string[];
  laborHours: number;
  completedChecklist: {
    item: string;
    completed: boolean;
  }[];
  residentRating?: number;
  residentFeedback?: string;
  status: 'submitted' | 'under_review' | 'verified' | 'rejected_needs_more_info';
  verifiedByAgent?: string;
  verificationAuditNotes?: string;
  proofBreakdown?: ProofScoreBreakdown;
  submittedAt: string;
  verifiedAt?: string;
}

export interface CorrelationCluster {
  id: string;
  name: string;
  category: IncidentCategory;
  building: string;
  affectedIncidents: string[];
  rootCauseHypothesis: string;
  confidenceScore: number;
  evidencePoints: string[];
  confirmedFacts: string[];
  hypothesizedPoints: string[];
  recommendedAction: string;
  isVerified: boolean;
  verifiedBy?: string;
  createdAt: string;
}

export interface HeatmapCell {
  building: string;
  floor: number;
  incidentCount: number;
  criticalCount: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  incidentIds: string[];
  dominantCategory: IncidentCategory;
}

export interface PredictiveRecommendation {
  id: string;
  assetName: string;
  building: string;
  category: IncidentCategory;
  riskScore: number; // 0 - 100
  failureProbability: number; // 0 - 100%
  supportingIncidentIds: string[];
  incidentFrequency: string;
  chronicDefectReason: string;
  preventiveAction: string;
  estimatedPreventiveCost: number;
  estimatedCatastrophicCost: number;
  priority: IncidentPriority;
  status: 'recommended' | 'scheduled' | 'dismissed';
  createdAt: string;
}

export interface AgentWarRoomEvent {
  id: string;
  timestamp: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId?: string;
  toAgentName?: string;
  eventType: 'handoff' | 'triage_dispatch' | 'correlation_alert' | 'quote_benchmark' | 'evidence_audit' | 'human_escalation' | 'decision';
  incidentId?: string;
  ticketNumber?: string;
  title: string;
  details: string;
  room: string;
  metadata?: Record<string, unknown>;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'agent' | 'human' | 'technician' | 'vendor' | 'system';
  action: string;
  incidentId?: string;
  details: string;
  switchRoom?: string;
  traceId: string;
}

export interface SwitchMessage {
  id: string;
  roomId: string;
  sender: string;
  senderType: 'agent' | 'human' | 'discord_bridge' | 'system';
  content: string;
  timestamp: string;
  deliveryStatus?: 'local' | 'pending' | 'sent' | 'failed' | 'received';
  deliveryError?: string;
  metadata?: {
    incidentId?: string;
    correlationId?: string;
    actionRequired?: boolean;
    confidence?: number;
    structuredPayload?: Record<string, unknown>;
    mentionAgentHandle?: string;
    source?: 'discord' | 'demo';
    externalMessageId?: string;
    [key: string]: unknown;
  };
}

export interface SwitchIntegrationStatus {
  provider: 'Discord';
  state: 'not_configured' | 'incomplete' | 'connecting' | 'connected' | 'error' | 'stopped';
  connected: boolean;
  configuredRoomIds: string[];
  connectedRoomIds: string[];
  error?: string;
}

export interface SwitchRoom {
  id: string;
  name: string;
  description: string;
  channelType: 'public' | 'incident' | 'restricted';
  activeParticipants: string[];
  messageCount: number;
  createdAt: string;
  discordSynced: boolean;
}
