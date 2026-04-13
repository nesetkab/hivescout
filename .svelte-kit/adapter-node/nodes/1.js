

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.B-rB_JhY.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/e7lCAgNO.js","_app/immutable/chunks/t62M88qj.js"];
export const stylesheets = [];
export const fonts = [];
