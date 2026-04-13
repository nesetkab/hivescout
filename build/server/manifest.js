const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","favicon.svg","field.png","logo-long.svg","logo.svg","manifest.json","sw.js"]),
	mimeTypes: {".svg":"image/svg+xml",".png":"image/png",".json":"application/json",".js":"text/javascript"},
	_: {
		client: {start:"_app/immutable/entry/start.D8EuTq3P.js",app:"_app/immutable/entry/app.BFfuK6rW.js",imports:["_app/immutable/entry/start.D8EuTq3P.js","_app/immutable/chunks/CV1jAoNy.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/entry/app.BFfuK6rW.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/C-OaypFN.js","_app/immutable/chunks/t62M88qj.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-D9j4hIJf.js')),
			__memo(() => import('./chunks/1-DrLSo415.js')),
			__memo(() => import('./chunks/2-oJRaCvGf.js')),
			__memo(() => import('./chunks/3-Ceeo6w9K.js')),
			__memo(() => import('./chunks/4-D-Ygz3jr.js')),
			__memo(() => import('./chunks/5-CICKUOIW.js')),
			__memo(() => import('./chunks/6-CfxN2FJP.js')),
			__memo(() => import('./chunks/7-Dl5SzXU2.js')),
			__memo(() => import('./chunks/8-BxZ3T0QR.js')),
			__memo(() => import('./chunks/9-B_UBXdGN.js')),
			__memo(() => import('./chunks/10-BZ9oX6YW.js')),
			__memo(() => import('./chunks/11-C-dOZf_1.js')),
			__memo(() => import('./chunks/12-DtDlpylj.js')),
			__memo(() => import('./chunks/13-s4GKNoqN.js')),
			__memo(() => import('./chunks/14-BDcewQZD.js'))
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
				endpoint: __memo(() => import('./chunks/_server.ts-DeprXLI_.js'))
			},
			{
				id: "/api/export",
				pattern: /^\/api\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CuUeFm6e.js'))
			},
			{
				id: "/api/groups",
				pattern: /^\/api\/groups\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BOKDjpZy.js'))
			},
			{
				id: "/api/groups/members",
				pattern: /^\/api\/groups\/members\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DLyaKmn_.js'))
			},
			{
				id: "/api/import",
				pattern: /^\/api\/import\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Honi2k5T.js'))
			},
			{
				id: "/api/import/scores",
				pattern: /^\/api\/import\/scores\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BGdMs_Uh.js'))
			},
			{
				id: "/api/matches",
				pattern: /^\/api\/matches\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BV_IybfG.js'))
			},
			{
				id: "/api/matchscout",
				pattern: /^\/api\/matchscout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-ClOv_qYw.js'))
			},
			{
				id: "/api/notes",
				pattern: /^\/api\/notes\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-8nxiKGpU.js'))
			},
			{
				id: "/api/prescout",
				pattern: /^\/api\/prescout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CWrRmphf.js'))
			},
			{
				id: "/api/schedule",
				pattern: /^\/api\/schedule\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BYTyvjeG.js'))
			},
			{
				id: "/api/scouter-accuracy",
				pattern: /^\/api\/scouter-accuracy\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-C9_F09bk.js'))
			},
			{
				id: "/api/scouters",
				pattern: /^\/api\/scouters\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-fpPO852Q.js'))
			},
			{
				id: "/api/scouters/assign",
				pattern: /^\/api\/scouters\/assign\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Do4pxm9t.js'))
			},
			{
				id: "/api/seed-test",
				pattern: /^\/api\/seed-test\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CyS29gGG.js'))
			},
			{
				id: "/api/teams",
				pattern: /^\/api\/teams\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Cul-gZ25.js'))
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
