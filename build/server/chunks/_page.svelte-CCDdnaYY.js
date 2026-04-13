import { a2 as ensure_array_like, a4 as attr_class, R as escape_html, K as derived } from './server-CrZugHhs.js';
import './client-DdAPveIL.js';
import './internal-Bb7m12Lp.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

//#region src/routes/scout/match/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let selectedMatch = "";
		let selectedTeam = "";
		let upcomingAssignments = derived(() => (data.schedule || []).filter((a) => !data.scoutedMatchIds?.includes(a.match_id)));
		let hasSchedule = derived(() => (data.schedule || []).length > 0);
		$$renderer.push(`<div class="match-scout svelte-18k7chz">`);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<h2 class="svelte-18k7chz">Match Scout - DECODE</h2> `);
			if (hasSchedule() && true) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="setup svelte-18k7chz">`);
				if (upcomingAssignments().length > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="assignment-list svelte-18k7chz"><!--[-->`);
					const each_array = ensure_array_like(upcomingAssignments().slice(0, 5));
					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let a = each_array[i];
						$$renderer.push(`<button${attr_class("assignment-btn svelte-18k7chz", void 0, {
							"next": i === 0,
							"selected": selectedMatch == a.match_id && selectedTeam == a.team_number
						})}><span class="asgn-q svelte-18k7chz">Q${escape_html(a.match_number)}</span> <span class="asgn-team svelte-18k7chz">#${escape_html(a.team_number)}</span> <span class="asgn-name svelte-18k7chz">${escape_html(a.team_name)}</span> `);
						if (i === 0) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="asgn-badge svelte-18k7chz">NEXT</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></button>`);
					}
					$$renderer.push(`<!--]--> `);
					if (upcomingAssignments().length > 5) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="dim-text svelte-18k7chz">+${escape_html(upcomingAssignments().length - 5)} more</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<p class="dim-text svelte-18k7chz">All scheduled matches scouted</p>`);
				}
				$$renderer.push(`<!--]--> <button class="link-btn svelte-18k7chz">Choose manually</button> `);
				if (selectedTeam) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="primary start-btn svelte-18k7chz">Start Match Timer</button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="setup svelte-18k7chz">`);
				if (hasSchedule()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="link-btn svelte-18k7chz">Back to schedule</button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <label class="svelte-18k7chz">Match `);
				$$renderer.select({
					value: selectedMatch,
					onchange: () => selectedTeam = "",
					class: ""
				}, ($$renderer) => {
					$$renderer.option({
						value: "",
						class: ""
					}, ($$renderer) => {
						$$renderer.push(`Select match...`);
					}, "svelte-18k7chz");
					$$renderer.push(`<!--[-->`);
					const each_array_1 = ensure_array_like(data.matches);
					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let match = each_array_1[$$index_1];
						$$renderer.option({
							value: match.id,
							class: ""
						}, ($$renderer) => {
							$$renderer.push(`Q${escape_html(match.match_number)}`);
						}, "svelte-18k7chz");
					}
					$$renderer.push(`<!--]-->`);
				}, "svelte-18k7chz");
				$$renderer.push(`</label> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (selectedTeam) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="primary start-btn svelte-18k7chz">Start Match Timer</button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CCDdnaYY.js.map
