import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/analytics/+server.ts
function GET({ url }) {
	const team = url.searchParams.get("team");
	if (team) return json({
		team: db.prepare("SELECT * FROM teams WHERE number = ?").get(Number(team)),
		stats: db.prepare(`
      SELECT
        COUNT(*) as matches_scouted,
        AVG(auto_leave) as auto_leave_rate,
        AVG(auto_classified) as avg_auto_classified,
        AVG(auto_overflow) as avg_auto_overflow,
        AVG(auto_pattern_matches) as avg_auto_pattern,
        AVG(teleop_classified) as avg_teleop_classified,
        AVG(teleop_overflow) as avg_teleop_overflow,
        AVG(teleop_depot) as avg_teleop_depot,
        AVG(teleop_pattern_matches) as avg_teleop_pattern,
        AVG(opened_gate) as gate_rate,
        AVG(driver_skill) as avg_driver_skill,
        AVG(reliability) as avg_reliability
      FROM match_scouts
      WHERE team_number = ?
    `).get(Number(team)),
		prescout: db.prepare("SELECT * FROM prescout_responses WHERE team_number = ? ORDER BY created_at DESC LIMIT 1").get(Number(team))
	});
	return json(db.prepare(`
    SELECT
      t.number, t.name,
      COUNT(ms.id) as matches_scouted,
      COALESCE(ROUND(AVG(ms.auto_leave), 2), 0) as auto_leave_rate,
      COALESCE(ROUND(AVG(ms.auto_classified), 1), 0) as avg_auto_classified,
      COALESCE(ROUND(AVG(ms.teleop_classified), 1), 0) as avg_teleop_classified,
      COALESCE(ROUND(AVG(ms.teleop_overflow), 1), 0) as avg_teleop_overflow,
      COALESCE(ROUND(AVG(ms.teleop_depot), 1), 0) as avg_teleop_depot,
      COALESCE(ROUND(AVG(ms.teleop_pattern_matches), 1), 0) as avg_teleop_pattern,
      COALESCE(ROUND(AVG(ms.opened_gate), 2), 0) as gate_rate,
      COALESCE(ROUND(AVG(ms.driver_skill), 1), 0) as avg_skill,
      COALESCE(ROUND(AVG(ms.reliability), 1), 0) as avg_reliability
    FROM teams t
    LEFT JOIN match_scouts ms ON t.number = ms.team_number
    GROUP BY t.number
    ORDER BY t.number
  `).all());
}
//#endregion
export { GET };
