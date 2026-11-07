import express from 'express';
import { createServer as createViteServer } from 'vite';
import { opsStore } from './src/server/store.js';
import { DiscordSwitchBridge } from './src/server/discordSwitchBridge.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const switchBridge = new DiscordSwitchBridge(
    (message) => {
      opsStore.receiveExternalSwitchMessage(message);
    },
    (status) => {
      opsStore.broadcastSSE('switch_status', status);
    },
  );
  opsStore.setSwitchPublisher((message) => switchBridge.sendMessage(message));
  switchBridge.start();

  app.use(express.json());

  // --- API Routes ---

  // Incidents
  app.get('/api/incidents', (req, res) => {
    const { status, priority, building, search } = req.query;
    const list = opsStore.getIncidents({
      status: status as string,
      priority: priority as string,
      building: building as string,
      search: search as string,
    });
    res.json({ success: true, count: list.length, data: list });
  });

  app.get('/api/incidents/:id', (req, res) => {
    const inc = opsStore.getIncidentById(req.params.id);
    if (!inc) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, data: inc });
  });

  app.post('/api/incidents', async (req, res) => {
    try {
      const { title, description, building, flat, residentName, residentContact } = req.body;
      if (!description) {
        return res.status(400).json({ success: false, error: 'Incident description is required' });
      }
      const result = await opsStore.createIncident({
        title,
        description,
        building,
        flat,
        residentName,
        residentContact,
      });
      res.status(201).json({ success: true, data: result.incident, correlation: result.correlation });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process incident';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.patch('/api/incidents/:id', (req, res) => {
    const updated = opsStore.updateIncident(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, data: updated });
  });

  app.post('/api/incidents/:id/reopen', (req, res) => {
    const { reason } = req.body;
    const reopened = opsStore.reopenIncident(req.params.id, reason || 'Further physical investigation required');
    if (!reopened) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, data: reopened });
  });

  // Agents
  app.get('/api/agents', (_req, res) => {
    const agents = opsStore.getAgents();
    res.json({ success: true, data: agents });
  });

  // Vendors
  app.get('/api/vendors', (_req, res) => {
    const vendors = opsStore.getVendors();
    res.json({ success: true, data: vendors });
  });

  // Approvals
  app.get('/api/approvals', (_req, res) => {
    const approvals = opsStore.getApprovals();
    res.json({ success: true, data: approvals });
  });

  app.post('/api/approvals/:id/approve', (req, res) => {
    const { decisionNotes, decidedBy } = req.body;
    const result = opsStore.approveRequest(req.params.id, decisionNotes, decidedBy);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Approval request not found' });
    }
    res.json({ success: true, data: result });
  });

  app.post('/api/approvals/:id/reject', (req, res) => {
    const { reason, decidedBy } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required' });
    }
    const result = opsStore.rejectRequest(req.params.id, reason, decidedBy);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Approval request not found' });
    }
    res.json({ success: true, data: result });
  });

  app.post('/api/approvals/:id/request-changes', (req, res) => {
    const { notes, decidedBy } = req.body;
    if (!notes) {
      return res.status(400).json({ success: false, error: 'Changes requested notes are required' });
    }
    const result = opsStore.requestChanges(req.params.id, notes, decidedBy);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Approval request not found' });
    }
    res.json({ success: true, data: result });
  });

  // Resolution Evidence
  app.get('/api/evidence', (_req, res) => {
    const evidence = opsStore.getEvidence();
    res.json({ success: true, data: evidence });
  });

  app.post('/api/evidence', async (req, res) => {
    try {
      const {
        incidentId,
        technicianName,
        beforePhotoUrl,
        afterPhotoUrl,
        repairNotes,
        partsReplaced,
        laborHours,
        checklist,
        residentFeedback,
        residentRating,
      } = req.body;

      if (!incidentId || !technicianName || !repairNotes) {
        return res.status(400).json({ success: false, error: 'incidentId, technicianName, and repairNotes are required' });
      }

      const result = await opsStore.submitEvidence({
        incidentId,
        technicianName,
        beforePhotoUrl: beforePhotoUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
        afterPhotoUrl: afterPhotoUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        repairNotes,
        partsReplaced: Array.isArray(partsReplaced) ? partsReplaced : [],
        laborHours: Number(laborHours) || 1,
        checklist: Array.isArray(checklist) ? checklist : [{ item: 'Visual check complete', completed: true }],
        residentFeedback,
        residentRating: Number(residentRating) || 5,
      });

      res.status(201).json({ success: true, data: result.evidence, incident: result.incident });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit evidence';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.post('/api/evidence/:id/override', (req, res) => {
    const { reason, decidedBy } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Override justification reason is required' });
    }
    const result = opsStore.overrideProofVerification(req.params.id, reason, decidedBy);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Evidence record not found' });
    }
    res.json({ success: true, data: result.evidence, incident: result.incident });
  });

  // Audit Trail
  app.get('/api/audit', (_req, res) => {
    const audit = opsStore.getAuditLog();
    res.json({ success: true, count: audit.length, data: audit });
  });

  // Intelligence & Correlations
  app.get('/api/intelligence', (_req, res) => {
    const correlations = opsStore.getCorrelations();
    res.json({
      success: true,
      data: {
        clusters: correlations,
        vulnerabilities: [
          {
            asset: 'Block B Vertical Plumbing Riser #BR-4',
            building: 'Block B (Maple)',
            incidentFrequency: '4 tickets / 6 months',
            riskLevel: 'HIGH',
            estimatedReplacementCost: 1200,
            chronicRootCause: 'Thermal expansion cycling on 2018 Schedule 40 PVC joints without expansion loops.',
          },
          {
            asset: 'Block A Lift #2 Leveling Optical Array',
            building: 'Block A (Oak)',
            incidentFrequency: '3 leveling faults / 90 days',
            riskLevel: 'MEDIUM',
            estimatedReplacementCost: 450,
            chronicRootCause: 'Dust accumulation on hoistway infrared sensor reflective prisms.',
          },
        ],
        frequentlyFailingAssets: ['Riser Column BR-4', 'Lift #2 Optical Leveler', 'Clubhouse RFID Coax Line'],
      },
    });
  });

  app.post('/api/intelligence/:id/verify', (req, res) => {
    const { verifiedBy } = req.body;
    const result = opsStore.verifyCorrelation(req.params.id, verifiedBy);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Correlation cluster not found' });
    }
    res.json({ success: true, data: result });
  });

  app.post('/api/intelligence/scan', async (_req, res) => {
    try {
      const result = await opsStore.triggerIntelligenceScan();
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Scan failed';
      res.status(500).json({ success: false, error: message });
    }
  });

  // Live Agent War Room
  app.get('/api/war-room/events', (_req, res) => {
    const events = opsStore.getWarRoomEvents();
    res.json({ success: true, count: events.length, data: events });
  });

  app.post('/api/war-room/directive', (req, res) => {
    const { agentId, directive, targetIncidentId } = req.body;
    if (!agentId || !directive) {
      return res.status(400).json({ success: false, error: 'agentId and directive are required' });
    }
    const result = opsStore.dispatchWarRoomDirective({ agentId, directive, targetIncidentId });
    res.status(201).json({ success: true, data: result.event });
  });

  // Society Risk Heatmap
  app.get('/api/heatmap', (req, res) => {
    const { category, range } = req.query;
    const cells = opsStore.getHeatmapData(category as string, range as string);
    res.json({ success: true, count: cells.length, data: cells });
  });

  // Predictive Maintenance Intelligence
  app.get('/api/predictive', (_req, res) => {
    const recs = opsStore.getPredictiveRecommendations();
    res.json({ success: true, count: recs.length, data: recs });
  });

  app.post('/api/predictive/:id/convert', (req, res) => {
    const result = opsStore.convertPredictiveToWorkOrder(req.params.id);
    if (!result.success) {
      return res.status(404).json({ success: false, error: 'Recommendation not found' });
    }
    res.json({ success: true, data: result.incident, recommendation: result.recommendation });
  });

  // Switch Protocol Endpoints
  app.get('/api/switch/status', (_req, res) => {
    res.json({ success: true, ...switchBridge.getStatus() });
  });

  app.get('/api/switch/rooms', (_req, res) => {
    const connectedRoomIds = new Set(switchBridge.getStatus().connectedRoomIds);
    const rooms = opsStore.getSwitchRooms().map((room) => ({
      ...room,
      discordSynced: connectedRoomIds.has(room.id),
    }));
    res.json({ success: true, data: rooms });
  });

  app.get('/api/switch/rooms/:id/messages', (req, res) => {
    const msgs = opsStore.getSwitchMessages(req.params.id);
    res.json({ success: true, data: msgs });
  });

  app.post('/api/switch/messages', (req, res) => {
    const { roomId, sender, senderType, content, metadata } = req.body;
    if (!roomId || !content) {
      return res.status(400).json({ success: false, error: 'roomId and content are required' });
    }
    if (!opsStore.getSwitchRooms().some((room) => room.id === roomId)) {
      return res.status(404).json({ success: false, error: 'Switch room not found' });
    }
    const msg = opsStore.sendSwitchMessage({
      roomId,
      sender: sender || 'Operations Manager',
      senderType: senderType || 'human',
      content,
      metadata,
    });
    res.status(201).json({ success: true, data: msg });
  });

  // Real-time SSE Stream for Switch & System Events
  app.get('/api/switch/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    opsStore.registerSSEClient(res);
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', timestamp: new Date().toISOString() })}\n\n`);
  });

  // Interactive Demo Controls
  app.post('/api/demo/run', async (_req, res) => {
    try {
      const outcome = await opsStore.runDemoScenario();
      res.json({ success: true, data: outcome });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to run scenario';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.post('/api/demo/reset', (_req, res) => {
    opsStore.reset();
    res.json({ success: true, message: 'Reset completed successfully' });
  });

  // Attach Vite Middleware for SPA Frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SocietyOps Server listening on http://0.0.0.0:${PORT}`);
  });

  process.on('SIGINT', () => switchBridge.stop());
  process.on('SIGTERM', () => switchBridge.stop());
}

startServer().catch((err) => {
  console.error('Fatal error starting SocietyOps server:', err);
  process.exit(1);
});
