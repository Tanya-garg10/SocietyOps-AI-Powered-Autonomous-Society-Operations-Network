import type { SwitchMessage } from '../types.js';

type BridgeState = 'not_configured' | 'incomplete' | 'connecting' | 'connected' | 'error' | 'stopped';

interface DiscordGatewayPacket {
  op: number;
  d: unknown;
  s?: number | null;
  t?: string | null;
}

interface DiscordMessageCreate {
  id?: string;
  channel_id?: string;
  content?: string;
  webhook_id?: string;
  author?: {
    id?: string;
    username?: string;
    global_name?: string | null;
    bot?: boolean;
  };
}

export interface DiscordSwitchStatus {
  provider: 'Discord';
  state: BridgeState;
  connected: boolean;
  configuredRoomIds: string[];
  connectedRoomIds: string[];
  error?: string;
}

type IncomingMessageHandler = (message: {
  roomId: string;
  sender: string;
  senderType: 'agent' | 'human';
  content: string;
  externalMessageId: string;
}) => void;

const DISCORD_API = 'https://discord.com/api/v10';
const GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json';
const ROOM_IDS = new Set([
  'society-control',
  'incident-water-leak-001',
  'vendor-coordination',
  'resolution-review',
]);

function parseIdMap(value: string | undefined, variableName: string): Record<string, string> {
  if (!value) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`${variableName} must be a JSON object.`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${variableName} must be a JSON object.`);
  }

  const entries = Object.entries(parsed);
  const result: Record<string, string> = {};
  for (const [key, id] of entries) {
    if (typeof id !== 'string' || !/^\d{15,22}$/.test(id)) {
      throw new Error(`${variableName} contains an invalid Discord ID for "${key}".`);
    }
    result[key] = id;
  }
  return result;
}

export class DiscordSwitchBridge {
  private readonly token = process.env.DISCORD_BOT_TOKEN?.trim() || '';
  private readonly roomChannels: Record<string, string>;
  private readonly agentIds: Record<string, string>;
  private readonly onMessage: IncomingMessageHandler;
  private readonly onStatusChange: (status: DiscordSwitchStatus) => void;
  private state: BridgeState = 'not_configured';
  private error?: string;
  private socket?: WebSocket;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private sequence: number | null = null;
  private heartbeatAcknowledged = true;
  private stopped = false;
  private botUserId?: string;
  private reconnectDelayMs = 1000;
  private readonly channelSendQueues = new Map<string, Promise<void>>();

  constructor(
    onMessage: IncomingMessageHandler,
    onStatusChange: (status: DiscordSwitchStatus) => void,
  ) {
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;

    try {
      this.roomChannels = parseIdMap(process.env.DISCORD_ROOM_CHANNELS, 'DISCORD_ROOM_CHANNELS');
      this.agentIds = parseIdMap(process.env.DISCORD_SWITCH_AGENT_IDS, 'DISCORD_SWITCH_AGENT_IDS');
      for (const roomId of Object.keys(this.roomChannels)) {
        if (!ROOM_IDS.has(roomId)) {
          throw new Error(`Unknown SocietyOps room in DISCORD_ROOM_CHANNELS: "${roomId}".`);
        }
      }
      if (new Set(Object.values(this.roomChannels)).size !== Object.keys(this.roomChannels).length) {
        throw new Error('Each SocietyOps room must map to a different Discord channel ID.');
      }
    } catch (error) {
      this.roomChannels = {};
      this.agentIds = {};
      this.state = 'error';
      this.error = error instanceof Error ? error.message : 'Invalid Discord configuration.';
    }

    if (this.state !== 'error') {
      const hasRoomChannels = Object.keys(this.roomChannels).length > 0;
      if (this.token && hasRoomChannels) {
        this.state = 'connecting';
      } else if (this.token) {
        this.state = 'incomplete';
        this.error = 'Set DISCORD_ROOM_CHANNELS to map SocietyOps rooms to Discord channel IDs.';
      } else if (hasRoomChannels) {
        this.state = 'incomplete';
        this.error = 'Set DISCORD_BOT_TOKEN to connect the Discord bot.';
      } else {
        this.state = 'not_configured';
      }
    }
  }

  public start(): void {
    if (this.state === 'error' || this.state === 'not_configured' || this.state === 'incomplete') {
      this.publishStatus();
      return;
    }
    this.connect();
  }

  public stop(): void {
    this.stopped = true;
    this.clearTimers();
    this.socket?.close();
    this.state = 'stopped';
    this.publishStatus();
  }

  public getStatus(): DiscordSwitchStatus {
    const connected = this.state === 'connected';
    return {
      provider: 'Discord',
      state: this.state,
      connected,
      configuredRoomIds: Object.keys(this.roomChannels),
      connectedRoomIds: connected ? Object.keys(this.roomChannels) : [],
      ...(this.error ? { error: this.error } : {}),
    };
  }

  public async sendMessage(message: SwitchMessage): Promise<'sent' | 'local'> {
    if (this.state === 'not_configured') return 'local';
    if (this.state === 'incomplete' || this.state === 'error') {
      throw new Error(this.error || 'Discord integration is not fully configured.');
    }

    const channelId = this.roomChannels[message.roomId];
    if (!channelId) {
      throw new Error(`No Discord channel is configured for Switch room "${message.roomId}".`);
    }
    if (this.state !== 'connected') {
      throw new Error('Discord is not connected yet; the message was not delivered.');
    }

    const metadata = message.metadata;
    const mentionHandle = metadata?.mentionAgentHandle;
    const mentionId = typeof mentionHandle === 'string' ? this.agentIds[mentionHandle] : undefined;
    const prefix = mentionId ? `<@${mentionId}> ` : '';
    const content = `${prefix}**${message.sender}**: ${message.content}`;
    const previous = this.channelSendQueues.get(channelId) || Promise.resolve();
    const delivery = previous.then(() => this.postMessage(channelId, content, mentionId));
    this.channelSendQueues.set(
      channelId,
      delivery.catch(() => {
        // A failed send is reported to its caller; keep later messages in the room queue usable.
      }),
    );
    await delivery;

    return 'sent';
  }

  private async postMessage(channelId: string, content: string, mentionId?: string): Promise<void> {
    for (let offset = 0; offset < content.length; offset += 1900) {
      const response = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.slice(offset, offset + 1900),
          allowed_mentions: mentionId ? { parse: [], users: [mentionId] } : { parse: [] },
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Discord rejected the message (${response.status}): ${detail.slice(0, 300)}`);
      }
    }
  }

  private connect(): void {
    if (this.stopped) return;
    this.state = 'connecting';
    this.error = undefined;
    this.publishStatus();

    try {
      const socket = new WebSocket(GATEWAY_URL);
      this.socket = socket;

      socket.addEventListener('message', (event) => {
        try {
          const packet = JSON.parse(String(event.data)) as DiscordGatewayPacket;
          this.handlePacket(packet);
        } catch (error) {
          console.error('Failed to process a Discord Gateway event:', error);
        }
      });

      socket.addEventListener('error', () => {
        this.error = 'Discord Gateway connection failed.';
        this.publishStatus();
      });

      socket.addEventListener('close', (event) => {
        this.clearHeartbeat();
        this.socket = undefined;

        if (this.stopped) return;
        if (event.code === 4004) {
          this.setError('Discord rejected the bot token. Check DISCORD_BOT_TOKEN.');
          return;
        }
        if (event.code === 4014 || event.code === 4013) {
          this.setError('Discord rejected the configured intents. Enable Message Content Intent for the bot.');
          return;
        }

        this.state = 'connecting';
        this.error = `Discord Gateway disconnected (${event.code}); reconnecting.`;
        this.publishStatus();
        const delay = this.reconnectDelayMs;
        this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, 30000);
        this.reconnectTimer = setTimeout(() => this.connect(), delay);
      });
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Could not open the Discord Gateway.');
    }
  }

  private handlePacket(packet: DiscordGatewayPacket): void {
    if (packet.s !== undefined && packet.s !== null) this.sequence = packet.s;

    if (packet.op === 10) {
      const hello = packet.d as { heartbeat_interval?: number };
      if (!hello.heartbeat_interval) {
        this.setError('Discord Gateway sent an invalid heartbeat interval.');
        return;
      }

      this.heartbeatAcknowledged = true;
      this.heartbeatTimer = setInterval(() => {
        if (!this.heartbeatAcknowledged) {
          this.socket?.close();
          return;
        }
        this.heartbeatAcknowledged = false;
        this.sendGatewayPacket(1, this.sequence);
      }, hello.heartbeat_interval);

      this.sendGatewayPacket(2, {
        token: this.token,
        intents: (1 << 0) | (1 << 9) | (1 << 15),
        properties: {
          os: process.platform,
          browser: 'SocietyOps',
          device: 'SocietyOps',
        },
      });
      return;
    }

    if (packet.op === 1) {
      this.sendGatewayPacket(1, this.sequence);
      return;
    }
    if (packet.op === 7) {
      this.socket?.close();
      return;
    }
    if (packet.op === 9) {
      this.socket?.close();
      return;
    }
    if (packet.op === 11) {
      this.heartbeatAcknowledged = true;
      return;
    }

    if (packet.op !== 0) return;
    if (packet.t === 'READY') {
      const ready = packet.d as { user?: { id?: string } };
      this.botUserId = ready.user?.id;
      this.state = 'connected';
      this.error = undefined;
      this.reconnectDelayMs = 1000;
      this.publishStatus();
      return;
    }
    if (packet.t === 'MESSAGE_CREATE') this.receiveMessage(packet.d as DiscordMessageCreate);
  }

  private receiveMessage(message: DiscordMessageCreate): void {
    const roomId = Object.entries(this.roomChannels)
      .find(([, channelId]) => channelId === message.channel_id)?.[0];
    const author = message.author;
    const content = message.content?.trim();
    if (!roomId || !author?.id || !content || author.id === this.botUserId || !message.id) return;

    this.onMessage({
      roomId,
      sender: author.global_name || author.username || 'Discord user',
      senderType: author.bot || message.webhook_id ? 'agent' : 'human',
      content,
      externalMessageId: message.id,
    });
  }

  private sendGatewayPacket(op: number, data: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ op, d: data }));
    }
  }

  private setError(error: string): void {
    this.state = 'error';
    this.error = error;
    this.publishStatus();
  }

  private publishStatus(): void {
    this.onStatusChange(this.getStatus());
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = undefined;
  }

  private clearTimers(): void {
    this.clearHeartbeat();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
  }
}
