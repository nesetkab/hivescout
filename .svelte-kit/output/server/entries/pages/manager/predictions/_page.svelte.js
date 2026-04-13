import { C as escape_html, S as clsx, i as ensure_array_like, n as attr_style, r as derived, s as stringify, t as attr_class, x as attr } from "../../../../chunks/server.js";
//#region src/routes/manager/predictions/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let mode = "matches";
		let search = "";
		let red1Pick = null;
		let red2Pick = null;
		let blue1Pick = null;
		let blue2Pick = null;
		let filteredMatches = derived(() => {
			if (!search.trim()) return data.matchPredictions;
			const q = search.toLowerCase();
			return data.matchPredictions.filter((m) => String(m.match_number).includes(q) || String(m.red1?.number).includes(q) || String(m.red2?.number).includes(q) || String(m.blue1?.number).includes(q) || String(m.blue2?.number).includes(q));
		});
		derived(() => {
			const r1 = data.allTeamStats.find((t) => t.number === red1Pick);
			const r2 = data.allTeamStats.find((t) => t.number === red2Pick);
			const b1 = data.allTeamStats.find((t) => t.number === blue1Pick);
			const b2 = data.allTeamStats.find((t) => t.number === blue2Pick);
			const r1c = r1?.predictedContribution || 0;
			const r2c = r2?.predictedContribution || 0;
			const b1c = b1?.predictedContribution || 0;
			const b2c = b2?.predictedContribution || 0;
			const redTotal = +(r1c + r2c).toFixed(1);
			const blueTotal = +(b1c + b2c).toFixed(1);
			return {
				r1,
				r2,
				b1,
				b2,
				r1c,
				r2c,
				b1c,
				b2c,
				redTotal,
				blueTotal,
				margin: +Math.abs(redTotal - blueTotal).toFixed(1),
				winner: redTotal > blueTotal ? "red" : blueTotal > redTotal ? "blue" : "tie"
			};
		});
		function availableTeams(exclude) {
			return data.allTeamStats.filter((t) => !exclude.includes(t.number));
		}
		let red1Available = derived(() => availableTeams([
			red2Pick,
			blue1Pick,
			blue2Pick
		]));
		let red2Available = derived(() => availableTeams([
			red1Pick,
			blue1Pick,
			blue2Pick
		]));
		let blue1Available = derived(() => availableTeams([
			red1Pick,
			red2Pick,
			blue2Pick
		]));
		let blue2Available = derived(() => availableTeams([
			red1Pick,
			red2Pick,
			blue1Pick
		]));
		function marginBarStyle(redTotal, blueTotal) {
			const redPct = redTotal / (redTotal + blueTotal || 1) * 100;
			return {
				redPct,
				bluePct: 100 - redPct
			};
		}
		$$renderer.push(`<div class="predictions svelte-19dwjn1"><div class="header-row svelte-19dwjn1"><h2>Match Predictions</h2> <div class="header-stats svelte-19dwjn1"><span>${escape_html(data.totalMatches)} matches</span> <span>${escape_html(data.teamsWithData)} teams with data</span></div></div> <div class="controls svelte-19dwjn1"><div class="mode-tabs svelte-19dwjn1"><button${attr_class("svelte-19dwjn1", void 0, { "active": mode === "matches" })}>Match List</button> <button${attr_class("svelte-19dwjn1", void 0, { "active": mode === "simulate" })}>Pick Match</button></div> `);
		if (mode === "matches") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<input${attr("value", search)} placeholder="Search match # or team..." class="search-input svelte-19dwjn1"/>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (mode === "matches") {
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
						$$renderer.push(`<span${attr_class(clsx(match.winner === "red" ? "red-text" : "blue-text"), "svelte-19dwjn1")}>${escape_html(match.winner === "red" ? "Red" : "Blue")} by ${escape_html(match.margin)} pts</span>`);
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
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="simulate-section svelte-19dwjn1"><div class="sim-alliances svelte-19dwjn1"><div class="sim-alliance red-border svelte-19dwjn1"><h3 class="red-text svelte-19dwjn1">Red Alliance</h3> <div class="sim-pick svelte-19dwjn1"><label class="svelte-19dwjn1">Team 1</label> `);
			$$renderer.select({
				value: red1Pick,
				class: ""
			}, ($$renderer) => {
				$$renderer.option({ value: null }, ($$renderer) => {
					$$renderer.push(`-- Select --`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array_1 = ensure_array_like(red1Available());
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let t = each_array_1[$$index_1];
					$$renderer.option({ value: t.number }, ($$renderer) => {
						$$renderer.push(`#${escape_html(t.number)} ${escape_html(t.name)} (${escape_html(t.matches > 0 ? t.predictedContribution.toFixed(1) + " pts" : "no data")})`);
					});
				}
				$$renderer.push(`<!--]-->`);
			}, "svelte-19dwjn1");
			$$renderer.push(` `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="sim-pick svelte-19dwjn1"><label class="svelte-19dwjn1">Team 2</label> `);
			$$renderer.select({
				value: red2Pick,
				class: ""
			}, ($$renderer) => {
				$$renderer.option({ value: null }, ($$renderer) => {
					$$renderer.push(`-- Select --`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array_2 = ensure_array_like(red2Available());
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let t = each_array_2[$$index_2];
					$$renderer.option({ value: t.number }, ($$renderer) => {
						$$renderer.push(`#${escape_html(t.number)} ${escape_html(t.name)} (${escape_html(t.matches > 0 ? t.predictedContribution.toFixed(1) + " pts" : "no data")})`);
					});
				}
				$$renderer.push(`<!--]-->`);
			}, "svelte-19dwjn1");
			$$renderer.push(` `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div> <div class="sim-alliance blue-border svelte-19dwjn1"><h3 class="blue-text svelte-19dwjn1">Blue Alliance</h3> <div class="sim-pick svelte-19dwjn1"><label class="svelte-19dwjn1">Team 1</label> `);
			$$renderer.select({
				value: blue1Pick,
				class: ""
			}, ($$renderer) => {
				$$renderer.option({ value: null }, ($$renderer) => {
					$$renderer.push(`-- Select --`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array_3 = ensure_array_like(blue1Available());
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let t = each_array_3[$$index_3];
					$$renderer.option({ value: t.number }, ($$renderer) => {
						$$renderer.push(`#${escape_html(t.number)} ${escape_html(t.name)} (${escape_html(t.matches > 0 ? t.predictedContribution.toFixed(1) + " pts" : "no data")})`);
					});
				}
				$$renderer.push(`<!--]-->`);
			}, "svelte-19dwjn1");
			$$renderer.push(` `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="sim-pick svelte-19dwjn1"><label class="svelte-19dwjn1">Team 2</label> `);
			$$renderer.select({
				value: blue2Pick,
				class: ""
			}, ($$renderer) => {
				$$renderer.option({ value: null }, ($$renderer) => {
					$$renderer.push(`-- Select --`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array_4 = ensure_array_like(blue2Available());
				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let t = each_array_4[$$index_4];
					$$renderer.option({ value: t.number }, ($$renderer) => {
						$$renderer.push(`#${escape_html(t.number)} ${escape_html(t.name)} (${escape_html(t.matches > 0 ? t.predictedContribution.toFixed(1) + " pts" : "no data")})`);
					});
				}
				$$renderer.push(`<!--]-->`);
			}, "svelte-19dwjn1");
			$$renderer.push(` `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div></div> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="empty svelte-19dwjn1">Select teams above to simulate a hypothetical match.</p>`);
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
