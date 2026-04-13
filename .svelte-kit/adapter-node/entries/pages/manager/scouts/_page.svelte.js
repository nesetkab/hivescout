import { C as escape_html, i as ensure_array_like, r as derived, t as attr_class, x as attr } from "../../../../chunks/server.js";
import "../../../../chunks/navigation.js";
//#region src/routes/manager/scouts/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let search = "";
		let filterTeam = "";
		let editingId = null;
		let editForm = {};
		let filtered = derived(() => {
			let arr = data.scouts;
			if (search.trim());
			return arr;
		});
		$$renderer.push(`<div class="scouts-page svelte-18mnzjc"><div class="header-row svelte-18mnzjc"><h2>All Scouts (${escape_html(data.scouts.length)})</h2> <div class="filters svelte-18mnzjc"><input${attr("value", search)} placeholder="Search..." class="search-input svelte-18mnzjc"/> `);
		$$renderer.select({
			value: filterTeam,
			class: ""
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`All teams`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(data.teams);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let t = each_array[$$index];
				$$renderer.option({ value: t.number }, ($$renderer) => {
					$$renderer.push(`#${escape_html(t.number)} ${escape_html(t.name)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		}, "svelte-18mnzjc");
		$$renderer.push(`</div></div> `);
		if (filtered().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="empty svelte-18mnzjc">No scouts found</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="scouts-list svelte-18mnzjc"><!--[-->`);
			const each_array_1 = ensure_array_like(filtered());
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let scout = each_array_1[$$index_1];
				$$renderer.push(`<div${attr_class("card scout-row svelte-18mnzjc", void 0, { "editing": editingId === scout.id })}><div class="scout-header svelte-18mnzjc"><span class="match-num svelte-18mnzjc">Q${escape_html(scout.match_number)}</span> <span class="team svelte-18mnzjc">#${escape_html(scout.team_number)} ${escape_html(scout.team_name)}</span> <span class="scouter svelte-18mnzjc">${escape_html(scout.scouter_name)}</span> <div class="actions svelte-18mnzjc">`);
				if (editingId === scout.id) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="primary small svelte-18mnzjc">Save</button> <button class="small svelte-18mnzjc">Cancel</button>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<button class="small svelte-18mnzjc">Edit</button> <button class="small danger svelte-18mnzjc">Delete</button>`);
				}
				$$renderer.push(`<!--]--></div></div> `);
				if (editingId === scout.id) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="edit-form svelte-18mnzjc"><div class="edit-grid svelte-18mnzjc"><label class="svelte-18mnzjc"><span>Auto Leave</span> `);
					$$renderer.select({
						value: editForm.auto_leave,
						class: ""
					}, ($$renderer) => {
						$$renderer.option({ value: 0 }, ($$renderer) => {
							$$renderer.push(`No`);
						});
						$$renderer.option({ value: 1 }, ($$renderer) => {
							$$renderer.push(`Yes`);
						});
					}, "svelte-18mnzjc");
					$$renderer.push(`</label> <label class="svelte-18mnzjc"><span>Auto Cls</span> <input type="number"${attr("value", editForm.auto_classified)} min="0" class="svelte-18mnzjc"/></label> <label class="svelte-18mnzjc"><span>Auto Ovf</span> <input type="number"${attr("value", editForm.auto_overflow)} min="0" class="svelte-18mnzjc"/></label> <label class="svelte-18mnzjc"><span>Tel Cls</span> <input type="number"${attr("value", editForm.teleop_classified)} min="0" class="svelte-18mnzjc"/></label> <label class="svelte-18mnzjc"><span>Tel Ovf</span> <input type="number"${attr("value", editForm.teleop_overflow)} min="0" class="svelte-18mnzjc"/></label> <label class="svelte-18mnzjc"><span>Gate</span> `);
					$$renderer.select({
						value: editForm.opened_gate,
						class: ""
					}, ($$renderer) => {
						$$renderer.option({ value: 0 }, ($$renderer) => {
							$$renderer.push(`No`);
						});
						$$renderer.option({ value: 1 }, ($$renderer) => {
							$$renderer.push(`Yes`);
						});
					}, "svelte-18mnzjc");
					$$renderer.push(`</label> <label class="svelte-18mnzjc"><span>BASE</span> `);
					$$renderer.select({
						value: editForm.endgame_base,
						class: ""
					}, ($$renderer) => {
						$$renderer.option({ value: "none" }, ($$renderer) => {
							$$renderer.push(`None`);
						});
						$$renderer.option({ value: "partial" }, ($$renderer) => {
							$$renderer.push(`Partial`);
						});
						$$renderer.option({ value: "full" }, ($$renderer) => {
							$$renderer.push(`Full`);
						});
					}, "svelte-18mnzjc");
					$$renderer.push(`</label> <label class="svelte-18mnzjc"><span>Skill</span> <input type="number"${attr("value", editForm.driver_skill)} min="1" max="5" class="svelte-18mnzjc"/></label> <label class="svelte-18mnzjc"><span>Reliability</span> <input type="number"${attr("value", editForm.reliability)} min="1" max="5" class="svelte-18mnzjc"/></label> <label class="svelte-18mnzjc"><span>Defense</span> <input type="number"${attr("value", editForm.defense_rating)} min="1" max="5" class="svelte-18mnzjc"/></label></div> <label class="notes-edit svelte-18mnzjc"><span>Notes</span> <textarea class="svelte-18mnzjc">`);
					const $$body = escape_html(editForm.notes);
					if ($$body) $$renderer.push(`${$$body}`);
					$$renderer.push(`</textarea></label></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="scout-stats svelte-18mnzjc"><span>A: ${escape_html(scout.auto_classified)}c ${escape_html(scout.auto_overflow)}o${escape_html(scout.auto_leave ? " +L" : "")}</span> <span>T: ${escape_html(scout.teleop_classified)}c ${escape_html(scout.teleop_overflow)}o</span> <span>BASE: ${escape_html(scout.endgame_base)}</span> <span>Gate: ${escape_html(scout.opened_gate ? "Y" : "N")}</span> <span>Skill: ${escape_html(scout.driver_skill)}</span> <span>Rel: ${escape_html(scout.reliability)}</span></div> `);
					if (scout.notes) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="scout-notes svelte-18mnzjc">${escape_html(scout.notes)}</div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
