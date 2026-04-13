import { d as db } from './db-Cl30lYRM.js';
import 'better-sqlite3';
import 'path';

//#region src/routes/manager/predictions/+page.server.ts
function load() {
	const teams = db.prepare("SELECT * FROM teams ORDER BY number").all();
	const allScouts = db.prepare(`
    SELECT ms.*, m.match_number
    FROM match_scouts ms
    JOIN matches m ON ms.match_id = m.id
  `).all();
	const matches = db.prepare(`
    SELECT m.*,
      t1.name as red1_name, t2.name as red2_name,
      t3.name as blue1_name, t4.name as blue2_name
    FROM matches m
    LEFT JOIN teams t1 ON m.red1 = t1.number
    LEFT JOIN teams t2 ON m.red2 = t2.number
    LEFT JOIN teams t3 ON m.blue1 = t3.number
    LEFT JOIN teams t4 ON m.blue2 = t4.number
    ORDER BY m.match_number
  `).all();
	const teamMap = /* @__PURE__ */ new Map();
	for (const s of allScouts) {
		if (!teamMap.has(s.team_number)) teamMap.set(s.team_number, []);
		teamMap.get(s.team_number).push(s);
	}
	const teamStats = /* @__PURE__ */ new Map();
	for (const t of teams) {
		const scouts = teamMap.get(t.number) || [];
		const n = scouts.length;
		if (n === 0) {
			teamStats.set(t.number, {
				number: t.number,
				name: t.name,
				matches: 0,
				avgScored: 0,
				avgOverflow: 0,
				autoLeaveRate: 0,
				parkRate: 0,
				avgParkValue: 0,
				predictedContribution: 0
			});
			continue;
		}
		let totalScored = 0;
		for (const s of scouts) try {
			const events = JSON.parse(s.scoring_events || "[]");
			for (const e of events) totalScored += e.scored || 0;
		} catch {}
		const avgScored = +(totalScored / n).toFixed(1);
		const avgOverflow = +(scouts.reduce((sum, r) => sum + (r.auto_overflow || 0) + (r.teleop_overflow || 0), 0) / n).toFixed(1);
		const autoLeaveRate = +(scouts.reduce((sum, r) => sum + r.auto_leave, 0) / n).toFixed(2);
		const parkAttempts = scouts.filter((s) => s.endgame_base !== "none");
		const parkFails = scouts.filter((s) => (s.notes || "").includes("[PARK FAILED]")).length;
		const parkRate = +((parkAttempts.length - parkFails) / n).toFixed(2);
		let totalParkValue = 0;
		let parkCount = 0;
		for (const s of parkAttempts) if (!(s.notes || "").includes("[PARK FAILED]")) {
			totalParkValue += s.endgame_base === "full" ? 10 : 5;
			parkCount++;
		}
		const avgParkValue = parkCount > 0 ? +(totalParkValue / parkCount).toFixed(1) : 0;
		const predictedContribution = +(avgScored * 3 + avgOverflow * 1 + autoLeaveRate * 3 + parkRate * avgParkValue).toFixed(1);
		teamStats.set(t.number, {
			number: t.number,
			name: t.name,
			matches: n,
			avgScored,
			avgOverflow,
			autoLeaveRate,
			parkRate,
			avgParkValue,
			predictedContribution
		});
	}
	const matchPredictions = matches.map((m) => {
		const red1Stats = teamStats.get(m.red1) || null;
		const red2Stats = teamStats.get(m.red2) || null;
		const blue1Stats = teamStats.get(m.blue1) || null;
		const blue2Stats = teamStats.get(m.blue2) || null;
		const red1Contrib = red1Stats?.predictedContribution || 0;
		const red2Contrib = red2Stats?.predictedContribution || 0;
		const blue1Contrib = blue1Stats?.predictedContribution || 0;
		const blue2Contrib = blue2Stats?.predictedContribution || 0;
		const redTotal = +(red1Contrib + red2Contrib).toFixed(1);
		const blueTotal = +(blue1Contrib + blue2Contrib).toFixed(1);
		return {
			id: m.id,
			match_number: m.match_number,
			status: m.status,
			score_red: m.score_red,
			score_blue: m.score_blue,
			red1: {
				number: m.red1,
				name: m.red1_name,
				contribution: red1Contrib,
				matches: red1Stats?.matches || 0
			},
			red2: {
				number: m.red2,
				name: m.red2_name,
				contribution: red2Contrib,
				matches: red2Stats?.matches || 0
			},
			blue1: {
				number: m.blue1,
				name: m.blue1_name,
				contribution: blue1Contrib,
				matches: blue1Stats?.matches || 0
			},
			blue2: {
				number: m.blue2,
				name: m.blue2_name,
				contribution: blue2Contrib,
				matches: blue2Stats?.matches || 0
			},
			redTotal,
			blueTotal,
			margin: +Math.abs(redTotal - blueTotal).toFixed(1),
			winner: redTotal > blueTotal ? "red" : blueTotal > redTotal ? "blue" : "tie"
		};
	});
	const allTeamStats = Array.from(teamStats.values()).sort((a, b) => a.number - b.number);
	return {
		matchPredictions,
		allTeamStats,
		totalMatches: matches.length,
		teamsWithData: allTeamStats.filter((t) => t.matches > 0).length
	};
}

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 8;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-fWzbmjed.js')).default;
const server_id = "src/routes/manager/predictions/+page.server.ts";
const imports = ["_app/immutable/nodes/8.C1kSFikq.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/t62M88qj.js"];
const stylesheets = ["_app/immutable/assets/8.Cw-Wa63C.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=8-2_3EwXj2.js.map
