import { json } from '@sveltejs/kit';
import 'dotenv/config';

const NEXUS_BASE = 'https://ftc.nexus/api/v1';

function getApiKey() {
  return process.env.NEXUS_API_KEY || '';
}

function getSeason() {
  return process.env.FTC_SEASON || '2025';
}

async function nexusFetch(endpoint: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('NEXUS_API_KEY not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${NEXUS_BASE}${endpoint}`, {
      headers: {
        'Nexus-Api-Key': apiKey,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Nexus API ${res.status}: ${text}`);
    }
    return res.json();
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Nexus API timeout');
    throw err;
  }
}

export function GET({ url }) {
  return (async () => {
    const action = url.searchParams.get('action');
    const eventCode = url.searchParams.get('event');
    const season = getSeason();

    try {
      if (action === 'events') {
        const data = await nexusFetch(`/events?season=${season}`);
        return json(data);
      }

      if (action === 'event' && eventCode) {
        const data = await nexusFetch(`/event/${eventCode}`);
        return json(data);
      }

      if (action === 'status') {
        // Quick check if API key works
        const apiKey = getApiKey();
        if (!apiKey) return json({ configured: false });
        return json({ configured: true, season });
      }

      return json({ error: 'Invalid action. Use ?action=events|event&event=CODE|status' }, { status: 400 });
    } catch (err: any) {
      return json({ error: err.message }, { status: 502 });
    }
  })();
}
