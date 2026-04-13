import "../../../chunks/index-server.js";
import { C as escape_html, c as unsubscribe_stores, i as ensure_array_like, o as store_get, r as derived, s as stringify, t as attr_class, x as attr } from "../../../chunks/server.js";
import "../../../chunks/client.js";
import { t as page } from "../../../chunks/stores.js";
import "../../../chunks/navigation.js";
import { t as matchActive } from "../../../chunks/stores2.js";
//#region src/routes/scout/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		let scouting = derived(() => store_get($$store_subs ??= {}, "$matchActive", matchActive));
		let currentPath = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname);
		let scouterName = derived(() => store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("name") || "Unknown");
		let now = /* @__PURE__ */ new Date();
		let clockStr = derived(() => now.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit"
		}));
		const tabs = [
			{
				path: "/scout",
				label: "Dashboard"
			},
			{
				path: "/scout/prescout",
				label: "Pre-Scout"
			},
			{
				path: "/scout/match",
				label: "Match"
			}
		];
		$$renderer.push(`<div class="scout-layout svelte-1fya954"><header class="svelte-1fya954"><img src="/logo-long.svg" alt="HiveScout" class="header-logo svelte-1fya954"/> <span class="clock svelte-1fya954">${escape_html(clockStr())}</span> <span class="scouter-name svelte-1fya954">${escape_html(scouterName())}</span></header> <main${attr_class("svelte-1fya954", void 0, { "scouting": scouting() })}>`);
		children($$renderer);
		$$renderer.push(`<!----></main> `);
		if (!scouting()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<nav class="svelte-1fya954"><!--[-->`);
			const each_array = ensure_array_like(tabs);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let tab = each_array[$$index];
				$$renderer.push(`<a${attr("href", `${stringify(tab.path)}?name=${stringify(encodeURIComponent(scouterName()))}`)}${attr_class("svelte-1fya954", void 0, { "active": currentPath() === tab.path })}>${escape_html(tab.label)}</a>`);
			}
			$$renderer.push(`<!--]--></nav>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _layout as default };
