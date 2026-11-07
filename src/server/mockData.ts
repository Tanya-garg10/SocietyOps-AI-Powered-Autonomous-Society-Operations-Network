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
  PredictiveRecommendation,
  AgentWarRoomEvent
} from '../types.js';

export const INITIAL_AGENTS: AgentInfo[] = [
  {
    id: 'agent-triage',
    name: 'Triage Agent',
    role: 'Incident Ingestion & Priority Classification',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    switchHandle: '@triage-agent',
    responsibility: 'Ingests inbound resident and guard reports, extracts structured metadata (flat, block, category), assesses severity, and initiates Switch operational broadcast.',
    systemPrompt: 'You are the SocietyOps Triage Agent. Classify maintenance emergencies, parse building and flat details, extract urgency signals, and alert the operations network via Switch.',
    currentTask: 'Monitoring live resident report feeds & Switch society-control channel',
    processedIncidentsCount: 42,
    lastActive: 'Just now',
    capabilities: ['NLP parsing', 'Emergency classification', 'Room announcement', 'Priority scoring'],
    recentActivities: [
      {
        id: 'act-1',
        timestamp: '10 mins ago',
        incidentId: 'INC-101',
        action: 'Ingested and classified report for Block B Flat 204',
        details: 'Assigned Priority: High. Extracted category: Plumbing & Water.',
        room: 'society-control'
      },
      {
        id: 'act-2',
        timestamp: '18 mins ago',
        incidentId: 'INC-102',
        action: 'Broadcasted incident alert to room #incident-water-leak-001',
        details: 'Alerted Intelligence & Dispatch agents for collaborative root-cause review.',
        room: 'society-control'
      }
    ]
  },
  {
    id: 'agent-intel',
    name: 'Intelligence Agent',
    role: 'Root Cause & Incident Correlation',
    avatar: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
    status: 'analyzing',
    switchHandle: '@intel-agent',
    responsibility: 'Performs spatial, architectural and temporal cross-referencing across incidents to identify common failure shafts, shared infrastructure, and chronic defects.',
    systemPrompt: 'You are the SocietyOps Intelligence Agent. Never accept isolated reports at face value. Search building blueprints and historical tickets to uncover common root causes. Always clearly state confidence levels and label hypotheses.',
    currentTask: 'Correlating 3 simultaneous water seepage reports in Block B vertical shaft',
    processedIncidentsCount: 38,
    lastActive: '2 mins ago',
    capabilities: ['Multi-incident correlation', 'Spatial shaft mapping', 'Hypothesis formulation', 'Chronic failure detection'],
    recentActivities: [
      {
        id: 'act-3',
        timestamp: '8 mins ago',
        incidentId: 'INC-101',
        action: 'Correlated INC-101 (B-204), INC-102 (B-304), and INC-103 (Lobby B)',
        details: 'Formulated hypothesis: Shared vertical plumbing riser joint leak. Confidence: 92%.',
        room: 'incident-water-leak-001'
      }
    ]
  },
  {
    id: 'agent-dispatch',
    name: 'Dispatch Agent',
    role: 'Workforce & Technician Routing',
    avatar: '/dispatch-agent.svg',
    status: 'active',
    switchHandle: '@dispatch-agent',
    responsibility: 'Matches incident requirements with in-house technician skills and schedule availability. Prepares detailed work orders and human approval packages.',
    systemPrompt: 'You are the SocietyOps Dispatch Agent. Optimize technician availability and routing. Escalate to external vendors when in-house trades are unavailable.',
    currentTask: 'Prepared plumber dispatch recommendation for Block B riser inspection',
    processedIncidentsCount: 35,
    lastActive: '4 mins ago',
    capabilities: ['Skill matching', 'Workload balancing', 'Approval packaging', 'ETA estimation'],
    recentActivities: [
      {
        id: 'act-4',
        timestamp: '6 mins ago',
        incidentId: 'INC-101',
        action: 'Selected lead technician Rajesh Kumar (Senior Plumber)',
        details: 'Packaged dispatch recommendation & requested Manager Approval.',
        room: 'incident-water-leak-001'
      }
    ]
  },
  {
    id: 'agent-vendor',
    name: 'Vendor Agent',
    role: 'External Procurement & Quotation Review',
    avatar: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    switchHandle: '@vendor-agent',
    responsibility: 'Maintains vetted vendor network, solicits quotes for complex repairs, verifies insurance/licenses, and evaluates SLA guarantees.',
    systemPrompt: 'You are the SocietyOps Vendor Agent. Compare quotes, verify vendor credentials, and ensure transparent pricing before forwarding requests for human authorization.',
    currentTask: 'Benchmarking quotes between AquaFix Solutions and RapidPlumb',
    processedIncidentsCount: 29,
    lastActive: '5 mins ago',
    capabilities: ['Quotation benchmarking', 'SLA verification', 'License auditing', 'Contract dispatching'],
    recentActivities: [
      {
        id: 'act-5',
        timestamp: '5 mins ago',
        incidentId: 'INC-101',
        action: 'Compared 2 vendor quotes for heavy riser pipe replacement',
        details: 'AquaFix: $180 (ETA 40m) vs RapidPlumb: $240 (ETA 25m).',
        room: 'vendor-coordination'
      }
    ]
  },
  {
    id: 'agent-verify',
    name: 'Verification Agent',
    role: 'Resolution Audit & Quality Assurance',
    avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
    status: 'waiting_approval',
    switchHandle: '@verify-agent',
    responsibility: 'Inspects technician completion evidence (before/after photos, checklist items, pressure tests), checks resident sign-off, and prevents premature ticket closure.',
    systemPrompt: 'You are the SocietyOps Verification Agent. Never accept simple verbal or text claims of completion. Audit photos, ensure moisture/pressure checks are met, and demand missing proof.',
    currentTask: 'Awaiting technician photo submission for INC-101 inspection',
    processedIncidentsCount: 31,
    lastActive: '12 mins ago',
    capabilities: ['Visual evidence audit', 'Checklist compliance', 'Resident survey evaluation', 'Defect rejection'],
    recentActivities: [
      {
        id: 'act-6',
        timestamp: '35 mins ago',
        incidentId: 'INC-098',
        action: 'Audited and verified HVAC compressor filter replacement in Clubhouse',
        details: 'All 4 checklist points satisfied, verified after-photo shows clean condenser.',
        room: 'resolution-review'
      }
    ]
  },
  {
    id: 'agent-memory',
    name: 'Memory Agent',
    role: 'Society Intelligence & Chronic Issue Tracking',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'idle',
    switchHandle: '@memory-agent',
    responsibility: 'Maintains long-term operational history across all buildings, logs recurring component failures, and generates predictive preventive maintenance schedules.',
    systemPrompt: 'You are the SocietyOps Memory Agent. Retain society institutional knowledge. Highlight components that fail repeatedly and calculate replacement vs repair ROI.',
    currentTask: 'Compiling Q3 Block B plumbing vulnerability dossier',
    processedIncidentsCount: 54,
    lastActive: '15 mins ago',
    capabilities: ['Long-term memory indexing', 'Asset lifecycle analysis', 'Preventive alerts', 'Historical querying'],
    recentActivities: [
      {
        id: 'act-7',
        timestamp: '1 hour ago',
        action: 'Flagged Block B vertical shaft as high-risk asset',
        details: 'Noted 4 plumbing tickets in 6 months for the same riser column.',
        room: 'society-control'
      }
    ]
  }
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'ven-1',
    name: 'AquaFix Plumbing Solutions',
    category: 'Plumbing & Water',
    contactPerson: 'Vikram Mehta',
    phone: '+91 98201 44512',
    email: 'dispatch@aquafixsolutions.in',
    rating: 4.8,
    totalJobs: 142,
    slaMinutes: 45,
    availability: 'Available',
    baseRate: 60,
    verifiedLicense: true,
    insuranceActive: true,
    badges: ['Certified Master Plumber', 'Thermal Leak Detection', 'Society Partner']
  },
  {
    id: 'ven-2',
    name: 'RapidPlumb & Leak Detection',
    category: 'Plumbing & Water',
    contactPerson: 'Karan Singhania',
    phone: '+91 98402 77120',
    email: 'emergency@rapidplumb.net',
    rating: 4.9,
    totalJobs: 98,
    slaMinutes: 30,
    availability: 'On Call',
    baseRate: 85,
    verifiedLicense: true,
    insuranceActive: true,
    badges: ['Emergency Express', 'Acoustic Pipe Scanner', 'ISO 9001']
  },
  {
    id: 'ven-3',
    name: 'SparkFlow Electrical Services',
    category: 'Electrical & Power',
    contactPerson: 'Arun Iyer',
    phone: '+91 97110 33209',
    email: 'support@sparkflow.co',
    rating: 4.7,
    totalJobs: 215,
    slaMinutes: 60,
    availability: 'Available',
    baseRate: 50,
    verifiedLicense: true,
    insuranceActive: true,
    badges: ['HT / LT Certified', 'Thermal Imaging', 'Panel Specialist']
  },
  {
    id: 'ven-4',
    name: 'Apex Vertical Lift Specialists',
    category: 'Elevators & Lifts',
    contactPerson: 'David Chen',
    phone: '+91 98305 99401',
    email: 'elevators@apexvertical.com',
    rating: 4.9,
    totalJobs: 76,
    slaMinutes: 35,
    availability: 'Busy',
    baseRate: 120,
    verifiedLicense: true,
    insuranceActive: true,
    badges: ['OEM Certified (Otis/Schindler)', 'Emergency Trapped Passenger Protocol']
  },
  {
    id: 'ven-5',
    name: 'HydroShield Structural Waterproofing',
    category: 'Civil & Structural',
    contactPerson: 'Sanjay Deshmukh',
    phone: '+91 98801 12398',
    email: 'civil@hydroshield.in',
    rating: 4.6,
    totalJobs: 64,
    slaMinutes: 120,
    availability: 'Available',
    baseRate: 110,
    verifiedLicense: true,
    insuranceActive: true,
    badges: ['Polymer Membrane Certified', '5-Year Warranty Backed']
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-101',
    ticketNumber: 'TKT-2026-101',
    title: 'Water leaking from ceiling in Block B, Flat 204',
    description: 'Water is dripping actively onto the kitchen counter and near the service duct from the ceiling above. Drywall saturated and staining rapidly expanding.',
    category: 'Plumbing & Water',
    building: 'Block B (Maple)',
    flat: 'B-204',
    floor: 2,
    priority: 'High',
    status: 'Investigating',
    residentName: 'Priya Sharma',
    residentContact: '+91 98200 11234',
    assignedTechnician: 'Rajesh Kumar (Senior Plumber)',
    assignedVendor: 'AquaFix Plumbing Solutions',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    tags: ['Water Seepage', 'Kitchen Ceiling', 'Shared Shaft', 'Potential Multi-Flat'],
    switchRoom: 'incident-water-leak-001',
    correlationId: 'CORR-BLOCK-B-WATER',
    estimatedCost: 180,
    rootCauseHypothesis: 'Vertical plumbing riser shaft failure between 2nd & 3rd floor slab joint affecting B-204 ceiling, B-304 flooring, and Ground Lobby elevator shaft surround.',
    proofScore: 35,
    timeline: [
      {
        id: 't-1',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Priya Sharma (Resident B-204)',
        actorRole: 'resident',
        action: 'Reported Incident',
        details: 'Submitted complaint with description of dripping ceiling in kitchen.',
        badge: 'Resident Inbound'
      },
      {
        id: 't-2',
        timestamp: new Date(Date.now() - 44 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Triage Agent',
        actorRole: 'agent',
        action: 'Classified & Prioritized',
        details: 'Category set to Plumbing & Water. Urgency flagged as HIGH due to active drip.',
        badge: 'Switch: #society-control'
      },
      {
        id: 't-3',
        timestamp: new Date(Date.now() - 38 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Intelligence Agent',
        actorRole: 'agent',
        action: 'Spatial Correlation Detected',
        details: 'Found overlapping incidents INC-102 (B-304) and INC-103 (Lobby B). Grouped into Cluster CORR-BLOCK-B-WATER.',
        badge: 'Switch: #incident-water-leak-001'
      },
      {
        id: 't-4',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Dispatch Agent',
        actorRole: 'agent',
        action: 'Drafted Technician Recommendation',
        details: 'Recommended Rajesh Kumar with backup from AquaFix Solutions. Forwarded approval request to Society Manager.',
        badge: 'Pending Human Gate'
      }
    ]
  },
  {
    id: 'INC-102',
    ticketNumber: 'TKT-2026-102',
    title: 'Dampness and wet bathroom floor in B-304',
    description: 'Resident noticed moisture rising from skirting and tiles near the bathroom duct. No fixture within the flat appears to be actively leaking.',
    category: 'Plumbing & Water',
    building: 'Block B (Maple)',
    flat: 'B-304',
    floor: 3,
    priority: 'Medium',
    status: 'Investigating',
    residentName: 'Amitabh Verma',
    residentContact: '+91 98111 88452',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    tags: ['Moisture', 'Bathroom Skirting', 'Shaft Adjacency'],
    switchRoom: 'incident-water-leak-001',
    correlationId: 'CORR-BLOCK-B-WATER',
    proofScore: 20,
    timeline: [
      {
        id: 't-5',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Amitabh Verma (Resident B-304)',
        actorRole: 'resident',
        action: 'Reported Incident',
        details: 'Reported skirting dampness near utility duct.',
        badge: 'Inbound'
      },
      {
        id: 't-6',
        timestamp: new Date(Date.now() - 38 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Intelligence Agent',
        actorRole: 'agent',
        action: 'Linked to INC-101',
        details: 'Direct vertical alignment above Flat 204. Confirmed single riser column #BR-4.',
        badge: 'Correlated'
      }
    ]
  },
  {
    id: 'INC-103',
    ticketNumber: 'TKT-2026-103',
    title: 'Water pooling near Block B lift lobby ceiling and duct',
    description: 'Security guard reported slow pooling of water behind decorative panel at Block B ground floor elevator entrance.',
    category: 'Plumbing & Water',
    building: 'Block B (Maple)',
    flat: 'Ground Floor Lobby',
    floor: 0,
    priority: 'High',
    status: 'Investigating',
    residentName: 'Ramesh (Head Guard)',
    residentContact: '+91 97000 23145',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    tags: ['Ground Floor', 'Lift Lobby', 'Water Pooling', 'Safety Risk'],
    switchRoom: 'incident-water-leak-001',
    correlationId: 'CORR-BLOCK-B-WATER',
    proofScore: 25,
    timeline: [
      {
        id: 't-7',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Ramesh (Head Guard)',
        actorRole: 'resident',
        action: 'Reported Hazard',
        details: 'Noted water accumulation near lift entrance.',
        badge: 'Security Inbound'
      },
      {
        id: 't-8',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Intelligence Agent',
        actorRole: 'agent',
        action: 'Gravity Drainage Path Confirmed',
        details: 'Water originating from B-204/304 shaft trickling down structural column to ground lobby.',
        badge: 'Hypothesis Node'
      }
    ]
  },
  {
    id: 'INC-104',
    ticketNumber: 'TKT-2026-104',
    title: 'Elevator #2 erratic floor leveling in Block A',
    description: 'Lift #2 in Block A stops 2 inches above landing level on 5th floor. Slight shudder during descent.',
    category: 'Elevators & Lifts',
    building: 'Block A (Oak)',
    flat: 'Passenger Lift #2',
    floor: 5,
    priority: 'Critical',
    status: 'In Progress',
    residentName: 'Kavita Nair',
    residentContact: '+91 99302 44102',
    assignedTechnician: 'Apex Vertical Engineer',
    assignedVendor: 'Apex Vertical Lift Specialists',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    tags: ['Elevator', 'Safety Interlock', 'Sensor Calibration'],
    switchRoom: 'society-control',
    estimatedCost: 380,
    proofScore: 50,
    timeline: [
      {
        id: 't-9',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Kavita Nair',
        actorRole: 'resident',
        action: 'Reported Lift Jolt',
        details: 'Reported uneven leveling on 5th floor.',
        badge: 'Resident Inbound'
      },
      {
        id: 't-10',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Human Manager (Anil Mehta)',
        actorRole: 'manager',
        action: 'Approved Emergency Dispatch',
        details: 'Approved $380 OEM callout fee for Apex Vertical.',
        badge: 'Approved'
      }
    ]
  },
  {
    id: 'INC-105',
    ticketNumber: 'TKT-2026-105',
    title: 'Clubhouse main entrance gate RFID sensor unresponsive',
    description: 'Resident RFID keyfobs intermittent when entering clubhouse gym and pool area.',
    category: 'Security & Access',
    building: 'Clubhouse',
    flat: 'Main RFID Turnstile',
    floor: 1,
    priority: 'Low',
    status: 'Resolved',
    residentName: 'Sunil Joshi',
    residentContact: '+91 98450 78912',
    assignedTechnician: 'SparkFlow Tech',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tags: ['Access Control', 'RFID', 'Firmware Flash'],
    switchRoom: 'resolution-review',
    estimatedCost: 75,
    proofScore: 95,
    timeline: [
      {
        id: 't-11',
        timestamp: 'Yesterday 14:20',
        actor: 'Verification Agent',
        actorRole: 'agent',
        action: 'Verified Resolution',
        details: 'Checked 10 test tap logs and photo of new antenna wiring. Recommended closure.',
        badge: 'Audit Passed'
      }
    ]
  }
];

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'APP-501',
    incidentId: 'INC-101',
    ticketNumber: 'TKT-2026-101',
    title: 'Emergency Shaft Valve & Riser Section Replacement (Block B)',
    requestedByAgent: 'Dispatch Agent',
    agentRole: 'Workforce Routing',
    actionType: 'expenditure',
    reason: 'Water leak has permeated drywall in B-204 and is tracking downward to ground lobby. In-house plumber Rajesh confirmed need for 2-inch brass ball valve & 4m PVC pressure pipe replacement.',
    estimatedCost: 180,
    supportingData: {
      vendorName: 'AquaFix Plumbing Solutions',
      technicianName: 'Rajesh Kumar (Senior Plumber)',
      scopeOfWork: 'Isolate vertical riser valve BR-4, cut damaged 2-inch pipe section between 2nd & 3rd floor slab, install high-pressure coupler, test at 4 bar.',
      riskAssessment: 'If unaddressed for 4+ hours, water will enter lift shaft circuitry, causing estimated $2,400+ control panel damage.',
      alternativesConsidered: [
        'Patch clamp (Temporary, high likelihood of recurring burst within 14 days)',
        'Full riser replacement (Cost $1,200, requires 48hr water shutdown across Block B)'
      ]
    },
    status: 'pending',
    requestedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: 'APP-502',
    incidentId: 'INC-104',
    ticketNumber: 'TKT-2026-104',
    title: 'Emergency Apex Elevator Magnetic Brake Sensor Kit Callout',
    requestedByAgent: 'Dispatch Agent',
    agentRole: 'Workforce Routing',
    actionType: 'technician_dispatch',
    reason: 'Elevator leveling sensor failure exceeds allowable safety tolerance (±5mm vs current 50mm offset). Requires authorized technician.',
    estimatedCost: 380,
    supportingData: {
      vendorName: 'Apex Vertical Lift Specialists',
      scopeOfWork: 'Replace photoelectric leveling sensor array on Car #2 and run recalibration cycle.',
      riskAssessment: 'Critical trip hazard and automatic emergency brake trip risk.',
      alternativesConsidered: ['Take elevator completely out of service (causes severe resident inconvenience for 12 floors)']
    },
    status: 'approved',
    requestedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    decidedAt: new Date(Date.now() - 3.2 * 60 * 60 * 1000).toISOString(),
    decidedBy: 'Anil Mehta (Society Operations Director)',
    decisionNotes: 'Approved immediately due to passenger safety regulation requirements.'
  }
];

export const INITIAL_EVIDENCE: ResolutionEvidence[] = [
  {
    id: 'EVI-301',
    incidentId: 'INC-105',
    ticketNumber: 'TKT-2026-105',
    technicianId: 'tech-sf-3',
    technicianName: 'Manoj Pillai (SparkFlow Electrical)',
    beforePhotoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    repairNotes: 'Turnstile RFID antenna cable had crimped insulation against the metal frame causing 13.56MHz signal grounding. Replaced coaxial lead with shielded RG-174, re-anchored antenna coil, and flashed firmware 2.4.1.',
    partsReplaced: ['RG-174 Coax Pigtail Cable (1.2m)', 'Mifare Reader Board Housing Clip'],
    laborHours: 1.5,
    completedChecklist: [
      { item: 'Physical damage inspection', completed: true },
      { item: 'Impedance and ground continuity check (<0.5 ohm)', completed: true },
      { item: '10 consecutive RFID fob tap tests', completed: true },
      { item: 'Waterproof silicone bead re-sealed', completed: true },
      { item: 'Resident / Guard sign-off obtained', completed: true }
    ],
    residentRating: 5,
    residentFeedback: 'Gate opens instantaneously now with zero lag. Great work!',
    status: 'verified',
    verifiedByAgent: 'Verification Agent',
    verificationAuditNotes: 'All 5 checklist requirements verified. After-photo clearly shows tidy cabling and sealed gasket. Fob tap logs confirmed in access control controller. Closed cleanly.',
    proofBreakdown: {
      score: 95,
      technicianReportScore: 25,
      photoEvidenceScore: 25,
      checklistScore: 20,
      residentSignoffScore: 15,
      managerSignoffScore: 10,
      missingCriteria: [],
      isEligibleForClosure: true
    },
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    verifiedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_CORRELATIONS: CorrelationCluster[] = [
  {
    id: 'CORR-BLOCK-B-WATER',
    name: 'Block B Vertical Plumbing Riser #BR-4 Joint Rupture',
    category: 'Plumbing & Water',
    building: 'Block B (Maple)',
    affectedIncidents: ['INC-101', 'INC-102', 'INC-103'],
    rootCauseHypothesis: 'Vertical plumbing riser shaft failure between 2nd & 3rd floor slab joint. Water trickles down interior masonry shaft, expressing as ceiling drip in B-204, floor moisture in B-304, and pooling at Ground Lobby.',
    confidenceScore: 92,
    evidencePoints: [
      'Identical vertical coordinate shaft: Flat 304 sits directly above Flat 204 sharing Riser Column BR-4.',
      'Temporal proximity: All 3 incidents reported within 75 minutes of each other.',
      'Hydraulic elevation gradient: Seepage severity aligns with downward gravity flow.',
      'Historical pattern: Memory Agent retrieved ticket #TKT-2025-412 (9 months ago) noting micro-fissure in the same PVC coupler.'
    ],
    confirmedFacts: [
      'Active water dripping onto kitchen counters verified in Flat B-204 (2nd floor).',
      'Tile baseboard moisture verified in Flat B-304 (3rd floor) directly along the utility duct collar.',
      'Water pooling verified at Block B ground floor elevator entrance sump.'
    ],
    hypothesizedPoints: [
      'PVC union joint rupture inside the concealed masonry utility shaft between 2nd and 3rd floor slabs.',
      'Water tracks downward along vertical rebar concrete column to express at ground lobby elevator wall.',
      'Pressure surge from roof booster pump header during 06:00 AM replenishment cycle triggered joint crack.'
    ],
    recommendedAction: 'Isolate main vertical supply valve at roof header for 30 minutes; open inspection hatch at 2nd floor landing rather than tearing drywall inside Flat 204 kitchen.',
    isVerified: false,
    createdAt: new Date(Date.now() - 38 * 60 * 1000).toISOString()
  }
];

export const INITIAL_PREDICTIVE_RECOMMENDATIONS: PredictiveRecommendation[] = [
  {
    id: 'PRED-001',
    assetName: 'Block B Vertical Plumbing Riser Column #BR-4',
    building: 'Block B (Maple)',
    category: 'Plumbing & Water',
    riskScore: 88,
    failureProbability: 92,
    supportingIncidentIds: ['INC-101', 'INC-102', 'INC-103'],
    incidentFrequency: '4 incidents in 6 months',
    chronicDefectReason: 'Thermal cycling on 2018 Schedule 40 PVC joints without expansion loops causes joint shear stress at floor slab transitions.',
    preventiveAction: 'Install flexible stainless-steel expansion bellows and replace aged 2-inch union coupling during scheduled 45-min off-peak window.',
    estimatedPreventiveCost: 220,
    estimatedCatastrophicCost: 2800,
    priority: 'Critical',
    status: 'recommended',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'PRED-002',
    assetName: 'Block A Passenger Lift #2 Optical Hoistway Leveler Array',
    building: 'Block A (Oak)',
    category: 'Elevators & Lifts',
    riskScore: 74,
    failureProbability: 78,
    supportingIncidentIds: ['INC-104'],
    incidentFrequency: '3 leveling shudder alerts in 90 days',
    chronicDefectReason: 'Shaft dust and vibration drift misaligns the infrared photoelectric level sensors, causing 50mm landing overshoot.',
    preventiveAction: 'Schedule precision optical recalibration, clean hoistway reflective prisms, and torque sensor mounting brackets.',
    estimatedPreventiveCost: 150,
    estimatedCatastrophicCost: 1600,
    priority: 'High',
    status: 'recommended',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'PRED-003',
    assetName: 'Clubhouse Main RFID Access Gate Coaxial Feed',
    building: 'Clubhouse',
    category: 'Security & Access',
    riskScore: 42,
    failureProbability: 35,
    supportingIncidentIds: ['INC-105'],
    incidentFrequency: '2 intermittent grounding faults in 12 months',
    chronicDefectReason: 'Door frame friction against unarmored coax lead caused intermittent RF grounding.',
    preventiveAction: 'Install rigid conduit sleeve around antenna feeder and apply silicon weatherproofing collar.',
    estimatedPreventiveCost: 80,
    estimatedCatastrophicCost: 450,
    priority: 'Low',
    status: 'scheduled',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_WAR_ROOM_EVENTS: AgentWarRoomEvent[] = [
  {
    id: 'wre-1',
    timestamp: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
    fromAgentId: 'agent-triage',
    fromAgentName: 'Triage Agent',
    toAgentId: 'agent-intel',
    toAgentName: 'Intelligence Agent',
    eventType: 'triage_dispatch',
    incidentId: 'INC-101',
    ticketNumber: 'TKT-2026-101',
    title: 'Inbound Emergency Classified: Block B Flat 204',
    details: 'Parsed resident report. Category: Plumbing & Water. Priority: HIGH. Handing off spatial coordinates to Intelligence Agent.',
    room: 'society-control'
  },
  {
    id: 'wre-2',
    timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    fromAgentId: 'agent-intel',
    fromAgentName: 'Intelligence Agent',
    toAgentId: 'agent-dispatch',
    toAgentName: 'Dispatch Agent',
    eventType: 'correlation_alert',
    incidentId: 'INC-101',
    ticketNumber: 'TKT-2026-101',
    title: 'Multi-Incident Correlation Cluster Established (92% Confidence)',
    details: 'Spatial matching linked INC-101 (B-204) with INC-102 (B-304) and INC-103 (Lobby). Root cause: Shared Riser #BR-4. Instructing Dispatch Agent to source specialized riser plumber.',
    room: 'incident-water-leak-001'
  },
  {
    id: 'wre-3',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    fromAgentId: 'agent-dispatch',
    fromAgentName: 'Dispatch Agent',
    toAgentId: 'agent-vendor',
    toAgentName: 'Vendor Agent',
    eventType: 'handoff',
    incidentId: 'INC-101',
    ticketNumber: 'TKT-2026-101',
    title: 'Task Delegation: External Vendor Quotation Sourcing',
    details: 'In-house trade Rajesh Kumar assigned for initial isolation. Delegated quotation benchmarking to Vendor Agent for emergency 2-inch ball valve replacement.',
    room: 'incident-water-leak-001'
  },
  {
    id: 'wre-4',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    fromAgentId: 'agent-vendor',
    fromAgentName: 'Vendor Agent',
    toAgentId: 'agent-dispatch',
    toAgentName: 'Dispatch Agent',
    eventType: 'quote_benchmark',
    incidentId: 'INC-101',
    ticketNumber: 'TKT-2026-101',
    title: 'Quotation Comparison Complete: AquaFix Selected ($180)',
    details: 'Benchmarked AquaFix ($180, ETA 45m, 6-mo warranty) vs RapidPlumb ($240, ETA 30m). Handed back to Dispatch Agent to formulate Human Approval Package.',
    room: 'vendor-coordination'
  },
  {
    id: 'wre-5',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    fromAgentId: 'agent-dispatch',
    fromAgentName: 'Dispatch Agent',
    eventType: 'human_escalation',
    incidentId: 'INC-101',
    ticketNumber: 'TKT-2026-101',
    title: 'Approval Package APP-501 Forwarded to Manager Gate',
    details: 'Packaged $180 expenditure proposal with risk assessment and alternatives. Escalated to Society Operations Manager for sovereign authorization.',
    room: 'incident-water-leak-001'
  }
];

export const INITIAL_SWITCH_ROOMS: SwitchRoom[] = [
  {
    id: 'society-control',
    name: '#society-control',
    description: 'Society-wide operations nerve center for triage alerts, priority incidents, and autonomous status feeds.',
    channelType: 'public',
    activeParticipants: [],
    messageCount: 0,
    createdAt: '2026-11-01T08:00:00Z',
    discordSynced: false
  },
  {
    id: 'incident-water-leak-001',
    name: '#incident-water-leak-001',
    description: 'Dynamic incident investigation room for Block B water correlation (INC-101, INC-102, INC-103).',
    channelType: 'incident',
    activeParticipants: [],
    messageCount: 0,
    createdAt: '2026-11-06T09:50:00Z',
    discordSynced: false
  },
  {
    id: 'vendor-coordination',
    name: '#vendor-coordination',
    description: 'Contractor quotation analysis, rate comparison, and external dispatch authorization room.',
    channelType: 'restricted',
    activeParticipants: [],
    messageCount: 0,
    createdAt: '2026-11-06T10:00:00Z',
    discordSynced: false
  },
  {
    id: 'resolution-review',
    name: '#resolution-review',
    description: 'Evidence verification room where technicians submit photo proof & checklist audits before ticket sign-off.',
    channelType: 'public',
    activeParticipants: [],
    messageCount: 0,
    createdAt: '2026-11-05T12:00:00Z',
    discordSynced: false
  }
];

export const INITIAL_SWITCH_MESSAGES: SwitchMessage[] = [];

export const INITIAL_AUDIT_LOG: AuditEvent[] = [
  {
    id: 'aud-1',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    actor: 'Priya Sharma (Resident)',
    actorType: 'human',
    action: 'INCIDENT_CREATED',
    incidentId: 'INC-101',
    details: 'Submitted ticket for water leaking through kitchen ceiling in Flat B-204.',
    switchRoom: 'society-control',
    traceId: 'trc-88219-init'
  },
  {
    id: 'aud-2',
    timestamp: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
    actor: 'Triage Agent',
    actorType: 'agent',
    action: 'METADATA_EXTRACTED',
    incidentId: 'INC-101',
    details: 'Classified: Plumbing & Water, Priority: High, Extracted tags: [Water Seepage, Shared Shaft].',
    switchRoom: 'society-control',
    traceId: 'trc-88219-triage'
  },
  {
    id: 'aud-3',
    timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    actor: 'Intelligence Agent',
    actorType: 'agent',
    action: 'CORRELATION_GRAPH_UPDATED',
    incidentId: 'INC-101',
    details: 'Cluster CORR-BLOCK-B-WATER established connecting B-204, B-304 and Ground Lobby. Confidence 92%.',
    switchRoom: 'incident-water-leak-001',
    traceId: 'trc-88219-intel'
  },
  {
    id: 'aud-4',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    actor: 'Dispatch Agent',
    actorType: 'agent',
    action: 'APPROVAL_REQUEST_SUBMITTED',
    incidentId: 'INC-101',
    details: 'Generated approval package APP-501 for $180 emergency valve replacement.',
    switchRoom: 'incident-water-leak-001',
    traceId: 'trc-88219-dispatch'
  },
  {
    id: 'aud-5',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    actor: 'Vendor Agent',
    actorType: 'agent',
    action: 'VENDOR_QUOTES_BENCHMARKED',
    incidentId: 'INC-101',
    details: 'Queried AquaFix ($180) and RapidPlumb ($240). Recommended AquaFix for 45m SLA.',
    switchRoom: 'vendor-coordination',
    traceId: 'trc-88219-vendor'
  }
];
