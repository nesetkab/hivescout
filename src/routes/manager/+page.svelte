<script>
  let { data } = $props();

  let noteQuery = $state('');
  let noteTeam = $state('');
  let noteResults = $state(null);
  let searching = $state(false);

  async function searchNotes() {
    if (!noteQuery.trim() && !noteTeam) return;
    searching = true;
    const params = new URLSearchParams();
    if (noteQuery.trim()) params.set('q', noteQuery.trim());
    if (noteTeam) params.set('team', noteTeam);
    const res = await fetch(`/api/notes?${params}`);
    noteResults = await res.json();
    searching = false;
  }

  function clearSearch() {
    noteQuery = '';
    noteTeam = '';
    noteResults = null;
  }

  function highlightMatch(text, query) {
    if (!query.trim() || !text) return text || '';
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
</script>

<div class="overview">
  <h2>Overview</h2>

  <div class="stats-grid">
    <div class="card stat">
      <span class="stat-value">{data.teamCount}</span>
      <span class="stat-label">Teams</span>
    </div>
    <div class="card stat">
      <span class="stat-value">{data.matchCount}</span>
      <span class="stat-label">Matches</span>
    </div>
    <div class="card stat">
      <span class="stat-value">{data.scouterCount}</span>
      <span class="stat-label">Scouters</span>
    </div>
    <div class="card stat">
      <span class="stat-value">{data.matchScoutCount}</span>
      <span class="stat-label">Match Scouts</span>
    </div>
    <div class="card stat">
      <span class="stat-value">{data.prescoutCount}</span>
      <span class="stat-label">Pre-Scouts</span>
    </div>
  </div>

  <section>
    <h3>Recent Scouting Activity</h3>
    {#if data.recentScouts.length === 0}
      <p class="empty">No match scouts submitted yet</p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>Match</th>
            <th>Score</th>
            <th>Team</th>
            <th>Scouter</th>
            <th>A.Cls</th>
            <th>T.Cls</th>
            <th>BASE</th>
          </tr>
        </thead>
        <tbody>
          {#each data.recentScouts as s}
            {@const isRed = s.team_number === s.red1 || s.team_number === s.red2}
            <tr>
              <td>Q{s.match_number}</td>
              <td>
                {#if s.score_red != null}
                  <span class="score-cell">
                    <span class="red-text">{s.score_red}</span>-<span class="blue-text">{s.score_blue}</span>
                    {#if isRed}
                      <span class="result-badge" class:win={s.score_red > s.score_blue} class:loss={s.score_red < s.score_blue}>{s.score_red > s.score_blue ? 'W' : s.score_red < s.score_blue ? 'L' : 'T'}</span>
                    {:else}
                      <span class="result-badge" class:win={s.score_blue > s.score_red} class:loss={s.score_blue < s.score_red}>{s.score_blue > s.score_red ? 'W' : s.score_blue < s.score_red ? 'L' : 'T'}</span>
                    {/if}
                  </span>
                {:else}
                  <span class="no-score">--</span>
                {/if}
              </td>
              <td>#{s.team_number} {s.team_name}</td>
              <td>{s.scouter_name}</td>
              <td>{s.auto_classified}{s.auto_leave ? ' +L' : ''}</td>
              <td>{s.teleop_classified}c {s.teleop_overflow}o</td>
              <td>{s.endgame_base}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>

  <section>
    <h3>Notes Search</h3>
    <div class="search-bar">
      <input bind:value={noteQuery} placeholder="Search notes (e.g. broken, fast, tipped...)"
        onkeydown={(e) => { if (e.key === 'Enter') searchNotes(); }} />
      <select bind:value={noteTeam}>
        <option value="">All teams</option>
        {#each data.teams || [] as t}
          <option value={t.number}>#{t.number}</option>
        {/each}
      </select>
      <button class="primary" onclick={searchNotes} disabled={searching || (!noteQuery.trim() && !noteTeam)}>
        {searching ? '...' : 'Search'}
      </button>
      {#if noteResults}
        <button onclick={clearSearch}>Clear</button>
      {/if}
    </div>

    {#if noteResults}
      <div class="note-results">
        {#if noteResults.matchNotes.length === 0 && noteResults.prescoutNotes.length === 0}
          <p class="empty">No results found</p>
        {/if}

        {#if noteResults.matchNotes.length > 0}
          <div class="note-group">
            <span class="note-group-label">Match Notes ({noteResults.matchNotes.length})</span>
            {#each noteResults.matchNotes as n}
              <div class="note-card card">
                <div class="note-meta">
                  <span class="note-match">Q{n.match_number}</span>
                  <span class="note-team">#{n.team_number} {n.team_name}</span>
                  <span class="note-scouter">{n.scouter_name}</span>
                </div>
                <div class="note-text">{@html highlightMatch(n.notes, noteQuery)}</div>
              </div>
            {/each}
          </div>
        {/if}

        {#if noteResults.prescoutNotes.length > 0}
          <div class="note-group">
            <span class="note-group-label">Pre-Scout Notes ({noteResults.prescoutNotes.length})</span>
            {#each noteResults.prescoutNotes as p}
              <div class="note-card card">
                <div class="note-meta">
                  <span class="note-team">#{p.team_number} {p.team_name}</span>
                  <span class="note-scouter">{p.scouter_name}</span>
                </div>
                {#if p.strengths}<div class="note-text"><b>Strengths:</b> {@html highlightMatch(p.strengths, noteQuery)}</div>{/if}
                {#if p.weaknesses}<div class="note-text"><b>Weaknesses:</b> {@html highlightMatch(p.weaknesses, noteQuery)}</div>{/if}
                {#if p.notes}<div class="note-text">{@html highlightMatch(p.notes, noteQuery)}</div>{/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </section>
</div>

<style>
  .overview {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 20px;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-dim);
  }

  h3 {
    font-size: 1.1rem;
    color: var(--text-dim);
  }

  .empty {
    color: var(--text-dim);
    font-size: 0.9rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th {
    text-align: left;
    padding: 8px 12px;
    color: var(--text-dim);
    font-weight: 500;
    border-bottom: 1px solid var(--bg-lighter);
  }

  td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--bg-light);
  }

  .red-text { color: var(--red, #ef4444); }
  .blue-text { color: var(--blue, #3b82f6); }

  .score-cell {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    font-size: 0.85rem;
  }

  .no-score {
    color: var(--text-dim);
  }

  .result-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 3px;
    background: var(--bg-lighter, #333);
    color: var(--text-dim);
  }

  .result-badge.win {
    background: #1a3a1a;
    color: var(--green, #22c55e);
  }

  .result-badge.loss {
    background: #3a1a1a;
    color: var(--red, #ef4444);
  }

  .search-bar {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-bar input { flex: 1; }
  .search-bar select { width: auto; max-width: 120px; }

  .note-results {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
  }

  .note-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .note-group-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .note-card {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .note-meta {
    display: flex;
    gap: 10px;
    font-size: 0.8rem;
  }

  .note-match { font-weight: 700; color: var(--accent); }
  .note-team { font-weight: 600; }
  .note-scouter { color: var(--text-dim); }

  .note-text {
    font-size: 0.85rem;
    line-height: 1.4;
  }

  :global(mark) {
    background: rgba(255, 217, 107, 0.3);
    color: var(--text);
    padding: 0 2px;
    border-radius: 2px;
  }
</style>
