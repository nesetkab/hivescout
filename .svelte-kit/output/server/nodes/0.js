

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.BBaaaUZM.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/t62M88qj.js"];
export const stylesheets = ["_app/immutable/assets/0.Cqw6YgFx.css"];
export const fonts = [];
