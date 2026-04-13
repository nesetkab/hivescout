import { t as db } from "../../../../chunks/db.js";
import { i as searchEvents, n as getEventSchedule, r as getEventTeams, t as getEventMatches } from "../../../../chunks/ftc-api.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/import/+server.ts
function GET({ url }) {
	return (async () => {
		const query = url.searchParams.get("search");
		if (query !== null) return json((await searchEvents(query || void 0)).slice(0, 50));
		return json({ error: "Use ?search=query to find events" }, { status: 400 });
	})();
}
function POST({ request }) {
	return (async () => {
		const { eventCode } = await request.json();
		if (!eventCode) return json({ error: "eventCode required" }, { status: 400 });
		const results = {
			teams: 0,
			matches: 0
		};
		const teams = await getEventTeams(eventCode);
		const insertTeam = db.prepare("INSERT OR REPLACE INTO teams (number, name, division) VALUES (?, ?, ?)");
		db.transaction(() => {
			for (const t of teams) {
				insertTeam.run(t.teamNumber, t.nameShort || `Team ${t.teamNumber}`, eventCode);
				results.teams++;
			}
		})();
		let schedule = await getEventSchedule(eventCode);
		let matchResults = await getEventMatches(eventCode);
		const resultMap = /* @__PURE__ */ new Map();
		for (const m of matchResults) if (m.tournamentLevel === "QUALIFICATION" || m.tournamentLevel === "qual") resultMap.set(m.matchNumber, m);
		const qualMatches = (schedule.length ? schedule : matchResults).filter((m) => m.tournamentLevel === "QUALIFICATION" || m.tournamentLevel === "qual");
		const insertMatch = db.prepare(`
      INSERT OR REPLACE INTO matches (id, match_number, division, red1, red2, blue1, blue2, scheduled_time, status, score_red, score_blue)
      VALUES (
        (SELECT id FROM matches WHERE match_number = ? AND division = ?),
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
		db.transaction(() => {
			for (const m of qualMatches) {
				const red = m.teams.filter((t) => t.station.startsWith("Red"));
				const blue = m.teams.filter((t) => t.station.startsWith("Blue"));
				const result = resultMap.get(m.matchNumber);
				const scoreRed = result?.scoreRedFinal != null && result.scoreRedFinal !== -1 ? result.scoreRedFinal : null;
				const scoreBlue = result?.scoreBlueFinal != null && result.scoreBlueFinal !== -1 ? result.scoreBlueFinal : null;
				const hasScore = scoreRed !== null;
				insertMatch.run(m.matchNumber, eventCode, m.matchNumber, eventCode, red[0]?.teamNumber || null, red[1]?.teamNumber || null, blue[0]?.teamNumber || null, blue[1]?.teamNumber || null, m.scheduledStartTime || m.actualStartTime || null, hasScore ? "completed" : "upcoming", scoreRed, scoreBlue);
				results.matches++;
			}
		})();
		return json({
			success: true,
			eventCode,
			imported: results
		});
	})();
}
//#endregion
export { GET, POST };
