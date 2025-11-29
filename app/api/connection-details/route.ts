import { NextResponse } from 'next/server';

// NOTE: you are expected to define the following environment variables in `.env.local`:
const AGENT_API_URL = process.env.AGENT_API_URL; // URL de votre API externe

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
  metadata?: {
    agent_name: string;
    agent_id: string;
  };
};

export async function GET(request: Request) {
  try {
    if (!AGENT_API_URL) {
      throw new Error('AGENT_API_URL is not defined');
    }

    // Récupérer l'agent_id depuis les query params
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    if (!agentId) {
      return new NextResponse('agent_id is required', { status: 400 });
    }

    console.log(`Fetching connection details for agent_id: ${agentId}`);

    // Appel à votre API externe
    const response = await fetch(AGENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agentId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent API returned ${response.status}: ${errorText}`);
    }

    // Récupération de la réponse de votre API
    const apiData = await response.json();
    /*
      Format attendu:
      {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "serverUrl": "wss://orch.adexgenie.ai",
        "roomName": "agent_room_abc123",
        "metadata": {
          "agent_name": "MyAgent",
          "agent_id": "uuid"
        }
      }
    */

    console.log('Connection details received from Agent API');

    // Formater la réponse pour le widget
    const data: ConnectionDetails = {
      serverUrl: apiData.serverUrl,
      roomName: apiData.roomName,
      participantToken: apiData.token,
      participantName: apiData.metadata?.agent_name || 'user',
      metadata: apiData.metadata,
    };

    const headers = new Headers({
      'Cache-Control': 'no-store',
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching connection details:', error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}
