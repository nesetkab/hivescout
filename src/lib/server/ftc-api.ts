import 'dotenv/config';

const FTC_API_BASE = 'https://ftc-api.firstinspires.org/v2.0';

function getAuth() {
  const user = process.env.FTC_USERNAME;
  const key = process.env.FTC_API_KEY;
  if (!user || !key) throw new Error('Missing FTC_USERNAME or FTC_API_KEY env vars');
  return 'Basic ' + Buffer.from(`${user}:${key}`).toString('base64');
}

function getSeason() {
  return process.env.FTC_SEASON || '2025';
}

async function ftcFetch<T>(endpoint: string, retries = 3): Promise<T> {
  const url = `${FTC_API_BASE}/${getSeason()}/${endpoint}`;
  console.log(`[FTC API] ${url}`);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        headers: { Authorization: getAuth(), Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('Retry-After') || 2);
        console.log(`[FTC API] Rate limited, waiting ${retryAfter}s`);
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`FTC API ${res.status}: ${text}`);
      }

      return res.json();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log(`[FTC API] Timeout on attempt ${attempt + 1}/${retries}`);
      }
      if (attempt === retries - 1) throw err;
      const delay = Math.min(1000 * 2 ** attempt, 8000);
      console.log(`[FTC API] Retry ${attempt + 1}/${retries} in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('FTC API: max retries exceeded');
}

export interface FTCTeam {
  teamNumber: number;
  nameShort: string;
  nameFull?: string;
  city?: string;
  stateProv?: string;
}

export interface FTCMatchTeam {
  teamNumber: number;
  station: string;
  dq: boolean;
  onField: boolean;
}

export interface FTCMatch {
  matchNumber: number;
  description: string;
  tournamentLevel: string;
  series: number;
  actualStartTime?: string;
  scheduledStartTime?: string;
  teams: FTCMatchTeam[];
  scoreRedFinal: number | null;
  scoreBlueFinal: number | null;
}

export interface FTCEvent {
  code: string;
  name: string;
  city: string;
  stateprov: string;
  dateStart: string;
  dateEnd: string;
  type: string;
  typeName: string;
}

export async function searchEvents(query?: string): Promise<FTCEvent[]> {
  const data = await ftcFetch<{ events: FTCEvent[] }>('events');
  if (!query) return data.events || [];
  const q = query.toLowerCase();
  return (data.events || []).filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q)
  );
}

export async function getEventTeams(eventCode: string): Promise<FTCTeam[]> {
  const allTeams: FTCTeam[] = [];
  let page = 1;
  while (true) {
    const data = await ftcFetch<{ teams: FTCTeam[]; pageTotal: number }>(
      `teams?eventCode=${eventCode}&page=${page}`
    );
    allTeams.push(...(data.teams || []));
    if (page >= (data.pageTotal || 1)) break;
    page++;
    await new Promise(r => setTimeout(r, 200));
  }
  return allTeams;
}

export async function getEventSchedule(eventCode: string): Promise<FTCMatch[]> {
  const data = await ftcFetch<{ schedule: FTCMatch[] }>(
    `schedule/${eventCode}?tournamentLevel=qual`
  );
  return data.schedule || [];
}

export async function getEventMatches(eventCode: string): Promise<FTCMatch[]> {
  const data = await ftcFetch<{ matches: FTCMatch[] }>(`matches/${eventCode}`);
  return data.matches || [];
}
