import * as server from '../entries/pages/manager/setup/_page.server.ts.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/manager/setup/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/manager/setup/+page.server.ts";
export const imports = ["_app/immutable/nodes/11.DdG67Qg8.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/BzSQjt5-.js","_app/immutable/chunks/B_xp5TRh.js","_app/immutable/chunks/t62M88qj.js"];
export const stylesheets = ["_app/immutable/assets/11.B60VFYtO.css"];
export const fonts = [];
