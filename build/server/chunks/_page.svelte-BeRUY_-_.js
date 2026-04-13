import { a3 as attr, a7 as stringify } from './server-CrZugHhs.js';

//#region src/routes/+page.svelte
function _page($$renderer) {
	let name = "";
	$$renderer.push(`<div class="landing svelte-1uha8ag"><img src="/logo.svg" alt="HiveScout" class="logo svelte-1uha8ag"/> <p class="svelte-1uha8ag">FTC Scouting System</p> <div class="entry svelte-1uha8ag"><input${attr("value", name)} placeholder="Your name"/> <div class="buttons svelte-1uha8ag"><a${attr("href", `/scout?name=${stringify(encodeURIComponent(name))}`)} class="svelte-1uha8ag"><button class="primary svelte-1uha8ag"${attr("disabled", !name.trim(), true)}>Enter as Scouter</button></a> <a href="/manager" class="svelte-1uha8ag"><button class="svelte-1uha8ag">Enter as Manager</button></a></div></div></div>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BeRUY_-_.js.map
