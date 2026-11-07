import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { CommandCenter } from './components/CommandCenter.js';
import { IncidentsView } from './components/IncidentsView.js';
import { IncidentDetailModal } from './components/IncidentDetailModal.js';
import { CreateIncidentModal } from './components/CreateIncidentModal.js';
import { AgentsView } from './components/AgentsView.js';
import { AgentDrawer } from './components/AgentDrawer.js';
import { SwitchHubView } from './components/SwitchHubView.js';
import { ApprovalsView } from './components/ApprovalsView.js';
import { VerificationView } from './components/VerificationView.js';
import { SubmitEvidenceModal } from './components/SubmitEvidenceModal.js';
import { VendorsView } from './components/VendorsView.js';
import { AuditTrailView } from './components/AuditTrailView.js';
import { CinematicIntro } from './components/CinematicIntro.js';
import { LiveWarRoomView } from './components/LiveWarRoomView.js';
import { IncidentDetectiveView } from './components/IncidentDetectiveView.js';
import { RiskHeatmapView } from './components/RiskHeatmapView.js';
import { PredictiveMaintenanceView } from './components/PredictiveMaintenanceView.js';
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
  AgentWarRoomEvent,
  SwitchIntegrationStatus
} from './types.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('command-center');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [evidence, setEvidence] = useState<ResolutionEvidence[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationCluster[]>([]);
  const [switchRooms, setSwitchRooms] = useState<SwitchRoom[]>([]);
  const [switchMessages, setSwitchMessages] = useState<SwitchMessage[]>([]);
  const [switchStatus, setSwitchStatus] = useState<SwitchIntegrationStatus>({
    provider: 'Discord',
    state: 'not_configured',
    connected: false,
    configuredRoomIds: [],
    connectedRoomIds: [],
  });
  const [warRoomEvents, setWarRoomEvents] = useState<AgentWarRoomEvent[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [isSSEConnected, setIsSSEConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cinematic Intro state
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('societyops_intro_seen');
    }
    return false;
  });

  // Sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modals state
  const [selectedIncidentForDetail, setSelectedIncidentForDetail] = useState<Incident | null>(null);
  const [selectedAgentForDrawer, setSelectedAgentForDrawer] = useState<AgentInfo | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPreset, setCreatePreset] = useState<{ description: string; building: string; flat: string } | undefined>(undefined);
  const [isSubmitEvidenceModalOpen, setIsSubmitEvidenceModalOpen] = useState(false);
  const [evidenceTargetIncident, setEvidenceTargetIncident] = useState<Incident | null>(null);

  // Fetch all initial data from backend API
  const fetchAllData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [
        incRes,
        agentRes,
        venRes,
        appRes,
        eviRes,
        intelRes,
        roomsRes,
        switchStatusRes,
        auditRes,
        warRoomRes
      ] = await Promise.all([
        fetch('/api/incidents').then((r) => r.json()),
        fetch('/api/agents').then((r) => r.json()),
        fetch('/api/vendors').then((r) => r.json()),
        fetch('/api/approvals').then((r) => r.json()),
        fetch('/api/evidence').then((r) => r.json()),
        fetch('/api/intelligence').then((r) => r.json()),
        fetch('/api/switch/rooms').then((r) => r.json()),
        fetch('/api/switch/status').then((r) => r.json()),
        fetch('/api/audit').then((r) => r.json()),
        fetch('/api/war-room/events').then((r) => r.json())
      ]);

      if (incRes.success) setIncidents(incRes.data);
      if (agentRes.success) setAgents(agentRes.data);
      if (venRes.success) setVendors(venRes.data);
      if (appRes.success) setApprovals(appRes.data);
      if (eviRes.success) setEvidence(eviRes.data);
      if (intelRes.success) setCorrelations(intelRes.data.clusters);
      if (roomsRes.success) setSwitchRooms(roomsRes.data);
      if (switchStatusRes.success) setSwitchStatus(switchStatusRes);
      if (auditRes.success) setAuditLog(auditRes.data);
      if (warRoomRes.success) setWarRoomEvents(warRoomRes.data);

      if (roomsRes.success) {
        const roomMessages = await Promise.all(
          roomsRes.data.map((room: SwitchRoom) =>
            fetch(`/api/switch/rooms/${encodeURIComponent(room.id)}/messages`).then((r) => r.json())
          )
        );
        setSwitchMessages(
          roomMessages.flatMap((result) => result.success ? result.data as SwitchMessage[] : [])
        );
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Connect to SSE stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/switch/events');

      eventSource.addEventListener('connected', () => {
        setIsSSEConnected(true);
      });

      eventSource.addEventListener('incident_created', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.incident) {
          setIncidents((prev) => [payload.incident, ...prev]);
        }
        if (payload.correlation) {
          setCorrelations((prev) => [payload.correlation, ...prev]);
        }
      });

      eventSource.addEventListener('incident_updated', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.incident) {
          setIncidents((prev) =>
            prev.map((i) => (i.id === payload.incident.id ? payload.incident : i))
          );
          setSelectedIncidentForDetail((curr) =>
            curr?.id === payload.incident.id ? payload.incident : curr
          );
        }
      });

      eventSource.addEventListener('approval_updated', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.approval) {
          setApprovals((prev) =>
            prev.map((a) => (a.id === payload.approval.id ? payload.approval : a))
          );
        }
      });

      eventSource.addEventListener('evidence_submitted', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.evidence) {
          setEvidence((prev) => [payload.evidence, ...prev]);
        }
        if (payload.incident) {
          setIncidents((prev) =>
            prev.map((i) => (i.id === payload.incident.id ? payload.incident : i))
          );
        }
      });

      eventSource.addEventListener('evidence_updated', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.evidence) {
          setEvidence((prev) =>
            prev.map((ev) => (ev.id === payload.evidence.id ? payload.evidence : ev))
          );
        }
        if (payload.incident) {
          setIncidents((prev) =>
            prev.map((i) => (i.id === payload.incident.id ? payload.incident : i))
          );
        }
      });

      eventSource.addEventListener('war_room_event', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.event) {
          setWarRoomEvents((prev) => [payload.event, ...prev]);
        }
      });

      eventSource.addEventListener('switch_message', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.message) {
          setSwitchMessages((prev) =>
            prev.some((message) => message.id === payload.message.id)
              ? prev
              : [...prev, payload.message]
          );
        }
      });

      eventSource.addEventListener('switch_message_updated', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.message) {
          setSwitchMessages((prev) =>
            prev.map((message) => message.id === payload.message.id ? payload.message : message)
          );
        }
      });

      eventSource.addEventListener('switch_status', (e) => {
        const status = JSON.parse(e.data);
        setSwitchStatus(status);
        setSwitchRooms((prev) =>
          prev.map((room) => ({
            ...room,
            discordSynced: status.connectedRoomIds.includes(room.id),
          }))
        );
      });

      eventSource.addEventListener('audit_logged', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.audit) {
          setAuditLog((prev) => [payload.audit, ...prev]);
        }
      });

      eventSource.addEventListener('reset', () => {
        fetchAllData();
      });

      eventSource.onerror = () => {
        setIsSSEConnected(false);
      };
    } catch (err) {
      console.warn('SSE connection failed:', err);
    }

    return () => {
      eventSource?.close();
    };
  }, [fetchAllData]);

  // Handle intro completion
  const handleIntroComplete = () => {
    sessionStorage.setItem('societyops_intro_seen', 'true');
    setShowIntro(false);
  };

  // Actions
  const handleCreateIncident = async (data: {
    description: string;
    building?: string;
    flat?: string;
    residentName?: string;
    residentContact?: string;
  }) => {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      await fetchAllData();
      setSelectedIncidentForDetail(result.data);
    }
  };

  const handleApprove = async (id: string, notes?: string) => {
    const res = await fetch(`/api/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisionNotes: notes, decidedBy: 'Anil Mehta (Operations Director)' }),
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleReject = async (id: string, reason: string) => {
    const res = await fetch(`/api/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, decidedBy: 'Anil Mehta (Operations Director)' }),
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleRequestChanges = async (id: string, notes: string) => {
    const res = await fetch(`/api/approvals/${id}/request-changes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, decidedBy: 'Anil Mehta (Operations Director)' }),
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleSubmitEvidence = async (data: any) => {
    const res = await fetch('/api/evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleOverrideProof = async (evidenceId: string, reason: string) => {
    const res = await fetch(`/api/evidence/${evidenceId}/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, decidedBy: 'Anil Mehta (Operations Director)' }),
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleReopenIncident = async (id: string, reason: string) => {
    const res = await fetch(`/api/incidents/${id}/reopen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleSendSwitchMessage = async (roomId: string, content: string) => {
    const res = await fetch('/api/switch/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        sender: 'Operations Director',
        senderType: 'human',
        content,
      }),
    });
    if (res.ok) {
      const result = await res.json();
      setSwitchMessages((prev) =>
        prev.some((message) => message.id === result.data.id)
          ? prev
          : [...prev, result.data]
      );
    }
  };

  const handleVerifyCorrelation = async (clusterId: string) => {
    const res = await fetch(`/api/intelligence/${clusterId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifiedBy: 'Prakash Rao (Chief Civil Engineer)' }),
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleTriggerScan = async () => {
    await fetch('/api/intelligence/scan', { method: 'POST' });
    await fetchAllData();
  };

  const handleDispatchDirective = async (agentId: string, directive: string, targetIncidentId?: string) => {
    const res = await fetch('/api/war-room/directive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, directive, targetIncidentId }),
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleRunScenario = async () => {
    const res = await fetch('/api/demo/run', { method: 'POST' });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleReset = async () => {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'Resolved').length;
  const activeAgentsCount = agents.filter(
    (a) => a.status === 'active' || a.status === 'analyzing' || a.status === 'collaborating'
  ).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#06080e] text-slate-100 font-sans antialiased selection:bg-violet-600/30 selection:text-violet-200">
      {/* Cinematic Intro sequence */}
      {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}

      {/* Main Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingApprovalsCount={pendingApprovalsCount}
        openIncidentsCount={openIncidentsCount}
        activeAgentsCount={activeAgentsCount}
        switchStatus={switchStatus}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* App Body */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Header
          isRefreshing={isRefreshing}
          onRefresh={fetchAllData}
          pendingApprovalsCount={pendingApprovalsCount}
          onNavigateToTab={setCurrentTab}
          onOpenCreateModal={() => {
            setCreatePreset(undefined);
            setIsCreateModalOpen(true);
          }}
        />

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 relative">
          {currentTab === 'command-center' && (
            <CommandCenter
              incidents={incidents}
              agents={agents}
              approvals={approvals}
              switchMessages={switchMessages}
              onSelectIncident={setSelectedIncidentForDetail}
              onSelectAgent={setSelectedAgentForDrawer}
              onNavigateToTab={setCurrentTab}
              onRunScenario={handleRunScenario}
              onReset={handleReset}
              onOpenCreateModalWithPreset={(text: string, building: string, flat: string) => {
                setCreatePreset({ description: text, building, flat });
                setIsCreateModalOpen(true);
              }}
              isSSEConnected={isSSEConnected}
            />
          )}

          {currentTab === 'war-room' && (
            <LiveWarRoomView
              agents={agents}
              warRoomEvents={warRoomEvents}
              incidents={incidents}
              isSSEConnected={isSSEConnected}
              switchRooms={switchRooms}
              switchMessages={switchMessages}
              onSelectAgent={setSelectedAgentForDrawer}
              onSelectIncident={setSelectedIncidentForDetail}
              onDispatchDirective={handleDispatchDirective}
            />
          )}

          {currentTab === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              onSelectIncident={setSelectedIncidentForDetail}
              onOpenCreateModal={() => {
                setCreatePreset(undefined);
                setIsCreateModalOpen(true);
              }}
            />
          )}

          {currentTab === 'detective' && (
            <IncidentDetectiveView
              correlations={correlations}
              incidents={incidents}
              onVerifyCorrelation={handleVerifyCorrelation}
              onTriggerScan={handleTriggerScan}
              onSelectIncident={setSelectedIncidentForDetail}
            />
          )}

          {currentTab === 'heatmap' && (
            <RiskHeatmapView
              incidents={incidents}
              onSelectIncident={setSelectedIncidentForDetail}
            />
          )}

          {currentTab === 'predictive' && (
            <PredictiveMaintenanceView
              onSelectIncident={setSelectedIncidentForDetail}
              onWorkOrderCreated={fetchAllData}
            />
          )}

          {currentTab === 'agents' && (
            <AgentsView
              agents={agents}
              onNavigateToTab={setCurrentTab}
              onSelectAgentDrawer={setSelectedAgentForDrawer}
            />
          )}

          {currentTab === 'switch' && (
            <SwitchHubView
              rooms={switchRooms}
              messages={switchMessages}
              agents={agents}
              isSSEConnected={isSSEConnected}
              switchStatus={switchStatus}
              onSendMessage={handleSendSwitchMessage}
              onRefresh={fetchAllData}
            />
          )}

          {currentTab === 'approvals' && (
            <ApprovalsView
              approvals={approvals}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
            />
          )}

          {currentTab === 'verification' && (
            <VerificationView
              evidenceList={evidence}
              incidents={incidents}
              onOpenSubmitEvidence={(inc) => {
                setEvidenceTargetIncident(inc || null);
                setIsSubmitEvidenceModalOpen(true);
              }}
              onReopenIncident={handleReopenIncident}
              onOverrideProof={handleOverrideProof}
            />
          )}

          {currentTab === 'vendors' && (
            <VendorsView vendors={vendors} onNavigateToTab={setCurrentTab} />
          )}

          {currentTab === 'audit' && <AuditTrailView auditLog={auditLog} />}
        </main>
      </div>

      {/* Global Modals & Slide-overs */}
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateIncident}
        initialPreset={createPreset}
      />

      <IncidentDetailModal
        incident={selectedIncidentForDetail}
        onClose={() => setSelectedIncidentForDetail(null)}
        onNavigateToTab={setCurrentTab}
        onSubmitEvidenceClick={(inc) => {
          setEvidenceTargetIncident(inc);
          setSelectedIncidentForDetail(null);
          setIsSubmitEvidenceModalOpen(true);
        }}
        onReopenIncident={handleReopenIncident}
      />

      <AgentDrawer
        agent={selectedAgentForDrawer}
        onClose={() => setSelectedAgentForDrawer(null)}
        incidents={incidents}
        switchMessages={switchMessages}
        onNavigateToTab={setCurrentTab}
        onSelectIncident={setSelectedIncidentForDetail}
      />

      <SubmitEvidenceModal
        isOpen={isSubmitEvidenceModalOpen}
        onClose={() => setIsSubmitEvidenceModalOpen(false)}
        incidents={incidents}
        preselectedIncident={evidenceTargetIncident}
        onSubmit={handleSubmitEvidence}
      />
    </div>
  );
}
