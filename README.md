# SocietyOps — The Autonomous Society Operations Network

> **Tagline:** Don't just report problems. Resolve them together.

SocietyOps is an AI-powered residential society operations platform where specialized autonomous AI agents collaborate with residents, security guards, maintenance technicians, vendors, and society managers to resolve real-world apartment maintenance incidents.

Built with **Gemini**, **React + TypeScript + Tailwind CSS**, **Express / FastAPI**, and a two-way Discord connection for Switch-connected chat rooms.

---

## 🌟 Key Highlights & Innovations

1. **Switch Rooms collaboration through Discord:**
   - **Triage Agent (@triage-agent):** Classifies complaints, parses flat/building metadata, extracts urgency, alerts operations rooms.
   - **Intelligence Agent (@intel-agent):** Cross-references historical tickets, spatial conduits, and gravity drainage paths to uncover common root causes.
   - **Dispatch Agent (@dispatch-agent):** Optimizes technician skills, balances trade availability, and packages work orders.
   - **Vendor Agent (@vendor-agent):** Benchmarks contractor quotations, verifies licenses & SLAs, and negotiates emergency rates.
   - **Verification Agent (@verify-agent):** Audits before/after imagery, verifies checklist criteria, and prevents premature closures.
   - **Memory Agent (@memory-agent):** Tracks chronic infrastructure defects and formulates predictive preventive maintenance schedules.
   - Incident and agent messages are posted to configured Discord channels that are connected as Switch rooms. Human messages and Switch agent replies in those channels are received back by SocietyOps.
   - The SocietyOps browser SSE stream only updates the UI; it is not presented as the Switch transport.

2. **Signature Innovation: Incident Correlation Graph:**
   - Detects hidden infrastructure patterns across multiple flats (e.g. B-204 ceiling leak + B-304 floor dampness + Ground Lobby lift water pooling).
   - Maps failure to shared vertical riser shaft #BR-4 between 2nd & 3rd floor slab joint.
   - Explicitly distinguishes between **AI Hypotheses** and **Field-Verified Findings**.

3. **Sovereign Human Approval Gate:**
   - Autonomous agents do not spend money without human authorization.
   - Financial decisions, contractor callouts, and critical incident closures require explicit manager approval.

4. **Proof of Resolution (Strict QA):**
   - No ticket can be closed simply because a technician says it's fixed.
   - Requires side-by-side Before & After photographic evidence, a 5-point completion checklist (pressure/moisture tests), and resident sign-off.

5. **Two-way Switch chat bridge:**
   - Discord Gateway receives human and Switch-agent messages from configured channels; Discord REST publishes SocietyOps messages.
   - Dedicated logical rooms: `#society-control`, `#incident-water-leak-001`, `#vendor-coordination`, `#resolution-review`.
   - The app reports local preview, connecting, connected, and delivery-failed states instead of claiming a connection when one is not configured.

---

## 🏗️ Architecture & Project Structure

```
societyops-ai/
├── src/                          # React Frontend & Application UI
│   ├── components/
│   │   ├── Sidebar.tsx           # Dark enterprise navigation & live Switch status
│   │   ├── Header.tsx            # Global search, notification bell & quick actions
│   │   ├── CommandCenter.tsx     # Operations KPI dashboard & real-time radar
│   │   ├── IncidentsView.tsx     # Incident management desk with filters
│   │   ├── IncidentDetailModal.tsx # Full timeline, root cause hypothesis, & actions
│   │   ├── CreateIncidentModal.tsx # Ingestion form with demo presets & AI triage
│   │   ├── AgentsView.tsx        # 6 specialized agents, prompts & telemetry
│   │   ├── SwitchHubView.tsx     # Real-time Switch rooms & Discord bridge
│   │   ├── CorrelationGraphView.tsx # Interactive vertical shaft schematic & hypothesis
│   │   ├── ApprovalsView.tsx     # Human approval gatekeeper for spend & dispatch
│   │   ├── VerificationView.tsx  # Proof of resolution visual comparisons & audit
│   │   ├── SubmitEvidenceModal.tsx # Technician work submission & checklist
│   │   ├── VendorsView.tsx       # Vetted vendor directory & quote benchmarking
│   │   └── AuditTrailView.tsx    # Immutable cryptographically traced event journal
│   ├── server/                   # Backend services & in-memory/JSON store
│   │   ├── store.ts              # Operations state, SSE broadcasting, demo runner
│   │   ├── discordSwitchBridge.ts # Discord Gateway receive + REST send for Switch-connected channels
│   │   ├── geminiService.ts      # Gemini 3.8 Flash agent reasoning service
│   │   └── mockData.ts           # Realistic seed dataset for Grand Orchids Residency
│   ├── types.ts                  # Shared TypeScript domain contracts
│   └── App.tsx                   # Main SPA controller & SSE event router
├── server.ts                     # Full-Stack Express server with Vite middleware
├── backend/                      # Python FastAPI stack
│   ├── app/
│   │   └── main.py               # FastAPI endpoints & SQLAlchemy models
│   └── requirements.txt          # Python dependencies
├── switch/                       # CLI for triggering a real SocietyOps incident
│   ├── switch_client.py          # SocietyOps HTTP API client
│   └── run_scenario.py           # Requires a connected Switch/Discord room; no fake conversation
└── docs/                         # Architecture & judging references
```

---

## 🚀 Quickstart & Running the App

### Option A: Web Full-Stack Mode (Instant AI Studio Run)

The repository is configured as an end-to-end full-stack app on Port 3000:

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server (Express backend + Vite React frontend)
npm run dev
```

Visit `http://localhost:3000` to open the SocietyOps Command Center.

### Connect Switch Rooms to SocietyOps

The current Switch Rooms setup connects agents to a messaging app; SocietyOps uses Discord as that chat transport. Follow the [Switch quickstart](https://docs.switchagents.ai/switch-rooms/getting-started/index.md), connect Discord, and create the four SocietyOps channels as Switch rooms. Add the Switch agents you want to involve to those rooms.

1. Create a Discord bot for SocietyOps and invite it to the same server/channels. Enable **Guilds**, **Guild Messages**, and the privileged **Message Content Intent** in the Discord Developer Portal. Grant it View Channel, Read Message History, and Send Messages permissions.
2. Copy the channel IDs (enable Developer Mode in Discord) and set the variables below. `DISCORD_ROOM_CHANNELS` maps SocietyOps room IDs to Discord channel IDs. `DISCORD_SWITCH_AGENT_IDS` is optional; when configured, SocietyOps mentions the Intelligence Agent on triage handoff.
3. Restart `npm run dev`. The Switch Collaboration view should show Discord as connected and list connected rooms. Send a test message and verify it appears in the Discord channel; reply as a human or Switch agent and verify it appears in SocietyOps.
4. Create an incident from SocietyOps. Triage posts the report and asks the Intelligence Agent to investigate in `#incident-water-leak-001`. Dispatch remains gated by manager approval.

Set clear instructions on the Switch agents in those rooms. For example: the Intelligence Agent should review the reported location against related incidents and return its evidence and uncertainty; the Dispatch Agent must prepare options but never commit spend or dispatch before an explicit manager approval; the Verification Agent must request missing proof rather than claim a repair is complete.

The Discord bot is the SocietyOps bridge, while Switch agents use the Switch-managed Discord connection. The app can verify its own Discord connection, but cannot verify that each channel is also configured as a Switch room. Do not expose the bot token in browser code or commit it. The bridge only consumes text messages; attachments remain in Discord.

For official setup details, see [Connect Discord](https://docs.switchagents.ai/switch-rooms/deploy/messaging-apps/discord.md). Switch does not document the legacy `api.switchagents.ai/v1` / SSE protocol previously claimed by this project, so this app does not use or advertise that endpoint.

### Option B: Python FastAPI Backend (Standalone)

```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The standalone FastAPI backend does not run the Discord/Switch bridge. Use the TypeScript server for Switch-connected chat.

### Option C: Run Switch Agent Scenario CLI

```bash
cd switch
python run_scenario.py
```

---

## 🎬 1-Click Signature Hackathon Demo

Click The **"1-Click Autonomous Demo"** button on the Command Center banner runs the SocietyOps workflow. It includes scripted demo steps and is not the live human–Switch collaboration proof. For the hackathon demo, create a new incident and complete the investigation with a real Switch agent and a human in the connected Discord/Switch room. SocietyOps-generated messages are delivered to configured Discord channels; incoming Switch-agent replies are never fabricated.

1. **Resident Report:** Priya Sharma reports water leaking from kitchen ceiling in Flat B-204.
2. **AI Triage:** Triage Agent parses the complaint, sets priority, posts an alert to `#society-control`, and asks the Intelligence Agent to investigate in `#incident-water-leak-001`.
3. **Root-Cause Correlation:** SocietyOps' Gemini-backed analysis checks the seeded/historical incident records and posts its hypothesis to `#incident-water-leak-001`. Switch agents and the manager can reply in that same connected Discord channel; their text messages appear in the SocietyOps view.
4. **Vendor & Dispatch Evaluation:** Dispatch Agent routes Senior Plumber Rajesh Kumar and Vendor Agent benchmarks quotes from AquaFix ($180) vs RapidPlumb ($240).
5. **Human Approval Gate:** Operations Manager authorizes $180 expenditure in the Approval Gate.
6. **Technician Repair:** Plumber isolates valve, replaces damaged coupler, and submits Before & After photos with 5-point hydrostatic pressure test.
7. **Verification Audit:** Verification Agent audits evidence, confirms criteria are met, and marks ticket RESOLVED.
8. **Audit Trail & Metrics:** Workflow events are recorded in the app's audit log with trace IDs. The in-memory app store is not permanent storage.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Required for autonomous Gemini AI triage & correlation
GEMINI_API_KEY="your-gemini-api-key"

# Optional: two-way Discord bridge for channels connected to Switch
DISCORD_BOT_TOKEN="your-discord-bot-token"
DISCORD_ROOM_CHANNELS="{\"society-control\":\"123456789012345678\",\"incident-water-leak-001\":\"123456789012345679\",\"vendor-coordination\":\"123456789012345680\",\"resolution-review\":\"123456789012345681\"}"

# Optional: Discord user IDs for Switch agents to mention (e.g. on Triage handoff)
DISCORD_SWITCH_AGENT_IDS="{\"@intel-agent\":\"123456789012345682\"}"
```

Do not use the example numeric IDs as real channel IDs. Configure only the channels/agent IDs in your own Discord server. `DISCORD_SWITCH_AGENT_IDS` may be left empty; ensure the Intelligence Agent is instructed in Switch to monitor its room if you do not set a mention ID.

Wispr Flow is a separate voice-to-text tool for dictating prompts and messages; it does not connect or relay messages between agents. For the hackathon's Code with Wispr side track, follow the [submission instructions](https://www.wemakedevs.org/hackathons/switch) and attach the usage scorecard from Wispr Flow Insights.

---

## 🏆 Hackathon Submission Checklist

- [x] Multi-Agent Network with 6 distinct autonomous agents
- [x] Two-way Discord Gateway/REST bridge for Switch-connected rooms
- [ ] Configure Discord bot and Switch rooms with your own credentials before the live demo
- [x] Signature feature: Incident correlation graph (Block B vertical riser)
- [x] Distinction between AI Hypotheses and Verified Findings
- [x] Human Approval Gate for financial and safety governance
- [x] Proof of Resolution with Before/After photos & checklist verification
- [x] Real-time Server-Sent Events (SSE) updates
- [x] Immutable audit trail with export capability
- [x] Responsive enterprise SaaS command center UI
