<script lang="ts">
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  // FTC Events import
  let eventSearch = $state('');
  let eventResults = $state<any[]>([]);
  let searching = $state(false);
  let importing = $state(false);
  let importResult = $state<{ teams: number; matches: number } | null>(null);

  // Add team
  let teamNumber = $state('');
  let teamName = $state('');

  // Add match
  let matchNumber = $state('');
  let red1 = $state('');
  let red2 = $state('');
  let blue1 = $state('');
  let blue2 = $state('');

  let searchTimeout: ReturnType<typeof setTimeout>;

  function onSearchInput() {
    clearTimeout(searchTimeout);
    importResult = null;
    if (!eventSearch.trim()) {
      eventResults = [];
      return;
    }
    searchTimeout = setTimeout(doSearch, 400);
  }

  async function doSearch() {
    if (!eventSearch.trim()) return;
    searching = true;
    const res = await fetch(`/api/import?search=${encodeURIComponent(eventSearch)}`);
    eventResults = await res.json();
    searching = false;
  }

  async function importEvent(code: string) {
    importing = true;
    importResult = null;
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventCode: code })
    });
    const data = await res.json();
    if (data.success) {
      importResult = data.imported;
    }
    importing = false;
    eventResults = [];
    eventSearch = '';
    invalidateAll();
  }

  async function clearMatches() {
    if (!confirm('Delete all matches and associated scout data?')) return;
    await fetch('/api/matches', { method: 'DELETE' });
    invalidateAll();
  }

  // Sync scores
  let syncingScores = $state(false);
  let syncResult = $state<string | null>(null);
  let syncEventCode = $state('');

  async function syncScores() {
    if (!syncEventCode.trim()) return;
    syncingScores = true;
    syncResult = null;
    try {
      const res = await fetch('/api/import/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventCode: syncEventCode.trim() })
      });
      const data = await res.json();
      if (data.success) {
        syncResult = `Updated scores for ${data.updated} matches`;
      } else {
        syncResult = `Error: ${data.error}`;
      }
    } catch (err: any) {
      syncResult = `Error: ${err.message}`;
    }
    syncingScores = false;
    invalidateAll();
  }

  let seeding = $state(false);
  let seedResult = $state('');
  async function seedTestData() {
    seeding = true;
    seedResult = '';
    const res = await fetch('/api/seed-test', { method: 'POST' });
    const data = await res.json();
    seedResult = data.success ? `Created ${data.scoutsCreated} scout entries` : data.error;
    seeding = false;
    invalidateAll();
  }

  async function addTeam() {
    if (!teamNumber || !teamName) return;
    await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: Number(teamNumber), name: teamName })
    });
    teamNumber = '';
    teamName = '';
    invalidateAll();
  }

  async function clearTeams() {
    if (!confirm('Delete ALL teams, matches, and scout data?')) return;
    await fetch('/api/teams', { method: 'DELETE' });
    invalidateAll();
  }

  async function addMatch() {
    if (!matchNumber) return;
    await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_number: Number(matchNumber),
        red1: red1 ? Number(red1) : null,
        red2: red2 ? Number(red2) : null,
        blue1: blue1 ? Number(blue1) : null,
        blue2: blue2 ? Number(blue2) : null
      })
    });
    matchNumber = '';
    red1 = '';
    red2 = '';
    blue1 = '';
    blue2 = '';
    invalidateAll();
  }
</script>

<div class="setup-page">
  <h2>Event Setup</h2>

  <div class="card import-section">
    <h3>Import from FTC Events</h3>
    <p class="hint">Search for an event to auto-import all teams and qualification matches</p>
    <div class="search-row">
      <input
        bind:value={eventSearch}
        oninput={onSearchInput}
        placeholder="Search events (e.g. 'world', 'michigan', 'USMIDET')"
      />
      {#if searching}
        <span class="status">Searching...</span>
      {/if}
    </div>

    {#if importing}
      <div class="import-status">Importing teams and matches...</div>
    {/if}

    {#if importResult}
      <div class="import-status success">
        Imported {importResult.teams} teams and {importResult.matches} matches
      </div>
    {/if}

    {#if eventResults.length > 0}
      <div class="event-results">
        {#each eventResults as evt}
          <div class="event-row">
            <div class="event-info">
              <span class="event-code">{evt.code}</span>
              <span class="event-name">{evt.name}</span>
              <span class="event-loc">{evt.city}, {evt.stateprov} -- {evt.dateStart?.slice(0, 10)}</span>
            </div>
            <button class="primary" onclick={() => importEvent(evt.code)} disabled={importing}>
              Import
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="card import-section">
    <h3>Sync Match Scores</h3>
    <p class="hint">Pull actual match scores from the FTC Events API for a previously imported event</p>
    <form class="search-row" onsubmit={(e) => { e.preventDefault(); syncScores(); }}>
      <input
        bind:value={syncEventCode}
        placeholder="Event code (e.g. USMIDET)"
      />
      <button type="submit" class="primary" disabled={syncingScores || !syncEventCode.trim()}>
        {syncingScores ? 'Syncing...' : 'Sync Scores'}
      </button>
    </form>
    {#if syncResult}
      <div class="import-status success">{syncResult}</div>
    {/if}
  </div>

  <div class="panels">
    <div class="panel">
      <div class="card">
        <h3>Add Team Manually</h3>
        <form onsubmit={(e) => { e.preventDefault(); addTeam(); }}>
          <input bind:value={teamNumber} type="number" placeholder="Team number" />
          <input bind:value={teamName} placeholder="Team name" />
          <button type="submit" class="primary" disabled={!teamNumber || !teamName}>Add Team</button>
        </form>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Teams ({data.teams.length})</h3>
          {#if data.teams.length > 0}
            <button class="danger small" onclick={clearTeams}>Clear All</button>
          {/if}
        </div>
        <div class="item-list">
          {#each data.teams as team}
            <div class="item">
              <span class="team-num">#{team.number}</span>
              <span>{team.name}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="card">
        <h3>Add Match Manually</h3>
        <form onsubmit={(e) => { e.preventDefault(); addMatch(); }}>
          <input bind:value={matchNumber} type="number" placeholder="Match number" />
          <div class="alliance-inputs">
            <div class="alliance-col">
              <span class="badge red">RED</span>
              <select bind:value={red1}>
                <option value="">Red 1...</option>
                {#each data.teams as t}<option value={t.number}>#{t.number}</option>{/each}
              </select>
              <select bind:value={red2}>
                <option value="">Red 2...</option>
                {#each data.teams as t}<option value={t.number}>#{t.number}</option>{/each}
              </select>
            </div>
            <div class="alliance-col">
              <span class="badge blue">BLUE</span>
              <select bind:value={blue1}>
                <option value="">Blue 1...</option>
                {#each data.teams as t}<option value={t.number}>#{t.number}</option>{/each}
              </select>
              <select bind:value={blue2}>
                <option value="">Blue 2...</option>
                {#each data.teams as t}<option value={t.number}>#{t.number}</option>{/each}
              </select>
            </div>
          </div>
          <button type="submit" class="primary" disabled={!matchNumber}>Add Match</button>
        </form>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Matches ({data.matches.length})</h3>
          {#if data.matches.length > 0}
            <button class="danger small" onclick={clearMatches}>Clear All</button>
          {/if}
        </div>
        <div class="item-list">
          {#each data.matches as match}
            <div class="item match-item">
              <span class="match-num">Q{match.match_number}</span>
              <span class="alliance-info">
                <span class="red-text">{match.red1 || '?'} / {match.red2 || '?'}</span>
                vs
                <span class="blue-text">{match.blue1 || '?'} / {match.blue2 || '?'}</span>
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="demo-section">
    <button onclick={seedTestData} disabled={seeding}>
      {seeding ? 'Generating...' : 'Generate Random Scout Data'}
    </button>
    {#if seedResult}
      <span class="seed-result">{seedResult}</span>
    {/if}
  </div>
</div>

<style>
  .setup-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .import-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hint {
    font-size: 0.8rem;
    color: var(--text-dim);
    margin-top: -4px;
  }

  .search-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-row input {
    flex: 1;
  }

  .status {
    font-size: 0.8rem;
    color: var(--text-dim);
    white-space: nowrap;
  }

  .import-status {
    padding: 8px 12px;
    border-radius: 6px;
    background: var(--bg-lighter);
    font-size: 0.85rem;
  }

  .import-status.success {
    background: #1a3a1a;
    color: var(--green);
  }

  .event-results {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 300px;
    overflow-y: auto;
  }

  .event-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--bg);
    border-radius: 6px;
    gap: 12px;
  }

  .event-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .event-code {
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--accent);
  }

  .event-name {
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .event-loc {
    font-size: 0.75rem;
    color: var(--text-dim);
  }

  .panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  h3 {
    font-size: 1rem;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .alliance-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .alliance-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .item-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 300px;
    overflow-y: auto;
  }

  .item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px 0;
    font-size: 0.85rem;
    border-bottom: 1px solid var(--bg-lighter);
  }

  .team-num, .match-num {
    font-weight: 600;
    color: var(--accent);
  }

  .alliance-info {
    font-size: 0.8rem;
    color: var(--text-dim);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-header h3 {
    margin-bottom: 0;
  }

  button.small {
    padding: 4px 10px;
    font-size: 0.75rem;
  }

  .red-text { color: var(--red); }
  .blue-text { color: var(--blue); }

  .demo-section {
    border-top: 1px solid var(--bg-lighter);
    padding-top: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .seed-result {
    font-size: 0.85rem;
    color: var(--green);
  }
</style>
