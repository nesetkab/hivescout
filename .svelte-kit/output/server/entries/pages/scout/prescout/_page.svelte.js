import { C as escape_html, i as ensure_array_like, x as attr } from "../../../../chunks/server.js";
import "../../../../chunks/navigation.js";
//#region src/routes/scout/prescout/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let selectedTeam = "";
		let drivetrain = "";
		let intakeType = "";
		let canScoreGoal = false;
		let canClassify = false;
		let canOpenGate = false;
		let autoCap = "";
		let teleopCap = "";
		let endgameCap = "";
		let strengths = "";
		let weaknesses = "";
		let notes = "";
		$$renderer.push(`<div class="prescout svelte-11rux1v"><h2>Pre-Scout</h2> <p class="subtitle svelte-11rux1v">Interview a team before their matches</p> <form class="svelte-11rux1v"><label class="svelte-11rux1v">Team `);
		$$renderer.select({ value: selectedTeam }, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`Select team...`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(data.teams);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let team = each_array[$$index];
				$$renderer.option({ value: team.number }, ($$renderer) => {
					$$renderer.push(`#${escape_html(team.number)} - ${escape_html(team.name)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</label> <label class="svelte-11rux1v">Drivetrain `);
		$$renderer.select({ value: drivetrain }, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`Select...`);
			});
			$$renderer.option({ value: "mecanum" }, ($$renderer) => {
				$$renderer.push(`Mecanum`);
			});
			$$renderer.option({ value: "tank" }, ($$renderer) => {
				$$renderer.push(`Tank / Differential`);
			});
			$$renderer.option({ value: "swerve" }, ($$renderer) => {
				$$renderer.push(`Swerve`);
			});
			$$renderer.option({ value: "other" }, ($$renderer) => {
				$$renderer.push(`Other`);
			});
		});
		$$renderer.push(`</label> <label class="svelte-11rux1v">Intake Type `);
		$$renderer.select({ value: intakeType }, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`Select...`);
			});
			$$renderer.option({ value: "claw" }, ($$renderer) => {
				$$renderer.push(`Claw / Gripper`);
			});
			$$renderer.option({ value: "roller" }, ($$renderer) => {
				$$renderer.push(`Roller Intake`);
			});
			$$renderer.option({ value: "vacuum" }, ($$renderer) => {
				$$renderer.push(`Vacuum / Suction`);
			});
			$$renderer.option({ value: "scoop" }, ($$renderer) => {
				$$renderer.push(`Scoop`);
			});
			$$renderer.option({ value: "none" }, ($$renderer) => {
				$$renderer.push(`No Intake`);
			});
			$$renderer.option({ value: "other" }, ($$renderer) => {
				$$renderer.push(`Other`);
			});
		});
		$$renderer.push(`</label> <fieldset class="capability-checks svelte-11rux1v"><legend class="svelte-11rux1v">DECODE Capabilities</legend> <label class="check-row svelte-11rux1v"><input type="checkbox"${attr("checked", canScoreGoal, true)} class="svelte-11rux1v"/> <span class="svelte-11rux1v">Can score ARTIFACTS in GOAL</span></label> <label class="check-row svelte-11rux1v"><input type="checkbox"${attr("checked", canClassify, true)} class="svelte-11rux1v"/> <span class="svelte-11rux1v">Can CLASSIFY (artifacts go to RAMP)</span></label> <label class="check-row svelte-11rux1v"><input type="checkbox"${attr("checked", canOpenGate, true)} class="svelte-11rux1v"/> <span class="svelte-11rux1v">Can open GATE</span></label></fieldset> <label class="svelte-11rux1v">Auto Capabilities <textarea placeholder="Can they LEAVE? Score in auto? Read the OBELISK MOTIF?">`);
		const $$body = escape_html(autoCap);
		if ($$body) $$renderer.push(`${$$body}`);
		$$renderer.push(`</textarea></label> <label class="svelte-11rux1v">Teleop Strategy <textarea placeholder="Scoring speed? Use LOADING ZONE? Go for PATTERN?">`);
		const $$body_1 = escape_html(teleopCap);
		if ($$body_1) $$renderer.push(`${$$body_1}`);
		$$renderer.push(`</textarea></label> <label class="svelte-11rux1v">Endgame / BASE <textarea placeholder="Can they return to BASE? Partial or full?">`);
		const $$body_2 = escape_html(endgameCap);
		if ($$body_2) $$renderer.push(`${$$body_2}`);
		$$renderer.push(`</textarea></label> <label class="svelte-11rux1v">Strengths <textarea placeholder="What are they good at?">`);
		const $$body_3 = escape_html(strengths);
		if ($$body_3) $$renderer.push(`${$$body_3}`);
		$$renderer.push(`</textarea></label> <label class="svelte-11rux1v">Weaknesses <textarea placeholder="Areas of concern?">`);
		const $$body_4 = escape_html(weaknesses);
		if ($$body_4) $$renderer.push(`${$$body_4}`);
		$$renderer.push(`</textarea></label> <label class="svelte-11rux1v">Additional Notes <textarea placeholder="Anything else...">`);
		const $$body_5 = escape_html(notes);
		if ($$body_5) $$renderer.push(`${$$body_5}`);
		$$renderer.push(`</textarea></label> <button type="submit" class="primary"${attr("disabled", true, true)}>${escape_html("Submit Pre-Scout")}</button></form> `);
		if (data.myPrescouts.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="svelte-11rux1v"><h3 class="svelte-11rux1v">Your Previous Pre-Scouts</h3> <!--[-->`);
			const each_array_1 = ensure_array_like(data.myPrescouts);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let ps = each_array_1[$$index_1];
				$$renderer.push(`<div class="card"><div class="ps-header svelte-11rux1v"><span class="team-num svelte-11rux1v">#${escape_html(ps.team_number)}</span> <span>${escape_html(ps.team_name)}</span></div> <div class="ps-detail svelte-11rux1v">`);
				if (ps.drivetrain) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span>Drivetrain: ${escape_html(ps.drivetrain)}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (ps.strengths) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span>Strengths: ${escape_html(ps.strengths)}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
