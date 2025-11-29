import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id } = body;

    // Récupérer l'API key depuis le header
    const apiKey = request.headers.get('X-API-Key');

    console.log('Proxying token request for agent:', agent_id);
    console.log('API Key present:', !!apiKey);

    if (!apiKey) {
      return new NextResponse('Missing API key in header', { status: 400 });
    }

    // Appel à votre API externe
    const response = await fetch('https://monvoice.adexgenie.ai/api/agent/generate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-API-Key': apiKey,
      },
      body: JSON.stringify({
        agent_id: agent_id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return new NextResponse(errorText, { status: response.status });
    }

    const data = await response.json();
    console.log('Token generated successfully');

    // Retourner les données
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(error instanceof Error ? error.message : 'Internal server error', {
      status: 500,
    });
  }
}
