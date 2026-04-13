import { R as escape_html, a4 as attr_class, a3 as attr, a2 as ensure_array_like, a7 as stringify, a8 as attr_style, a9 as clsx$1, K as derived } from './server-CrZugHhs.js';

//#region src/routes/manager/predictions/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let mode = "matches";
		let search = "";
		let filteredMatches = derived(() => {
			if (!search.trim()) return data.matchPredictions;
			const q = search.toLowerCase();
			return data.matchPredictions.filter((m) => String(m.match_number).includes(q) || String(m.red1?.number).includes(q) || String(m.red2?.number).includes(q) || String(m.blue1?.number).includes(q) || String(m.blue2?.number).includes(q));
		});
		function marginBarStyle(redTotal, blueTotal) {
			const redPct = redTotal / (redTotal + blueTotal || 1) * 100;
			return {
				redPct,
				bluePct: 100 - redPct
			};
		}
		$$renderer.push(`<div class="predictions svelte-19dwjn1"><div class="header-row svelte-19dwjn1"><h2>Match Predictions</h2> <div class="header-stats svelte-19dwjn1"><span>${escape_html(data.totalMatches)} matches</span> <span>${escape_html(data.teamsWithData)} teams with data</span></div></div> <div class="controls svelte-19dwjn1"><div class="mode-tabs svelte-19dwjn1"><button${attr_class("svelte-19dwjn1", void 0, { "active": mode === "matches" })}>Match List</button> <button${attr_class("svelte-19dwjn1", void 0, { "active": mode === "simulate" })}>Pick Match</button></div> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<input${attr("value", search)} placeholder="Search match # or team..." class="search-input svelte-19dwjn1"/>`);
		}
		$$renderer.push(`<!--]--></div> `);
		{
			$$renderer.push("<!--[0-->");
			if (data.matchPredictions.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="empty svelte-19dwjn1">No matches scheduled yet. Add matches in Setup first.</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="match-list svelte-19dwjn1"><!--[-->`);
				const each_array = ensure_array_like(filteredMatches());
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let match = each_array[$$index];
					const bar = marginBarStyle(match.redTotal, match.blueTotal);
					$$renderer.push(`<div class="match-card card svelte-19dwjn1"><div class="match-header svelte-19dwjn1"><span class="match-num svelte-19dwjn1">Match ${escape_html(match.match_number)}</span> `);
					if (match.status === "completed") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="badge green">Completed</span>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<span class="badge-status svelte-19dwjn1">${escape_html(match.status)}</span>`);
					}
					$$renderer.push(`<!--]--></div> <div class="alliances svelte-19dwjn1"><div${attr_class("alliance red-side svelte-19dwjn1", void 0, { "winner": match.winner === "red" })}><div class="alliance-label red-label svelte-19dwjn1">RED</div> <div class="alliance-teams svelte-19dwjn1"><div class="team-row svelte-19dwjn1"><a${attr("href", `/manager/analytics/${stringify(match.red1.number)}`)} class="team-link svelte-19dwjn1"><span class="team-number svelte-19dwjn1">${escape_html(match.red1.number || "?")}</span> <span class="team-name svelte-19dwjn1">${escape_html(match.red1.name || "TBD")}</span></a> <span class="contrib svelte-19dwjn1">${escape_html(match.red1.contribution.toFixed(1))}</span></div> <div class="team-row svelte-19dwjn1"><a${attr("href", `/manager/analytics/${stringify(match.red2.number)}`)} class="team-link svelte-19dwjn1"><span class="team-number svelte-19dwjn1">${escape_html(match.red2.number || "?")}</span> <span class="team-name svelte-19dwjn1">${escape_html(match.red2.name || "TBD")}</span></a> <span class="contrib svelte-19dwjn1">${escape_html(match.red2.contribution.toFixed(1))}</span></div></div> <div class="alliance-total red-total svelte-19dwjn1">${escape_html(match.redTotal)}</div></div> <div class="vs svelte-19dwjn1">vs</div> <div${attr_class("alliance blue-side svelte-19dwjn1", void 0, { "winner": match.winner === "blue" })}><div class="alliance-total blue-total svelte-19dwjn1">${escape_html(match.blueTotal)}</div> <div class="alliance-teams svelte-19dwjn1"><div class="team-row svelte-19dwjn1"><a${attr("href", `/manager/analytics/${stringify(match.blue1.number)}`)} class="team-link svelte-19dwjn1"><span class="team-number svelte-19dwjn1">${escape_html(match.blue1.number || "?")}</span> <span class="team-name svelte-19dwjn1">${escape_html(match.blue1.name || "TBD")}</span></a> <span class="contrib svelte-19dwjn1">${escape_html(match.blue1.contribution.toFixed(1))}</span></div> <div class="team-row svelte-19dwjn1"><a${attr("href", `/manager/analytics/${stringify(match.blue2.number)}`)} class="team-link svelte-19dwjn1"><span class="team-number svelte-19dwjn1">${escape_html(match.blue2.number || "?")}</span> <span class="team-name svelte-19dwjn1">${escape_html(match.blue2.name || "TBD")}</span></a> <span class="contrib svelte-19dwjn1">${escape_html(match.blue2.contribution.toFixed(1))}</span></div></div> <div class="alliance-label blue-label svelte-19dwjn1">BLUE</div></div></div> <div class="margin-bar svelte-19dwjn1"><div class="margin-fill red-fill svelte-19dwjn1"${attr_style(`width: ${stringify(bar.redPct)}%`)}></div> <div class="margin-fill blue-fill svelte-19dwjn1"${attr_style(`width: ${stringify(bar.bluePct)}%`)}></div></div> <div class="margin-label svelte-19dwjn1">`);
					if (match.winner === "tie") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="tie-text svelte-19dwjn1">Even match</span>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<span${attr_class(clsx$1(match.winner === "red" ? "red-text" : "blue-text"), "svelte-19dwjn1")}>${escape_html(match.winner === "red" ? "Red" : "Blue")} by ${escape_html(match.margin)} pts</span>`);
					}
					$$renderer.push(`<!--]--></div> `);
					if (match.status === "completed" && match.score_red != null) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="actual-score svelte-19dwjn1">Actual: <span class="red-text svelte-19dwjn1">${escape_html(match.score_red)}</span> - <span class="blue-text svelte-19dwjn1">${escape_html(match.score_blue)}</span></div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-fWzbmjed.js.map
