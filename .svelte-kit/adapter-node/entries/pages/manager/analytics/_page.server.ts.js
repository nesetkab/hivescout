import { t as db } from "../../../../chunks/db.js";
//#region src/routes/manager/analytics/+page.server.ts
function load() {
	const teams = db.prepare("SELECT * FROM teams ORDER BY number").all();
	const allScouts = db.prepare(`
    SELECT ms.*, m.match_number
    FROM match_scouts ms
    JOIN matches m ON ms.match_id = m.id
  `).all();
	const teamMap = /* @__PURE__ */ new Map();
	for (const s of allScouts) {
		if (!teamMap.has(s.team_number)) teamMap.set(s.team_number, []);
		teamMap.get(s.team_number).push(s);
	}
	const overview = teams.map((t) => {
		const scouts = teamMap.get(t.number) || [];
		const n = scouts.length;
		if (n === 0) return {
			number: t.number,
			name: t.name,
			matches: 0,
			avgAttempted: 0,
			avgScored: 0,
			accuracy: 0,
			autoLeaveRate: 0,
			avgAutoCls: 0,
			avgTelCls: 0,
			avgTelOvf: 0,
			gateRate: 0,
			avgSkill: 0,
			avgReliability: 0,
			parkRate: 0,
			primaryPark: "none",
			totalScore: 0,
			disconnects: 0,
			summary: ""
		};
		let totalAttempted = 0;
		let totalScored = 0;
		for (const s of scouts) try {
			const events = JSON.parse(s.scoring_events || "[]");
			for (const e of events) {
				totalAttempted += e.attempted || 0;
				totalScored += e.scored || 0;
			}
		} catch {}
		const avgAttempted = +(totalAttempted / n).toFixed(1);
		const avgScored = +(totalScored / n).toFixed(1);
		const accuracy = totalAttempted ? Math.round(totalScored / totalAttempted * 100) : 0;
		const autoLeaveRate = Math.round(scouts.reduce((s, r) => s + r.auto_leave, 0) / n * 100);
		const avgAutoCls = +(scouts.reduce((s, r) => s + r.auto_classified, 0) / n).toFixed(1);
		const avgTelCls = +(scouts.reduce((s, r) => s + r.teleop_classified, 0) / n).toFixed(1);
		const avgTelOvf = +(scouts.reduce((s, r) => s + r.teleop_overflow, 0) / n).toFixed(1);
		const gateRate = Math.round(scouts.reduce((s, r) => s + r.opened_gate, 0) / n * 100);
		const avgSkill = +(scouts.reduce((s, r) => s + r.driver_skill, 0) / n).toFixed(1);
		const avgReliability = +(scouts.reduce((s, r) => s + r.reliability, 0) / n).toFixed(1);
		const parkAttempts = scouts.filter((s) => s.endgame_base !== "none");
		const parkRate = Math.round(parkAttempts.length / n * 100);
		const parkFails = scouts.filter((s) => (s.notes || "").includes("[PARK FAILED]")).length;
		const parkSuccessRate = parkAttempts.length ? Math.round((parkAttempts.length - parkFails) / parkAttempts.length * 100) : 0;
		const methods = {};
		for (const s of scouts) {
			const m = (s.notes || "").match(/\[PARK:\s*(normal|tilt|lift)\]/);
			if (m) methods[m[1]] = (methods[m[1]] || 0) + 1;
		}
		let primaryPark = "none";
		let maxCount = 0;
		for (const [k, v] of Object.entries(methods)) if (v > maxCount) {
			primaryPark = k;
			maxCount = v;
		}
		if (parkAttempts.length === 0) primaryPark = "none";
		const disconnects = scouts.filter((s) => (s.notes || "").includes("[DISCONNECTED]")).length;
		const totalScore = avgScored * 3 + avgAutoCls * 2 + parkRate / 100 * 10 + avgSkill * 2 + avgReliability * 2;
		const parts = [];
		parts.push(`Scores ${avgScored}/${avgAttempted} (${accuracy}%)`);
		if (autoLeaveRate > 0) parts.push(`leaves ${autoLeaveRate}%`);
		if (parkRate > 0) parts.push(`${primaryPark !== "none" ? primaryPark : ""} park ${parkSuccessRate}%`);
		if (disconnects > 0) parts.push(`${disconnects} DC`);
		const summary = parts.join(", ");
		return {
			number: t.number,
			name: t.name,
			matches: n,
			avgAttempted,
			avgScored,
			accuracy,
			autoLeaveRate,
			avgAutoCls,
			avgTelCls,
			avgTelOvf,
			gateRate,
			avgSkill,
			avgReliability,
			parkRate,
			primaryPark,
			parkSuccessRate,
			totalScore: +totalScore.toFixed(1),
			disconnects,
			summary
		};
	});
	const scouted = overview.filter((t) => t.matches > 0);
	scouted.sort((a, b) => b.totalScore - a.totalScore);
	const ranked = scouted.map((t, i) => ({
		...t,
		rank: i + 1
	}));
	return {
		ranked,
		unscouted: overview.filter((t) => t.matches === 0),
		highlights: {
			topScorer: ranked.length ? ranked.reduce((a, b) => a.avgScored > b.avgScored ? a : b) : null,
			topAccuracy: ranked.length ? ranked.reduce((a, b) => a.accuracy > b.accuracy ? a : b) : null,
			topReliability: ranked.length ? ranked.reduce((a, b) => a.avgReliability > b.avgReliability ? a : b) : null,
			mostScouted: ranked.length ? ranked.reduce((a, b) => a.matches > b.matches ? a : b) : null
		},
		totalTeams: teams.length,
		scoutedCount: scouted.length,
		totalScouts: allScouts.length
	};
}
//#endregion
export { load };
