export type EmbedWidgetConfig = {
  apiUrl?: string;
  agentId?: string;
  apiKey?: string;
  serverUrl?: string;
  participantToken?: string;
  participantName?: string;
};

declare global {
  interface Window {
    AdexGenieEmbedConfig?: EmbedWidgetConfig;
  }
}

function getConfigFromScriptTag(): EmbedWidgetConfig {
  if (typeof document === 'undefined') {
    return {};
  }

  const currentScript = document.currentScript as HTMLScriptElement | null;
  if (!currentScript) return {};

  const { dataset } = currentScript;
  return {
    apiUrl: dataset.apiUrl,
    agentId: dataset.agentId,
    apiKey: dataset.apiKey,
    serverUrl: dataset.serverUrl,
    participantToken: dataset.token,
    participantName: dataset.participantName,
  };
}

export function getEmbedWidgetConfig(): EmbedWidgetConfig {
  const globalConfig = typeof window !== 'undefined' ? window.AdexGenieEmbedConfig ?? {} : {};
  const scriptConfig = getConfigFromScriptTag();

  return {
    ...globalConfig,
    ...scriptConfig,
  };
}
