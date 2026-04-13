import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function GET({ url }) {
  const team = url.searchParams.get('team');
  if (team) {
    const responses = db.prepare(`
      SELECT p.*, s.name as scouter_name
      FROM prescout_responses p
      JOIN scouters s ON p.scouter_id = s.id
      WHERE p.team_number = ?
      ORDER BY p.created_at DESC
    `).all(Number(team));
    return json(responses);
  }
  const all = db.prepare(`
    SELECT p.*, s.name as scouter_name, t.name as team_name
    FROM prescout_responses p
    JOIN scouters s ON p.scouter_id = s.id
    JOIN teams t ON p.team_number = t.number
    ORDER BY p.created_at DESC
  `).all();
  return json(all);
}

export function POST({ request }) {
  return (async () => {
    const data = await request.json();
    const result = db.prepare(`
      INSERT INTO prescout_responses (team_number, scouter_id, drivetrain, intake_type, can_score_goal, can_classify, can_open_gate, auto_capabilities, teleop_capabilities, endgame_capabilities, strengths, weaknesses, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.team_number, data.scouter_id,
      data.drivetrain, data.intake_type || null,
      data.can_score_goal || 0, data.can_classify || 0, data.can_open_gate || 0,
      data.auto_capabilities, data.teleop_capabilities,
      data.endgame_capabilities, data.strengths, data.weaknesses, data.notes
    );
    return json({ id: result.lastInsertRowid });
  })();
}
