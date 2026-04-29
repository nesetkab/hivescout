import db from '$lib/server/db';

export function load() {
  // Get all teams
  const teams = db.prepare('SELECT * FROM teams ORDER BY number').all() as any[];

  // Get all match scout data grouped by team
  const allScouts = db.prepare(`
    SELECT ms.*, m.match_number
    FROM match_scouts ms
    JOIN matches m ON ms.match_id = m.id
  `).all() as any[];

  const teamMap = new Map<number, any[]>();
  for (const s of allScouts) {
    if (!teamMap.has(s.team_number)) teamMap.set(s.team_number, []);
    teamMap.get(s.team_number)!.push(s);
  }

  // Compute stats per team (same logic as analytics)
  const teamStats = teams.map((t) => {
    const scouts = teamMap.get(t.number) || [];
    const n = scouts.length;
    if (n === 0) {
      return {
        number: t.number, name: t.name, matches: 0,
        avgScored: 0, accuracy: 0, parkRate: 0, avgReliability: 0,
        totalScore: 0,
      };
    }

    let totalAttempted = 0;
    let totalScored = 0;
    for (const s of scouts) {
      try {
        const events = JSON.parse(s.scoring_events || '[]');
        for (const e of events) {
          totalAttempted += e.attempted || 0;
          totalScored += e.scored || 0;
        }
      } catch {}
    }

    const avgScored = +(totalScored / n).toFixed(1);
    const accuracy = totalAttempted ? Math.round((totalScored / totalAttempted) * 100) : 0;
    const avgAutoCls = +(scouts.reduce((s: number, r: any) => s + r.auto_classified, 0) / n).toFixed(1);
    const avgSkill = +(scouts.reduce((s: number, r: any) => s + r.driver_skill, 0) / n).toFixed(1);
    const avgReliability = +(scouts.reduce((s: number, r: any) => s + r.reliability, 0) / n).toFixed(1);
    const parkAttempts = scouts.filter((s: any) => s.endgame_base !== 'none');
    const parkRate = Math.round(parkAttempts.length / n * 100);

    const totalScore = avgScored * 3 + avgAutoCls * 2 + (parkRate / 100) * 10 + avgSkill * 2 + avgReliability * 2;

    return {
      number: t.number, name: t.name, matches: n,
      avgScored, accuracy, parkRate, avgReliability,
      totalScore: +totalScore.toFixed(1),
    };
  });

  // Get saved picklist
  const savedPicklist = db.prepare(`
    SELECT p.position, p.team_number, p.notes, p.tier
    FROM picklist p
    ORDER BY p.position ASC
  `).all() as any[];

  return {
    teamStats,
    savedPicklist,
  };
}
