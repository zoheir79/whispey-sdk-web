/**
 * LiveKit Agent Widget - Standalone Integration
 * Version: 1.0.0
 * 
 * Usage:
 * <script src="livekit-agent-widget.js"></script>
 * <script>
 *   LiveKitAgentWidget.init({
 *     agentName: 'My Agent',
 *     apiEndpoint: '/api/connection-details' // optional
 *   });
 * </script>
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.LiveKitAgentWidget) {
    console.warn('LiveKitAgentWidget already initialized');
    return;
  }

  class LiveKitAgentWidget {
    constructor() {
      this.config = {
        agentName: 'Agent',
        agentId: null, // UUID de l'agent
        apiEndpoint: '/api/connection-details',
        primaryColor: '#002cf2',
        darkPrimaryColor: '#1fd5f9'
      };
      this.shadowRoot = null;
      this.container = null;
      this.mode = null; // 'popup' or 'iframe'
      this.isOpen = false;
      this.room = null;
      this.connectionDetails = null;
    }

    init(userConfig = {}) {
      this.config = { ...this.config, ...userConfig };
      this.createWidget();
      this.loadLiveKitSDK();
    }

    loadLiveKitSDK() {
      // Load LiveKit SDK dynamically
      if (window.LivekitClient) {
        console.log('LiveKit SDK already loaded');
        this.onLiveKitLoaded();
        return;
      }

      console.log('Loading LiveKit SDK...');
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/livekit-client@2.13.3/dist/livekit-client.umd.min.js';
      script.onload = () => this.onLiveKitLoaded();
      script.onerror = () => {
        console.error('Failed to load LiveKit SDK');
        this.showError('SDK Error', 'Failed to load LiveKit SDK. Please check your internet connection.');
      };
      document.head.appendChild(script);
    }

    onLiveKitLoaded() {
      console.log('LiveKit SDK loaded successfully');
    }

    createWidget() {
      // Create container with Shadow DOM for complete isolation
      this.container = document.createElement('div');
      this.container.id = 'livekit-agent-widget-root';
      this.shadowRoot = this.container.attachShadow({ mode: 'open' });
      
      // Add styles
      this.injectStyles();
      
      // Create floating buttons
      this.createFloatingButtons();
      
      // Append to body
      document.body.appendChild(this.container);
    }

    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .lk-widget-container {
          position: fixed;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .lk-floating-buttons {
          position: fixed;
          bottom: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 999999;
        }

        .lk-float-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          background: ${this.config.primaryColor};
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.3s ease;
          position: relative;
        }

        .lk-float-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .lk-float-btn:active {
          transform: scale(0.95);
        }

        .lk-float-btn::after {
          content: attr(data-tooltip);
          position: absolute;
          right: 70px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .lk-float-btn:hover::after {
          opacity: 1;
        }

        .lk-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999998;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .lk-popup-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        .lk-popup-container {
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 360px;
          height: 480px;
          background: white;
          border-radius: 28px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          z-index: 999999;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          overflow: hidden;
        }

        .lk-popup-container.active {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .lk-iframe-container {
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 360px;
          height: 80px;
          background: white;
          border-radius: 40px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          z-index: 999999;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .lk-iframe-container.active {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .lk-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.1);
          color: #333;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          z-index: 10;
          transition: background 0.2s ease;
        }

        .lk-close-btn:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        .lk-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .lk-welcome {
          text-align: center;
        }

        .lk-welcome h2 {
          font-size: 24px;
          margin-bottom: 12px;
          color: #1f2937;
        }

        .lk-welcome p {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
        }

        .lk-start-btn {
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 24px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .lk-start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 44, 242, 0.3);
        }

        .lk-start-btn:active {
          transform: translateY(0);
        }

        .lk-session-active {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #f9fafb;
        }

        .lk-session-header {
          padding: 20px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .lk-session-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .lk-session-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .lk-session-controls {
          padding: 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .lk-control-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: #f3f4f6;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.2s ease;
        }

        .lk-control-btn:hover {
          background: #e5e7eb;
        }

        .lk-control-btn.active {
          background: ${this.config.primaryColor};
          color: white;
        }

        .lk-control-btn.danger {
          background: #ef4444;
          color: white;
        }

        .lk-control-btn.danger:hover {
          background: #dc2626;
        }

        .lk-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #6b7280;
        }

        .lk-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top-color: ${this.config.primaryColor};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .lk-error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 16px;
          color: #991b1b;
          font-size: 14px;
          margin: 12px 0;
        }

        .lk-error-title {
          font-weight: 600;
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .lk-popup-container,
          .lk-iframe-container {
            right: 10px;
            left: 10px;
            width: auto;
          }

          .lk-floating-buttons {
            right: 10px;
            bottom: 10px;
          }
        }

        @media (prefers-color-scheme: dark) {
          .lk-popup-container,
          .lk-iframe-container {
            background: #1f2937;
            border-color: #374151;
          }

          .lk-welcome h2,
          .lk-session-title {
            color: #f9fafb;
          }

          .lk-welcome p {
            color: #9ca3af;
          }

          .lk-session-active {
            background: #111827;
          }

          .lk-session-header {
            background: #1f2937;
            border-color: #374151;
          }

          .lk-session-controls {
            background: #1f2937;
            border-color: #374151;
          }

          .lk-control-btn {
            background: #374151;
            color: #f9fafb;
          }

          .lk-control-btn:hover {
            background: #4b5563;
          }

          .lk-close-btn {
            background: rgba(255, 255, 255, 0.1);
            color: #f9fafb;
          }

          .lk-close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        }
      `;
      this.shadowRoot.appendChild(style);
    }

    createFloatingButtons() {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'lk-floating-buttons';

      // Popup button
      const popupBtn = document.createElement('button');
      popupBtn.className = 'lk-float-btn';
      popupBtn.setAttribute('data-tooltip', 'Open Popup Chat');
      popupBtn.innerHTML = '💬';
      popupBtn.onclick = () => this.toggleMode('popup');

      // Iframe button
      const iframeBtn = document.createElement('button');
      iframeBtn.className = 'lk-float-btn';
      iframeBtn.setAttribute('data-tooltip', 'Open Inline Chat');
      iframeBtn.innerHTML = '🎯';
      iframeBtn.onclick = () => this.toggleMode('iframe');

      buttonsContainer.appendChild(popupBtn);
      buttonsContainer.appendChild(iframeBtn);

      this.shadowRoot.appendChild(buttonsContainer);
    }

    toggleMode(mode) {
      if (this.isOpen && this.mode === mode) {
        this.close();
      } else {
        this.open(mode);
      }
    }

    open(mode) {
      this.mode = mode;
      this.isOpen = true;

      // Remove existing containers
      const existingPopup = this.shadowRoot.querySelector('.lk-popup-container');
      const existingIframe = this.shadowRoot.querySelector('.lk-iframe-container');
      const existingOverlay = this.shadowRoot.querySelector('.lk-popup-overlay');
      
      if (existingPopup) existingPopup.remove();
      if (existingIframe) existingIframe.remove();
      if (existingOverlay) existingOverlay.remove();

      if (mode === 'popup') {
        this.createPopupView();
      } else {
        this.createIframeView();
      }

      // Fetch connection details
      this.fetchConnectionDetails();
    }

    close() {
      this.isOpen = false;
      this.mode = null;

      const popup = this.shadowRoot.querySelector('.lk-popup-container');
      const iframe = this.shadowRoot.querySelector('.lk-iframe-container');
      const overlay = this.shadowRoot.querySelector('.lk-popup-overlay');

      if (popup) popup.classList.remove('active');
      if (iframe) iframe.classList.remove('active');
      if (overlay) overlay.classList.remove('active');

      setTimeout(() => {
        if (popup) popup.remove();
        if (iframe) iframe.remove();
        if (overlay) overlay.remove();
      }, 300);

      // Disconnect room
      if (this.room) {
        this.disconnectRoom();
      }
    }

    createPopupView() {
      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'lk-popup-overlay';
      overlay.onclick = () => this.close();

      // Popup container
      const popup = document.createElement('div');
      popup.className = 'lk-popup-container';

      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'lk-close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.onclick = () => this.close();

      // Content
      const content = document.createElement('div');
      content.className = 'lk-content';
      content.innerHTML = `
        <div class="lk-welcome">
          <h2>${this.config.agentName}</h2>
          <p>Start a conversation with our AI agent</p>
          <button class="lk-start-btn">Start Call</button>
        </div>
      `;

      const startBtn = content.querySelector('.lk-start-btn');
      startBtn.onclick = () => this.startSession(content);

      popup.appendChild(closeBtn);
      popup.appendChild(content);

      this.shadowRoot.appendChild(overlay);
      this.shadowRoot.appendChild(popup);

      // Trigger animation
      setTimeout(() => {
        overlay.classList.add('active');
        popup.classList.add('active');
      }, 10);
    }

    createIframeView() {
      const iframe = document.createElement('div');
      iframe.className = 'lk-iframe-container';

      const content = document.createElement('div');
      content.className = 'lk-content';
      content.innerHTML = `
        <div class="lk-welcome">
          <button class="lk-start-btn">Start Call</button>
        </div>
      `;

      const startBtn = content.querySelector('.lk-start-btn');
      startBtn.onclick = () => this.startSession(content);

      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'lk-close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.onclick = () => this.close();

      iframe.appendChild(closeBtn);
      iframe.appendChild(content);

      this.shadowRoot.appendChild(iframe);

      // Trigger animation
      setTimeout(() => {
        iframe.classList.add('active');
      }, 10);
    }

    async fetchConnectionDetails() {
      try {
        // Vérifier si agentId est fourni
        if (!this.config.agentId) {
          throw new Error('agentId is required. Please provide it in the widget configuration.');
        }

        // Construire l'URL avec le paramètre agent_id
        let endpoint = this.config.apiEndpoint.startsWith('http') 
          ? this.config.apiEndpoint 
          : `${window.location.origin}${this.config.apiEndpoint}`;
        
        endpoint += `?agent_id=${encodeURIComponent(this.config.agentId)}`;
        
        console.log('Fetching connection details from:', endpoint);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        
        this.connectionDetails = await response.json();
        console.log('Connection details received successfully');
      } catch (error) {
        console.error('Error fetching connection details:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unable to connect to the server';
        this.showError('Connection Error', errorMessage);
      }
    }

    async startSession(contentElement) {
      if (!window.LivekitClient) {
        this.showError('SDK Error', 'LiveKit SDK not loaded. Please refresh the page.');
        return;
      }

      if (!this.connectionDetails) {
        contentElement.innerHTML = `
          <div class="lk-loading">
            <div class="lk-spinner"></div>
            <span>Connecting...</span>
          </div>
        `;
        await this.fetchConnectionDetails();
      }

      if (!this.connectionDetails) {
        this.showError('Connection Error', 'Unable to establish connection details.');
        return;
      }

      contentElement.innerHTML = `
        <div class="lk-session-active">
          <div class="lk-session-header">
            <div class="lk-session-title">${this.config.agentName}</div>
          </div>
          <div class="lk-session-body">
            <div class="lk-loading">
              <div class="lk-spinner"></div>
              <span>Connecting to agent...</span>
            </div>
          </div>
          <div class="lk-session-controls">
            <button class="lk-control-btn" data-action="mic" title="Microphone">
              🎤
            </button>
            <button class="lk-control-btn danger" data-action="end" title="End Call">
              📞
            </button>
          </div>
        </div>
      `;

      // Setup controls
      const controls = contentElement.querySelectorAll('.lk-control-btn');
      controls.forEach(btn => {
        btn.onclick = () => this.handleControl(btn.dataset.action, btn);
      });

      // Connect to room
      await this.connectToRoom(contentElement);
    }

    async connectToRoom(contentElement) {
      try {
        const { Room } = window.LivekitClient;
        this.room = new Room();

        // Event listeners
        this.room.on('disconnected', () => {
          this.close();
        });

        this.room.on('participantConnected', (participant) => {
          console.log('Participant connected:', participant.identity);
          this.updateSessionBody(contentElement, 'Agent connected');
        });

        this.room.on('trackSubscribed', (track, publication, participant) => {
          if (track.kind === 'audio') {
            track.attach();
          }
        });

        // Connect
        console.log('Connecting to room:', this.connectionDetails.serverUrl);
        await this.room.connect(
          this.connectionDetails.serverUrl,
          this.connectionDetails.participantToken
        );
        console.log('Connected to room successfully');

        // Enable microphone
        console.log('Enabling microphone...');
        await this.room.localParticipant.setMicrophoneEnabled(true);
        console.log('Microphone enabled');

        this.updateSessionBody(contentElement, 'Connected! Speak to start the conversation.');

      } catch (error) {
        console.error('Error connecting to room:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        this.showError('Connection Failed', errorMessage);
      }
    }

    updateSessionBody(contentElement, message) {
      const sessionBody = contentElement.querySelector('.lk-session-body');
      if (sessionBody) {
        sessionBody.innerHTML = `<p style="color: #6b7280; text-align: center;">${message}</p>`;
      }
    }

    handleControl(action, button) {
      if (action === 'mic') {
        if (this.room) {
          const isEnabled = this.room.localParticipant.isMicrophoneEnabled;
          this.room.localParticipant.setMicrophoneEnabled(!isEnabled);
          button.classList.toggle('active', !isEnabled);
        }
      } else if (action === 'end') {
        this.close();
      }
    }

    disconnectRoom() {
      if (this.room) {
        this.room.disconnect();
        this.room = null;
      }
    }

    showError(title, description) {
      const containers = this.shadowRoot.querySelectorAll('.lk-content');
      containers.forEach(content => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'lk-error';
        errorDiv.innerHTML = `
          <div class="lk-error-title">${title}</div>
          <div>${description}</div>
        `;
        content.insertBefore(errorDiv, content.firstChild);
      });
    }
  }

  // Expose to global scope
  window.LiveKitAgentWidget = {
    init: function(config) {
      const widget = new LiveKitAgentWidget();
      widget.init(config);
      return widget;
    }
  };

})();
