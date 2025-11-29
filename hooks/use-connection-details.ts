import { useCallback, useEffect, useState } from 'react';
import { getEmbedWidgetConfig } from '@/components/embed-popup/embed-config';

export type FlowType = 'voice' | 'text' | 'audio_to_text' | 'text_to_audio';
export type AgentType = 'voice' | 'text_only' | 'multimodal';

export type AgentInfo = {
  id: string;
  name: string;
  type: AgentType;
  flowType: FlowType;
};

export type ConnectionDetails = {
  serverUrl: string;
  participantToken: string;
  participantName?: string;
  agent?: AgentInfo;
};

export default function useConnectionDetails() {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);

  const fetchConnectionDetails = useCallback(async () => {
    const config = getEmbedWidgetConfig();

    if (config.serverUrl && config.participantToken) {
      setConnectionDetails({
        serverUrl: config.serverUrl,
        participantToken: config.participantToken,
        participantName: config.participantName ?? 'User',
      });
      return;
    }

    const apiUrl = config.apiUrl ?? 'https://monvoice.adexgenie.ai/api/agent/generate-token';

    if (!config.agentId || !config.apiKey) {
      console.error('Missing agentId or apiKey for AdexGenie widget.');
      return;
    }

    try {
      setConnectionDetails(null);

      const isProxy = apiUrl.includes('/api/proxy-token');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [isProxy ? 'X-API-Key' : 'X-Agent-API-Key']: config.apiKey,
        },
        body: JSON.stringify({ agent_id: config.agentId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Parse agent info from API response
      const agentInfo: AgentInfo | undefined = data.agent
        ? {
            id: data.agent.id,
            name: data.agent.name,
            type: data.agent.type || 'voice',
            flowType: data.agent.flow_type || data.metadata?.flowType || 'voice',
          }
        : data.metadata?.flowType
          ? {
              id: data.metadata.agentId || '',
              name: data.metadata.agentName || '',
              type: data.metadata.agentType || 'voice',
              flowType: data.metadata.flowType || 'voice',
            }
          : undefined;

      setConnectionDetails({
        serverUrl: data.url || data.server_url || data.serverUrl,
        participantToken: data.token || data.participant_token || data.participantToken,
        participantName: data.participant_name || data.participantName || 'User',
        agent: agentInfo,
      });
    } catch (error) {
      console.error('Error fetching connection details:', error);
    }
  }, []);

  useEffect(() => {
    fetchConnectionDetails();
  }, [fetchConnectionDetails]);

  return { connectionDetails, refreshConnectionDetails: fetchConnectionDetails };
}
