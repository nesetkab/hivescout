import { d as db } from './db-Cl30lYRM.js';
import { error } from '@sveltejs/kit';
import 'better-sqlite3';
import 'path';

//#region src/routes/manager/analytics/[team]/+page.server.ts
function load({ params }) {
	const teamNum = Number(params.team);
	const team = db.prepare("SELECT * FROM teams WHERE number = ?").get(teamNum);
	if (!team) throw error(404, "Team not found");
	const rawScouts = db.prepare(`
    SELECT ms.*, m.match_number, s.name as scouter_name
    FROM match_scouts ms
    JOIN matches m ON ms.match_id = m.id
    JOIN scouters s ON ms.scouter_id = s.id
    WHERE ms.team_number = ?
    ORDER BY m.match_number
  `).all(teamNum);
	const matchCount = rawScouts.length;
	const allEvents = [];
	const perMatch = [];
	for (const row of rawScouts) {
		let events = [];
		try {
			events = JSON.parse(row.scoring_events || "[]");
		} catch {}
		allEvents.push(...events);
		const notes = row.notes || "";
		const parkMatch = notes.match(/\[PARK:\s*(normal|tilt|lift)\]/);
		const parkMethod = parkMatch ? parkMatch[1] : "none";
		const parkFailed = notes.includes("[PARK FAILED]");
		const disconnected = notes.includes("[DISCONNECTED]");
		const matchAttempted = events.reduce((s, e) => s + (e.attempted || 0), 0);
		const matchScored = events.reduce((s, e) => s + (e.scored || 0), 0);
		perMatch.push({
			match_number: row.match_number,
			attempted: matchAttempted,
			scored: matchScored,
			auto_leave: row.auto_leave,
			auto_classified: row.auto_classified,
			auto_overflow: row.auto_overflow,
			opened_gate: row.opened_gate,
			endgame_base: row.endgame_base,
			park_method: parkMethod,
			park_failed: parkFailed,
			disconnected,
			driver_skill: row.driver_skill,
			reliability: row.reliability,
			defense_rating: row.defense_rating
		});
	}
	const totalAttempted = perMatch.reduce((s, m) => s + m.attempted, 0);
	const totalScored = perMatch.reduce((s, m) => s + m.scored, 0);
	const avgAttempted = matchCount ? +(totalAttempted / matchCount).toFixed(1) : 0;
	const avgScored = matchCount ? +(totalScored / matchCount).toFixed(1) : 0;
	const scoringRate = totalAttempted ? Math.round(totalScored / totalAttempted * 100) : 0;
	const varianceScored = matchCount > 1 ? +(perMatch.reduce((s, m) => s + (m.scored - avgScored) ** 2, 0) / matchCount).toFixed(1) : 0;
	const stdDevScored = +Math.sqrt(varianceScored).toFixed(1);
	const leaveRate = matchCount ? Math.round(perMatch.reduce((s, m) => s + m.auto_leave, 0) / matchCount * 100) : 0;
	const avgAutoClassified = matchCount ? +(perMatch.reduce((s, m) => s + m.auto_classified, 0) / matchCount).toFixed(1) : 0;
	const avgAutoOverflow = matchCount ? +(perMatch.reduce((s, m) => s + m.auto_overflow, 0) / matchCount).toFixed(1) : 0;
	const gateRate = matchCount ? Math.round(perMatch.reduce((s, m) => s + m.opened_gate, 0) / matchCount * 100) : 0;
	const parkAttempts = perMatch.filter((m) => m.endgame_base !== "none");
	const parkMethods = {};
	for (const m of parkAttempts) {
		const key = m.park_method !== "none" ? m.park_method : m.endgame_base;
		if (!parkMethods[key]) parkMethods[key] = {
			total: 0,
			failed: 0
		};
		parkMethods[key].total++;
		if (m.park_failed) parkMethods[key].failed++;
	}
	const parkAttemptsCount = parkAttempts.length;
	const parkSuccesses = parkAttempts.filter((m) => !m.park_failed).length;
	const parkSuccessRate = parkAttemptsCount ? Math.round(parkSuccesses / parkAttemptsCount * 100) : 0;
	let primaryParkMethod = "none";
	let primaryParkCount = 0;
	for (const [method, data] of Object.entries(parkMethods)) if (data.total > primaryParkCount) {
		primaryParkMethod = method;
		primaryParkCount = data.total;
	}
	const parkConfidence = parkAttemptsCount ? Math.round(primaryParkCount / parkAttemptsCount * 100) : 0;
	const fullParkCount = parkAttempts.filter((m) => m.endgame_base === "full").length;
	const partialParkCount = parkAttempts.filter((m) => m.endgame_base === "partial").length;
	const noParkCount = perMatch.filter((m) => m.endgame_base === "none").length;
	const avgDriverSkill = matchCount ? +(perMatch.reduce((s, m) => s + m.driver_skill, 0) / matchCount).toFixed(1) : 0;
	const avgReliability = matchCount ? +(perMatch.reduce((s, m) => s + m.reliability, 0) / matchCount).toFixed(1) : 0;
	const avgDefense = matchCount ? +(perMatch.reduce((s, m) => s + m.defense_rating, 0) / matchCount).toFixed(1) : 0;
	const disconnectCount = perMatch.filter((m) => m.disconnected).length;
	let botType = "scorer";
	if (allEvents.length > 0) {
		const avgY = allEvents.reduce((s, e) => s + e.y, 0) / allEvents.length;
		if (avgY < 35) botType = "close";
		else if (avgY > 65) botType = "far";
		else botType = "mid-range";
	}
	let summary = "";
	if (matchCount > 0) {
		const parts = [];
		parts.push(`${team.number} is a ${botType} bot scoring an average of ${avgScored} out of ${avgAttempted} attempted (${scoringRate}% accuracy)`);
		if (leaveRate > 0) {
			parts[0] += `. Leaves in auto ${leaveRate}% of the time`;
			if (avgAutoClassified > 0) parts[0] += ` with ${avgAutoClassified} avg classified`;
		}
		if (parkAttemptsCount > 0) {
			const methodLabel = primaryParkMethod === "none" ? "" : ` with a ${primaryParkMethod}`;
			const baseLabel = fullParkCount >= partialParkCount ? "full" : "partial";
			parts.push(`They ${baseLabel} park${methodLabel} that is ${parkSuccessRate}% consistent`);
		} else parts.push("They do not park");
		if (gateRate > 50) parts.push(`Opens gate ${gateRate}% of the time`);
		if (disconnectCount > 0) parts.push(`Disconnected in ${disconnectCount}/${matchCount} matches`);
		summary = parts.join(". ") + ".";
	} else summary = `No match data for team ${team.number} yet.`;
	return {
		team,
		matchCount,
		perMatch,
		allEvents,
		scoring: {
			avgAttempted,
			avgScored,
			scoringRate,
			stdDevScored
		},
		auto: {
			leaveRate,
			avgClassified: avgAutoClassified,
			avgOverflow: avgAutoOverflow
		},
		gateRate,
		park: {
			attemptsCount: parkAttemptsCount,
			successRate: parkSuccessRate,
			primaryMethod: primaryParkMethod,
			confidence: parkConfidence,
			methods: parkMethods,
			fullCount: fullParkCount,
			partialCount: partialParkCount,
			noCount: noParkCount
		},
		qualitative: {
			avgDriverSkill,
			avgReliability,
			avgDefense,
			disconnectCount
		},
		botType,
		summary
	};
}

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Df6BUw6W.js')).default;
const server_id = "src/routes/manager/analytics/[team]/+page.server.ts";
const imports = ["_app/immutable/nodes/7.DIZbm1iC.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/t62M88qj.js"];
const stylesheets = ["_app/immutable/assets/7.CgiXr6Nc.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-DxC99CEE.js.map
