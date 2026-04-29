import db from '$lib/server/db';

export function load() {
  const teams = db.prepare('SELECT * FROM teams ORDER BY number').all() as any[];
  const allScouts = db.prepare(`
    SELECT ms.*, m.match_number
    FROM match_scouts ms
    JOIN matches m ON ms.match_id = m.id
  `).all() as any[];

  // Group by team
  const teamMap = new Map<number, any[]>();
  for (const s of allScouts) {
    if (!teamMap.has(s.team_number)) teamMap.set(s.team_number, []);
    teamMap.get(s.team_number)!.push(s);
  }

  const teamStats = teams.map((t) => {
    const scouts = teamMap.get(t.number) || [];
    const n = scouts.length;
    if (n === 0) {
      return {
        number: t.number, name: t.name, matches: 0,
        avgScored: 0, avgAttempted: 0, accuracy: 0,
        autoLeaveRate: 0, avgAutoClassified: 0,
        parkRate: 0, parkSuccessRate: 0,
        avgDriverSkill: 0, avgReliability: 0, avgDefense: 0,
        disconnectCount: 0, avgGateOpens: 0,
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

    const avgAttempted = +(totalAttempted / n).toFixed(1);
    const avgScored = +(totalScored / n).toFixed(1);
    const accuracy = totalAttempted ? Math.round((totalScored / totalAttempted) * 100) : 0;

    const autoLeaveRate = Math.round(scouts.reduce((s: number, r: any) => s + r.auto_leave, 0) / n * 100);
    const avgAutoClassified = +(scouts.reduce((s: number, r: any) => s + r.auto_classified, 0) / n).toFixed(1);

    const parkAttempts = scouts.filter((s: any) => s.endgame_base !== 'none');
    const parkRate = Math.round(parkAttempts.length / n * 100);
    const parkFails = scouts.filter((s: any) => (s.notes || '').includes('[PARK FAILED]')).length;
    const parkSuccessRate = parkAttempts.length ? Math.round((parkAttempts.length - parkFails) / parkAttempts.length * 100) : 0;

    const avgDriverSkill = +(scouts.reduce((s: number, r: any) => s + r.driver_skill, 0) / n).toFixed(1);
    const avgReliability = +(scouts.reduce((s: number, r: any) => s + r.reliability, 0) / n).toFixed(1);
    const avgDefense = +(scouts.reduce((s: number, r: any) => s + r.defense_rating, 0) / n).toFixed(1);

    const disconnectCount = scouts.filter((s: any) => (s.notes || '').includes('[DISCONNECTED]')).length;

    const totalGateOpens = scouts.reduce((s: number, r: any) => s + r.opened_gate, 0);
    const avgGateOpens = +(totalGateOpens / n).toFixed(1);

    return {
      number: t.number, name: t.name, matches: n,
      avgScored, avgAttempted, accuracy,
      autoLeaveRate, avgAutoClassified,
      parkRate, parkSuccessRate,
      avgDriverSkill, avgReliability, avgDefense,
      disconnectCount, avgGateOpens,
    };
  });

  return { teams, teamStats };
}
