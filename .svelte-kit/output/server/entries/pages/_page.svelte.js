import { x as attr } from "../../chunks/server.js";
import "../../chunks/navigation.js";
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let name = "";
		$$renderer.push(`<div class="landing svelte-1uha8ag"><img src="/logo.svg" alt="HiveScout" class="logo svelte-1uha8ag"/> <div class="entry svelte-1uha8ag"><form class="svelte-1uha8ag"><input${attr("value", name)} placeholder="Your name"/> <div class="buttons svelte-1uha8ag"><button type="submit" class="primary svelte-1uha8ag"${attr("disabled", !name.trim(), true)}>Enter</button></div></form></div></div>`);
	});
}
//#endregion
export { _page as default };
