import { t as db } from "../../../../chunks/db.js";
//#region src/routes/manager/scouters/+page.server.ts
function load() {
	return {
		scouters: db.prepare(`
    SELECT s.*,
      COUNT(DISTINCT ms.id) as scout_count,
      gm.group_id,
      g.name as group_name
    FROM scouters s
    LEFT JOIN match_scouts ms ON s.id = ms.scouter_id
    LEFT JOIN scout_group_members gm ON s.id = gm.scouter_id
    LEFT JOIN scout_groups g ON gm.group_id = g.id
    GROUP BY s.id
    ORDER BY s.name
  `).all(),
		teams: db.prepare("SELECT * FROM teams ORDER BY number").all(),
		groups: db.prepare(`
    SELECT g.*
    FROM scout_groups g
    ORDER BY g.sort_order, g.id
  `).all(),
		groupMembers: db.prepare(`
    SELECT gm.*, s.name as scouter_name
    FROM scout_group_members gm
    JOIN scouters s ON gm.scouter_id = s.id
    ORDER BY s.name
  `).all(),
		assignmentCount: db.prepare("SELECT COUNT(*) as c FROM shift_assignments").get().c,
		schedulePreview: db.prepare(`
    SELECT sa.*, m.match_number, s.name as scouter_name, g.name as group_name, t.name as team_name
    FROM shift_assignments sa
    JOIN matches m ON sa.match_id = m.id
    JOIN scouters s ON sa.scouter_id = s.id
    JOIN scout_groups g ON sa.group_id = g.id
    JOIN teams t ON sa.team_number = t.number
    ORDER BY m.match_number, sa.id
  `).all()
	};
}
//#endregion
export { load };
