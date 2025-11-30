/**
 * AdexGenie Agent Widget - Standalone Integration
 * Version: 1.0.0
 *
 * Usage:
 * <script src="adexgenie-widget.js"></script>
 * <script>
 *   AdexGenieWidget.init({
 *     agentName: 'My Agent',
 *     agentId: 'your-uuid-here'
 *   });
 * </script>
 */
import { Room } from 'livekit-client';

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.AdexGenieWidget) {
    console.warn('AdexGenieWidget already initialized');
    return;
  }

  // Intercepter et masquer TOUS les logs LiveKit
  const originalConsoleLog = console.log;
  const originalConsoleDebug = console.debug;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  const shouldSuppressLog = (args) => {
    const message = args.join(' ').toLowerCase();
    return (
      message.includes('livekit') ||
      message.includes('lk-') ||
      message.includes('webrtc') ||
      message.includes('signalclient') ||
      message.includes('roomengine')
    );
  };

  console.log = function (...args) {
    if (shouldSuppressLog(args)) {
      return; // Supprimer complètement
    }
    originalConsoleLog.apply(console, args);
  };

  console.debug = function (...args) {
    if (shouldSuppressLog(args)) {
      return; // Supprimer complètement
    }
    originalConsoleDebug.apply(console, args);
  };

  console.info = function (...args) {
    if (shouldSuppressLog(args)) {
      return; // Supprimer complètement
    }
    originalConsoleInfo.apply(console, args);
  };

  console.warn = function (...args) {
    if (shouldSuppressLog(args)) {
      return; // Supprimer complètement
    }
    originalConsoleWarn.apply(console, args);
  };

  console.error = function (...args) {
    if (shouldSuppressLog(args)) {
      return; // Supprimer complètement
    }
    originalConsoleError.apply(console, args);
  };

  class AdexGenie {
    constructor() {
      this['AG-config'] = {
        agentId: null,
        apiUrl: null, // URL de l'API pour récupérer le JWT
        apiKey: null, // Clé API publique
        // Couleurs du thème AdexGenie (basées sur le logo)
        primaryColor: '#00A7E1', // Bleu cyan principal
        secondaryColor: '#0066A1', // Bleu foncé
        accentColor: '#00D4FF', // Cyan clair
        successColor: '#10b981', // Vert
        dangerColor: '#dc2626', // Rouge
        backgroundColor: '#f8f9fa', // Fond clair
        surfaceColor: '#ffffff', // Surface blanche
        textColor: '#1f2937', // Texte sombre
        textLightColor: '#6b7280', // Texte gris
        borderColor: '#e5e7eb', // Bordures
      };
      this['AG-shadowRoot'] = null;
      this['AG-container'] = null;
      this['AG-mode'] = null;
      this['AG-isOpen'] = false;
      this['AG-room'] = null;
      this['AG-connectionDetails'] = null;
    }

    init(config = {}) {
      // Validate required config
      if (!config.agentId) {
        console.error('AdexGenie Widget: agentId is required');
        return;
      }

      if (!config.apiUrl) {
        console.error('AdexGenie Widget: apiUrl is required');
        return;
      }

      if (!config.apiKey) {
        console.error('AdexGenie Widget: apiKey is required');
        return;
      }

      // Merge config
      this['AG-config'] = {
        ...this['AG-config'],
        ...config,
      };

      console.log('AdexGenie Widget initialized successfully');
      this.createWidget();
    }

    createWidget() {
      this['AG-container'] = document.createElement('div');
      this['AG-container'].id = 'adexgenie-widget-root';
      // Remove default styles here, rely on CSS class

      this['AG-shadowRoot'] = this['AG-container'].attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.textContent = this.getStyles();
      this['AG-shadowRoot'].appendChild(style);

      const fab = document.createElement('button');
      fab.className = 'ag-fab';
      fab.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      fab.onclick = () => this.toggle();

      this['AG-shadowRoot'].appendChild(fab);
      document.body.appendChild(this['AG-container']);
    }

    toggle() {
      if (this['AG-isOpen']) {
        this.close();
      } else {
        this.open('popup');
      }
    }

    open(mode) {
      if (this['AG-isOpen']) return;

      this['AG-isOpen'] = true;
      this['AG-mode'] = mode;

      // Create widget container
      const container = document.createElement('div');
      container.className = 'ag-widget-container active';

      const content = document.createElement('div');
      content.className = 'ag-content';
      container.appendChild(content);

      this['AG-shadowRoot'].appendChild(container);

      // Update FAB icon
      const fab = this['AG-shadowRoot'].querySelector('.ag-fab');
      fab.classList.add('close');
      fab.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;

      // Store content element for later use
      this['AG-contentElement'] = content;
      this.startSession(content);
    }

    close() {
      console.log('Closing widget...');

      // Disconnect room first
      if (this['AG-room']) {
        this.disconnectRoom();
      }

      this['AG-isOpen'] = false;
      this['AG-mode'] = null;
      this['AG-contentElement'] = null;

      const container = this['AG-shadowRoot'].querySelector('.ag-widget-container');
      if (container) {
        container.classList.remove('active');
        setTimeout(() => container.remove(), 300);
      }

      // Reset FAB
      const fab = this['AG-shadowRoot'].querySelector('.ag-fab');
      if (fab) {
        fab.classList.remove('close');
        fab.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      }
    }

    getStyles() {
      return `
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        
        /* LiveKit Color Variables */
        :host {
          --lk-fg0: #000000;
          --lk-fg1: #3b3b3b;
          --lk-bg1: #f9f9f6;
          --lk-bg2: #f3f3f1;
          --lk-bg3: #e2e2df;
          --lk-separator1: #dbdbd8;
          --lk-primary: #002cf2;
          --lk-primary-hover: #0020b9;
          --lk-destructive: #db1b06;
          --lk-destructive-bg: #fae6e6;
          --lk-radius: 0.625rem;
        }
        
        /* FAB Button */
        .ag-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: var(--lk-radius);
          background: var(--lk-primary);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 44, 242, 0.3);
          transition: all 0.2s ease;
          z-index: 999998;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ag-fab:hover {
          background: var(--lk-primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 44, 242, 0.4);
        }

        /* Widget Container */
        .ag-widget-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 400px;
          height: 600px;
          background: var(--lk-bg1);
          border-radius: calc(var(--lk-radius) * 2);
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

        /* Control Bar (LiveKit Style) */
        .ag-control-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: var(--lk-bg2);
          border-top: 1px solid var(--lk-separator1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          gap: 8px;
          z-index: 10;
        }

        /* Microphone Toggle (LiveKit Style) */
        .ag-mic-toggle {
          display: flex;
          align-items: center;
          gap: 0;
          background: var(--lk-bg3);
          border-radius: var(--lk-radius);
          height: 48px;
          border: 1px solid var(--lk-separator1);
          overflow: hidden;
        }

        .ag-mic-btn {
          height: 48px;
          padding: 0 16px;
          border: none;
          background: transparent;
          color: var(--lk-fg1);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          border-right: 1px solid var(--lk-separator1);
        }
        
        .ag-mic-btn:hover {
          background: var(--lk-bg2);
        }

        .ag-mic-btn.muted {
          background: var(--lk-destructive-bg);
          color: var(--lk-destructive);
          border-right-color: #ffcdc7;
        }

        /* Audio Visualizer (LiveKit Style) */
        .ag-visualizer {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 20px;
        }

        .ag-bar {
          width: 2px;
          background: var(--lk-fg1);
          border-radius: 2px;
          transition: all 0.1s ease;
        }

        .ag-mic-btn.muted .ag-bar {
          background: var(--lk-destructive);
        }

        .ag-bar:nth-child(1) { height: 8px; animation: ag-wave 1.2s ease-in-out infinite 0s; }
        .ag-bar:nth-child(2) { height: 14px; animation: ag-wave 1.2s ease-in-out infinite 0.15s; }
        .ag-bar:nth-child(3) { height: 10px; animation: ag-wave 1.2s ease-in-out infinite 0.3s; }

        @keyframes ag-wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.7; }
          50% { transform: scaleY(1); opacity: 1; }
        }

        /* Device Select */
        .ag-device-select {
          height: 48px;
          padding: 0 12px;
          border: none;
          background: transparent;
          color: var(--lk-fg1);
          cursor: pointer;
          font-size: 14px;
          outline: none;
        }

        .ag-device-select:hover {
          background: var(--lk-bg2);
        }

        /* Agent Status (Center) */
        .ag-agent-status {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--lk-fg1);
        }

        .ag-agent-visualizer {
          display: flex;
          gap: 2px;
        }

        .ag-agent-bar {
          width: 2px;
          height: 12px;
          background: var(--lk-fg1);
          border-radius: 2px;
          animation: ag-agent-wave 1s ease-in-out infinite;
        }

        .ag-agent-bar:nth-child(1) { animation-delay: 0s; }
        .ag-agent-bar:nth-child(2) { animation-delay: 0.15s; }
        .ag-agent-bar:nth-child(3) { animation-delay: 0.3s; }

        @keyframes ag-agent-wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }

        /* End Call Button (LiveKit Style) */
        .ag-end-btn {
          height: 48px;
          padding: 0 20px;
          border-radius: var(--lk-radius);
          background: var(--lk-destructive);
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        
        .ag-end-btn:hover {
          background: #c01606;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(219, 27, 6, 0.3);
        }

        /* Session Body */
        .ag-session-body {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 72px;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ag-session-body::-webkit-scrollbar {
          width: 8px;
        }

        .ag-session-body::-webkit-scrollbar-track {
          background: var(--lk-bg2);
        }

        .ag-session-body::-webkit-scrollbar-thumb {
          background: var(--lk-separator1);
          border-radius: 4px;
        }

        /* Messages (LiveKit Style) */
        .ag-message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
          animation: ag-slide-up 0.3s ease-out;
        }

        @keyframes ag-slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ag-message.agent {
          align-self: flex-start;
        }

        .ag-message.user {
          align-self: flex-end;
        }

        .ag-message-bubble {
          padding: 12px 16px;
          border-radius: var(--lk-radius);
          font-size: 15px;
          line-height: 1.5;
        }

        .ag-message.agent .ag-message-bubble {
          background: var(--lk-bg3);
          color: var(--lk-fg0);
        }

        .ag-message.user .ag-message-bubble {
          background: var(--lk-primary);
          color: white;
        }

        .ag-message-time {
          font-size: 11px;
          color: var(--lk-fg1);
          margin-top: 4px;
          padding: 0 4px;
        }

        /* Loading State */
        .ag-loading-view {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--lk-bg1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          z-index: 20;
        }
        
        .ag-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--lk-bg3);
          border-top-color: var(--lk-primary);
          border-radius: 50%;
          animation: ag-spin 0.8s linear infinite;
        }
        
        @keyframes ag-spin {
          to { transform: rotate(360deg); }
        }

        .ag-loading-text {
          color: var(--lk-fg1);
          font-size: 14px;
        }

        /* Error State */
        .ag-error {
          padding: 24px;
          text-align: center;
        }

        .ag-error h3 {
          color: var(--lk-destructive);
          font-size: 18px;
          margin-bottom: 8px;
        }

        .ag-error p {
          color: var(--lk-fg1);
          font-size: 14px;
        }
      `;
    }

    async fetchConnectionDetails() {
      try {
        console.log('Fetching JWT token from:', this['AG-config'].apiUrl);

        // Appeler l'API pour récupérer le JWT token
        const response = await fetch(this['AG-config'].apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this['AG-config'].apiKey, // API Key dans le header
          },
          body: JSON.stringify({
            agent_id: this['AG-config'].agentId, // Agent ID dans le payload
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        const apiData = await response.json();

        // Formater les détails de connexion
        this['AG-connectionDetails'] = {
          serverUrl: apiData.serverUrl || apiData.server_url, // URL du serveur fournie par l'API
          roomName: apiData.roomName || apiData.room_name,
          participantToken: apiData.token || apiData.jwt,
          participantName: apiData.participantName || 'user',
          agentName: apiData.agentName || apiData.agent_name || 'Agent', // Nom de l'agent fourni par l'API
          metadata: apiData.metadata || {},
        };

        console.log('Connection details received successfully');
      } catch (error) {
        console.error('Error fetching connection details:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unable to connect to the server';
        this.showError('Connection Error', errorMessage);
      }
    }

    startSession(contentElement) {
      if (!this['AG-connectionDetails']) {
        contentElement.innerHTML = `
          <div class="ag-loading-view">
            <div class="ag-dots">
              <div class="ag-dot"></div>
              <div class="ag-dot"></div>
              <div class="ag-dot"></div>
            </div>
          </div>
        `;
        // Store content element and fetch details
        this['AG-contentElement'] = contentElement;
        this.fetchConnectionDetails().then(() => {
          // Retry startSession after fetching connection details
          if (this['AG-connectionDetails'] && this['AG-contentElement']) {
            this.startSession(this['AG-contentElement']);
          }
        });
        return;
      }

      // LiveKit Layout: Chat Body + Control Bar at bottom
      contentElement.innerHTML = `
        <div class="ag-session-body">
          <p style="color: #6b7280; text-align: center; margin-top: 40px;">Connected! Speak to start the conversation.</p>
        </div>

        <div class="ag-control-bar">
          <div class="ag-mic-toggle">
            <button class="ag-mic-btn" data-action="mic" title="Toggle Microphone">
              <div class="ag-visualizer">
                <div class="ag-bar"></div>
                <div class="ag-bar"></div>
                <div class="ag-bar"></div>
              </div>
            </button>
            <select class="ag-device-select">
              <option>Default Microphone</option>
            </select>
          </div>
          
          <div class="ag-agent-status">
            <div class="ag-agent-visualizer">
              <div class="ag-agent-bar"></div>
              <div class="ag-agent-bar"></div>
              <div class="ag-agent-bar"></div>
            </div>
            <span>Agent listening</span>
          </div>
          
          <button class="ag-end-btn" data-action="end" title="End Call">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.32.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            END CALL
          </button>
        </div>
      `;

      const micBtn = contentElement.querySelector('.ag-mic-btn');
      const endBtn = contentElement.querySelector('.ag-end-btn');

      if (micBtn) {
        micBtn.onclick = () => this.handleControl('mic', micBtn);
      }

      if (endBtn) {
        endBtn.onclick = () => this.handleControl('end', endBtn);
      }

      this.connectToRoom(contentElement);
    }

    async connectToRoom(contentElement) {
      try {
        this['AG-room'] = new Room();

        this['AG-room'].on('disconnected', () => {
          this.close();
        });

        this['AG-room'].on('participantConnected', (participant) => {
          console.log('Participant connected:', participant.identity);
          this.updateSessionBody(contentElement, 'Agent connected');
        });

        this['AG-room'].on('trackSubscribed', (track, publication, participant) => {
          console.log('Track subscribed:', track.kind, 'from', participant.identity);
          if (track.kind === 'audio') {
            track.attach();
          }
        });

        // Écouter les transcriptions natives LiveKit
        this['AG-room'].on('transcriptionReceived', (segments, participant) => {
          console.log('Transcription received:', segments);
          segments.forEach((segment) => {
            if (segment.final && segment.text) {
              const isAgent =
                participant?.identity?.includes('agent') ||
                participant?.identity === this['AG-connectionDetails'].agentName;
              this.addMessage(segment.text, isAgent ? 'agent' : 'user');
            }
          });
        });

        // Écouter les data messages (pour les agents qui envoient via data channel)
        this['AG-room'].on('dataReceived', (payload, participant) => {
          try {
            const decoder = new TextDecoder();
            const text = decoder.decode(payload);
            const data = JSON.parse(text);
            console.log('Data received:', data);

            // Vérifier si c'est une transcription
            if (data.text || data.message) {
              const isAgent =
                participant?.identity?.includes('agent') ||
                participant?.identity === this['AG-connectionDetails'].agentName;
              this.addMessage(data.text || data.message, isAgent ? 'agent' : 'user');
            }
          } catch {
            console.log('Non-JSON data received');
          }
        });

        // Écouter les messages chat
        this['AG-room'].on('chatMessage', (message, participant) => {
          console.log('Chat message:', message);
          const isAgent =
            participant?.identity?.includes('agent') ||
            participant?.identity === this['AG-connectionDetails'].agentName;
          this.addMessage(message.message, isAgent ? 'agent' : 'user');
        });

        console.log('Connecting to room:', this['AG-connectionDetails'].serverUrl);
        await this['AG-room'].connect(
          this['AG-connectionDetails'].serverUrl,
          this['AG-connectionDetails'].participantToken
        );
        console.log('Connected to room successfully');

        console.log('Enabling microphone...');
        await this['AG-room'].localParticipant.setMicrophoneEnabled(true);
        console.log('Microphone enabled');

        this.updateSessionBody(contentElement, 'Connected! Speak to start the conversation.');
      } catch (error) {
        console.error('Error connecting to room:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        this.showError('Connection Failed', errorMessage);
      }
    }

    updateSessionBody(contentElement, message) {
      const sessionBody = contentElement.querySelector('.ag-session-body');
      if (sessionBody) {
        sessionBody.innerHTML = `<p style="color: #6b7280; text-align: center;">${message}</p>`;
      }
    }

    // Convertir le markdown basique en HTML
    formatMarkdown(text) {
      if (!text) return '';

      let html = text
        // Escape HTML pour éviter XSS
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Gras **text** ou __text__
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        // Italique *text* ou _text_
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        // Listes à puces (- item)
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Retours à la ligne
        .replace(/\n/g, '<br>');

      // Envelopper les <li> dans <ul>
      if (html.includes('<li>')) {
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        // Nettoyer les <br> autour des <ul>
        html = html.replace(/<br><ul>/g, '<ul>');
        html = html.replace(/<\/ul><br>/g, '</ul>');
      }

      return html;
    }

    addMessage(text, sender = 'agent') {
      const sessionBody = this['AG-shadowRoot'].querySelector('.ag-session-body');
      if (!sessionBody) return;

      // Supprimer le message de bienvenue si présent
      const welcomeMsg = sessionBody.querySelector('p');
      if (welcomeMsg) {
        welcomeMsg.remove();
      }

      // Créer le message
      const messageDiv = document.createElement('div');
      messageDiv.className = `ag-message ${sender}`;

      const now = new Date();
      const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      // Formater le texte markdown en HTML
      const formattedText = this.formatMarkdown(text);

      messageDiv.innerHTML = `
        <div class="ag-message-bubble">${formattedText}</div>
        <div class="ag-message-time">${timeStr}</div>
      `;

      sessionBody.appendChild(messageDiv);

      // Scroll vers le bas
      sessionBody.scrollTop = sessionBody.scrollHeight;
    }

    handleControl(action, btn) {
      if (action === 'mic') {
        const isEnabled = this['AG-room']?.localParticipant?.isMicrophoneEnabled;
        if (this['AG-room']?.localParticipant) {
          this['AG-room'].localParticipant.setMicrophoneEnabled(!isEnabled);
          if (!isEnabled) {
            btn.classList.remove('muted');
          } else {
            btn.classList.add('muted');
          }
        }
      } else if (action === 'end') {
        this.close();
      }
    }

    disconnectRoom() {
      if (this['AG-room']) {
        console.log('Disconnecting room and stopping all tracks...');

        try {
          // Stop all local tracks if they exist
          if (this['AG-room'].localParticipant) {
            const participant = this['AG-room'].localParticipant;

            // Stop audio tracks
            if (participant.audioTracks) {
              participant.audioTracks.forEach((publication) => {
                if (publication.track) {
                  publication.track.stop();
                }
              });
            }

            // Stop video tracks
            if (participant.videoTracks) {
              participant.videoTracks.forEach((publication) => {
                if (publication.track) {
                  publication.track.stop();
                }
              });
            }
          }
        } catch (e) {
          console.log('Error stopping tracks:', e);
        }

        // Disconnect from room
        this['AG-room'].disconnect();
        this['AG-room'] = null;
        console.log('Room disconnected successfully');
      }
    }

    showError(title, message) {
      const content = this['AG-shadowRoot'].querySelector('.ag-content');
      if (content) {
        content.innerHTML = `
          <div class="ag-error">
            <h3>${title}</h3>
            <p>${message}</p>
          </div>
        `;
      }
    }
  }

  window.AdexGenie = new AdexGenie();
})();
