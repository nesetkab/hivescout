import { d as db } from './db-Cl30lYRM.js';
import { json } from '@sveltejs/kit';
import 'better-sqlite3';
import 'path';

//#region src/routes/api/scouter-accuracy/+server.ts
function getEndgamePoints(base) {
	if (base === "full") return 10;
	if (base === "partial") return 5;
	return 0;
}
function GET() {
	const rows = db.prepare(`
    SELECT ms.id, ms.scouter_id, ms.team_number,
      ms.auto_leave, ms.endgame_base, ms.scoring_events,
      s.name as scouter_name,
      m.score_red, m.score_blue, m.red1, m.red2, m.blue1, m.blue2, m.match_number
    FROM match_scouts ms
    JOIN scouters s ON ms.scouter_id = s.id
    JOIN matches m ON ms.match_id = m.id
  `).all();
	const scouterMap = /* @__PURE__ */ new Map();
	for (const r of rows) {
		if (!scouterMap.has(r.scouter_id)) scouterMap.set(r.scouter_id, {
			name: r.scouter_name,
			total: 0,
			withScores: 0,
			deviations: []
		});
		const entry = scouterMap.get(r.scouter_id);
		entry.total++;
		const allianceScore = r.team_number === r.red1 || r.team_number === r.red2 ? r.score_red : r.score_blue;
		if (allianceScore == null) continue;
		let events = [];
		try {
			events = JSON.parse(r.scoring_events || "[]");
		} catch {}
		const est = events.reduce((s, e) => s + (e.scored || 0) * 3, 0) + events.reduce((s, e) => s + ((e.attempted || 0) - (e.scored || 0)) * 1, 0) + (r.auto_leave ? 3 : 0) + getEndgamePoints(r.endgame_base);
		const actual = allianceScore / 2;
		const dev = Math.round((est - actual) * 10) / 10;
		entry.withScores++;
		entry.deviations.push({
			match: r.match_number,
			team: r.team_number,
			est: Math.round(est),
			actual: Math.round(actual),
			dev
		});
	}
	return json(Array.from(scouterMap.entries()).map(([id, d]) => {
		const devs = d.deviations.map((x) => x.dev);
		const absDevs = d.deviations.map((x) => Math.abs(x.dev));
		return {
			id,
			name: d.name,
			total: d.total,
			withScores: d.withScores,
			avgDev: devs.length ? +(devs.reduce((a, b) => a + b, 0) / devs.length).toFixed(1) : 0,
			avgAbsDev: absDevs.length ? +(absDevs.reduce((a, b) => a + b, 0) / absDevs.length).toFixed(1) : 0,
			deviations: d.deviations
		};
	}).sort((a, b) => a.avgAbsDev - b.avgAbsDev));
}

export { GET };
//# sourceMappingURL=_server.ts-Bk2-nHqf.js.map
