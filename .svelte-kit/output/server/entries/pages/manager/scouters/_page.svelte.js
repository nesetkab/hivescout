import "../../../../chunks/index-server.js";
import { C as escape_html, i as ensure_array_like, n as attr_style, r as derived, s as stringify, t as attr_class, x as attr } from "../../../../chunks/server.js";
import "../../../../chunks/navigation.js";
//#region src/routes/manager/scouters/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let accuracy = [];
		let newGroupName = "";
		let addToGroup = "";
		let addScouter = "";
		let shiftLength = 5;
		let activeGroups = 1;
		let generating = false;
		const groupColors = [
			"#ffd96b",
			"#6bff8a",
			"#6ba3ff",
			"#ff6b6b",
			"#b07aff",
			"#6bffd9"
		];
		function groupColor(index) {
			return groupColors[index % groupColors.length];
		}
		let unassigned = derived(() => (data.scouters || []).filter((s) => !s.group_id));
		let poolSize = derived(() => {
			if (!data.groups?.length || !data.groupMembers) return 0;
			const sizes = data.groups.map((g) => data.groupMembers.filter((m) => m.group_id === g.id).length);
			const avg = sizes.length ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0;
			return Math.round(avg * activeGroups);
		});
		let scheduleByMatch = derived(() => {
			const map = /* @__PURE__ */ new Map();
			for (const a of data.schedulePreview || []) {
				if (!map.has(a.match_number)) map.set(a.match_number, []);
				map.get(a.match_number).push(a);
			}
			return Array.from(map.entries()).map(([num, assignments]) => ({
				match_number: num,
				assignments
			}));
		});
		$$renderer.push(`<div class="scouters-page svelte-qq17pr"><h2>Scouters &amp; Shifts</h2> <div class="section-grid svelte-qq17pr"><div class="section svelte-qq17pr"><h3 class="svelte-qq17pr">Groups</h3> <div class="create-row svelte-qq17pr"><input${attr("value", newGroupName)} placeholder="Group name..." class="svelte-qq17pr"/> <button class="primary"${attr("disabled", !newGroupName.trim(), true)}>Create</button></div> `);
		if (!data.groups?.length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="dim svelte-qq17pr">Create groups to organize your scouters into shifts</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="groups-grid svelte-qq17pr"><!--[-->`);
			const each_array = ensure_array_like(data.groups);
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let group = each_array[i];
				$$renderer.push(`<div class="card group-card svelte-qq17pr"${attr_style(`border-left: 4px solid ${stringify(groupColor(i))}`)}><div class="group-header svelte-qq17pr"><span class="group-name svelte-qq17pr">${escape_html(group.name)}</span> <button class="small danger svelte-qq17pr">x</button></div> <div class="member-list svelte-qq17pr"><!--[-->`);
				const each_array_1 = ensure_array_like(data.groupMembers.filter((m) => m.group_id === group.id));
				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let member = each_array_1[$$index];
					$$renderer.push(`<span class="member-tag svelte-qq17pr">${escape_html(member.scouter_name)} <button class="remove-x svelte-qq17pr">x</button></span>`);
				}
				$$renderer.push(`<!--]--> `);
				if (data.groupMembers.filter((m) => m.group_id === group.id).length === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="dim small-text svelte-qq17pr">No members</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--> `);
		if (data.groups?.length > 0 && unassigned().length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="assign-row svelte-qq17pr">`);
			$$renderer.select({
				value: addScouter,
				class: ""
			}, ($$renderer) => {
				$$renderer.option({ value: "" }, ($$renderer) => {
					$$renderer.push(`Scouter...`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array_2 = ensure_array_like(unassigned());
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let s = each_array_2[$$index_2];
					$$renderer.option({ value: s.id }, ($$renderer) => {
						$$renderer.push(`${escape_html(s.name)}`);
					});
				}
				$$renderer.push(`<!--]-->`);
			}, "svelte-qq17pr");
			$$renderer.push(` `);
			$$renderer.select({
				value: addToGroup,
				class: ""
			}, ($$renderer) => {
				$$renderer.option({ value: "" }, ($$renderer) => {
					$$renderer.push(`Group...`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array_3 = ensure_array_like(data.groups);
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let g = each_array_3[$$index_3];
					$$renderer.option({ value: g.id }, ($$renderer) => {
						$$renderer.push(`${escape_html(g.name)}`);
					});
				}
				$$renderer.push(`<!--]-->`);
			}, "svelte-qq17pr");
			$$renderer.push(` <button${attr("disabled", true, true)}>Add</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="section svelte-qq17pr"><h3 class="svelte-qq17pr">Schedule Generator</h3> `);
		if ((data.groups?.length || 0) < 2) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="dim svelte-qq17pr">Create at least 2 groups to generate a rotation schedule</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="gen-controls svelte-qq17pr"><div class="gen-row svelte-qq17pr"><label class="gen-label svelte-qq17pr">Matches per shift <input type="number"${attr("value", shiftLength)} min="1" max="50" style="width: 70px;" class="svelte-qq17pr"/></label> <label class="gen-label svelte-qq17pr">Groups active at once <input type="number"${attr("value", activeGroups)} min="1"${attr("max", data.groups.length)} style="width: 70px;" class="svelte-qq17pr"/></label></div> <div class="gen-preview svelte-qq17pr">`);
			if (activeGroups === 1) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="dim svelte-qq17pr">Rotation:</span> <!--[-->`);
				const each_array_4 = ensure_array_like(data.groups);
				for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
					let g = each_array_4[i];
					$$renderer.push(`<span class="rotation-tag svelte-qq17pr"${attr_style(`background: ${stringify(groupColor(i))}`)}>${escape_html(g.name)}</span> `);
					if (i < data.groups.length - 1) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="dim svelte-qq17pr">then</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--> <span class="dim svelte-qq17pr">repeat</span>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<span class="dim svelte-qq17pr">${escape_html(activeGroups)} groups overlap per shift, ${escape_html(data.groups.length - activeGroups)} on break.</span> <span class="dim svelte-qq17pr">~${escape_html(poolSize())} scouters cover ${escape_html(Math.min(4, poolSize()))} teams/match.</span>`);
			}
			$$renderer.push(`<!--]--></div> <div class="gen-buttons svelte-qq17pr"><button class="primary"${attr("disabled", generating, true)}>${escape_html("Generate Schedule")}</button> `);
			if (data.assignmentCount > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="danger">Clear</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			if (data.assignmentCount > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="dim svelte-qq17pr">${escape_html(data.assignmentCount)} assignments active</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div></div> `);
		if (scheduleByMatch().length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="section svelte-qq17pr"><h3 class="svelte-qq17pr">Schedule (${escape_html(scheduleByMatch().length)} matches)</h3> <div class="schedule-table-wrap svelte-qq17pr"><table class="schedule-table svelte-qq17pr"><thead><tr><th class="svelte-qq17pr">Match</th><th class="svelte-qq17pr">Group</th><th class="svelte-qq17pr">Assignments</th></tr></thead><tbody><!--[-->`);
			const each_array_5 = ensure_array_like(scheduleByMatch());
			for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
				let row = each_array_5[i];
				const activeGroupNames = [...new Set(row.assignments.map((a) => a.group_name))];
				const prevGroupNames = i > 0 ? [...new Set(scheduleByMatch()[i - 1].assignments.map((a) => a.group_name))] : [];
				if (i > 0 && JSON.stringify(activeGroupNames.sort()) !== JSON.stringify(prevGroupNames.sort())) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<tr class="shift-break svelte-qq17pr"><td colspan="3" class="svelte-qq17pr">SHIFT CHANGE</td></tr>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <tr><td class="match-col svelte-qq17pr">Q${escape_html(row.match_number)}</td><td class="group-col svelte-qq17pr"><!--[-->`);
				const each_array_6 = ensure_array_like(activeGroupNames);
				for (let $$index_5 = 0, $$length = each_array_6.length; $$index_5 < $$length; $$index_5++) {
					let gName = each_array_6[$$index_5];
					$$renderer.push(`<span class="group-badge svelte-qq17pr"${attr_style(`background: ${stringify(groupColor(data.groups.findIndex((g) => g.name === gName)))}`)}>${escape_html(gName)}</span>`);
				}
				$$renderer.push(`<!--]--></td><td class="assign-col svelte-qq17pr"><!--[-->`);
				const each_array_7 = ensure_array_like(row.assignments);
				for (let $$index_6 = 0, $$length = each_array_7.length; $$index_6 < $$length; $$index_6++) {
					let a = each_array_7[$$index_6];
					$$renderer.push(`<span class="assign-chip svelte-qq17pr"${attr_style(`border-left: 3px solid ${stringify(groupColor(data.groups.findIndex((g) => g.name === a.group_name)))}`)}><span class="assign-scouter svelte-qq17pr">${escape_html(a.scouter_name)}</span> <span class="assign-team svelte-qq17pr">#${escape_html(a.team_number)}</span></span>`);
				}
				$$renderer.push(`<!--]--></td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="section svelte-qq17pr"><div class="section-header svelte-qq17pr"><h3 class="svelte-qq17pr">All Scouters (${escape_html((data.scouters || []).length)})</h3> `);
		if (data.scouters?.length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="small danger svelte-qq17pr">Delete All</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (!data.scouters?.length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="dim svelte-qq17pr">No scouters have joined yet. Scouters are created when they enter the app.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="scouter-grid svelte-qq17pr"><!--[-->`);
			const each_array_8 = ensure_array_like(data.scouters);
			for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
				let scouter = each_array_8[$$index_8];
				$$renderer.push(`<div class="card scouter-card svelte-qq17pr"><div class="scouter-header svelte-qq17pr"><span class="scouter-name svelte-qq17pr">${escape_html(scouter.name)}</span> <span class="scout-count svelte-qq17pr">${escape_html(scouter.scout_count)} scouts</span> <button class="remove-x svelte-qq17pr">x</button></div> `);
				if (scouter.group_name) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="group-badge small svelte-qq17pr"${attr_style(`background: ${stringify(groupColor(data.groups.findIndex((g) => g.name === scouter.group_name)))}`)}>${escape_html(scouter.group_name)}</span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="dim small-text svelte-qq17pr">No group</span>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="section svelte-qq17pr"><h3 class="svelte-qq17pr">Scouter Accuracy</h3> `);
		if (accuracy.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="dim svelte-qq17pr">No accuracy data yet. Import an event with completed matches.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="accuracy-grid svelte-qq17pr"><!--[-->`);
			const each_array_9 = ensure_array_like(accuracy);
			for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
				let s = each_array_9[$$index_9];
				const pct = s.withScores > 0 ? Math.max(0, Math.round(100 - s.avgAbsDev * 2.5)) : null;
				const grade = pct === null ? "-" : pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
				const gradeColor = grade === "A" ? "green" : grade === "B" ? "green" : grade === "C" ? "yellow-c" : grade === "D" ? "red-c" : grade === "F" ? "red-c" : "";
				$$renderer.push(`<div class="card accuracy-card svelte-qq17pr"><div class="acc-header svelte-qq17pr"><span class="acc-name svelte-qq17pr">${escape_html(s.name)}</span> <span${attr_class(`acc-grade ${stringify(gradeColor)}`, "svelte-qq17pr")}>${escape_html(grade)}</span></div> `);
				if (s.withScores > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="acc-pct svelte-qq17pr">${escape_html(pct)}%</span> <span class="acc-detail svelte-qq17pr">${escape_html(s.withScores)} matches graded</span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="dim small-text svelte-qq17pr">No graded matches</span>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}
//#endregion
export { _page as default };
