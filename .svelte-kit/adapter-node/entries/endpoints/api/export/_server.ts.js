import { t as db } from "../../../../chunks/db.js";
//#region src/routes/api/export/+server.ts
function GET({ url }) {
	const format = url.searchParams.get("format") || "csv";
	const rows = db.prepare(`
    SELECT
      m.match_number,
      ms.team_number,
      t.name as team_name,
      s.name as scouter_name,
      ms.auto_leave,
      ms.auto_classified,
      ms.auto_overflow,
      ms.teleop_classified,
      ms.teleop_overflow,
      ms.opened_gate,
      ms.endgame_base,
      ms.defense_rating,
      ms.driver_skill,
      ms.reliability,
      ms.notes,
      ms.created_at,
      m.score_red,
      m.score_blue
    FROM match_scouts ms
    JOIN matches m ON ms.match_id = m.id
    JOIN teams t ON ms.team_number = t.number
    JOIN scouters s ON ms.scouter_id = s.id
    ORDER BY m.match_number, ms.team_number
  `).all();
	if (format === "json") return new Response(JSON.stringify(rows, null, 2), { headers: {
		"Content-Type": "application/json",
		"Content-Disposition": "attachment; filename=\"hivescout-export.json\""
	} });
	const headers = [
		"match_number",
		"team_number",
		"team_name",
		"scouter_name",
		"auto_leave",
		"auto_classified",
		"auto_overflow",
		"teleop_classified",
		"teleop_overflow",
		"opened_gate",
		"endgame_base",
		"defense_rating",
		"driver_skill",
		"reliability",
		"notes",
		"created_at",
		"score_red",
		"score_blue"
	];
	const csvLines = [headers.join(",")];
	for (const row of rows) {
		const values = headers.map((h) => {
			const val = row[h];
			if (val === null || val === void 0) return "";
			const str = String(val);
			if (str.includes(",") || str.includes("\"") || str.includes("\n")) return `"${str.replace(/"/g, "\"\"")}"`;
			return str;
		});
		csvLines.push(values.join(","));
	}
	return new Response(csvLines.join("\n"), { headers: {
		"Content-Type": "text/csv",
		"Content-Disposition": "attachment; filename=\"hivescout-export.csv\""
	} });
}
//#endregion
export { GET };
