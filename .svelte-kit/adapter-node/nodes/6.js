import * as server from '../entries/pages/manager/analytics/_page.server.ts.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/manager/analytics/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/manager/analytics/+page.server.ts";
export const imports = ["_app/immutable/nodes/6.DkN8K_Cl.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/t62M88qj.js"];
export const stylesheets = ["_app/immutable/assets/6.DuWsKv74.css"];
export const fonts = [];
