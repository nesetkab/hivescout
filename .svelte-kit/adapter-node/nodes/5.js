import * as server from '../entries/pages/manager/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/manager/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/manager/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.crwjJicj.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/t62M88qj.js"];
export const stylesheets = ["_app/immutable/assets/5.brjYqr9x.css"];
export const fonts = [];
