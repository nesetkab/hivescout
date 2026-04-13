const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["field.png","icon-192.png","icon-512.png","logo-long.svg","logo.svg","manifest.json","sw.js"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml",".json":"application/json",".js":"text/javascript"},
	_: {
		client: {start:"_app/immutable/entry/start.Cjcpajej.js",app:"_app/immutable/entry/app.DfIwzeyA.js",imports:["_app/immutable/entry/start.Cjcpajej.js","_app/immutable/chunks/BzSQjt5-.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/entry/app.DfIwzeyA.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/C-OaypFN.js","_app/immutable/chunks/t62M88qj.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-D6mekkhe.js')),
			__memo(() => import('./chunks/1-Y9QySrRo.js')),
			__memo(() => import('./chunks/2-BBePfnsh.js')),
			__memo(() => import('./chunks/3-7ZgWXHcg.js')),
			__memo(() => import('./chunks/4-D1aN5WTR.js')),
			__memo(() => import('./chunks/5-DDavfSyi.js')),
			__memo(() => import('./chunks/6-DS6rFGQ-.js')),
			__memo(() => import('./chunks/7-DxC99CEE.js')),
			__memo(() => import('./chunks/8-2_3EwXj2.js')),
			__memo(() => import('./chunks/9-BCceQkrJ.js')),
			__memo(() => import('./chunks/10-Dclf1OwX.js')),
			__memo(() => import('./chunks/11-BRRxsFU2.js')),
			__memo(() => import('./chunks/12-CLbp-Bej.js')),
			__memo(() => import('./chunks/13-CQIGaaj-.js')),
			__memo(() => import('./chunks/14-Cms423uo.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/api/analytics",
				pattern: /^\/api\/analytics\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-ByxdFwoJ.js'))
			},
			{
				id: "/api/export",
				pattern: /^\/api\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-D9Jhev6g.js'))
			},
			{
				id: "/api/groups",
				pattern: /^\/api\/groups\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DI0uzl1g.js'))
			},
			{
				id: "/api/groups/members",
				pattern: /^\/api\/groups\/members\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CVf1W4n2.js'))
			},
			{
				id: "/api/import",
				pattern: /^\/api\/import\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BHvUgVOe.js'))
			},
			{
				id: "/api/import/scores",
				pattern: /^\/api\/import\/scores\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DzXSz282.js'))
			},
			{
				id: "/api/matches",
				pattern: /^\/api\/matches\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-D3rzDfvx.js'))
			},
			{
				id: "/api/matchscout",
				pattern: /^\/api\/matchscout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BZBbjB5x.js'))
			},
			{
				id: "/api/notes",
				pattern: /^\/api\/notes\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-B5haIItD.js'))
			},
			{
				id: "/api/prescout",
				pattern: /^\/api\/prescout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DNmWnsjP.js'))
			},
			{
				id: "/api/schedule",
				pattern: /^\/api\/schedule\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-C7rvQM8H.js'))
			},
			{
				id: "/api/scouter-accuracy",
				pattern: /^\/api\/scouter-accuracy\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Bk2-nHqf.js'))
			},
			{
				id: "/api/scouters",
				pattern: /^\/api\/scouters\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BvVZFRMJ.js'))
			},
			{
				id: "/api/scouters/assign",
				pattern: /^\/api\/scouters\/assign\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BR88bJts.js'))
			},
			{
				id: "/api/seed-test",
				pattern: /^\/api\/seed-test\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-ByhtEbfT.js'))
			},
			{
				id: "/api/teams",
				pattern: /^\/api\/teams\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BpEbexv8.js'))
			},
			{
				id: "/manager",
				pattern: /^\/manager\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/manager/analytics",
				pattern: /^\/manager\/analytics\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/manager/analytics/[team]",
				pattern: /^\/manager\/analytics\/([^/]+?)\/?$/,
				params: [{"name":"team","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/manager/predictions",
				pattern: /^\/manager\/predictions\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/manager/scouters",
				pattern: /^\/manager\/scouters\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/manager/scouts",
				pattern: /^\/manager\/scouts\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/manager/setup",
				pattern: /^\/manager\/setup\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/scout",
				pattern: /^\/scout\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/scout/match",
				pattern: /^\/scout\/match\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/scout/prescout",
				pattern: /^\/scout\/prescout\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 14 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
