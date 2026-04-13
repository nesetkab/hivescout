import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/seed-test/+server.ts
function POST() {
	let scouter = db.prepare("SELECT * FROM scouters WHERE name = ?").get("TestBot");
	if (!scouter) {
		db.prepare("INSERT INTO scouters (name) VALUES (?)").run("TestBot");
		scouter = db.prepare("SELECT * FROM scouters WHERE name = ?").get("TestBot");
	}
	const matches = db.prepare("SELECT * FROM matches").all();
	const teams = db.prepare("SELECT number FROM teams").all();
	if (!matches.length || !teams.length) return json({ error: "Import an event first" }, { status: 400 });
	const teamNums = teams.map((t) => t.number);
	const parkMethods = [
		"none",
		"normal",
		"tilt",
		"lift"
	];
	const baseTypes = [
		"none",
		"none",
		"partial",
		"partial",
		"full",
		"full",
		"full"
	];
	let count = 0;
	const insert = db.prepare(`
    INSERT INTO match_scouts (
      match_id, team_number, scouter_id,
      auto_leave, auto_classified, auto_overflow, auto_pattern_matches,
      teleop_classified, teleop_overflow, teleop_depot, teleop_pattern_matches,
      opened_gate, endgame_base,
      defense_rating, driver_skill, reliability,
      minor_fouls, major_fouls, yellow_card, red_card,
      notes, scoring_events, started_at, ended_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
	db.transaction(() => {
		for (const match of matches) {
			const matchTeams = [
				match.red1,
				match.red2,
				match.blue1,
				match.blue2
			].filter(Boolean);
			const toScout = matchTeams.slice(0, 1 + Math.floor(Math.random() * Math.min(2, matchTeams.length)));
			for (const teamNum of toScout) {
				if (!teamNums.includes(teamNum)) continue;
				if (db.prepare("SELECT 1 FROM match_scouts WHERE match_id = ? AND team_number = ? AND scouter_id = ?").get(match.id, teamNum, scouter.id)) continue;
				const autoLeave = Math.random() > .2 ? 1 : 0;
				const openedGate = Math.random() > .5 ? 1 : 0;
				const endgameBase = baseTypes[Math.floor(Math.random() * baseTypes.length)];
				const method = endgameBase !== "none" ? parkMethods[1 + Math.floor(Math.random() * 3)] : "none";
				const parkFailed = endgameBase !== "none" && Math.random() < .15;
				const disconnected = Math.random() < .08;
				const events = [];
				const totalBalls = 50 + Math.floor(Math.random() * 31);
				const autoBalls = 5 + Math.floor(Math.random() * 10);
				const teleopBalls = totalBalls - autoBalls;
				let autoRemaining = autoBalls;
				const autoEventList = [];
				while (autoRemaining > 0) {
					const att = Math.min(autoRemaining, 1 + Math.floor(Math.random() * 3));
					autoEventList.push(att);
					autoRemaining -= att;
				}
				let teleopRemaining = teleopBalls;
				const teleopEventList = [];
				while (teleopRemaining > 0) {
					const att = Math.min(teleopRemaining, 1 + Math.floor(Math.random() * 3));
					teleopEventList.push(att);
					teleopRemaining -= att;
				}
				const teamSeed = teamNum % 100;
				const baseY = teamSeed < 50 ? 8 + teamSeed % 15 : 20 + teamSeed % 25;
				function launchZoneX(y) {
					const t = Math.min(1, y / 50);
					return {
						min: 17 + t * 18,
						max: 83 - t * 18
					};
				}
				function randomLaunchPoint(baseY, spread) {
					const y = Math.max(3, Math.min(48, baseY + (Math.random() - .5) * spread));
					const bounds = launchZoneX(y);
					const x = bounds.min + Math.random() * (bounds.max - bounds.min);
					return {
						x: Math.round(x * 10) / 10,
						y: Math.round(y * 10) / 10
					};
				}
				for (const att of autoEventList) {
					const scored = Math.floor(Math.random() * (att + 1));
					const pos = randomLaunchPoint(baseY, 12);
					events.push({
						phase: "auto",
						x: pos.x,
						y: pos.y,
						attempted: att,
						scored,
						time: Math.floor(Math.random() * 30)
					});
				}
				for (const att of teleopEventList) {
					const scored = Math.floor(Math.random() * (att + 1));
					const pos = randomLaunchPoint(baseY, 18);
					events.push({
						phase: "teleop",
						x: pos.x,
						y: pos.y,
						attempted: att,
						scored,
						time: 45 + Math.floor(Math.random() * 120)
					});
				}
				const autoClassified = events.filter((e) => e.phase === "auto").reduce((s, e) => s + e.scored, 0);
				const autoOverflow = events.filter((e) => e.phase === "auto").reduce((s, e) => s + (e.attempted - e.scored), 0);
				const teleopClassified = events.filter((e) => e.phase === "teleop").reduce((s, e) => s + e.scored, 0);
				const teleopOverflow = events.filter((e) => e.phase === "teleop").reduce((s, e) => s + (e.attempted - e.scored), 0);
				const noteParts = [];
				if (disconnected) noteParts.push("[DISCONNECTED]");
				if (parkFailed) noteParts.push("[PARK FAILED]");
				if (method !== "none") noteParts.push(`[PARK: ${method}]`);
				insert.run(match.id, teamNum, scouter.id, autoLeave, autoClassified, autoOverflow, 0, teleopClassified, teleopOverflow, 0, 0, openedGate, endgameBase, 2 + Math.floor(Math.random() * 4), 2 + Math.floor(Math.random() * 4), 2 + Math.floor(Math.random() * 4), 0, 0, 0, 0, noteParts.join(" "), JSON.stringify(events), (/* @__PURE__ */ new Date()).toISOString(), (/* @__PURE__ */ new Date()).toISOString());
				count++;
			}
		}
	})();
	return json({
		success: true,
		scoutsCreated: count
	});
}
//#endregion
export { POST };
