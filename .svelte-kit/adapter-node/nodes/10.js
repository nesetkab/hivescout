import * as server from '../entries/pages/manager/scouts/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/manager/scouts/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/manager/scouts/+page.server.ts";
export const imports = ["_app/immutable/nodes/10.BnJENlhP.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/BzSQjt5-.js","_app/immutable/chunks/B_xp5TRh.js","_app/immutable/chunks/t62M88qj.js"];
export const stylesheets = ["_app/immutable/assets/10.QeLlBQdx.css"];
export const fonts = [];
