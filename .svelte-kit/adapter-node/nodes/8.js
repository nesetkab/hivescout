import * as server from '../entries/pages/manager/predictions/_page.server.ts.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/manager/predictions/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/manager/predictions/+page.server.ts";
export const imports = ["_app/immutable/nodes/8.C1kSFikq.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/t62M88qj.js"];
export const stylesheets = ["_app/immutable/assets/8.Cw-Wa63C.css"];
export const fonts = [];
