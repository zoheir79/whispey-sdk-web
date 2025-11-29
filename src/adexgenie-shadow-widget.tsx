import React from 'react';
import ReactDOM from 'react-dom/client';
import { LogLevel, setLogLevel } from 'livekit-client';
import { LiveKitRoom, RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import globalCss from '@/styles/globals.css';
import { PopupView } from '../components/embed-popup/popup-view';

// Disable LiveKit logs
setLogLevel(LogLevel.silent);

// Expose React globally for LiveKit components
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
}

interface WidgetConfig {
  agentId: string;
  apiUrl?: string;
  apiKey: string;
}

interface ConnectionDetails {
  serverUrl: string;
  participantToken: string;
}

class AdexGenieShadowWidget {
  private agentId: string;
  private apiUrl: string;
  private apiKey: string;
  private shadowHost: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private reactRoot: any = null;
  private connectionDetails: ConnectionDetails | null = null;
  private isOpen: boolean = false;
  private fab: HTMLButtonElement | null = null;
  private popup: HTMLDivElement | null = null;

  constructor(config: WidgetConfig) {
    this.agentId = config.agentId;
    this.apiUrl = config.apiUrl || 'https://monvoice.adexgenie.ai/api/agent/generate-token';
    this.apiKey = config.apiKey;
    this.init();
  }

  private init() {
    // Create shadow host
    this.shadowHost = document.createElement('div');
    this.shadowHost.id = 'adexgenie-shadow-widget';
    document.body.appendChild(this.shadowHost);

    // Create shadow root
    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });

    // Create container
    const container = document.createElement('div');
    container.className = 'widget-container';
    this.shadowRoot.appendChild(container);

    // Inject styles
    this.injectStyles();

    // Create FAB
    this.createFAB(container);
  }

  private injectStyles() {
    if (!this.shadowRoot) return;
    // 1) Inject all app + LiveKit styles (Tailwind, variables, etc.)
    //    This is the same technique used by components/embed-popup/standalone-bundle-root.tsx
    const appStyle = document.createElement('style');
    appStyle.textContent = globalCss;
    this.shadowRoot.appendChild(appStyle);

    // 2) Add a small layer of widget-specific styles (position, FAB, popup shell)
    const widgetStyle = document.createElement('style');
    widgetStyle.textContent = `
      .widget-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
      }

      .fab {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
        color: white;
      }

      .fab:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .fab.close {
        background: #ef4444;
      }

      .fab svg {
        width: 24px;
        height: 24px;
      }

      .widget-popup {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 400px;
        height: 600px;
        background: var(--bg2, #f9fafb);
        border: 1px solid var(--separator1, #e5e7eb);
        border-radius: 28px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        pointer-events: none;
        transition: opacity 0.3s, transform 0.3s;
        overflow: hidden;
      }

      .widget-popup.active {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: all;
      }

      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        flex-direction: column;
        gap: 16px;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #f3f4f6;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .react-mount {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Force visibility of LiveKit components */
      .react-mount > * {
        width: 100%;
        height: 100%;
      }
    `;
    this.shadowRoot.appendChild(widgetStyle);
  }

  private createFAB(container: HTMLElement) {
    this.fab = document.createElement('button');
    this.fab.className = 'fab';
    this.fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;
    this.fab.onclick = () => this.toggle();
    container.appendChild(this.fab);
  }

  private async toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      await this.open();
    }
  }

  private async fetchConnectionDetails(): Promise<ConnectionDetails> {
    const isProxy = this.apiUrl.includes('/api/proxy-token');

    const response = await fetch(this.apiUrl, {
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
    return {
      serverUrl: data.url || data.server_url || data.serverUrl,
      participantToken: data.token || data.participant_token || data.participantToken,
    };
  }

  private async open() {
    if (this.isOpen || !this.shadowRoot || !this.fab) return;
    this.isOpen = true;

    // Update FAB
    this.fab.classList.add('close');
    this.fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    // Create popup
    this.popup = document.createElement('div');
    this.popup.className = 'widget-popup';
    this.shadowRoot.querySelector('.widget-container')?.appendChild(this.popup);

    // Show loading
    this.popup.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p style="color: #6b7280;">Connecting...</p>
      </div>
    `;

    setTimeout(() => {
      this.popup?.classList.add('active');
    }, 10);

    try {
      // Fetch connection details
      this.connectionDetails = await this.fetchConnectionDetails();

      // Render React app with LiveKit
      this.renderLiveKitApp();
    } catch (error) {
      console.error('Failed to connect:', error);
      if (this.popup) {
        this.popup.innerHTML = `
          <div class="loading">
            <p style="color: #ef4444; font-weight: 600;">Connection Failed</p>
            <p style="color: #6b7280; font-size: 14px;">${(error as Error).message}</p>
          </div>
        `;
      }
    }
  }

  private renderLiveKitApp() {
    if (!this.popup || !this.connectionDetails) return;

    // Clear popup
    this.popup.innerHTML = '';

    // Create React mount point
    const reactMount = document.createElement('div');
    reactMount.className = 'react-mount';
    this.popup.appendChild(reactMount);

    // Create React root and render LiveKit
    this.reactRoot = ReactDOM.createRoot(reactMount);

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
  }

  private close() {
    if (!this.isOpen || !this.fab || !this.popup) return;
    this.isOpen = false;

    // Update FAB
    this.fab.classList.remove('close');
    this.fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;

    // Unmount React
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }

    // Remove popup
    this.popup.classList.remove('active');
    setTimeout(() => {
      this.popup?.remove();
      this.popup = null;
    }, 300);

    this.connectionDetails = null;
  }
}

// Expose globally
(window as any).AdexGenieShadowWidget = AdexGenieShadowWidget;

export default AdexGenieShadowWidget;
