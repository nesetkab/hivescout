<script lang="ts">
  let { data } = $props();

  let search = $state('');
  let sortBy = $state('totalScore');
  let sortDir = $state<'asc' | 'desc'>('desc');
  let view = $state<'cards' | 'table'>('cards');

  function toggleSort(col: string) {
    if (sortBy === col) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = col;
      sortDir = 'desc';
    }
  }

  let filtered = $derived.by(() => {
    let arr = [...data.ranked];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((t: any) =>
        String(t.number).includes(q) || t.name.toLowerCase().includes(q)
      );
    }
    arr.sort((a: any, b: any) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  });

  function arrow(col: string) {
    if (sortBy !== col) return '';
    return sortDir === 'asc' ? ' ^' : ' v';
  }

  function tierColor(rank: number, total: number): string {
    const pct = rank / total;
    if (pct <= 0.15) return 'tier-s';
    if (pct <= 0.35) return 'tier-a';
    if (pct <= 0.6) return 'tier-b';
    return 'tier-c';
  }

  function barWidth(val: number, max: number): string {
    return `${Math.min(100, Math.max(2, (val / max) * 100))}%`;
  }

  let maxScored = $derived(Math.max(...data.ranked.map((t: any) => t.avgScored), 1));
  let maxAttempted = $derived(Math.max(...data.ranked.map((t: any) => t.avgAttempted), 1));
</script>

<div class="analytics">
  <!-- Header stats -->
  <div class="header-row">
    <h2>Analytics</h2>
    <div class="header-stats">
      <span>{data.scoutedCount}/{data.totalTeams} teams scouted</span>
      <span>{data.totalScouts} total scouts</span>
      <a href="/api/export?format=csv" class="export-btn">Export CSV</a>
      <a href="/api/export?format=json" class="export-btn">Export JSON</a>
    </div>
  </div>

  {#if data.highlights.topScorer}
    <div class="highlights">
      <div class="highlight card">
        <span class="hl-label">Top Scorer</span>
        <a href="/manager/analytics/{data.highlights.topScorer.number}" class="hl-value">#{data.highlights.topScorer.number}</a>
        <span class="hl-detail">{data.highlights.topScorer.avgScored} avg</span>
      </div>
      <div class="highlight card">
        <span class="hl-label">Best Accuracy</span>
        <a href="/manager/analytics/{data.highlights.topAccuracy.number}" class="hl-value">#{data.highlights.topAccuracy.number}</a>
        <span class="hl-detail">{data.highlights.topAccuracy.accuracy}%</span>
      </div>
      <div class="highlight card">
        <span class="hl-label">Most Reliable</span>
        <a href="/manager/analytics/{data.highlights.topReliability.number}" class="hl-value">#{data.highlights.topReliability.number}</a>
        <span class="hl-detail">{data.highlights.topReliability.avgReliability}/5</span>
      </div>
      <div class="highlight card">
        <span class="hl-label">Most Data</span>
        <a href="/manager/analytics/{data.highlights.mostScouted.number}" class="hl-value">#{data.highlights.mostScouted.number}</a>
        <span class="hl-detail">{data.highlights.mostScouted.matches} matches</span>
      </div>
    </div>
  {/if}

  <!-- Controls -->
  <div class="controls">
    <input bind:value={search} placeholder="Search teams..." class="search-input" />
    <div class="sort-controls">
      <select bind:value={sortBy} onchange={() => { sortDir = 'desc'; }}>
        <option value="totalScore">Power Score</option>
        <option value="avgScored">Avg Scored</option>
        <option value="accuracy">Accuracy</option>
        <option value="avgAttempted">Avg Attempted</option>
        <option value="autoLeaveRate">Auto Leave</option>
        <option value="avgAutoCls">Auto Classified</option>
        <option value="gateRate">Gate Rate</option>
        <option value="parkRate">Park Rate</option>
        <option value="avgSkill">Driver Skill</option>
        <option value="avgReliability">Reliability</option>
        <option value="matches">Matches</option>
        <option value="number">Team #</option>
      </select>
      <button onclick={() => sortDir = sortDir === 'asc' ? 'desc' : 'asc'}>
        {sortDir === 'desc' ? 'DESC' : 'ASC'}
      </button>
      <button class:active={view === 'cards'} onclick={() => view = 'cards'}>Cards</button>
      <button class:active={view === 'table'} onclick={() => view = 'table'}>Table</button>
    </div>
  </div>

  {#if data.ranked.length === 0}
    <p class="empty">No scouted data yet. Scout some matches first.</p>
  {:else if view === 'cards'}
    <div class="team-cards">
      {#each filtered as team, i}
        <a href="/manager/analytics/{team.number}" class="team-card card {tierColor(team.rank, data.ranked.length)}">
          <div class="card-top">
            <div class="card-rank">#{team.rank}</div>
            <div class="card-identity">
              <span class="card-number">{team.number}</span>
              <span class="card-name">{team.name}</span>
            </div>
            <div class="card-score">{team.totalScore}</div>
          </div>

          <!-- Scoring bar -->
          <div class="card-bars">
            <div class="bar-row">
              <span class="bar-label">Scored</span>
              <div class="bar-track">
                <div class="bar-fill scored" style="width: {barWidth(team.avgScored, maxScored)}"></div>
              </div>
              <span class="bar-val">{team.avgScored}</span>
            </div>
            <div class="bar-row">
              <span class="bar-label">Attempted</span>
              <div class="bar-track">
                <div class="bar-fill attempted" style="width: {barWidth(team.avgAttempted, maxAttempted)}"></div>
              </div>
              <span class="bar-val">{team.avgAttempted}</span>
            </div>
          </div>

          <div class="card-stats">
            <div class="mini-stat">
              <span class="ms-val">{team.accuracy}%</span>
              <span class="ms-label">Acc</span>
            </div>
            <div class="mini-stat">
              <span class="ms-val">{team.autoLeaveRate}%</span>
              <span class="ms-label">Leave</span>
            </div>
            <div class="mini-stat">
              <span class="ms-val">{team.parkRate}%</span>
              <span class="ms-label">Park</span>
            </div>
            <div class="mini-stat">
              <span class="ms-val">{team.gateRate}%</span>
              <span class="ms-label">Gate</span>
            </div>
            <div class="mini-stat">
              <span class="ms-val">{team.avgSkill}</span>
              <span class="ms-label">Skill</span>
            </div>
            <div class="mini-stat">
              <span class="ms-val">{team.avgReliability}</span>
              <span class="ms-label">Rel</span>
            </div>
          </div>

          <div class="card-summary">{team.summary}</div>

          {#if team.disconnects > 0}
            <div class="card-warn">{team.disconnects} disconnect{team.disconnects > 1 ? 's' : ''}</div>
          {/if}
        </a>
      {/each}
    </div>

  {:else}
    <!-- Table view -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th onclick={() => toggleSort('rank')}>#</th>
            <th onclick={() => toggleSort('number')}>Team{arrow('number')}</th>
            <th onclick={() => toggleSort('matches')}>M{arrow('matches')}</th>
            <th onclick={() => toggleSort('avgScored')}>Scored{arrow('avgScored')}</th>
            <th onclick={() => toggleSort('avgAttempted')}>Att{arrow('avgAttempted')}</th>
            <th onclick={() => toggleSort('accuracy')}>Acc{arrow('accuracy')}</th>
            <th onclick={() => toggleSort('autoLeaveRate')}>Leave{arrow('autoLeaveRate')}</th>
            <th onclick={() => toggleSort('parkRate')}>Park{arrow('parkRate')}</th>
            <th onclick={() => toggleSort('gateRate')}>Gate{arrow('gateRate')}</th>
            <th onclick={() => toggleSort('avgSkill')}>Skill{arrow('avgSkill')}</th>
            <th onclick={() => toggleSort('avgReliability')}>Rel{arrow('avgReliability')}</th>
            <th onclick={() => toggleSort('totalScore')}>Score{arrow('totalScore')}</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as team}
            <tr>
              <td class="rank-cell {tierColor(team.rank, data.ranked.length)}">{team.rank}</td>
              <td class="team-num"><a href="/manager/analytics/{team.number}">#{team.number}</a> <span class="table-name">{team.name}</span></td>
              <td>{team.matches}</td>
              <td>{team.avgScored}</td>
              <td>{team.avgAttempted}</td>
              <td>{team.accuracy}%</td>
              <td>{team.autoLeaveRate}%</td>
              <td>{team.parkRate}%</td>
              <td>{team.gateRate}%</td>
              <td>{team.avgSkill}</td>
              <td>{team.avgReliability}</td>
              <td class="score-cell">{team.totalScore}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if data.unscouted.length > 0}
    <details class="unscouted">
      <summary>{data.unscouted.length} unscouted teams</summary>
      <div class="unscouted-list">
        {#each data.unscouted as t}
          <span>#{t.number} {t.name}</span>
        {/each}
      </div>
    </details>
  {/if}
</div>

<style>
  .analytics {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-stats {
    display: flex;
    gap: 16px;
    font-size: 0.8rem;
    color: var(--text-dim);
    align-items: center;
  }

  .export-btn {
    padding: 4px 10px;
    background: var(--bg-lighter);
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text);
    text-decoration: none;
  }

  .export-btn:hover {
    background: var(--accent-dim);
    text-decoration: none;
  }

  /* Highlights */
  .highlights {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .highlight {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 12px;
  }

  .hl-label {
    font-size: 0.7rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .hl-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--accent);
  }

  .hl-detail {
    font-size: 0.8rem;
    color: var(--text-dim);
  }

  /* Controls */
  .controls {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .search-input {
    flex: 1;
    max-width: 250px;
  }

  .sort-controls {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .sort-controls select {
    width: auto;
  }

  .sort-controls button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .sort-controls button.active {
    background: var(--accent);
    color: #1a1a1a;
  }

  .empty { color: var(--text-dim); }

  /* Team cards */
  .team-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 10px;
  }

  .team-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    text-decoration: none;
    color: var(--text);
    transition: border-color 0.15s;
    border-left: 4px solid var(--bg-lighter);
  }

  .team-card:hover {
    border-color: var(--accent);
    text-decoration: none;
  }

  .team-card.tier-s { border-left-color: #ffd96b; }
  .team-card.tier-a { border-left-color: var(--green); }
  .team-card.tier-b { border-left-color: var(--accent); }
  .team-card.tier-c { border-left-color: var(--bg-lighter); }

  .card-top {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .card-rank {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-dim);
    min-width: 28px;
  }

  .card-identity {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .card-number {
    font-weight: 700;
    font-size: 1rem;
    color: var(--accent);
  }

  .card-name {
    font-size: 0.75rem;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-score {
    font-size: 1.2rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--text);
  }

  /* Bars */
  .card-bars {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .bar-label {
    font-size: 0.65rem;
    color: var(--text-dim);
    width: 55px;
    text-align: right;
  }

  .bar-track {
    flex: 1;
    height: 6px;
    background: var(--bg);
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }

  .bar-fill.scored { background: var(--accent); }
  .bar-fill.attempted { background: var(--bg-lighter); }

  .bar-val {
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 30px;
    font-variant-numeric: tabular-nums;
  }

  /* Mini stats */
  .card-stats {
    display: flex;
    gap: 4px;
  }

  .mini-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 4px 0;
    background: var(--bg);
    border-radius: 4px;
  }

  .ms-val {
    font-size: 0.8rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .ms-label {
    font-size: 0.55rem;
    color: var(--text-dim);
    text-transform: uppercase;
  }

  .card-summary {
    font-size: 0.75rem;
    color: var(--text-dim);
    line-height: 1.3;
  }

  .card-warn {
    font-size: 0.7rem;
    color: var(--red);
    font-weight: 500;
  }

  /* Table view */
  .table-wrap { overflow-x: auto; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }

  th {
    text-align: left;
    padding: 8px 8px;
    color: var(--text-dim);
    font-weight: 500;
    border-bottom: 1px solid var(--bg-lighter);
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
  }

  th:hover { color: var(--text); }

  td {
    padding: 6px 8px;
    border-bottom: 1px solid var(--bg-light);
  }

  .team-num { font-weight: 600; }
  .team-num a { color: var(--accent); }

  .table-name {
    font-weight: 400;
    color: var(--text-dim);
    font-size: 0.75rem;
    margin-left: 4px;
  }

  .rank-cell {
    font-weight: 700;
    text-align: center;
    border-radius: 3px;
    width: 32px;
  }

  .rank-cell.tier-s { color: #ffd96b; }
  .rank-cell.tier-a { color: var(--green); }
  .rank-cell.tier-b { color: var(--accent); }
  .rank-cell.tier-c { color: var(--text-dim); }

  .score-cell {
    font-weight: 700;
    color: var(--accent);
  }

  /* Unscouted */
  .unscouted {
    font-size: 0.8rem;
    color: var(--text-dim);
  }

  .unscouted summary {
    cursor: pointer;
    padding: 8px 0;
  }

  .unscouted-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 0;
  }

  .unscouted-list span {
    background: var(--bg-light);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
  }
</style>
