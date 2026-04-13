import Database from "better-sqlite3";
import { join } from "path";
//#region src/lib/server/db.ts
var db = new Database(process.env.DATABASE_PATH || join(process.cwd(), "hivescout.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    number INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    division TEXT NOT NULL DEFAULT 'default'
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_number INTEGER NOT NULL,
    division TEXT NOT NULL DEFAULT 'default',
    red1 INTEGER REFERENCES teams(number),
    red2 INTEGER REFERENCES teams(number),
    blue1 INTEGER REFERENCES teams(number),
    blue2 INTEGER REFERENCES teams(number),
    scheduled_time TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming'
  );

  CREATE TABLE IF NOT EXISTS scouters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'scouter',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scouter_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scouter_id INTEGER NOT NULL REFERENCES scouters(id),
    team_number INTEGER NOT NULL REFERENCES teams(number),
    UNIQUE(scouter_id, team_number)
  );

  CREATE TABLE IF NOT EXISTS prescout_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_number INTEGER NOT NULL REFERENCES teams(number),
    scouter_id INTEGER NOT NULL REFERENCES scouters(id),
    drivetrain TEXT,
    intake_type TEXT,
    can_score_goal INTEGER DEFAULT 0,
    can_classify INTEGER DEFAULT 0,
    can_open_gate INTEGER DEFAULT 0,
    auto_capabilities TEXT,
    teleop_capabilities TEXT,
    endgame_capabilities TEXT,
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);
if (db.prepare("PRAGMA table_info(match_scouts)").all().some((c) => c.name === "auto_samples_scored")) db.exec("DROP TABLE IF EXISTS match_scouts");
db.exec(`
  CREATE TABLE IF NOT EXISTS match_scouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    team_number INTEGER NOT NULL REFERENCES teams(number),
    scouter_id INTEGER NOT NULL REFERENCES scouters(id),
    -- AUTO (30s autonomous)
    auto_leave INTEGER DEFAULT 0,
    auto_classified INTEGER DEFAULT 0,
    auto_overflow INTEGER DEFAULT 0,
    auto_pattern_matches INTEGER DEFAULT 0,
    -- TELEOP (2:00 driver controlled)
    teleop_classified INTEGER DEFAULT 0,
    teleop_overflow INTEGER DEFAULT 0,
    teleop_depot INTEGER DEFAULT 0,
    teleop_pattern_matches INTEGER DEFAULT 0,
    -- gate
    opened_gate INTEGER DEFAULT 0,
    -- ENDGAME / BASE
    endgame_base TEXT DEFAULT 'none',
    -- qualitative
    defense_rating INTEGER DEFAULT 0,
    driver_skill INTEGER DEFAULT 0,
    reliability INTEGER DEFAULT 0,
    notes TEXT,
    -- penalties observed
    minor_fouls INTEGER DEFAULT 0,
    major_fouls INTEGER DEFAULT 0,
    yellow_card INTEGER DEFAULT 0,
    red_card INTEGER DEFAULT 0,
    -- timing
    started_at TEXT,
    ended_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS scout_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scout_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL REFERENCES scout_groups(id) ON DELETE CASCADE,
    scouter_id INTEGER NOT NULL REFERENCES scouters(id) ON DELETE CASCADE,
    UNIQUE(group_id, scouter_id)
  );

  CREATE TABLE IF NOT EXISTS shift_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    scouter_id INTEGER NOT NULL REFERENCES scouters(id),
    team_number INTEGER NOT NULL,
    group_id INTEGER NOT NULL REFERENCES scout_groups(id),
    is_break INTEGER NOT NULL DEFAULT 0,
    UNIQUE(match_id, team_number)
  );
`);
var matchCols = db.prepare("PRAGMA table_info(matches)").all();
if (!matchCols.some((c) => c.name === "score_red")) try {
	db.exec("ALTER TABLE matches ADD COLUMN score_red INTEGER");
} catch {}
if (!matchCols.some((c) => c.name === "score_blue")) try {
	db.exec("ALTER TABLE matches ADD COLUMN score_blue INTEGER");
} catch {}
if (!db.prepare("PRAGMA table_info(match_scouts)").all().some((c) => c.name === "scoring_events")) try {
	db.exec("ALTER TABLE match_scouts ADD COLUMN scoring_events TEXT DEFAULT '[]'");
} catch {}
var prescoutCols = db.prepare("PRAGMA table_info(prescout_responses)").all();
if (!prescoutCols.some((c) => c.name === "intake_type") && prescoutCols.length > 0) {
	try {
		db.exec("ALTER TABLE prescout_responses ADD COLUMN intake_type TEXT");
	} catch {}
	try {
		db.exec("ALTER TABLE prescout_responses ADD COLUMN can_score_goal INTEGER DEFAULT 0");
	} catch {}
	try {
		db.exec("ALTER TABLE prescout_responses ADD COLUMN can_classify INTEGER DEFAULT 0");
	} catch {}
	try {
		db.exec("ALTER TABLE prescout_responses ADD COLUMN can_open_gate INTEGER DEFAULT 0");
	} catch {}
}
//#endregion
export { db as t };
