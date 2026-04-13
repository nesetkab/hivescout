import { R as escape_html, a2 as ensure_array_like, a4 as attr_class, a3 as attr } from './server-CrZugHhs.js';

//#region src/routes/manager/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let noteQuery = "";
		let noteTeam = "";
		$$renderer.push(`<div class="overview svelte-t8z5n4"><h2>Overview</h2> <div class="stats-grid svelte-t8z5n4"><div class="card stat svelte-t8z5n4"><span class="stat-value svelte-t8z5n4">${escape_html(data.teamCount)}</span> <span class="stat-label svelte-t8z5n4">Teams</span></div> <div class="card stat svelte-t8z5n4"><span class="stat-value svelte-t8z5n4">${escape_html(data.matchCount)}</span> <span class="stat-label svelte-t8z5n4">Matches</span></div> <div class="card stat svelte-t8z5n4"><span class="stat-value svelte-t8z5n4">${escape_html(data.scouterCount)}</span> <span class="stat-label svelte-t8z5n4">Scouters</span></div> <div class="card stat svelte-t8z5n4"><span class="stat-value svelte-t8z5n4">${escape_html(data.matchScoutCount)}</span> <span class="stat-label svelte-t8z5n4">Match Scouts</span></div> <div class="card stat svelte-t8z5n4"><span class="stat-value svelte-t8z5n4">${escape_html(data.prescoutCount)}</span> <span class="stat-label svelte-t8z5n4">Pre-Scouts</span></div></div> <section><h3 class="svelte-t8z5n4">Recent Scouting Activity</h3> `);
		if (data.recentScouts.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="empty svelte-t8z5n4">No match scouts submitted yet</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<table class="svelte-t8z5n4"><thead><tr><th class="svelte-t8z5n4">Match</th><th class="svelte-t8z5n4">Score</th><th class="svelte-t8z5n4">Team</th><th class="svelte-t8z5n4">Scouter</th><th class="svelte-t8z5n4">A.Cls</th><th class="svelte-t8z5n4">T.Cls</th><th class="svelte-t8z5n4">BASE</th></tr></thead><tbody><!--[-->`);
			const each_array = ensure_array_like(data.recentScouts);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let s = each_array[$$index];
				const isRed = s.team_number === s.red1 || s.team_number === s.red2;
				$$renderer.push(`<tr><td class="svelte-t8z5n4">Q${escape_html(s.match_number)}</td><td class="svelte-t8z5n4">`);
				if (s.score_red != null) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="score-cell svelte-t8z5n4"><span class="red-text svelte-t8z5n4">${escape_html(s.score_red)}</span>-<span class="blue-text svelte-t8z5n4">${escape_html(s.score_blue)}</span> `);
					if (isRed) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span${attr_class("result-badge svelte-t8z5n4", void 0, {
							"win": s.score_red > s.score_blue,
							"loss": s.score_red < s.score_blue
						})}>${escape_html(s.score_red > s.score_blue ? "W" : s.score_red < s.score_blue ? "L" : "T")}</span>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<span${attr_class("result-badge svelte-t8z5n4", void 0, {
							"win": s.score_blue > s.score_red,
							"loss": s.score_blue < s.score_red
						})}>${escape_html(s.score_blue > s.score_red ? "W" : s.score_blue < s.score_red ? "L" : "T")}</span>`);
					}
					$$renderer.push(`<!--]--></span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="no-score svelte-t8z5n4">--</span>`);
				}
				$$renderer.push(`<!--]--></td><td class="svelte-t8z5n4">#${escape_html(s.team_number)} ${escape_html(s.team_name)}</td><td class="svelte-t8z5n4">${escape_html(s.scouter_name)}</td><td class="svelte-t8z5n4">${escape_html(s.auto_classified)}${escape_html(s.auto_leave ? " +L" : "")}</td><td class="svelte-t8z5n4">${escape_html(s.teleop_classified)}c ${escape_html(s.teleop_overflow)}o</td><td class="svelte-t8z5n4">${escape_html(s.endgame_base)}</td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table>`);
		}
		$$renderer.push(`<!--]--></section> <section><h3 class="svelte-t8z5n4">Notes Search</h3> <div class="search-bar svelte-t8z5n4"><input${attr("value", noteQuery)} placeholder="Search notes (e.g. broken, fast, tipped...)" class="svelte-t8z5n4"/> `);
		$$renderer.select({
			value: noteTeam,
			class: ""
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`All teams`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like(data.teams || []);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let t = each_array_1[$$index_1];
				$$renderer.option({ value: t.number }, ($$renderer) => {
					$$renderer.push(`#${escape_html(t.number)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		}, "svelte-t8z5n4");
		$$renderer.push(` <button class="primary"${attr("disabled", (true), true)}>${escape_html("Search")}</button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></section></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-kg9FO9w3.js.map
