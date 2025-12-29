import React from 'react';
import ReactDOM from 'react-dom/client';
import { LogLevel, setLogLevel } from 'livekit-client';
import { LiveKitRoom, RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import { PopupView } from '@/components/embed-popup/popup-view';
import { AgentProvider, useAgentCapabilities } from '@/contexts/agent-context';
import type { AgentInfo, FlowType } from '@/hooks/use-connection-details';
import '@/styles/globals.css';

// Disable LiveKit logs
setLogLevel(LogLevel.silent);

// Expose React globally for LiveKit components
if (typeof window !== 'undefined') {
  (window as unknown as { React: typeof React }).React = React;
  (window as unknown as { ReactDOM: typeof ReactDOM }).ReactDOM = ReactDOM;
}

interface ConnectionDetails {
  serverUrl: string;
  participantToken: string;
  participantName: string;
  agentName: string;
  agent?: AgentInfo;
}

function normalizeFlowType(value: unknown): FlowType {
  const vRaw = typeof value === 'string' ? value.toLowerCase().trim() : '';
  const v = vRaw
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/>/g, '')
    .replace(/\//g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (v === 'voice') return 'voice';
  if (v === 'text' || v === 'textonly' || v === 'text_only') return 'text';
  if (v === 'audio_to_text' || v === 'audiototext' || v === 'audio_text') return 'audio_to_text';
  if (v === 'text_to_audio' || v === 'texttoaudio' || v === 'text_audio') return 'text_to_audio';

  return 'voice';
}

type WidgetRoomProps = {
  serverUrl: string;
  participantToken: string;
  agent?: AgentInfo;
  onDisconnected: () => void;
};

function WidgetRoom({ serverUrl, participantToken, agent, onDisconnected }: WidgetRoomProps) {
  return (
    <AgentProvider agent={agent}>
      <WidgetRoomInner
        serverUrl={serverUrl}
        participantToken={participantToken}
        onDisconnected={onDisconnected}
      />
    </AgentProvider>
  );
}

type WidgetRoomInnerProps = {
  serverUrl: string;
  participantToken: string;
  onDisconnected: () => void;
};

function WidgetRoomInner({ serverUrl, participantToken, onDisconnected }: WidgetRoomInnerProps) {
  const { canUseMicrophone, hasAudioOutput } = useAgentCapabilities();

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={participantToken}
      connect={true}
      audio={canUseMicrophone}
      video={false}
      onDisconnected={onDisconnected}
    >
      {hasAudioOutput && (
        <>
          <RoomAudioRenderer />
          <StartAudio label="Start Audio" />
        </>
      )}
      <PopupView
        disabled={false}
        sessionStarted={true}
        onDisplayError={(err) => console.error('Session error:', err)}
      />
    </LiveKitRoom>
  );
}

type DisplayMode = 'popup' | 'fullWindow';

class AdexGenieWidget {
  private container: HTMLElement;
  private isOpen: boolean = false;
  private connectionDetails: ConnectionDetails | null = null;
  private apiUrl: string;
  private agentId: string;
  private apiKey: string;
  private flowTypeOverride: FlowType | undefined;
  private agentTypeOverride: AgentInfo['type'] | undefined;
  private agentNameOverride: string | undefined;
  private displayMode: DisplayMode;
  private chatPadding: string;
  private reactRoot: ReturnType<typeof ReactDOM.createRoot> | null = null;
  private fab: HTMLButtonElement | null = null;

  constructor(config: {
    apiUrl: string;
    agentId: string;
    apiKey: string;
    flowType?: FlowType;
    agentType?: AgentInfo['type'];
    agentName?: string;
    displayMode?: DisplayMode;
    chatPadding?: string;
  }) {
    this.apiUrl = config.apiUrl;
    this.agentId = config.agentId;
    this.apiKey = config.apiKey;
    this.flowTypeOverride = config.flowType;
    this.agentTypeOverride = config.agentType;
    this.agentNameOverride = config.agentName;
    this.displayMode = config.displayMode || 'popup';
    this.chatPadding = config.chatPadding || '0';

    // Create container directly in body
    this.container = document.createElement('div');
    this.container.id = 'adexgenie-widget-root';
    document.body.appendChild(this.container);

    // For fullWindow mode, auto-open immediately
    if (this.displayMode === 'fullWindow') {
      this.initFullWindow();
    } else {
      this.init();
    }
  }

  private init() {
    // Add styles to document head
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    document.head.appendChild(style);

    // Create FAB button
    this.fab = document.createElement('button');
    this.fab.className = 'ag-fab';
    this.fab.innerHTML = `
      <img src="/logo.webp" alt="AdexGenie" style="width: 36px; height: 36px; object-fit: contain;" />
    `;
    this.fab.onclick = () => this.toggle();

    this.container.appendChild(this.fab);
  }

  private async initFullWindow() {
    // Add fullWindow styles to document head
    const style = document.createElement('style');
    style.textContent = this.getFullWindowStyles();
    document.head.appendChild(style);

    // Create fullWindow container
    const fullWindowContainer = document.createElement('div');
    fullWindowContainer.className = 'ag-fullwindow-container';
    this.container.appendChild(fullWindowContainer);

    // Show loading state
    fullWindowContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 16px;">
        <div style="width: 40px; height: 40px; border: 3px solid #e2e2df; border-top-color: #0891b2; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="color: #6b7280; font-size: 14px;">Connexion en cours...</p>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    // Fetch connection details
    try {
      await this.fetchConnectionDetails();
      this.renderFullWindowApp(fullWindowContainer);
    } catch {
      fullWindowContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 16px; padding: 24px;">
          <p style="color: #db1b06; font-size: 16px; font-weight: 600;">Erreur de connexion</p>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">Impossible de se connecter au serveur. Veuillez réessayer.</p>
        </div>
      `;
    }
  }

  private renderFullWindowApp(container: HTMLElement) {
    if (!this.connectionDetails) return;

    container.innerHTML = '';

    const reactMount = document.createElement('div');
    reactMount.style.width = '100%';
    reactMount.style.height = '100%';
    reactMount.style.display = 'flex';
    reactMount.style.flexDirection = 'column';
    container.appendChild(reactMount);

    this.reactRoot = ReactDOM.createRoot(reactMount);

    if (this.connectionDetails.serverUrl && this.connectionDetails.participantToken) {
      this.reactRoot.render(
        <WidgetRoom
          serverUrl={this.connectionDetails.serverUrl}
          participantToken={this.connectionDetails.participantToken}
          agent={this.connectionDetails.agent}
          onDisconnected={() => {
            // In fullWindow mode, just show a message or reload
            container.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 16px;">
                <p style="color: #6b7280; font-size: 16px;">Session terminée</p>
                <button onclick="location.reload()" style="padding: 12px 24px; background: #0891b2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Recommencer</button>
              </div>
            `;
          }}
        />
      );
    }
  }

  private getFullWindowStyles() {
    return `
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
      }

      #adexgenie-widget-root {
        width: 100%;
        height: 100%;
      }

      .ag-fullwindow-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        background: #f9f9f6;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 999999;
        padding: ${this.chatPadding};
        box-sizing: border-box;
      }

      .ag-fullwindow-container > div {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .ag-fullwindow-container [data-lk-theme],
      .ag-fullwindow-container .lk-room-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
    `;
  }

  private getStyles() {
    return `
      .ag-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #67e8f9 0%, #cbd5e1 100%);
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 
          0 4px 12px rgba(103, 232, 249, 0.4),
          inset 0 -2px 8px rgba(0, 0, 0, 0.15),
          inset 0 2px 8px rgba(255, 255, 255, 0.5);
        transition: all 0.2s ease;
        z-index: 999998;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .ag-fab::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 50%);
        pointer-events: none;
      }
      
      .ag-fab:hover {
        background: linear-gradient(135deg, #22d3ee 0%, #94a3b8 100%);
        transform: translateY(-2px);
        box-shadow: 
          0 6px 16px rgba(34, 211, 238, 0.5),
          inset 0 -2px 10px rgba(0, 0, 0, 0.2),
          inset 0 2px 10px rgba(255, 255, 255, 0.55);
      }

      .ag-fab.close {
        background: #db1b06;
      }

      .ag-fab.close:hover {
        background: #c01606;
      }

      .ag-widget-container {
        position: fixed;
        bottom: 96px;
        right: 24px;
        width: 400px;
        height: 600px;
        max-height: calc(100vh - 140px);
        background: #f9f9f6;
        border-radius: 28px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 999999;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        padding: ${this.chatPadding};
        box-sizing: border-box;
      }

      .ag-widget-container.active {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: all;
      }

      @media (max-width: 768px) {
        .ag-widget-container {
          bottom: 80px;
          right: 16px;
          left: 16px;
          width: auto;
          max-width: calc(100vw - 32px);
        }
      }

      /* LiveKit Room styles - force full height flex layout */
      .ag-widget-container > div {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .ag-widget-container [data-lk-theme],
      .ag-widget-container .lk-room-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
    `;
  }

  private async fetchConnectionDetails() {
    try {
      // Call external API directly or through proxy
      const apiUrl = this.apiUrl || 'https://monvoice.adexgenie.ai/api/agent/generate-token';

      // Use X-API-Key for Next.js proxy, X-Agent-API-Key for direct API calls
      const isProxy = apiUrl.includes('/api/proxy-token');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [isProxy ? 'X-API-Key' : 'X-Agent-API-Key']: this.apiKey,
        },
        body: JSON.stringify({
          agent_id: this.agentId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      const rawFlowType =
        this.flowTypeOverride ??
        data.agent?.flow_type ??
        data.agent?.flowType ??
        data.metadata?.flowType;
      const rawAgentType = this.agentTypeOverride ?? data.agent?.type ?? data.metadata?.agentType;
      const flowFromFlowType = normalizeFlowType(rawFlowType);
      const flowFromAgentType = normalizeFlowType(rawAgentType);
      const flowType =
        flowFromAgentType === 'text'
          ? 'text'
          : flowFromFlowType !== 'voice'
            ? flowFromFlowType
            : flowFromAgentType;
      const agentType = (rawAgentType ?? 'voice') as AgentInfo['type'];
      const agentName =
        this.agentNameOverride ??
        data.agent?.name ??
        data.metadata?.agentName ??
        data.agent_name ??
        'Agent';
      const agent: AgentInfo | undefined =
        rawFlowType || rawAgentType || data.agent || data.metadata?.agentType
          ? {
              id: data.agent?.id ?? data.metadata?.agentId ?? this.agentId,
              name: agentName,
              type: agentType,
              flowType,
            }
          : undefined;

      if (
        typeof window !== 'undefined' &&
        (window as unknown as { AdexGenieWidgetDebug?: boolean }).AdexGenieWidgetDebug
      ) {
        console.log('[AdexGenieWidget] agent flow detection', {
          rawFlowType,
          rawAgentType,
          resolvedFlowType: flowType,
          agentType: agent?.type,
        });
      }

      this.connectionDetails = {
        serverUrl: data.url || data.server_url || data.serverUrl,
        participantToken: data.token || data.participant_token || data.participantToken,
        participantName: data.participant_name || 'User',
        agentName: agent?.name ?? data.agent_name ?? 'Agent',
        agent,
      };
    } catch (error) {
      console.error('Error fetching connection details:', error);
      throw error;
    }
  }

  private async open() {
    if (this.isOpen) return;
    this.isOpen = true;

    // Update FAB
    const fab = this.fab;
    if (fab) {
      fab.classList.add('close');
      fab.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    }

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'ag-widget-container';
    this.container.appendChild(widgetContainer);

    // Show loading state
    widgetContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 16px;">
        <div style="width: 40px; height: 40px; border: 3px solid #e2e2df; border-top-color: #0891b2; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="color: #6b7280; font-size: 14px;">Connexion en cours...</p>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    setTimeout(() => {
      widgetContainer.classList.add('active');
    }, 10);

    // Fetch connection details if not already fetched
    if (!this.connectionDetails) {
      try {
        await this.fetchConnectionDetails();
      } catch {
        widgetContainer.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 16px; padding: 24px;">
            <p style="color: #db1b06; font-size: 16px; font-weight: 600;">Erreur de connexion</p>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">Impossible de se connecter au serveur. Veuillez réessayer.</p>
          </div>
        `;
        return;
      }
    }

    // Render React app
    this.renderReactApp(widgetContainer);
  }

  private renderReactApp(container: HTMLElement) {
    if (!this.connectionDetails) return;

    // Clear loading state
    container.innerHTML = '';

    // Create a div for React to mount into
    const reactMount = document.createElement('div');
    reactMount.style.width = '100%';
    reactMount.style.height = '100%';
    reactMount.style.display = 'flex';
    reactMount.style.flexDirection = 'column';
    container.appendChild(reactMount);

    // Mount React app
    this.reactRoot = ReactDOM.createRoot(reactMount);

    // Only render if we have valid connection details
    if (this.connectionDetails.serverUrl && this.connectionDetails.participantToken) {
      this.reactRoot.render(
        <WidgetRoom
          serverUrl={this.connectionDetails.serverUrl}
          participantToken={this.connectionDetails.participantToken}
          agent={this.connectionDetails.agent}
          onDisconnected={() => this.close()}
        />
      );
    } else {
      console.error('Invalid connection details:', this.connectionDetails);
    }
  }

  private close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    // Unmount React
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }

    // Remove widget container
    const widgetContainer = this.container.querySelector('.ag-widget-container');
    if (widgetContainer) {
      widgetContainer.classList.remove('active');
      setTimeout(() => widgetContainer.remove(), 300);
    }

    // Reset FAB
    if (this.fab) {
      this.fab.classList.remove('close');
      this.fab.innerHTML = `
        <img src="/logo.webp" alt="AdexGenie" style="width: 36px; height: 36px; object-fit: contain;" />
      `;
    }
  }

  private toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

// Export for UMD
export default AdexGenieWidget;

// Auto-initialize if config is present
if (typeof window !== 'undefined') {
  (window as unknown as { AdexGenieWidget: typeof AdexGenieWidget }).AdexGenieWidget =
    AdexGenieWidget;
}
