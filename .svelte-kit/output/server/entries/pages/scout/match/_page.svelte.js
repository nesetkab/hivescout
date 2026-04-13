import { C as escape_html, i as ensure_array_like, n as attr_style, r as derived, s as stringify, t as attr_class, x as attr } from "../../../../chunks/server.js";
import "../../../../chunks/navigation.js";
import "../../../../chunks/stores2.js";
//#region src/routes/scout/match/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let selectedMatch = "";
		let selectedTeam = "";
		let upcomingAssignments = derived(() => (data.schedule || []).filter((a) => !data.scoutedMatchIds?.includes(a.match_id)));
		derived(() => upcomingAssignments().length > 0 ? upcomingAssignments()[0] : null);
		let hasSchedule = derived(() => (data.schedule || []).length > 0);
		let elapsed = 0;
		let phase = "setup";
		let disconnected = false;
		let tapX = null;
		let tapY = null;
		let attempted = null;
		let scoringEvents = [];
		let autoLeave = false;
		let gateFlash = false;
		let endgameBase = "none";
		let parkMethod = "none";
		let parkFailed = false;
		let defenseRating = 3;
		let driverSkill = 3;
		let reliability = 3;
		let notes = "";
		let submitting = false;
		derived(() => {
			return [];
		});
		let autoClassified = derived(() => scoringEvents.filter((e) => e.phase === "auto").reduce((s, e) => s + e.scored, 0));
		let autoOverflow = derived(() => scoringEvents.filter((e) => e.phase === "auto").reduce((s, e) => s + (e.attempted - e.scored), 0));
		let teleopClassified = derived(() => scoringEvents.filter((e) => e.phase === "teleop").reduce((s, e) => s + e.scored, 0));
		let teleopOverflow = derived(() => scoringEvents.filter((e) => e.phase === "teleop").reduce((s, e) => s + (e.attempted - e.scored), 0));
		let displayTime = derived(() => {
			if (phase === "auto") {
				const remaining = Math.max(0, 30 - elapsed);
				return `0:${String(remaining).padStart(2, "0")}`;
			}
			if (phase === "transition") {
				const remaining = Math.max(0, 45 - elapsed);
				return `0:${String(remaining).padStart(2, "0")}`;
			}
			const remaining = Math.max(0, 165 - elapsed);
			const m = Math.floor(remaining / 60);
			const s = remaining % 60;
			return `${m}:${String(s).padStart(2, "0")}`;
		});
		$$renderer.push(`<div class="match-scout svelte-18k7chz">`);
		if (phase === "setup") {
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
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (phase === "auto" || phase === "transition" || phase === "teleop" || phase === "endgame") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div${attr_class("timer-bar svelte-18k7chz", void 0, {
				"auto": phase === "auto",
				"transition": phase === "transition",
				"teleop": phase === "teleop",
				"endgame": phase === "endgame"
			})}><span class="timer-phase svelte-18k7chz">${escape_html(phase.toUpperCase())}</span> <span class="timer-clock svelte-18k7chz">${escape_html(displayTime())}</span> <button class="danger svelte-18k7chz">Stop</button></div> `);
			if (phase === "transition") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="transition-banner svelte-18k7chz">TRANSITION - pick up controllers</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="quick-actions svelte-18k7chz">`);
			if (phase === "auto") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button${attr_class("quick-btn svelte-18k7chz", void 0, { "active": autoLeave })}>LEFT LAUNCH</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <button${attr_class("quick-btn svelte-18k7chz", void 0, { "active": gateFlash })}>${escape_html("OPEN GATE")}</button></div> <div class="field-container svelte-18k7chz" role="button" tabindex="0"><div class="field svelte-18k7chz"><img src="/field.png" alt="DECODE field" class="field-img svelte-18k7chz" draggable="false"/> <!--[-->`);
			const each_array_3 = ensure_array_like(scoringEvents);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let evt = each_array_3[$$index_3];
				$$renderer.push(`<div${attr_class("event-dot svelte-18k7chz", void 0, {
					"auto-dot": evt.phase === "auto",
					"teleop-dot": evt.phase === "teleop"
				})}${attr_style(`left: ${stringify(evt.x)}%; top: ${stringify(evt.y)}%`)}>${escape_html(evt.scored)}/${escape_html(evt.attempted)}</div>`);
			}
			$$renderer.push(`<!--]--> `);
			if (tapX !== null && tapY !== null) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="tap-marker svelte-18k7chz"${attr_style(`left: ${stringify(tapX)}%; top: ${stringify(tapY)}%`)}></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="field-hint svelte-18k7chz">Tap where robot is scoring from</div></div> `);
			if (tapX !== null) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="action-panel svelte-18k7chz"><div class="action-row svelte-18k7chz"><span class="action-label svelte-18k7chz">Attempted</span> <div class="action-buttons svelte-18k7chz"><button${attr_class("svelte-18k7chz", void 0, { "selected": attempted === 1 })}>1</button> <button${attr_class("svelte-18k7chz", void 0, { "selected": attempted === 2 })}>2</button> <button${attr_class("svelte-18k7chz", void 0, { "selected": attempted === 3 })}>3</button></div></div> `);
				if (attempted !== null) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="action-row svelte-18k7chz"><span class="action-label svelte-18k7chz">Scored</span> <div class="action-buttons svelte-18k7chz"><!--[-->`);
					const each_array_4 = ensure_array_like(Array.from({ length: attempted + 1 }, (_, i) => i));
					for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
						let n = each_array_4[$$index_4];
						$$renderer.push(`<button class="svelte-18k7chz">${escape_html(n)}</button>`);
					}
					$$renderer.push(`<!--]--></div></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="event-log svelte-18k7chz"><div class="log-header svelte-18k7chz"><span class="svelte-18k7chz">Events (${escape_html(scoringEvents.length)})</span> `);
			if (scoringEvents.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="small svelte-18k7chz">Undo</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="log-summary svelte-18k7chz"><span class="svelte-18k7chz">Classified: ${escape_html(autoClassified() + teleopClassified())}</span> <span class="svelte-18k7chz">Overflow: ${escape_html(autoOverflow() + teleopOverflow())}</span></div></div> `);
			if (phase === "endgame") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="endgame-section svelte-18k7chz"><h3 class="svelte-18k7chz">Endgame - BASE</h3> <div class="park-buttons svelte-18k7chz"><button${attr_class("park-btn svelte-18k7chz", void 0, { "active": endgameBase === "none" })}>NO PARK</button> <button${attr_class("park-btn svelte-18k7chz", void 0, { "active": endgameBase === "partial" })}>PARTIAL</button> <button${attr_class("park-btn svelte-18k7chz", void 0, { "active": endgameBase === "full" })}>FULL</button></div> `);
				if (endgameBase === "partial" || endgameBase === "full") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="park-buttons svelte-18k7chz"><button${attr_class("park-btn method svelte-18k7chz", void 0, { "active": parkMethod === "normal" })}>NORMAL PARK</button> <button${attr_class("park-btn method svelte-18k7chz", void 0, { "active": parkMethod === "tilt" })}>TILT</button> <button${attr_class("park-btn method svelte-18k7chz", void 0, { "active": parkMethod === "lift" })}>LIFT</button></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (phase === "review") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="timer-bar svelte-18k7chz"><span class="timer-phase svelte-18k7chz">REVIEW</span> <span class="svelte-18k7chz">${escape_html(scoringEvents.length)} events</span></div> <div class="field-container svelte-18k7chz" style="pointer-events: none;"><div class="field svelte-18k7chz"><img src="/field.png" alt="DECODE field" class="field-img svelte-18k7chz" draggable="false"/> <!--[-->`);
			const each_array_5 = ensure_array_like(scoringEvents);
			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let evt = each_array_5[$$index_5];
				$$renderer.push(`<div${attr_class("event-dot svelte-18k7chz", void 0, {
					"auto-dot": evt.phase === "auto",
					"teleop-dot": evt.phase === "teleop"
				})}${attr_style(`left: ${stringify(evt.x)}%; top: ${stringify(evt.y)}%`)}>${escape_html(evt.scored)}/${escape_html(evt.attempted)}</div>`);
			}
			$$renderer.push(`<!--]--></div></div> <div class="review-stats card svelte-18k7chz"><div class="stat-row svelte-18k7chz"><span class="svelte-18k7chz">Auto Leave</span><span class="svelte-18k7chz">${escape_html("No")}</span></div> <div class="stat-row svelte-18k7chz"><span class="svelte-18k7chz">Auto Classified</span><span class="svelte-18k7chz">${escape_html(autoClassified())}</span></div> <div class="stat-row svelte-18k7chz"><span class="svelte-18k7chz">Auto Overflow</span><span class="svelte-18k7chz">${escape_html(autoOverflow())}</span></div> <div class="stat-row svelte-18k7chz"><span class="svelte-18k7chz">Teleop Classified</span><span class="svelte-18k7chz">${escape_html(teleopClassified())}</span></div> <div class="stat-row svelte-18k7chz"><span class="svelte-18k7chz">Teleop Overflow</span><span class="svelte-18k7chz">${escape_html(teleopOverflow())}</span></div> <div class="stat-row svelte-18k7chz"><span class="svelte-18k7chz">Opened Gate</span><span class="svelte-18k7chz">${escape_html("No")}</span></div> <div class="stat-row svelte-18k7chz"><span class="svelte-18k7chz">BASE</span><span class="svelte-18k7chz">${escape_html(endgameBase)}${escape_html(parkMethod !== "none" ? ` (${parkMethod})` : "")}${escape_html("")}</span></div> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <section class="svelte-18k7chz"><h3 class="svelte-18k7chz">Ratings (1-5)</h3> <div class="counters svelte-18k7chz"><div class="counter-row svelte-18k7chz"><span class="svelte-18k7chz">Driver Skill</span> <div class="counter svelte-18k7chz"><button class="svelte-18k7chz">-</button> <span class="count svelte-18k7chz">${escape_html(driverSkill)}</span> <button class="svelte-18k7chz">+</button></div></div> <div class="counter-row svelte-18k7chz"><span class="svelte-18k7chz">Reliability</span> <div class="counter svelte-18k7chz"><button class="svelte-18k7chz">-</button> <span class="count svelte-18k7chz">${escape_html(reliability)}</span> <button class="svelte-18k7chz">+</button></div></div> <div class="counter-row svelte-18k7chz"><span class="svelte-18k7chz">Defense</span> <div class="counter svelte-18k7chz"><button class="svelte-18k7chz">-</button> <span class="count svelte-18k7chz">${escape_html(defenseRating)}</span> <button class="svelte-18k7chz">+</button></div></div></div> <label class="svelte-18k7chz">Notes <textarea placeholder="Anything notable..." class="svelte-18k7chz">`);
			const $$body = escape_html(notes);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea></label> <button class="primary submit-btn svelte-18k7chz"${attr("disabled", submitting, true)}>${escape_html("Submit Match Scout")}</button></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (phase === "auto" || phase === "transition" || phase === "teleop" || phase === "endgame") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="fixed-bottom-bar svelte-18k7chz"><button${attr_class("fixed-btn disconnected-btn svelte-18k7chz", void 0, { "active": disconnected })}>DISCONNECTED</button> `);
			if (endgameBase !== "none") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button${attr_class("fixed-btn park-failed-btn svelte-18k7chz", void 0, { "active": parkFailed })}>PARK FAILED</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _page as default };
