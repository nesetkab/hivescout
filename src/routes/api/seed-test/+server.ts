import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function POST() {
  // Ensure a test scouter exists
  let scouter = db.prepare('SELECT * FROM scouters WHERE name = ?').get('TestBot') as any;
  if (!scouter) {
    db.prepare('INSERT INTO scouters (name) VALUES (?)').run('TestBot');
    scouter = db.prepare('SELECT * FROM scouters WHERE name = ?').get('TestBot') as any;
  }

  const matches = db.prepare('SELECT * FROM matches').all() as any[];
  const teams = db.prepare('SELECT number FROM teams').all() as any[];
  if (!matches.length || !teams.length) {
    return json({ error: 'Import an event first' }, { status: 400 });
  }

  const teamNums = teams.map((t: any) => t.number);
  const parkMethods = ['none', 'normal', 'tilt', 'lift'];
  const baseTypes = ['none', 'none', 'partial', 'partial', 'full', 'full', 'full'];

  let count = 0;

  const insert = db.prepare(`
    INSERT INTO match_scouts (
      match_id, team_number, scouter_id,
      auto_leave, auto_classified, auto_overflow, auto_pattern_matches,
      teleop_classified, teleop_overflow, teleop_depot, teleop_pattern_matches,
      opened_gate, endgame_base,
      defense_rating, driver_skill, reliability,
      minor_fouls, major_fouls, yellow_card, red_card,
      notes, scoring_events, started_at, ended_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const match of matches) {
      // Pick teams that are in this match
      const matchTeams = [match.red1, match.red2, match.blue1, match.blue2].filter(Boolean);
      // Scout 1-2 random teams per match
      const toScout = matchTeams.slice(0, 1 + Math.floor(Math.random() * Math.min(2, matchTeams.length)));

      for (const teamNum of toScout) {
        if (!teamNums.includes(teamNum)) continue;

        // Check if already scouted
        const exists = db.prepare(
          'SELECT 1 FROM match_scouts WHERE match_id = ? AND team_number = ? AND scouter_id = ?'
        ).get(match.id, teamNum, scouter.id);
        if (exists) continue;

        const autoLeave = Math.random() > 0.2 ? 1 : 0;
        const openedGate = Math.random() > 0.5 ? 1 : 0;
        const endgameBase = baseTypes[Math.floor(Math.random() * baseTypes.length)];
        const method = endgameBase !== 'none' ? parkMethods[1 + Math.floor(Math.random() * 3)] : 'none';
        const parkFailed = endgameBase !== 'none' && Math.random() < 0.15;
        const disconnected = Math.random() < 0.08;

        // Generate scoring events
        const events: any[] = [];
        // Target 50-80 total balls attempted
        const totalBalls = 50 + Math.floor(Math.random() * 31);
        const autoBalls = 5 + Math.floor(Math.random() * 10);
        const teleopBalls = totalBalls - autoBalls;
        // Split into events of 1-3 balls each
        let autoRemaining = autoBalls;
        const autoEventList: number[] = [];
        while (autoRemaining > 0) {
          const att = Math.min(autoRemaining, 1 + Math.floor(Math.random() * 3));
          autoEventList.push(att);
          autoRemaining -= att;
        }
        let teleopRemaining = teleopBalls;
        const teleopEventList: number[] = [];
        while (teleopRemaining > 0) {
          const att = Math.min(teleopRemaining, 1 + Math.floor(Math.random() * 3));
          teleopEventList.push(att);
          teleopRemaining -= att;
        }

        // Launch zones on rotated field (goals at top):
        // Top launch zone (goal-side): triangle roughly x:17-83%, y:5-50%
        //   The triangle narrows as y increases - at y=5% full width, at y=50% narrow center
        // Bottom launch zone (audience-side): triangle x:17-83%, y:83-100%
        //   Smaller, narrows going down
        // Most scoring happens from the top launch zone (closer to goals)
        //
        // Team personality: some teams are close shooters (low y), some are far (high y in top zone)
        const teamSeed = teamNum % 100;
        // Pick a base y-band within the top launch zone for this team
        const closeBot = teamSeed < 50; // half the teams are close bots
        const baseY = closeBot
          ? 8 + (teamSeed % 15)   // y: 8-23% (close to goals)
          : 20 + (teamSeed % 25);  // y: 20-45% (mid to far in launch zone)

        // Generate a point within the top launch zone triangle
        // The launch zone is bounded by diagonal lines from corners
        // At y%, the valid x range narrows toward center
        // Approximation: at y=0 x is 17-83, at y=50 x is ~35-65
        function launchZoneX(y: number): { min: number; max: number } {
          // Linear interpolation of the triangle bounds
          const t = Math.min(1, y / 50); // 0 at top, 1 at y=50
          const minX = 17 + t * 18; // 17 -> 35
          const maxX = 83 - t * 18; // 83 -> 65
          return { min: minX, max: maxX };
        }

        function randomLaunchPoint(baseY: number, spread: number) {
          const y = Math.max(3, Math.min(48, baseY + (Math.random() - 0.5) * spread));
          const bounds = launchZoneX(y);
          const x = bounds.min + Math.random() * (bounds.max - bounds.min);
          return {
            x: Math.round(x * 10) / 10,
            y: Math.round(y * 10) / 10
          };
        }

        for (const att of autoEventList) {
          const scored = Math.floor(Math.random() * (att + 1));
          const pos = randomLaunchPoint(baseY, 12);
          events.push({
            phase: 'auto',
            x: pos.x, y: pos.y,
            attempted: att,
            scored,
            time: Math.floor(Math.random() * 30)
          });
        }

        for (const att of teleopEventList) {
          const scored = Math.floor(Math.random() * (att + 1));
          // Teleop has slightly more spread
          const pos = randomLaunchPoint(baseY, 18);
          events.push({
            phase: 'teleop',
            x: pos.x, y: pos.y,
            attempted: att,
            scored,
            time: 45 + Math.floor(Math.random() * 120)
          });
        }

        const autoClassified = events.filter(e => e.phase === 'auto').reduce((s, e) => s + e.scored, 0);
        const autoOverflow = events.filter(e => e.phase === 'auto').reduce((s, e) => s + (e.attempted - e.scored), 0);
        const teleopClassified = events.filter(e => e.phase === 'teleop').reduce((s, e) => s + e.scored, 0);
        const teleopOverflow = events.filter(e => e.phase === 'teleop').reduce((s, e) => s + (e.attempted - e.scored), 0);

        const noteParts = [];
        if (disconnected) noteParts.push('[DISCONNECTED]');
        if (parkFailed) noteParts.push('[PARK FAILED]');
        if (method !== 'none') noteParts.push(`[PARK: ${method}]`);

        insert.run(
          match.id, teamNum, scouter.id,
          autoLeave, autoClassified, autoOverflow, 0,
          teleopClassified, teleopOverflow, 0, 0,
          openedGate, endgameBase,
          2 + Math.floor(Math.random() * 4),
          2 + Math.floor(Math.random() * 4),
          2 + Math.floor(Math.random() * 4),
          0, 0, 0, 0,
          noteParts.join(' '),
          JSON.stringify(events),
          new Date().toISOString(),
          new Date().toISOString()
        );
        count++;
      }
    }
  });

  tx();
  return json({ success: true, scoutsCreated: count });
}
