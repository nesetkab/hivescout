import "../../../chunks/index-server.js";
import { C as escape_html, c as unsubscribe_stores, i as ensure_array_like, o as store_get, r as derived, t as attr_class, x as attr } from "../../../chunks/server.js";
import "../../../chunks/client.js";
import { t as page } from "../../../chunks/stores.js";
import "../../../chunks/navigation.js";
//#region src/routes/manager/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		let currentPath = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname);
		const tabs = [
			{
				path: "/manager",
				label: "Overview"
			},
			{
				path: "/manager/scouters",
				label: "Scouters"
			},
			{
				path: "/manager/scouts",
				label: "Scouts"
			},
			{
				path: "/manager/analytics",
				label: "Analytics"
			},
			{
				path: "/manager/predictions",
				label: "Predictions"
			},
			{
				path: "/manager/setup",
				label: "Setup"
			}
		];
		$$renderer.push(`<div class="manager-layout svelte-1xi4ot"><header class="svelte-1xi4ot"><a href="/" class="title svelte-1xi4ot"><img src="/logo-long.svg" alt="HiveScout" class="header-logo svelte-1xi4ot"/></a> <span class="subtitle svelte-1xi4ot">Manager</span> <nav class="svelte-1xi4ot"><!--[-->`);
		const each_array = ensure_array_like(tabs);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tab = each_array[$$index];
			$$renderer.push(`<a${attr("href", tab.path)}${attr_class("svelte-1xi4ot", void 0, { "active": currentPath() === tab.path || tab.path !== "/manager" && currentPath().startsWith(tab.path + "/") })}>${escape_html(tab.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></header> <main class="svelte-1xi4ot">`);
		children($$renderer);
		$$renderer.push(`<!----></main></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _layout as default };
