import { R as escape_html, a3 as attr, a7 as stringify, a4 as attr_class, a2 as ensure_array_like, a8 as attr_style, K as derived } from './server-CrZugHhs.js';

//#region src/routes/manager/analytics/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let search = "";
		let sortBy = "totalScore";
		let sortDir = "desc";
		let view = "cards";
		let filtered = derived(() => {
			let arr = [...data.ranked];
			arr.sort((a, b) => {
				const av = a[sortBy];
				const bv = b[sortBy];
				const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
				return sortDir === "asc" ? cmp : -cmp;
			});
			return arr;
		});
		function tierColor(rank, total) {
			const pct = rank / total;
			if (pct <= .15) return "tier-s";
			if (pct <= .35) return "tier-a";
			if (pct <= .6) return "tier-b";
			return "tier-c";
		}
		function barWidth(val, max) {
			return `${Math.min(100, Math.max(2, val / max * 100))}%`;
		}
		let maxScored = derived(() => Math.max(...data.ranked.map((t) => t.avgScored), 1));
		let maxAttempted = derived(() => Math.max(...data.ranked.map((t) => t.avgAttempted), 1));
		$$renderer.push(`<div class="analytics svelte-138aw5j"><div class="header-row svelte-138aw5j"><h2>Analytics</h2> <div class="header-stats svelte-138aw5j"><span>${escape_html(data.scoutedCount)}/${escape_html(data.totalTeams)} teams scouted</span> <span>${escape_html(data.totalScouts)} total scouts</span> <a href="/api/export?format=csv" class="export-btn svelte-138aw5j">Export CSV</a> <a href="/api/export?format=json" class="export-btn svelte-138aw5j">Export JSON</a></div></div> `);
		if (data.highlights.topScorer) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="highlights svelte-138aw5j"><div class="highlight card svelte-138aw5j"><span class="hl-label svelte-138aw5j">Top Scorer</span> <a${attr("href", `/manager/analytics/${stringify(data.highlights.topScorer.number)}`)} class="hl-value svelte-138aw5j">#${escape_html(data.highlights.topScorer.number)}</a> <span class="hl-detail svelte-138aw5j">${escape_html(data.highlights.topScorer.avgScored)} avg</span></div> <div class="highlight card svelte-138aw5j"><span class="hl-label svelte-138aw5j">Best Accuracy</span> <a${attr("href", `/manager/analytics/${stringify(data.highlights.topAccuracy.number)}`)} class="hl-value svelte-138aw5j">#${escape_html(data.highlights.topAccuracy.number)}</a> <span class="hl-detail svelte-138aw5j">${escape_html(data.highlights.topAccuracy.accuracy)}%</span></div> <div class="highlight card svelte-138aw5j"><span class="hl-label svelte-138aw5j">Most Reliable</span> <a${attr("href", `/manager/analytics/${stringify(data.highlights.topReliability.number)}`)} class="hl-value svelte-138aw5j">#${escape_html(data.highlights.topReliability.number)}</a> <span class="hl-detail svelte-138aw5j">${escape_html(data.highlights.topReliability.avgReliability)}/5</span></div> <div class="highlight card svelte-138aw5j"><span class="hl-label svelte-138aw5j">Most Data</span> <a${attr("href", `/manager/analytics/${stringify(data.highlights.mostScouted.number)}`)} class="hl-value svelte-138aw5j">#${escape_html(data.highlights.mostScouted.number)}</a> <span class="hl-detail svelte-138aw5j">${escape_html(data.highlights.mostScouted.matches)} matches</span></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="controls svelte-138aw5j"><input${attr("value", search)} placeholder="Search teams..." class="search-input svelte-138aw5j"/> <div class="sort-controls svelte-138aw5j">`);
		$$renderer.select({
			value: sortBy,
			onchange: () => {
				sortDir = "desc";
			},
			class: ""
		}, ($$renderer) => {
			$$renderer.option({ value: "totalScore" }, ($$renderer) => {
				$$renderer.push(`Power Score`);
			});
			$$renderer.option({ value: "avgScored" }, ($$renderer) => {
				$$renderer.push(`Avg Scored`);
			});
			$$renderer.option({ value: "accuracy" }, ($$renderer) => {
				$$renderer.push(`Accuracy`);
			});
			$$renderer.option({ value: "avgAttempted" }, ($$renderer) => {
				$$renderer.push(`Avg Attempted`);
			});
			$$renderer.option({ value: "autoLeaveRate" }, ($$renderer) => {
				$$renderer.push(`Auto Leave`);
			});
			$$renderer.option({ value: "avgAutoCls" }, ($$renderer) => {
				$$renderer.push(`Auto Classified`);
			});
			$$renderer.option({ value: "gateRate" }, ($$renderer) => {
				$$renderer.push(`Gate Rate`);
			});
			$$renderer.option({ value: "parkRate" }, ($$renderer) => {
				$$renderer.push(`Park Rate`);
			});
			$$renderer.option({ value: "avgSkill" }, ($$renderer) => {
				$$renderer.push(`Driver Skill`);
			});
			$$renderer.option({ value: "avgReliability" }, ($$renderer) => {
				$$renderer.push(`Reliability`);
			});
			$$renderer.option({ value: "matches" }, ($$renderer) => {
				$$renderer.push(`Matches`);
			});
			$$renderer.option({ value: "number" }, ($$renderer) => {
				$$renderer.push(`Team #`);
			});
		}, "svelte-138aw5j");
		$$renderer.push(` <button class="svelte-138aw5j">${escape_html(sortDir === "desc" ? "DESC" : "ASC")}</button> <button${attr_class("svelte-138aw5j", void 0, { "active": view === "cards" })}>Cards</button> <button${attr_class("svelte-138aw5j", void 0, { "active": view === "table" })}>Table</button></div></div> `);
		if (data.ranked.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="empty svelte-138aw5j">No scouted data yet. Scout some matches first.</p>`);
		} else {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="team-cards svelte-138aw5j"><!--[-->`);
			const each_array = ensure_array_like(filtered());
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let team = each_array[i];
				$$renderer.push(`<a${attr("href", `/manager/analytics/${stringify(team.number)}`)}${attr_class(`team-card card ${stringify(tierColor(team.rank, data.ranked.length))}`, "svelte-138aw5j")}><div class="card-top svelte-138aw5j"><div class="card-rank svelte-138aw5j">#${escape_html(team.rank)}</div> <div class="card-identity svelte-138aw5j"><span class="card-number svelte-138aw5j">${escape_html(team.number)}</span> <span class="card-name svelte-138aw5j">${escape_html(team.name)}</span></div> <div class="card-score svelte-138aw5j">${escape_html(team.totalScore)}</div></div> <div class="card-bars svelte-138aw5j"><div class="bar-row svelte-138aw5j"><span class="bar-label svelte-138aw5j">Scored</span> <div class="bar-track svelte-138aw5j"><div class="bar-fill scored svelte-138aw5j"${attr_style(`width: ${stringify(barWidth(team.avgScored, maxScored()))}`)}></div></div> <span class="bar-val svelte-138aw5j">${escape_html(team.avgScored)}</span></div> <div class="bar-row svelte-138aw5j"><span class="bar-label svelte-138aw5j">Attempted</span> <div class="bar-track svelte-138aw5j"><div class="bar-fill attempted svelte-138aw5j"${attr_style(`width: ${stringify(barWidth(team.avgAttempted, maxAttempted()))}`)}></div></div> <span class="bar-val svelte-138aw5j">${escape_html(team.avgAttempted)}</span></div></div> <div class="card-stats svelte-138aw5j"><div class="mini-stat svelte-138aw5j"><span class="ms-val svelte-138aw5j">${escape_html(team.accuracy)}%</span> <span class="ms-label svelte-138aw5j">Acc</span></div> <div class="mini-stat svelte-138aw5j"><span class="ms-val svelte-138aw5j">${escape_html(team.autoLeaveRate)}%</span> <span class="ms-label svelte-138aw5j">Leave</span></div> <div class="mini-stat svelte-138aw5j"><span class="ms-val svelte-138aw5j">${escape_html(team.parkRate)}%</span> <span class="ms-label svelte-138aw5j">Park</span></div> <div class="mini-stat svelte-138aw5j"><span class="ms-val svelte-138aw5j">${escape_html(team.gateRate)}%</span> <span class="ms-label svelte-138aw5j">Gate</span></div> <div class="mini-stat svelte-138aw5j"><span class="ms-val svelte-138aw5j">${escape_html(team.avgSkill)}</span> <span class="ms-label svelte-138aw5j">Skill</span></div> <div class="mini-stat svelte-138aw5j"><span class="ms-val svelte-138aw5j">${escape_html(team.avgReliability)}</span> <span class="ms-label svelte-138aw5j">Rel</span></div></div> <div class="card-summary svelte-138aw5j">${escape_html(team.summary)}</div> `);
				if (team.disconnects > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="card-warn svelte-138aw5j">${escape_html(team.disconnects)} disconnect${escape_html(team.disconnects > 1 ? "s" : "")}</div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></a>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--> `);
		if (data.unscouted.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<details class="unscouted svelte-138aw5j"><summary class="svelte-138aw5j">${escape_html(data.unscouted.length)} unscouted teams</summary> <div class="unscouted-list svelte-138aw5j"><!--[-->`);
			const each_array_2 = ensure_array_like(data.unscouted);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let t = each_array_2[$$index_2];
				$$renderer.push(`<span class="svelte-138aw5j">#${escape_html(t.number)} ${escape_html(t.name)}</span>`);
			}
			$$renderer.push(`<!--]--></div></details>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C1fEe_aI.js.map
