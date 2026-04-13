import { a3 as attr, a2 as ensure_array_like, R as escape_html } from './server-CrZugHhs.js';
import './client-DdAPveIL.js';
import './internal-Bb7m12Lp.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

//#region src/routes/manager/setup/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let eventSearch = "";
		let eventResults = [];
		let importing = false;
		let teamNumber = "";
		let teamName = "";
		let matchNumber = "";
		let red1 = "";
		let red2 = "";
		let blue1 = "";
		let blue2 = "";
		let syncEventCode = "";
		let seeding = false;
		$$renderer.push(`<div class="setup-page svelte-l4e0ki"><h2>Event Setup</h2> <div class="card import-section svelte-l4e0ki"><h3 class="svelte-l4e0ki">Import from FTC Events</h3> <p class="hint svelte-l4e0ki">Search for an event to auto-import all teams and qualification matches</p> <div class="search-row svelte-l4e0ki"><input${attr("value", eventSearch)} placeholder="Search events (e.g. 'world', 'michigan', 'USMIDET')" class="svelte-l4e0ki"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (eventResults.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="event-results svelte-l4e0ki"><!--[-->`);
			const each_array = ensure_array_like(eventResults);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let evt = each_array[$$index];
				$$renderer.push(`<div class="event-row svelte-l4e0ki"><div class="event-info svelte-l4e0ki"><span class="event-code svelte-l4e0ki">${escape_html(evt.code)}</span> <span class="event-name svelte-l4e0ki">${escape_html(evt.name)}</span> <span class="event-loc svelte-l4e0ki">${escape_html(evt.city)}, ${escape_html(evt.stateprov)} -- ${escape_html(evt.dateStart?.slice(0, 10))}</span></div> <button class="primary"${attr("disabled", importing, true)}>Import</button></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="card import-section svelte-l4e0ki"><h3 class="svelte-l4e0ki">Sync Match Scores</h3> <p class="hint svelte-l4e0ki">Pull actual match scores from the FTC Events API for a previously imported event</p> <form class="search-row svelte-l4e0ki"><input${attr("value", syncEventCode)} placeholder="Event code (e.g. USMIDET)" class="svelte-l4e0ki"/> <button type="submit" class="primary"${attr("disabled", !syncEventCode.trim(), true)}>${escape_html("Sync Scores")}</button></form> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="panels svelte-l4e0ki"><div class="panel svelte-l4e0ki"><div class="card"><h3 class="svelte-l4e0ki">Add Team Manually</h3> <form class="svelte-l4e0ki"><input${attr("value", teamNumber)} type="number" placeholder="Team number"/> <input${attr("value", teamName)} placeholder="Team name"/> <button type="submit" class="primary"${attr("disabled", true, true)}>Add Team</button></form></div> <div class="card"><h3 class="svelte-l4e0ki">Teams (${escape_html(data.teams.length)})</h3> <div class="item-list svelte-l4e0ki"><!--[-->`);
		const each_array_1 = ensure_array_like(data.teams);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let team = each_array_1[$$index_1];
			$$renderer.push(`<div class="item svelte-l4e0ki"><span class="team-num svelte-l4e0ki">#${escape_html(team.number)}</span> <span>${escape_html(team.name)}</span></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div> <div class="panel svelte-l4e0ki"><div class="card"><h3 class="svelte-l4e0ki">Add Match Manually</h3> <form class="svelte-l4e0ki"><input${attr("value", matchNumber)} type="number" placeholder="Match number"/> <div class="alliance-inputs svelte-l4e0ki"><div class="alliance-col svelte-l4e0ki"><span class="badge red">RED</span> `);
		$$renderer.select({ value: red1 }, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`Red 1...`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_2 = ensure_array_like(data.teams);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let t = each_array_2[$$index_2];
				$$renderer.option({ value: t.number }, ($$renderer) => {
					$$renderer.push(`#${escape_html(t.number)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(` `);
		$$renderer.select({ value: red2 }, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`Red 2...`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_3 = ensure_array_like(data.teams);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let t = each_array_3[$$index_3];
				$$renderer.option({ value: t.number }, ($$renderer) => {
					$$renderer.push(`#${escape_html(t.number)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <div class="alliance-col svelte-l4e0ki"><span class="badge blue">BLUE</span> `);
		$$renderer.select({ value: blue1 }, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`Blue 1...`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_4 = ensure_array_like(data.teams);
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let t = each_array_4[$$index_4];
				$$renderer.option({ value: t.number }, ($$renderer) => {
					$$renderer.push(`#${escape_html(t.number)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(` `);
		$$renderer.select({ value: blue2 }, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`Blue 2...`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_5 = ensure_array_like(data.teams);
			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let t = each_array_5[$$index_5];
				$$renderer.option({ value: t.number }, ($$renderer) => {
					$$renderer.push(`#${escape_html(t.number)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div></div> <button type="submit" class="primary"${attr("disabled", true, true)}>Add Match</button></form></div> <div class="card"><div class="card-header svelte-l4e0ki"><h3 class="svelte-l4e0ki">Matches (${escape_html(data.matches.length)})</h3> `);
		if (data.matches.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="danger small svelte-l4e0ki">Clear All</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="item-list svelte-l4e0ki"><!--[-->`);
		const each_array_6 = ensure_array_like(data.matches);
		for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
			let match = each_array_6[$$index_6];
			$$renderer.push(`<div class="item match-item svelte-l4e0ki"><span class="match-num svelte-l4e0ki">Q${escape_html(match.match_number)}</span> <span class="alliance-info svelte-l4e0ki"><span class="red-text svelte-l4e0ki">${escape_html(match.red1 || "?")} / ${escape_html(match.red2 || "?")}</span> vs <span class="blue-text svelte-l4e0ki">${escape_html(match.blue1 || "?")} / ${escape_html(match.blue2 || "?")}</span></span></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div></div> <div class="demo-section svelte-l4e0ki"><button${attr("disabled", seeding, true)}>${escape_html("Generate Random Scout Data")}</button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C6kMKMPI.js.map
