import { json } from '@sveltejs/kit';
import db from '$lib/server/db';
import { getEventTeams, getEventSchedule, getEventMatches, searchEvents, type FTCMatch } from '$lib/server/ftc-api';

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

    // Import schedule and match results
    let schedule = await getEventSchedule(eventCode);
    let matchResults = await getEventMatches(eventCode);

    // Merge: use schedule for team assignments, results for scores
    const resultMap = new Map<number, FTCMatch>();
    for (const m of matchResults) {
      if (m.tournamentLevel === 'QUALIFICATION' || m.tournamentLevel === 'qual') {
        resultMap.set(m.matchNumber, m);
      }
    }

    // Use schedule if available, otherwise fall back to results
    let allMatches = schedule.length ? schedule : matchResults;
    const qualMatches = allMatches.filter(
      (m) => m.tournamentLevel === 'QUALIFICATION' || m.tournamentLevel === 'qual'
    );

    const insertMatch = db.prepare(`
      INSERT OR REPLACE INTO matches (id, match_number, division, red1, red2, blue1, blue2, scheduled_time, status, score_red, score_blue)
      VALUES (
        (SELECT id FROM matches WHERE match_number = ? AND division = ?),
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const matchTx = db.transaction(() => {
      for (const m of qualMatches) {
        const red = m.teams.filter((t) => t.station.startsWith('Red'));
        const blue = m.teams.filter((t) => t.station.startsWith('Blue'));

        // Check if we have actual scores from results
        const result = resultMap.get(m.matchNumber);
        const scoreRed = result?.scoreRedFinal != null && result.scoreRedFinal !== -1 ? result.scoreRedFinal : null;
        const scoreBlue = result?.scoreBlueFinal != null && result.scoreBlueFinal !== -1 ? result.scoreBlueFinal : null;
        const hasScore = scoreRed !== null;

        insertMatch.run(
          m.matchNumber, eventCode,
          m.matchNumber,
          eventCode,
          red[0]?.teamNumber || null,
          red[1]?.teamNumber || null,
          blue[0]?.teamNumber || null,
          blue[1]?.teamNumber || null,
          m.scheduledStartTime || m.actualStartTime || null,
          hasScore ? 'completed' : 'upcoming',
          scoreRed,
          scoreBlue
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
