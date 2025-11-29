'use client';

import { type ReactNode, createContext, useContext } from 'react';
import { type AgentInfo, type FlowType } from '@/hooks/use-connection-details';

type AgentContextValue = {
  agent: AgentInfo | undefined;
  flowType: FlowType;
  // Computed capabilities based on flowType
  capabilities: {
    canUseMicrophone: boolean; // User can speak
    canUseTextInput: boolean; // User can type (always true per requirement)
    hasAudioOutput: boolean; // Agent can speak
  };
};

const AgentContext = createContext<AgentContextValue | null>(null);

/**
 * Derive UI capabilities from flowType:
 * - voice: full audio (mic + speaker)
 * - text: text only (no mic, no speaker)
 * - audio_to_text: user speaks, agent responds with text (mic, no speaker)
 * - text_to_audio: user types, agent speaks (no mic, speaker)
 */
function getCapabilitiesFromFlowType(flowType: FlowType) {
  switch (flowType) {
    case 'voice':
      return {
        canUseMicrophone: true,
        canUseTextInput: true,
        hasAudioOutput: true,
      };
    case 'text':
      return {
        canUseMicrophone: false,
        canUseTextInput: true,
        hasAudioOutput: false,
      };
    case 'audio_to_text':
      return {
        canUseMicrophone: true,
        canUseTextInput: true,
        hasAudioOutput: false,
      };
    case 'text_to_audio':
      return {
        canUseMicrophone: false,
        canUseTextInput: true,
        hasAudioOutput: true,
      };
    default:
      // Default to voice for backwards compatibility
      return {
        canUseMicrophone: true,
        canUseTextInput: true,
        hasAudioOutput: true,
      };
  }
}

type AgentProviderProps = {
  agent: AgentInfo | undefined;
  children: ReactNode;
};

export function AgentProvider({ agent, children }: AgentProviderProps) {
  const flowType = agent?.flowType ?? 'voice';
  const capabilities = getCapabilitiesFromFlowType(flowType);

  return (
    <AgentContext.Provider value={{ agent, flowType, capabilities }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext() {
  const context = useContext(AgentContext);
  if (!context) {
    // Return default values if used outside provider (backwards compatibility)
    return {
      agent: undefined,
      flowType: 'voice' as FlowType,
      capabilities: {
        canUseMicrophone: true,
        canUseTextInput: true,
        hasAudioOutput: true,
      },
    };
  }
  return context;
}

export function useAgentCapabilities() {
  const { capabilities } = useAgentContext();
  return capabilities;
}
