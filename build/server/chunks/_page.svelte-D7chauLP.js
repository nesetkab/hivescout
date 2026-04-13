import { a4 as attr_class, R as escape_html, a2 as ensure_array_like, K as derived } from './server-CrZugHhs.js';

//#region src/routes/scout/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let nextAssignment = derived(() => {
			return data.schedule.find((s) => !data.scoutedMatchIds.includes(s.match_id));
		});
		let timeline = derived(() => {
			if (data.schedule.length === 0) return [];
			const allNums = data.allMatchNumbers;
			const assignedNums = new Set(data.schedule.map((s) => s.match_number));
			const items = [];
			let i = 0;
			while (i < allNums.length) {
				const num = allNums[i];
				if (assignedNums.has(num)) {
					const a = data.schedule.find((s) => s.match_number === num);
					items.push({
						type: "match",
						match_number: num,
						team_number: a.team_number,
						team_name: a.team_name,
						scouted: data.scoutedMatchIds.includes(a.match_id),
						match_id: a.match_id
					});
					i++;
				} else {
					const breakStart = num;
					let breakEnd = num;
					while (i < allNums.length && !assignedNums.has(allNums[i])) {
						breakEnd = allNums[i];
						i++;
					}
					items.push({
						type: "break",
						from: breakStart,
						to: breakEnd,
						count: breakEnd - breakStart + 1
					});
				}
			}
			return items;
		});
		let isOnBreak = derived(() => !nextAssignment() && data.schedule.length > 0);
		let nextBreak = derived(() => {
			if (!nextAssignment()) return null;
			const idx = timeline().findIndex((t) => t.type === "break" && t.from > nextAssignment().match_number);
			return idx >= 0 ? timeline()[idx] : null;
		});
		$$renderer.push(`<div class="dashboard svelte-f78o7d"><h2 class="svelte-f78o7d">Dashboard</h2> `);
		if (data.schedule.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div${attr_class("status-card card svelte-f78o7d", void 0, { "on-break": isOnBreak() })}>`);
			if (nextAssignment()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="status-label svelte-f78o7d">NEXT UP</div> <div class="next-match svelte-f78o7d"><span class="next-q svelte-f78o7d">Q${escape_html(nextAssignment().match_number)}</span> <span class="next-team svelte-f78o7d">Scout #${escape_html(nextAssignment().team_number)} <span class="dim svelte-f78o7d">${escape_html(nextAssignment().team_name)}</span></span></div> `);
				if (nextBreak()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="next-break svelte-f78o7d">Break after Q${escape_html(nextBreak().from - 1)} (${escape_html(nextBreak().count)} matches off)</div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else if (isOnBreak()) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<div class="status-label break-label svelte-f78o7d">ON BREAK</div> <div class="break-msg svelte-f78o7d">No more assignments</div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="status-label svelte-f78o7d">SCHEDULE COMPLETE</div>`);
			}
			$$renderer.push(`<!--]--> `);
			if (data.groupInfo) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="group-tag svelte-f78o7d">${escape_html(data.groupInfo.group_name)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <section class="svelte-f78o7d"><h3 class="svelte-f78o7d">Your Schedule</h3> <div class="timeline svelte-f78o7d"><!--[-->`);
			const each_array = ensure_array_like(timeline());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				if (item.type === "match") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div${attr_class("tl-item svelte-f78o7d", void 0, {
						"scouted": item.scouted,
						"next": nextAssignment() && item.match_number === nextAssignment().match_number
					})}><span class="tl-q svelte-f78o7d">Q${escape_html(item.match_number)}</span> <span class="tl-team svelte-f78o7d">#${escape_html(item.team_number)}</span> <span class="tl-name svelte-f78o7d">${escape_html(item.team_name)}</span> `);
					if (item.scouted) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="tl-done svelte-f78o7d">done</span>`);
					} else if (nextAssignment() && item.match_number === nextAssignment().match_number) {
						$$renderer.push("<!--[1-->");
						$$renderer.push(`<span class="tl-next svelte-f78o7d">next</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="tl-break svelte-f78o7d">BREAK Q${escape_html(item.from)}-Q${escape_html(item.to)}</div>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div></section>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="card"><p class="dim svelte-f78o7d">No shift schedule assigned yet. Ask your manager to generate one.</p></div>`);
		}
		$$renderer.push(`<!--]--> `);
		if (data.assignments.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="svelte-f78o7d"><h3 class="svelte-f78o7d">Assigned Teams</h3> <div class="team-list svelte-f78o7d"><!--[-->`);
			const each_array_1 = ensure_array_like(data.assignments);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let a = each_array_1[$$index_1];
				$$renderer.push(`<div class="card team-card svelte-f78o7d"><span class="team-num svelte-f78o7d">#${escape_html(a.team_number)}</span> <span>${escape_html(a.team_name)}</span></div>`);
			}
			$$renderer.push(`<!--]--></div></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <section class="svelte-f78o7d"><h3 class="svelte-f78o7d">All Matches (${escape_html(data.matches.length)})</h3> `);
		if (data.matches.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="dim svelte-f78o7d">No matches loaded yet</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="match-list svelte-f78o7d"><!--[-->`);
			const each_array_2 = ensure_array_like(data.matches.slice(0, 20));
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let match = each_array_2[$$index_2];
				$$renderer.push(`<div class="card match-card svelte-f78o7d"><div class="match-header svelte-f78o7d"><span class="match-num svelte-f78o7d">Q${escape_html(match.match_number)}</span></div> <div class="alliances svelte-f78o7d"><div class="alliance svelte-f78o7d"><span class="badge red">RED</span> <span>${escape_html(match.red1 || "?")} / ${escape_html(match.red2 || "?")}</span></div> <div class="alliance svelte-f78o7d"><span class="badge blue">BLUE</span> <span>${escape_html(match.blue1 || "?")} / ${escape_html(match.blue2 || "?")}</span></div></div></div>`);
			}
			$$renderer.push(`<!--]--> `);
			if (data.matches.length > 20) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="dim svelte-f78o7d">+ ${escape_html(data.matches.length - 20)} more matches</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></section></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D7chauLP.js.map
