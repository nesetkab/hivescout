import { a2 as ensure_array_like, a3 as attr, a4 as attr_class, R as escape_html, K as derived, a5 as store_get, a6 as unsubscribe_stores } from './server-CrZugHhs.js';
import './client-DdAPveIL.js';
import { p as page } from './stores-CGuWsqoT.js';
import './internal-Bb7m12Lp.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

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

export { _layout as default };
//# sourceMappingURL=_layout.svelte-CpSlIluA.js.map
