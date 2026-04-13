import { json } from '@sveltejs/kit';
import db from '$lib/server/db';
import { getEventMatches } from '$lib/server/ftc-api';

export function POST({ request }) {
  return (async () => {
    const { eventCode } = await request.json();
    if (!eventCode) {
      return json({ error: 'eventCode required' }, { status: 400 });
    }

    const matches = await getEventMatches(eventCode);
    const qualMatches = matches.filter(
      (m) => m.tournamentLevel === 'QUALIFICATION' || m.tournamentLevel === 'qual'
    );

    const updateScore = db.prepare(`
      UPDATE matches
      SET score_red = ?, score_blue = ?, status = 'completed'
      WHERE match_number = ? AND division = ?
    `);

    let updated = 0;
    const tx = db.transaction(() => {
      for (const m of qualMatches) {
        if (m.scoreRedFinal !== null && m.scoreRedFinal !== -1) {
          const result = updateScore.run(
            m.scoreRedFinal,
            m.scoreBlueFinal,
            m.matchNumber,
            eventCode
          );
          if (result.changes > 0) updated++;
        }
      }
    });
    tx();

    return json({
      success: true,
      eventCode,
      updated
    });
  })();
}
