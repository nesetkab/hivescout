import "../../../../../chunks/index-server.js";
import { C as escape_html, i as ensure_array_like, n as attr_style, s as stringify, t as attr_class, x as attr } from "../../../../../chunks/server.js";
//#region src/routes/manager/analytics/[team]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let heatmapMode = "dots";
		$$renderer.push(`<div class="team-detail svelte-qd3xvn"><div class="header svelte-qd3xvn"><a href="/manager/analytics" class="back svelte-qd3xvn">Analytics</a> <span class="sep svelte-qd3xvn">/</span> <h2 class="svelte-qd3xvn">#${escape_html(data.team.number)} ${escape_html(data.team.name)}</h2> <span class="match-badge svelte-qd3xvn">${escape_html(data.matchCount)} matches</span></div> <div class="summary-card card svelte-qd3xvn"><p class="svelte-qd3xvn">${escape_html(data.summary)}</p></div> `);
		if (data.matchCount === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="empty svelte-qd3xvn">No match scout data yet for this team.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grid svelte-qd3xvn"><div class="left-col svelte-qd3xvn"><div class="card heatmap-card svelte-qd3xvn"><div class="card-head svelte-qd3xvn"><h3 class="svelte-qd3xvn">Scoring Heatmap</h3> <div class="mode-toggle svelte-qd3xvn"><button${attr_class("svelte-qd3xvn", void 0, { "active": heatmapMode === "dots" })}>Dots</button> <button${attr_class("svelte-qd3xvn", void 0, { "active": heatmapMode === "heatmap" })}>Heat</button></div></div> <div class="heatmap-container svelte-qd3xvn"><img src="/field.png" alt="DECODE field" class="field-bg svelte-qd3xvn" draggable="false"/> `);
			if (heatmapMode === "dots") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="field-overlay svelte-qd3xvn"><!--[-->`);
				const each_array = ensure_array_like(data.allEvents);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let evt = each_array[$$index];
					if (evt.scored > 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<circle${attr("cx", evt.x)}${attr("cy", evt.y)} r="1.5"${attr("fill", evt.phase === "auto" ? "#ffd96b" : "#6ba3ff")} opacity="0.7"></circle>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<circle${attr("cx", evt.x)}${attr("cy", evt.y)} r="1.5" fill="none"${attr("stroke", evt.phase === "auto" ? "#ffd96b" : "#6ba3ff")} stroke-width="0.5" opacity="0.6"></circle>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></svg>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<canvas class="field-overlay heat-canvas svelte-qd3xvn"></canvas>`);
			}
			$$renderer.push(`<!--]--></div> <div class="legend svelte-qd3xvn">`);
			if (heatmapMode === "dots") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="legend-item svelte-qd3xvn"><span class="dot auto-color svelte-qd3xvn"></span> Auto</span> <span class="legend-item svelte-qd3xvn"><span class="dot teleop-color svelte-qd3xvn"></span> Teleop</span> <span class="legend-item svelte-qd3xvn">Filled = scored, Hollow = missed</span>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<span class="legend-item svelte-qd3xvn">Brighter = more scoring attempts</span>`);
			}
			$$renderer.push(`<!--]--> <span class="legend-item svelte-qd3xvn">${escape_html(data.allEvents.length)} total events</span></div></div> <div class="card"><h3 class="svelte-qd3xvn">Scoring by Match</h3> <div class="match-bars svelte-qd3xvn"><!--[-->`);
			const each_array_1 = ensure_array_like(data.perMatch);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let m = each_array_1[$$index_1];
				$$renderer.push(`<div class="bar-col svelte-qd3xvn"><div class="bar-stack svelte-qd3xvn"${attr_style(`--max: ${stringify(Math.max(...data.perMatch.map((p) => p.attempted), 1))}`)}><div class="bar attempted svelte-qd3xvn"${attr_style(`height: ${stringify(m.attempted / Math.max(...data.perMatch.map((p) => p.attempted), 1) * 100)}%`)}></div> <div class="bar scored svelte-qd3xvn"${attr_style(`height: ${stringify(m.scored / Math.max(...data.perMatch.map((p) => p.attempted), 1) * 100)}%`)}></div></div> <span class="bar-label svelte-qd3xvn">Q${escape_html(m.match_number)}</span></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="legend svelte-qd3xvn"><span class="legend-item svelte-qd3xvn"><span class="dot svelte-qd3xvn" style="background: var(--bg-lighter);"></span> Attempted</span> <span class="legend-item svelte-qd3xvn"><span class="dot svelte-qd3xvn" style="background: var(--accent);"></span> Scored</span></div></div></div> <div class="right-col svelte-qd3xvn"><div class="card"><h3 class="svelte-qd3xvn">Scoring</h3> <div class="big-stats svelte-qd3xvn"><div class="big-stat svelte-qd3xvn"><span class="big-num svelte-qd3xvn">${escape_html(data.scoring.avgAttempted)}</span> <span class="big-label svelte-qd3xvn">Avg Attempted</span></div> <div class="big-stat svelte-qd3xvn"><span class="big-num svelte-qd3xvn">${escape_html(data.scoring.avgScored)}</span> <span class="big-label svelte-qd3xvn">Avg Scored</span></div> <div class="big-stat svelte-qd3xvn"><span class="big-num accent svelte-qd3xvn">${escape_html(data.scoring.scoringRate)}%</span> <span class="big-label svelte-qd3xvn">Accuracy</span></div></div> <div class="detail-row svelte-qd3xvn"><span class="svelte-qd3xvn">Consistency</span> <span class="svelte-qd3xvn">+/- ${escape_html(data.scoring.stdDevScored)} per match</span></div></div> <div class="card"><h3 class="svelte-qd3xvn">Autonomous</h3> <div class="stat-bar-row svelte-qd3xvn"><span class="svelte-qd3xvn">Leave Rate</span> <div class="progress-bar svelte-qd3xvn"><div class="progress-fill svelte-qd3xvn"${attr_style(`width: ${stringify(data.auto.leaveRate)}%`)}></div></div> <span class="stat-val svelte-qd3xvn">${escape_html(data.auto.leaveRate)}%</span></div> <div class="detail-row svelte-qd3xvn"><span class="svelte-qd3xvn">Avg Classified</span> <span class="svelte-qd3xvn">${escape_html(data.auto.avgClassified)}</span></div> <div class="detail-row svelte-qd3xvn"><span class="svelte-qd3xvn">Avg Overflow</span> <span class="svelte-qd3xvn">${escape_html(data.auto.avgOverflow)}</span></div></div> <div class="card"><h3 class="svelte-qd3xvn">Park Analysis</h3> `);
			if (data.park.attemptsCount > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="big-stats svelte-qd3xvn"><div class="big-stat svelte-qd3xvn"><span class="big-num svelte-qd3xvn">${escape_html(data.park.primaryMethod.toUpperCase())}</span> <span class="big-label svelte-qd3xvn">Primary Method</span></div> <div class="big-stat svelte-qd3xvn"><span${attr_class("big-num svelte-qd3xvn", void 0, {
					"green": data.park.successRate >= 80,
					"yellow-text": data.park.successRate >= 50 && data.park.successRate < 80,
					"red-text": data.park.successRate < 50
				})}>${escape_html(data.park.successRate)}%</span> <span class="big-label svelte-qd3xvn">Success Rate</span></div> <div class="big-stat svelte-qd3xvn"><span class="big-num svelte-qd3xvn">${escape_html(data.park.confidence)}%</span> <span class="big-label svelte-qd3xvn">Confidence</span></div></div> <div class="park-breakdown svelte-qd3xvn"><div class="detail-row svelte-qd3xvn"><span class="svelte-qd3xvn">Full park</span> <span class="svelte-qd3xvn">${escape_html(data.park.fullCount)}</span></div> <div class="detail-row svelte-qd3xvn"><span class="svelte-qd3xvn">Partial park</span> <span class="svelte-qd3xvn">${escape_html(data.park.partialCount)}</span></div> <div class="detail-row svelte-qd3xvn"><span class="svelte-qd3xvn">No park</span> <span class="svelte-qd3xvn">${escape_html(data.park.noCount)}</span></div> <!--[-->`);
				const each_array_2 = ensure_array_like(Object.entries(data.park.methods));
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let [method, stats] = each_array_2[$$index_2];
					$$renderer.push(`<div class="detail-row svelte-qd3xvn"><span class="svelte-qd3xvn">${escape_html(method)}</span> <span class="svelte-qd3xvn">${escape_html(stats.total - stats.failed)}/${escape_html(stats.total)} success</span></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<p class="dim svelte-qd3xvn">Does not park</p>`);
			}
			$$renderer.push(`<!--]--></div> <div class="card"><h3 class="svelte-qd3xvn">Other</h3> <div class="stat-bar-row svelte-qd3xvn"><span class="svelte-qd3xvn">Gate Rate</span> <div class="progress-bar svelte-qd3xvn"><div class="progress-fill svelte-qd3xvn"${attr_style(`width: ${stringify(data.gateRate)}%`)}></div></div> <span class="stat-val svelte-qd3xvn">${escape_html(data.gateRate)}%</span></div> <div class="detail-row svelte-qd3xvn"><span class="svelte-qd3xvn">Driver Skill</span> <span class="svelte-qd3xvn">${escape_html(data.qualitative.avgDriverSkill)} / 5</span></div> <div class="detail-row svelte-qd3xvn"><span class="svelte-qd3xvn">Reliability</span> <span class="svelte-qd3xvn">${escape_html(data.qualitative.avgReliability)} / 5</span></div> <div class="detail-row svelte-qd3xvn"><span class="svelte-qd3xvn">Defense</span> <span class="svelte-qd3xvn">${escape_html(data.qualitative.avgDefense)} / 5</span></div> `);
			if (data.qualitative.disconnectCount > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="detail-row svelte-qd3xvn" style="color: var(--red);"><span class="svelte-qd3xvn">Disconnects</span> <span class="svelte-qd3xvn">${escape_html(data.qualitative.disconnectCount)} / ${escape_html(data.matchCount)}</span></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
