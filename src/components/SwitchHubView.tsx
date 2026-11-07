import React, { useState } from 'react';
import { 
  Network, 
  Radio, 
  Send, 
  MessageSquare, 
  Users, 
  Bot, 
  ShieldCheck, 
  Terminal, 
  Hash, 
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  User,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SwitchRoom, SwitchMessage, AgentInfo, SwitchIntegrationStatus } from '../types.js';
import { SwitchHubDiagram } from './SwitchHubDiagram.js';

interface SwitchHubViewProps {
  rooms: SwitchRoom[];
  messages: SwitchMessage[];
  agents: AgentInfo[];
  isSSEConnected: boolean;
  switchStatus: SwitchIntegrationStatus;
  onSendMessage: (roomId: string, content: string) => Promise<void>;
  onRefresh: () => void;
}

export const SwitchHubView: React.FC<SwitchHubViewProps> = ({
  rooms,
  messages,
  agents,
  isSSEConnected,
  switchStatus,
  onSendMessage,
  onRefresh,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    rooms[1]?.id || rooms[0]?.id || 'incident-water-leak-001'
  );
  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showProtocolInspector, setShowProtocolInspector] = useState(false);
  const [showTopology, setShowTopology] = useState(true);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const roomMessages = messages.filter((m) => m.roomId === selectedRoomId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(selectedRoomId, inputContent);
      setInputContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Switch Collaboration Network</h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
              <Radio className={`w-3 h-3 ${switchStatus.connected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              {switchStatus.connected
                ? `Discord bridge · ${switchStatus.connectedRoomIds.length} channels`
                : switchStatus.state === 'not_configured'
                  ? 'Local preview · Discord not configured'
                  : switchStatus.state === 'connecting'
                    ? 'Connecting to Discord...'
                    : `Discord ${switchStatus.state}`}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            SocietyOps relays messages through Discord channels. Connect those same channels to Switch for human/agent collaboration; this dashboard's SSE stream is separate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTopology(!showTopology)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
              showTopology
                ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/30'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>{showTopology ? 'Hide Room Map' : 'Show Room Map'}</span>
          </button>

          <button
            onClick={() => setShowProtocolInspector(!showProtocolInspector)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
              showProtocolInspector
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{showProtocolInspector ? 'Hide Connection Details' : 'Connection Details'}</span>
          </button>
        </div>
      </div>

      {/* Connection details */}
      <AnimatePresence>
        {showProtocolInspector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-2xl bg-black/60 border border-indigo-500/30 shadow-2xl space-y-3 font-mono text-xs overflow-hidden"
          >
            <div className="flex items-center justify-between text-violet-400 font-bold">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>Switch Rooms chat connection</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${
                switchStatus.connected
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-amber-300 bg-amber-500/10 border-amber-500/20'
              }`}>
                {switchStatus.connected ? 'DISCORD GATEWAY CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400 pt-2 border-t border-white/10">
              <div>
                <span className="text-slate-500 block">Chat platform:</span>
                <span className="text-slate-200">Discord channels (connect these to Switch separately)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Configured rooms:</span>
                <span className="text-slate-200">
                  {switchStatus.configuredRoomIds.length
                    ? switchStatus.configuredRoomIds.map((id) => `#${id}`).join(', ')
                    : 'None'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">SocietyOps UI stream:</span>
                <span className={isSSEConnected ? 'text-emerald-400' : 'text-slate-400'}>
                  {isSSEConnected ? 'Connected (local app events)' : 'Disconnected'}
                </span>
              </div>
            </div>
            {switchStatus.error && (
              <p className="pt-2 text-[11px] text-rose-300">{switchStatus.error}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual SocietyOps room and agent-role map */}
      {showTopology && (
        <SwitchHubDiagram
          agents={agents}
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={(roomId) => setSelectedRoomId(roomId)}
          isSSEConnected={isSSEConnected}
        />
      )}

      {/* Main Switch Layout: Rooms sidebar + Chat workspace */}
      <div className="bg-[#0c101a] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-4 min-h-[600px]">
        {/* Rooms Sidebar */}
        <div className="border-r border-white/[0.08] bg-[#090d16] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Switch Rooms
            </span>
            <span className="text-[10px] font-mono text-slate-500">{rooms.length} Channels</span>
          </div>

          <div className="space-y-1.5">
            {rooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-lg shadow-indigo-900/30 border border-white/20'
                      : 'hover:bg-white/[0.04] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs truncate flex items-center gap-1.5">
                      <Hash className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`} />
                      {room.name.replace('#', '')}
                    </span>
                    {room.discordSynced && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                        isSelected ? 'bg-blue-800 text-blue-200' : 'bg-white/5 text-slate-400'
                      }`}>
                        Discord
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {room.description}
                  </p>
                  <div className={`mt-2 flex items-center justify-between text-[10px] font-mono ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                    <span>{room.activeParticipants.length} participants</span>
                    <span>{room.messageCount} msgs</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Participants observed in this room */}
          <div className="pt-4 border-t border-white/[0.08]">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Participants
            </span>
            <div className="space-y-1.5">
              {selectedRoom?.activeParticipants.map((part, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span className="truncate font-medium">{part}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3 flex flex-col bg-[#0b0f19]">
          {/* Room Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-2.5">
              <Hash className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white">{selectedRoom?.name}</h3>
                <p className="text-xs text-slate-400">{selectedRoom?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Discord bridge:</span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                selectedRoom && switchStatus.connectedRoomIds.includes(selectedRoom.id)
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-slate-400 bg-white/5 border-white/10'
              }`}>
                {selectedRoom && switchStatus.connectedRoomIds.includes(selectedRoom.id)
                  ? <><CheckCircle2 className="w-3 h-3" /> Connected</>
                  : 'Local preview'}
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px]">
            {roomMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No messages in this Switch room yet. Send a message to initiate multi-agent dialogue.
              </div>
            ) : (
              roomMessages.map((msg, index) => {
                const isAgent = msg.senderType === 'agent';
                const isHuman = msg.senderType === 'human';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="space-y-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isAgent ? 'text-indigo-400' : isHuman ? 'text-blue-400' : 'text-violet-400'}`}>
                        {msg.sender}
                      </span>
                      <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded border ${
                        isAgent
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : isHuman
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      }`}>
                        {isAgent ? 'Agent' : isHuman ? 'Human Operations' : 'Discord Member'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      {msg.deliveryStatus && (
                        <span className={`text-[9px] uppercase font-mono ${
                          msg.deliveryStatus === 'sent' || msg.deliveryStatus === 'received'
                            ? 'text-emerald-400'
                            : msg.deliveryStatus === 'failed'
                              ? 'text-rose-400'
                              : msg.deliveryStatus === 'pending'
                                ? 'text-amber-300'
                                : 'text-slate-500'
                        }`}>
                          {msg.deliveryStatus === 'received' ? 'received from Discord' : msg.deliveryStatus === 'sent' ? 'sent to Discord' : msg.deliveryStatus === 'local' ? 'local only' : msg.deliveryStatus}
                        </span>
                      )}
                    </div>

                    <div className={`p-4 rounded-2xl leading-relaxed max-w-2xl border ${
                      isAgent
                        ? 'bg-white/[0.03] border-white/[0.08] text-slate-200'
                        : isHuman
                        ? 'bg-blue-950/40 border-blue-500/30 text-blue-100 font-medium'
                        : 'bg-purple-950/40 border-purple-500/30 text-purple-100'
                    }`}>
                      <p className="font-sans leading-relaxed">{msg.content}</p>
                      {msg.deliveryError && (
                        <p className="mt-2 text-[10px] text-rose-300">Delivery failed: {msg.deliveryError}</p>
                      )}

                      {msg.metadata?.actionRequired && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 text-amber-300 font-semibold flex items-center gap-1.5 text-[11px] font-mono">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Action required: Human review triggered in Approval Gate</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Composer */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/[0.08] bg-white/[0.01] flex items-center gap-3">
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder={`Message ${selectedRoom?.name} as Operations Manager via SocietyOps...`}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isSending || !inputContent.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition flex items-center gap-2 shadow-md shadow-indigo-900/30 disabled:opacity-50 border border-white/10"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
