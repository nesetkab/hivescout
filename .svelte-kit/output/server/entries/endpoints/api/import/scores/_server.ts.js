import { t as db } from "../../../../../chunks/db.js";
import { t as getEventMatches } from "../../../../../chunks/ftc-api.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/import/scores/+server.ts
function POST({ request }) {
	return (async () => {
		const { eventCode } = await request.json();
		if (!eventCode) return json({ error: "eventCode required" }, { status: 400 });
		const qualMatches = (await getEventMatches(eventCode)).filter((m) => m.tournamentLevel === "QUALIFICATION" || m.tournamentLevel === "qual");
		const updateScore = db.prepare(`
      UPDATE matches
      SET score_red = ?, score_blue = ?, status = 'completed'
      WHERE match_number = ? AND division = ?
    `);
		let updated = 0;
		db.transaction(() => {
			for (const m of qualMatches) if (m.scoreRedFinal !== null && m.scoreRedFinal !== -1) {
				if (updateScore.run(m.scoreRedFinal, m.scoreBlueFinal, m.matchNumber, eventCode).changes > 0) updated++;
			}
		})();
		return json({
			success: true,
			eventCode,
			updated
		});
	})();
}
//#endregion
export { POST };
