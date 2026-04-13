import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/teams/+server.ts
function GET({ url }) {
	const division = url.searchParams.get("division") || "default";
	return json(db.prepare("SELECT * FROM teams WHERE division = ? ORDER BY number").all(division));
}
function POST({ request }) {
	return (async () => {
		const { number, name, division } = await request.json();
		db.prepare("INSERT OR REPLACE INTO teams (number, name, division) VALUES (?, ?, ?)").run(number, name, division || "default");
		return json({ success: true });
	})();
}
//#endregion
export { GET, POST };
