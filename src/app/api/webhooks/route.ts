import { NextRequest, NextResponse } from 'next/server';

// Lista de webhooks registrados
const webhooks: Map<string, string> = new Map();

// POST - Registrar webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, url } = body;

    if (!event || !url) {
      return NextResponse.json(
        { error: 'event e url são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    // Armazenar webhook (em memória - em produção usar banco)
    webhooks.set(event, url);

    return NextResponse.json({
      success: true,
      message: `Webhook registrado para evento: ${event}`,
      event,
      url,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET - Listar webhooks registrados
export async function GET() {
  const hooks: { event: string; url: string }[] = [];
  webhooks.forEach((url, event) => {
    hooks.push({ event, url });
  });

  return NextResponse.json({
    webhooks: hooks,
    count: hooks.length,
  });
}

// Função para dispara webhooks (chamada internamente)
export async function triggerWebhook(event: string, data: any) {
  const url = webhooks.get(event);
  if (!url) return null;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Timestamp': new Date().toISOString(),
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data,
      }),
    });

    return { success: response.ok, status: response.status };
  } catch (error) {
    console.error(`Webhook error for ${event}:`, error);
    return { success: false, error: 'Network error' };
  }
}

// Eventos disponíveis:
// - membro.cadastrado
// - membro.atualizado
// - membro.desligado
// - unidade.criada
// - avaliacao.criada
// - classe.concluida
// - transicao.criada