import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function POST() {
  // Use all existing scouters, create a fallback if none exist
  let scouters = db.prepare('SELECT * FROM scouters').all() as any[];
  if (scouters.length === 0) {
    db.prepare('INSERT INTO scouters (name) VALUES (?)').run('TestBot');
    scouters = db.prepare('SELECT * FROM scouters').all() as any[];
  }

  const matches = db.prepare('SELECT * FROM matches').all() as any[];
  const teams = db.prepare('SELECT number FROM teams').all() as any[];
  if (!matches.length || !teams.length) {
    return json({ error: 'Import an event first' }, { status: 400 });
  }

  // Give each scouter a different accuracy personality
  // Lower noise = more accurate scouter
  const scouterProfiles = scouters.map((s: any, i: number) => ({
    id: s.id,
    name: s.name,
    noiseLevel: 0.05 + (i * 0.08), // first scouter: 5% noise (A grade), last: more noise (lower grade)
  }));

  const teamNums = teams.map((t: any) => t.number);
  const parkMethods = ['none', 'normal', 'tilt', 'lift'];
  const baseTypes = ['none', 'none', 'partial', 'partial', 'full', 'full', 'full'];

  let count = 0;
  let scouterIdx = 0;

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
      // Scout all 4 teams in each match
      const matchTeams = [match.red1, match.red2, match.blue1, match.blue2].filter(Boolean);
      const toScout = matchTeams;

      for (const teamNum of toScout) {
        if (!teamNums.includes(teamNum)) continue;

        // Pick next scouter in rotation
        const profile = scouterProfiles[scouterIdx % scouterProfiles.length];
        scouterIdx++;

        // Check if already scouted by this scouter
        const exists = db.prepare(
          'SELECT 1 FROM match_scouts WHERE match_id = ? AND team_number = ? AND scouter_id = ?'
        ).get(match.id, teamNum, profile.id);
        if (exists) continue;

        // Work backwards from actual score to generate realistic data
        const isRed = teamNum === match.red1 || teamNum === match.red2;
        const allianceScore = isRed ? (match.score_red || 60) : (match.score_blue || 60);
        const targetContribution = allianceScore / 2;

        // Decide endgame first (it's part of the score)
        const autoLeave = Math.random() > 0.15 ? 1 : 0;
        const endgameBase = baseTypes[Math.floor(Math.random() * baseTypes.length)];
        const method = endgameBase !== 'none' ? parkMethods[1 + Math.floor(Math.random() * 3)] : 'none';
        const parkFailed = endgameBase !== 'none' && Math.random() < 0.15;
        const disconnected = Math.random() < 0.05;

        const endgamePts = endgameBase === 'full' ? 10 : endgameBase === 'partial' ? 5 : 0;
        const autoPts = autoLeave ? 3 : 0;

        // Remaining points come from scoring events (classified=3pts, overflow=1pt)
        const scoringBudget = Math.max(0, targetContribution - endgamePts - autoPts);

        // Add noise based on scouter's accuracy profile
        const noise = 1 + (Math.random() - 0.5) * 2 * profile.noiseLevel;
        const noisyBudget = Math.max(0, Math.round(scoringBudget * noise));

        // Generate events that roughly add up to the budget
        // classified = 3pts, overflow = 1pt. Target ~60-75% accuracy
        const accuracy = 0.55 + Math.random() * 0.25;
        // total scored * 3 + total missed * 1 ≈ noisyBudget
        // scored * 3 + missed * 1 = budget, scored/(scored+missed) = accuracy
        // scored = budget * accuracy / (3*accuracy + 1*(1-accuracy))
        const denom = 3 * accuracy + 1 * (1 - accuracy);
        const totalScored = Math.max(1, Math.round(noisyBudget * accuracy / denom));
        const totalMissed = Math.max(0, Math.round(noisyBudget * (1 - accuracy) / denom));
        const totalBalls = totalScored + totalMissed;
        // Gate opens: roughly 1 open per 9 balls, with some noise
        const openedGate = Math.max(0, Math.round(totalBalls / 9 + (Math.random() - 0.5) * 2));
        const autoBalls = Math.min(totalBalls, 3 + Math.floor(Math.random() * 6));
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

        const events: any[] = [];

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

        // Distribute scored/missed across events with the target accuracy
        let scoredRemaining = totalScored;
        let missedRemaining = totalMissed;

        for (const att of autoEventList) {
          // Distribute proportionally
          const canScore = Math.min(att, scoredRemaining);
          const canMiss = Math.min(att, missedRemaining);
          const s = Math.min(att, Math.round(att * accuracy) + (Math.random() > 0.5 ? 1 : 0));
          const actualScored = Math.min(s, canScore + canMiss > 0 ? Math.min(s, scoredRemaining) : 0);
          scoredRemaining -= actualScored;
          missedRemaining -= (att - actualScored);

          const pos = randomLaunchPoint(baseY, 12);
          events.push({
            phase: 'auto',
            x: pos.x, y: pos.y,
            attempted: att,
            scored: Math.max(0, actualScored),
            time: Math.floor(Math.random() * 30)
          });
        }

        for (const att of teleopEventList) {
          const s = Math.min(att, Math.round(att * accuracy) + (Math.random() > 0.5 ? 1 : 0));
          const actualScored = Math.min(s, scoredRemaining);
          scoredRemaining -= actualScored;
          missedRemaining -= (att - actualScored);

          const pos = randomLaunchPoint(baseY, 18);
          events.push({
            phase: 'teleop',
            x: pos.x, y: pos.y,
            attempted: att,
            scored: Math.max(0, actualScored),
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
          match.id, teamNum, profile.id,
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
