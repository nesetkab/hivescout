import 'dotenv/config';

//#region src/lib/server/ftc-api.ts
var FTC_API_BASE = "https://ftc-api.firstinspires.org/v2.0";
function getAuth() {
	const user = process.env.FTC_USERNAME;
	const key = process.env.FTC_API_KEY;
	if (!user || !key) throw new Error("Missing FTC_USERNAME or FTC_API_KEY env vars");
	return "Basic " + Buffer.from(`${user}:${key}`).toString("base64");
}
function getSeason() {
	return process.env.FTC_SEASON || "2025";
}
async function ftcFetch(endpoint) {
	const url = `${FTC_API_BASE}/${getSeason()}/${endpoint}`;
	console.log(`[FTC API] ${url}`);
	const res = await fetch(url, { headers: {
		Authorization: getAuth(),
		Accept: "application/json"
	} });
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`FTC API ${res.status}: ${text}`);
	}
	return res.json();
}
async function searchEvents(query) {
	const data = await ftcFetch("events");
	if (!query) return data.events || [];
	const q = query.toLowerCase();
	return (data.events || []).filter((e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q) || e.city.toLowerCase().includes(q));
}
async function getEventTeams(eventCode) {
	const allTeams = [];
	let page = 1;
	while (true) {
		const data = await ftcFetch(`teams?eventCode=${eventCode}&page=${page}`);
		allTeams.push(...data.teams || []);
		if (page >= (data.pageTotal || 1)) break;
		page++;
	}
	return allTeams;
}
async function getEventSchedule(eventCode) {
	return (await ftcFetch(`schedule/${eventCode}?tournamentLevel=qual`)).schedule || [];
}
async function getEventMatches(eventCode) {
	return (await ftcFetch(`matches/${eventCode}`)).matches || [];
}

export { getEventSchedule as a, getEventMatches as b, getEventTeams as g, searchEvents as s };
//# sourceMappingURL=ftc-api-C_fuwGII.js.map
