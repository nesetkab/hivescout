import { json } from '@sveltejs/kit';
import db from '$lib/server/db';
import { getEventTeams, getEventSchedule, getEventMatches, searchEvents } from '$lib/server/ftc-api';

export function GET({ url }) {
  return (async () => {
    const query = url.searchParams.get('search');
    if (query !== null) {
      const events = await searchEvents(query || undefined);
      // Return first 50 results
      return json(events.slice(0, 50));
    }
    return json({ error: 'Use ?search=query to find events' }, { status: 400 });
  })();
}

export function POST({ request }) {
  return (async () => {
    const { eventCode } = await request.json();
    if (!eventCode) {
      return json({ error: 'eventCode required' }, { status: 400 });
    }

    const results = { teams: 0, matches: 0 };

    // Import teams
    const teams = await getEventTeams(eventCode);
    const insertTeam = db.prepare(
      'INSERT OR REPLACE INTO teams (number, name, division) VALUES (?, ?, ?)'
    );
    const teamTx = db.transaction(() => {
      for (const t of teams) {
        insertTeam.run(t.teamNumber, t.nameShort || `Team ${t.teamNumber}`, eventCode);
        results.teams++;
      }
    });
    teamTx();

    // Import schedule (try schedule first, fall back to matches)
    let matches = await getEventSchedule(eventCode);
    if (!matches.length) {
      matches = await getEventMatches(eventCode);
    }

    const qualMatches = matches.filter(
      (m) => m.tournamentLevel === 'QUALIFICATION' || m.tournamentLevel === 'qual'
    );

    const insertMatch = db.prepare(`
      INSERT OR REPLACE INTO matches (id, match_number, division, red1, red2, blue1, blue2, scheduled_time, status)
      VALUES (
        (SELECT id FROM matches WHERE match_number = ? AND division = ?),
        ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const matchTx = db.transaction(() => {
      for (const m of qualMatches) {
        const red = m.teams.filter((t) => t.station.startsWith('Red'));
        const blue = m.teams.filter((t) => t.station.startsWith('Blue'));
        const hasScore = m.scoreRedFinal !== null && m.scoreRedFinal !== -1;

        insertMatch.run(
          m.matchNumber, eventCode,
          m.matchNumber,
          eventCode,
          red[0]?.teamNumber || null,
          red[1]?.teamNumber || null,
          blue[0]?.teamNumber || null,
          blue[1]?.teamNumber || null,
          m.scheduledStartTime || m.actualStartTime || null,
          hasScore ? 'completed' : 'upcoming'
        );
        results.matches++;
      }
    });
    matchTx();

    return json({
      success: true,
      eventCode,
      imported: results
    });
  })();
}
