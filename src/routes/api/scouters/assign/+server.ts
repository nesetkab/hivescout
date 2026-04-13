import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function POST({ request }) {
  return (async () => {
    const { scouter_id, team_number } = await request.json();
    try {
      db.prepare('INSERT INTO scouter_assignments (scouter_id, team_number) VALUES (?, ?)').run(scouter_id, team_number);
      return json({ success: true });
    } catch {
      return json({ success: false, error: 'Already assigned' }, { status: 409 });
    }
  })();
}

export function DELETE({ request }) {
  return (async () => {
    const { scouter_id, team_number } = await request.json();
    db.prepare('DELETE FROM scouter_assignments WHERE scouter_id = ? AND team_number = ?').run(scouter_id, team_number);
    return json({ success: true });
  })();
}
