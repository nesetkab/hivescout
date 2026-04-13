import * as server from '../entries/pages/scout/match/_page.server.ts.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/scout/match/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/scout/match/+page.server.ts";
export const imports = ["_app/immutable/nodes/13.D9ofOqx4.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/e7lCAgNO.js","_app/immutable/chunks/aZinjOF-.js","_app/immutable/chunks/t62M88qj.js","_app/immutable/chunks/BJCAe_y5.js"];
export const stylesheets = ["_app/immutable/assets/13.CxpkB7zE.css"];
export const fonts = [];
