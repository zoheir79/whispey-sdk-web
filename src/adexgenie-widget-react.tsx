import React from 'react';
import ReactDOM from 'react-dom/client';
import { LogLevel, setLogLevel } from 'livekit-client';
import { LiveKitRoom, RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import { PopupView } from '@/components/embed-popup/popup-view';
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
}

class AdexGenieWidget {
  private container: HTMLElement;
  private isOpen: boolean = false;
  private connectionDetails: ConnectionDetails | null = null;
  private apiUrl: string;
  private agentId: string;
  private apiKey: string;
  private reactRoot: ReturnType<typeof ReactDOM.createRoot> | null = null;
  private fab: HTMLButtonElement | null = null;

  constructor(config: { apiUrl: string; agentId: string; apiKey: string }) {
    this.apiUrl = config.apiUrl;
    this.agentId = config.agentId;
    this.apiKey = config.apiKey;

    // Create container directly in body
    this.container = document.createElement('div');
    this.container.id = 'adexgenie-widget-root';
    document.body.appendChild(this.container);

    this.init();
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

      this.connectionDetails = {
        serverUrl: data.url || data.server_url || data.serverUrl,
        participantToken: data.token || data.participant_token || data.participantToken,
        participantName: data.participant_name || 'User',
        agentName: data.agent_name || 'Agent',
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
      } catch (_error) {
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
        <LiveKitRoom
          serverUrl={this.connectionDetails.serverUrl}
          token={this.connectionDetails.participantToken}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={() => this.close()}
        >
          <RoomAudioRenderer />
          <StartAudio label="Start Audio" />
          <PopupView
            disabled={false}
            sessionStarted={true}
            onDisplayError={(err) => console.error('Session error:', err)}
          />
        </LiveKitRoom>
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
