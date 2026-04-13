export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg","field.png","icon-192.png","icon-512.png","logo-long.svg","logo.svg","manifest.json","sw.js"]),
	mimeTypes: {".svg":"image/svg+xml",".png":"image/png",".json":"application/json",".js":"text/javascript"},
	_: {
		client: {start:"_app/immutable/entry/start.KMM5Fwdm.js",app:"_app/immutable/entry/app.CzX90M8T.js",imports:["_app/immutable/entry/start.KMM5Fwdm.js","_app/immutable/chunks/e7lCAgNO.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/entry/app.CzX90M8T.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/C-OaypFN.js","_app/immutable/chunks/t62M88qj.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js'))
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
				endpoint: __memo(() => import('./entries/endpoints/api/analytics/_server.ts.js'))
			},
			{
				id: "/api/export",
				pattern: /^\/api\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/export/_server.ts.js'))
			},
			{
				id: "/api/groups",
				pattern: /^\/api\/groups\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/groups/_server.ts.js'))
			},
			{
				id: "/api/groups/members",
				pattern: /^\/api\/groups\/members\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/groups/members/_server.ts.js'))
			},
			{
				id: "/api/import",
				pattern: /^\/api\/import\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/import/_server.ts.js'))
			},
			{
				id: "/api/import/scores",
				pattern: /^\/api\/import\/scores\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/import/scores/_server.ts.js'))
			},
			{
				id: "/api/matches",
				pattern: /^\/api\/matches\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/matches/_server.ts.js'))
			},
			{
				id: "/api/matchscout",
				pattern: /^\/api\/matchscout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/matchscout/_server.ts.js'))
			},
			{
				id: "/api/notes",
				pattern: /^\/api\/notes\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/notes/_server.ts.js'))
			},
			{
				id: "/api/prescout",
				pattern: /^\/api\/prescout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/prescout/_server.ts.js'))
			},
			{
				id: "/api/schedule",
				pattern: /^\/api\/schedule\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/schedule/_server.ts.js'))
			},
			{
				id: "/api/scouter-accuracy",
				pattern: /^\/api\/scouter-accuracy\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/scouter-accuracy/_server.ts.js'))
			},
			{
				id: "/api/scouters",
				pattern: /^\/api\/scouters\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/scouters/_server.ts.js'))
			},
			{
				id: "/api/scouters/assign",
				pattern: /^\/api\/scouters\/assign\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/scouters/assign/_server.ts.js'))
			},
			{
				id: "/api/seed-test",
				pattern: /^\/api\/seed-test\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/seed-test/_server.ts.js'))
			},
			{
				id: "/api/teams",
				pattern: /^\/api\/teams\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/teams/_server.ts.js'))
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
