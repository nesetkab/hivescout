
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/analytics" | "/api/export" | "/api/groups" | "/api/groups/members" | "/api/import" | "/api/import/scores" | "/api/matches" | "/api/matchscout" | "/api/notes" | "/api/prescout" | "/api/schedule" | "/api/scouter-accuracy" | "/api/scouters" | "/api/scouters/assign" | "/api/seed-test" | "/api/teams" | "/manager" | "/manager/analytics" | "/manager/analytics/[team]" | "/manager/predictions" | "/manager/scouters" | "/manager/scouts" | "/manager/setup" | "/scout" | "/scout/match" | "/scout/prescout";
		RouteParams(): {
			"/manager/analytics/[team]": { team: string }
		};
		LayoutParams(): {
			"/": { team?: string };
			"/api": Record<string, never>;
			"/api/analytics": Record<string, never>;
			"/api/export": Record<string, never>;
			"/api/groups": Record<string, never>;
			"/api/groups/members": Record<string, never>;
			"/api/import": Record<string, never>;
			"/api/import/scores": Record<string, never>;
			"/api/matches": Record<string, never>;
			"/api/matchscout": Record<string, never>;
			"/api/notes": Record<string, never>;
			"/api/prescout": Record<string, never>;
			"/api/schedule": Record<string, never>;
			"/api/scouter-accuracy": Record<string, never>;
			"/api/scouters": Record<string, never>;
			"/api/scouters/assign": Record<string, never>;
			"/api/seed-test": Record<string, never>;
			"/api/teams": Record<string, never>;
			"/manager": { team?: string };
			"/manager/analytics": { team?: string };
			"/manager/analytics/[team]": { team: string };
			"/manager/predictions": Record<string, never>;
			"/manager/scouters": Record<string, never>;
			"/manager/scouts": Record<string, never>;
			"/manager/setup": Record<string, never>;
			"/scout": Record<string, never>;
			"/scout/match": Record<string, never>;
			"/scout/prescout": Record<string, never>
		};
		Pathname(): "/" | "/api/analytics" | "/api/export" | "/api/groups" | "/api/groups/members" | "/api/import" | "/api/import/scores" | "/api/matches" | "/api/matchscout" | "/api/notes" | "/api/prescout" | "/api/schedule" | "/api/scouter-accuracy" | "/api/scouters" | "/api/scouters/assign" | "/api/seed-test" | "/api/teams" | "/manager" | "/manager/analytics" | `/manager/analytics/${string}` & {} | "/manager/predictions" | "/manager/scouters" | "/manager/scouts" | "/manager/setup" | "/scout" | "/scout/match" | "/scout/prescout";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.svg" | "/field.png" | "/icon-192.png" | "/icon-512.png" | "/logo-long.svg" | "/logo.svg" | "/manifest.json" | "/sw.js" | string & {};
	}
}