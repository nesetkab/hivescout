import * as server from '../entries/pages/scout/_page.server.ts.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/scout/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/scout/+page.server.ts";
export const imports = ["_app/immutable/nodes/12.DeX3DBa9.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/t62M88qj.js"];
export const stylesheets = ["_app/immutable/assets/12.P4U54ro_.css"];
export const fonts = [];
