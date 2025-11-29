import { Room, RoomEvent, Track } from 'livekit-client';

class AdexGenieWidget {
  constructor(config) {
    this.agentId = config.agentId;
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.room = null;
    this.container = null;
    this.fab = null;
    this.isOpen = false;

    this.init();
  }

  init() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'adexgenie-widget-container';
    document.body.appendChild(this.container);

    // Create FAB
    this.fab = document.createElement('button');
    this.fab.id = 'adexgenie-fab';
    this.fab.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;
    this.container.appendChild(this.fab);

    // Add styles
    this.injectStyles();

    // FAB click handler
    this.fab.onclick = () => this.toggle();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #adexgenie-widget-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      #adexgenie-fab {
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

      #adexgenie-fab:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      #adexgenie-fab.close {
        background: #ef4444;
      }

      #adexgenie-widget-room {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 400px;
        height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        pointer-events: none;
        transition: opacity 0.3s, transform 0.3s;
        overflow: hidden;
      }

      #adexgenie-widget-room.active {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: all;
      }

      .lk-room-container {
        width: 100%;
        height: 100%;
      }
    `;
    document.head.appendChild(style);
  }

  async toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      await this.open();
    }
  }

  async fetchConnectionDetails() {
    try {
      const apiUrl = this.apiUrl || 'https://monvoice.adexgenie.ai/api/agent/generate-token';
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
      return {
        serverUrl: data.url || data.server_url || data.serverUrl,
        token: data.token || data.participant_token || data.participantToken,
      };
    } catch (error) {
      console.error('Error fetching connection details:', error);
      throw error;
    }
  }

  async open() {
    if (this.isOpen) return;
    this.isOpen = true;

    // Update FAB
    this.fab.classList.add('close');
    this.fab.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    // Create room container
    const roomContainer = document.createElement('div');
    roomContainer.id = 'adexgenie-widget-room';
    roomContainer.className = 'lk-room-container';
    this.container.appendChild(roomContainer);

    setTimeout(() => {
      roomContainer.classList.add('active');
    }, 10);

    // Fetch connection details
    try {
      const { serverUrl, token } = await this.fetchConnectionDetails();

      // Create LiveKit Room
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // Setup room events
      this.setupRoomEvents(roomContainer);

      // Connect to room
      await this.room.connect(serverUrl, token);

      // Enable microphone
      await this.room.localParticipant.setMicrophoneEnabled(true);

    } catch (error) {
      console.error('Failed to connect:', error);
      roomContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center;">
          <div>
            <p style="color: #ef4444; font-weight: 600; margin-bottom: 8px;">Connection Failed</p>
            <p style="color: #6b7280; font-size: 14px;">${error.message}</p>
          </div>
        </div>
      `;
    }
  }

  setupRoomEvents(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; background: #f9fafb;">
        <div style="padding: 16px; background: white; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">Voice Assistant</h3>
        </div>
        <div id="transcripts" style="flex: 1; overflow-y: auto; padding: 16px;"></div>
        <div style="padding: 16px; background: white; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: center;">
          <button id="mic-toggle" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
            🎤 Microphone
          </button>
          <button id="end-call" style="padding: 12px 24px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
            End Call
          </button>
        </div>
      </div>
    `;

    const transcriptsDiv = container.querySelector('#transcripts');
    const micToggle = container.querySelector('#mic-toggle');
    const endCall = container.querySelector('#end-call');

    // Mic toggle
    micToggle.onclick = async () => {
      const enabled = this.room.localParticipant.isMicrophoneEnabled;
      await this.room.localParticipant.setMicrophoneEnabled(!enabled);
      micToggle.textContent = enabled ? '🎤 Microphone (Off)' : '🎤 Microphone';
      micToggle.style.background = enabled ? '#6b7280' : '#667eea';
    };

    // End call
    endCall.onclick = () => this.close();

    // Room events
    this.room.on(RoomEvent.Connected, () => {
      this.addTranscript(transcriptsDiv, 'system', 'Connected to voice assistant');
    });

    this.room.on(RoomEvent.Disconnected, () => {
      this.addTranscript(transcriptsDiv, 'system', 'Disconnected');
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === Track.Kind.Audio) {
        const audioElement = track.attach();
        container.appendChild(audioElement);
      }
    });

    // Listen for transcriptions (if available)
    this.room.on(RoomEvent.DataReceived, (payload, participant) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data.type === 'transcription') {
          const isUser = participant?.identity === this.room.localParticipant.identity;
          this.addTranscript(transcriptsDiv, isUser ? 'user' : 'assistant', data.text);
        }
      } catch (e) {
        // Not a transcription message
      }
    });
  }

  addTranscript(container, type, text) {
    const div = document.createElement('div');
    div.style.cssText = `
      margin-bottom: 12px;
      padding: 12px;
      border-radius: 8px;
      ${type === 'user' ? 'background: #ede9fe; margin-left: 20px;' : ''}
      ${type === 'assistant' ? 'background: #dbeafe; margin-right: 20px;' : ''}
      ${type === 'system' ? 'background: #f3f4f6; text-align: center; font-size: 12px; color: #6b7280;' : ''}
    `;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    // Update FAB
    this.fab.classList.remove('close');
    this.fab.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;

    // Disconnect room
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }

    // Remove room container
    const roomContainer = document.getElementById('adexgenie-widget-room');
    if (roomContainer) {
      roomContainer.classList.remove('active');
      setTimeout(() => {
        roomContainer.remove();
      }, 300);
    }
  }
}

// Expose globally
window.AdexGenieWidget = AdexGenieWidget;
