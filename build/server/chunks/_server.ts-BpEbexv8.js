import { d as db } from './db-Cl30lYRM.js';
import { json } from '@sveltejs/kit';
import 'better-sqlite3';
import 'path';

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

export { GET, POST };
//# sourceMappingURL=_server.ts-BpEbexv8.js.map
