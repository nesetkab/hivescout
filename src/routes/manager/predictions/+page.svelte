<script lang="ts">
  let { data } = $props();

  let mode = $state<'matches' | 'simulate'>('matches');
  let search = $state('');

  // Simulate mode state
  let red1Pick = $state<number | null>(null);
  let red2Pick = $state<number | null>(null);
  let blue1Pick = $state<number | null>(null);
  let blue2Pick = $state<number | null>(null);

  let filteredMatches = $derived.by(() => {
    if (!search.trim()) return data.matchPredictions;
    const q = search.toLowerCase();
    return data.matchPredictions.filter((m: any) =>
      String(m.match_number).includes(q) ||
      String(m.red1?.number).includes(q) ||
      String(m.red2?.number).includes(q) ||
      String(m.blue1?.number).includes(q) ||
      String(m.blue2?.number).includes(q)
    );
  });

  // Simulation computed
  let simResult = $derived.by(() => {
    const r1 = data.allTeamStats.find((t: any) => t.number === red1Pick);
    const r2 = data.allTeamStats.find((t: any) => t.number === red2Pick);
    const b1 = data.allTeamStats.find((t: any) => t.number === blue1Pick);
    const b2 = data.allTeamStats.find((t: any) => t.number === blue2Pick);

    const r1c = r1?.predictedContribution || 0;
    const r2c = r2?.predictedContribution || 0;
    const b1c = b1?.predictedContribution || 0;
    const b2c = b2?.predictedContribution || 0;

    const redTotal = +(r1c + r2c).toFixed(1);
    const blueTotal = +(b1c + b2c).toFixed(1);
    const margin = +(Math.abs(redTotal - blueTotal)).toFixed(1);
    const winner = redTotal > blueTotal ? 'red' : blueTotal > redTotal ? 'blue' : 'tie';

    return { r1, r2, b1, b2, r1c, r2c, b1c, b2c, redTotal, blueTotal, margin, winner };
  });

  // Available teams for each pick slot (exclude already picked)
  function availableTeams(exclude: (number | null)[]) {
    return data.allTeamStats.filter((t: any) => !exclude.includes(t.number));
  }

  let red1Available = $derived(availableTeams([red2Pick, blue1Pick, blue2Pick]));
  let red2Available = $derived(availableTeams([red1Pick, blue1Pick, blue2Pick]));
  let blue1Available = $derived(availableTeams([red1Pick, red2Pick, blue2Pick]));
  let blue2Available = $derived(availableTeams([red1Pick, red2Pick, blue1Pick]));

  function marginBarStyle(redTotal: number, blueTotal: number) {
    const max = Math.max(redTotal, blueTotal, 1);
    const redPct = (redTotal / (redTotal + blueTotal || 1)) * 100;
    const bluePct = 100 - redPct;
    return { redPct, bluePct };
  }

  function clearSim() {
    red1Pick = null;
    red2Pick = null;
    blue1Pick = null;
    blue2Pick = null;
  }
</script>

<div class="predictions">
  <div class="header-row">
    <h2>Match Predictions</h2>
    <div class="header-stats">
      <span>{data.totalMatches} matches</span>
      <span>{data.teamsWithData} teams with data</span>
    </div>
  </div>

  <div class="controls">
    <div class="mode-tabs">
      <button class:active={mode === 'matches'} onclick={() => mode = 'matches'}>Match List</button>
      <button class:active={mode === 'simulate'} onclick={() => mode = 'simulate'}>Pick Match</button>
    </div>
    {#if mode === 'matches'}
      <input bind:value={search} placeholder="Search match # or team..." class="search-input" />
    {/if}
  </div>

  {#if mode === 'matches'}
    {#if data.matchPredictions.length === 0}
      <p class="empty">No matches scheduled yet. Add matches in Setup first.</p>
    {:else}
      <div class="match-list">
        {#each filteredMatches as match}
          {@const bar = marginBarStyle(match.redTotal, match.blueTotal)}
          <div class="match-card card">
            <div class="match-header">
              <span class="match-num">Match {match.match_number}</span>
              {#if match.status === 'completed'}
                <span class="badge green">Completed</span>
              {:else}
                <span class="badge-status">{match.status}</span>
              {/if}
            </div>

            <div class="alliances">
              <!-- Red Alliance -->
              <div class="alliance red-side" class:winner={match.winner === 'red'}>
                <div class="alliance-label red-label">RED</div>
                <div class="alliance-teams">
                  <div class="team-row">
                    <a href="/manager/analytics/{match.red1.number}" class="team-link">
                      <span class="team-number">{match.red1.number || '?'}</span>
                      <span class="team-name">{match.red1.name || 'TBD'}</span>
                    </a>
                    <span class="contrib">{match.red1.contribution.toFixed(1)}</span>
                  </div>
                  <div class="team-row">
                    <a href="/manager/analytics/{match.red2.number}" class="team-link">
                      <span class="team-number">{match.red2.number || '?'}</span>
                      <span class="team-name">{match.red2.name || 'TBD'}</span>
                    </a>
                    <span class="contrib">{match.red2.contribution.toFixed(1)}</span>
                  </div>
                </div>
                <div class="alliance-total red-total">{match.redTotal}</div>
              </div>

              <div class="vs">vs</div>

              <!-- Blue Alliance -->
              <div class="alliance blue-side" class:winner={match.winner === 'blue'}>
                <div class="alliance-total blue-total">{match.blueTotal}</div>
                <div class="alliance-teams">
                  <div class="team-row">
                    <a href="/manager/analytics/{match.blue1.number}" class="team-link">
                      <span class="team-number">{match.blue1.number || '?'}</span>
                      <span class="team-name">{match.blue1.name || 'TBD'}</span>
                    </a>
                    <span class="contrib">{match.blue1.contribution.toFixed(1)}</span>
                  </div>
                  <div class="team-row">
                    <a href="/manager/analytics/{match.blue2.number}" class="team-link">
                      <span class="team-number">{match.blue2.number || '?'}</span>
                      <span class="team-name">{match.blue2.name || 'TBD'}</span>
                    </a>
                    <span class="contrib">{match.blue2.contribution.toFixed(1)}</span>
                  </div>
                </div>
                <div class="alliance-label blue-label">BLUE</div>
              </div>
            </div>

            <!-- Margin bar -->
            <div class="margin-bar">
              <div class="margin-fill red-fill" style="width: {bar.redPct}%"></div>
              <div class="margin-fill blue-fill" style="width: {bar.bluePct}%"></div>
            </div>
            <div class="margin-label">
              {#if match.winner === 'tie'}
                <span class="tie-text">Even match</span>
              {:else}
                <span class={match.winner === 'red' ? 'red-text' : 'blue-text'}>
                  {match.winner === 'red' ? 'Red' : 'Blue'} by {match.margin} pts
                </span>
              {/if}
            </div>

            {#if match.status === 'completed' && match.score_red != null}
              <div class="actual-score">
                Actual: <span class="red-text">{match.score_red}</span> - <span class="blue-text">{match.score_blue}</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

  {:else}
    <!-- Simulate Mode -->
    <div class="simulate-section">
      <div class="sim-alliances">
        <div class="sim-alliance red-border">
          <h3 class="red-text">Red Alliance</h3>
          <div class="sim-pick">
            <label>Team 1</label>
            <select bind:value={red1Pick}>
              <option value={null}>-- Select --</option>
              {#each red1Available as t}
                <option value={t.number}>#{t.number} {t.name} ({t.matches > 0 ? t.predictedContribution.toFixed(1) + ' pts' : 'no data'})</option>
              {/each}
            </select>
            {#if red1Pick}
              {@const stats = data.allTeamStats.find((t: any) => t.number === red1Pick)}
              {#if stats && stats.matches > 0}
                <div class="pick-stats">
                  <span>{stats.avgScored} avg scored</span>
                  <span>{(stats.autoLeaveRate * 100).toFixed(0)}% auto</span>
                  <span>{(stats.parkRate * 100).toFixed(0)}% park</span>
                </div>
              {:else}
                <div class="pick-stats dim">No scouting data</div>
              {/if}
            {/if}
          </div>
          <div class="sim-pick">
            <label>Team 2</label>
            <select bind:value={red2Pick}>
              <option value={null}>-- Select --</option>
              {#each red2Available as t}
                <option value={t.number}>#{t.number} {t.name} ({t.matches > 0 ? t.predictedContribution.toFixed(1) + ' pts' : 'no data'})</option>
              {/each}
            </select>
            {#if red2Pick}
              {@const stats = data.allTeamStats.find((t: any) => t.number === red2Pick)}
              {#if stats && stats.matches > 0}
                <div class="pick-stats">
                  <span>{stats.avgScored} avg scored</span>
                  <span>{(stats.autoLeaveRate * 100).toFixed(0)}% auto</span>
                  <span>{(stats.parkRate * 100).toFixed(0)}% park</span>
                </div>
              {:else}
                <div class="pick-stats dim">No scouting data</div>
              {/if}
            {/if}
          </div>
        </div>

        <div class="sim-alliance blue-border">
          <h3 class="blue-text">Blue Alliance</h3>
          <div class="sim-pick">
            <label>Team 1</label>
            <select bind:value={blue1Pick}>
              <option value={null}>-- Select --</option>
              {#each blue1Available as t}
                <option value={t.number}>#{t.number} {t.name} ({t.matches > 0 ? t.predictedContribution.toFixed(1) + ' pts' : 'no data'})</option>
              {/each}
            </select>
            {#if blue1Pick}
              {@const stats = data.allTeamStats.find((t: any) => t.number === blue1Pick)}
              {#if stats && stats.matches > 0}
                <div class="pick-stats">
                  <span>{stats.avgScored} avg scored</span>
                  <span>{(stats.autoLeaveRate * 100).toFixed(0)}% auto</span>
                  <span>{(stats.parkRate * 100).toFixed(0)}% park</span>
                </div>
              {:else}
                <div class="pick-stats dim">No scouting data</div>
              {/if}
            {/if}
          </div>
          <div class="sim-pick">
            <label>Team 2</label>
            <select bind:value={blue2Pick}>
              <option value={null}>-- Select --</option>
              {#each blue2Available as t}
                <option value={t.number}>#{t.number} {t.name} ({t.matches > 0 ? t.predictedContribution.toFixed(1) + ' pts' : 'no data'})</option>
              {/each}
            </select>
            {#if blue2Pick}
              {@const stats = data.allTeamStats.find((t: any) => t.number === blue2Pick)}
              {#if stats && stats.matches > 0}
                <div class="pick-stats">
                  <span>{stats.avgScored} avg scored</span>
                  <span>{(stats.autoLeaveRate * 100).toFixed(0)}% auto</span>
                  <span>{(stats.parkRate * 100).toFixed(0)}% park</span>
                </div>
              {:else}
                <div class="pick-stats dim">No scouting data</div>
              {/if}
            {/if}
          </div>
        </div>
      </div>

      {#if red1Pick || red2Pick || blue1Pick || blue2Pick}
        <button class="clear-btn" onclick={clearSim}>Clear All</button>
      {/if}

      <!-- Simulation Result -->
      {#if red1Pick || red2Pick || blue1Pick || blue2Pick}
        <div class="sim-result card">
          <div class="sim-score-row">
            <div class="sim-score red-side-score">
              <span class="sim-total red-text">{simResult.redTotal}</span>
              <span class="sim-breakdown">
                {#if simResult.r1}{simResult.r1.number}: {simResult.r1c.toFixed(1)}{/if}
                {#if simResult.r1 && simResult.r2} + {/if}
                {#if simResult.r2}{simResult.r2.number}: {simResult.r2c.toFixed(1)}{/if}
              </span>
            </div>
            <div class="sim-vs">vs</div>
            <div class="sim-score blue-side-score">
              <span class="sim-total blue-text">{simResult.blueTotal}</span>
              <span class="sim-breakdown">
                {#if simResult.b1}{simResult.b1.number}: {simResult.b1c.toFixed(1)}{/if}
                {#if simResult.b1 && simResult.b2} + {/if}
                {#if simResult.b2}{simResult.b2.number}: {simResult.b2c.toFixed(1)}{/if}
              </span>
            </div>
          </div>

          <div class="margin-bar">
            <div class="margin-fill red-fill" style="width: {marginBarStyle(simResult.redTotal, simResult.blueTotal).redPct}%"></div>
            <div class="margin-fill blue-fill" style="width: {marginBarStyle(simResult.redTotal, simResult.blueTotal).bluePct}%"></div>
          </div>
          <div class="margin-label">
            {#if simResult.winner === 'tie'}
              <span class="tie-text">Even match</span>
            {:else}
              <span class={simResult.winner === 'red' ? 'red-text' : 'blue-text'}>
                {simResult.winner === 'red' ? 'Red' : 'Blue'} by {simResult.margin} pts
              </span>
            {/if}
          </div>
        </div>
      {:else}
        <p class="empty">Select teams above to simulate a hypothetical match.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .predictions {
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
  }

  .controls {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .mode-tabs {
    display: flex;
    gap: 4px;
  }

  .mode-tabs button {
    padding: 6px 14px;
    font-size: 0.85rem;
  }

  .mode-tabs button.active {
    background: var(--accent);
    color: #1a1a1a;
  }

  .search-input {
    flex: 1;
    max-width: 250px;
  }

  .empty {
    color: var(--text-dim);
    padding: 24px 0;
  }

  /* Match list */
  .match-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .match-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 18px;
  }

  .match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .match-num {
    font-weight: 700;
    font-size: 0.9rem;
  }

  .badge-status {
    font-size: 0.7rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Alliances row */
  .alliances {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .alliance {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    background: var(--bg);
  }

  .red-side {
    border-left: 3px solid var(--red);
  }

  .blue-side {
    border-right: 3px solid var(--blue);
    flex-direction: row-reverse;
  }

  .alliance.winner {
    background: rgba(255, 255, 255, 0.04);
  }

  .alliance-label {
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    writing-mode: vertical-lr;
    text-orientation: mixed;
    transform: rotate(180deg);
  }

  .red-label { color: var(--red); }
  .blue-label { color: var(--blue); }

  .alliance-teams {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .blue-side .alliance-teams {
    text-align: right;
  }

  .team-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .blue-side .team-row {
    flex-direction: row-reverse;
  }

  .team-link {
    display: flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    color: var(--text);
  }

  .team-link:hover {
    text-decoration: none;
  }

  .team-link:hover .team-number {
    color: var(--accent);
  }

  .blue-side .team-link {
    flex-direction: row-reverse;
  }

  .team-number {
    font-weight: 700;
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }

  .team-name {
    font-size: 0.7rem;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }

  .contrib {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-dim);
    font-variant-numeric: tabular-nums;
    margin-left: auto;
  }

  .blue-side .contrib {
    margin-left: 0;
    margin-right: auto;
  }

  .alliance-total {
    font-size: 1.4rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    min-width: 50px;
    text-align: center;
  }

  .red-total { color: var(--red); }
  .blue-total { color: var(--blue); }

  .vs {
    font-size: 0.75rem;
    color: var(--text-dim);
    font-weight: 600;
    flex-shrink: 0;
  }

  /* Margin bar */
  .margin-bar {
    display: flex;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background: var(--bg);
  }

  .margin-fill {
    height: 100%;
    transition: width 0.3s;
  }

  .red-fill { background: var(--red); }
  .blue-fill { background: var(--blue); }

  .margin-label {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .red-text { color: var(--red); }
  .blue-text { color: var(--blue); }
  .tie-text { color: var(--text-dim); }

  .actual-score {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-dim);
    padding-top: 4px;
    border-top: 1px solid var(--bg-lighter);
  }

  /* Simulate section */
  .simulate-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sim-alliances {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .sim-alliance {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--bg-light);
    border-radius: 8px;
  }

  .sim-alliance h3 {
    font-size: 0.9rem;
    font-weight: 700;
  }

  .red-border { border-left: 3px solid var(--red); }
  .blue-border { border-left: 3px solid var(--blue); }

  .sim-pick {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sim-pick label {
    font-size: 0.7rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .sim-pick select {
    width: 100%;
  }

  .pick-stats {
    display: flex;
    gap: 10px;
    font-size: 0.7rem;
    color: var(--accent);
    padding: 2px 0;
  }

  .pick-stats.dim {
    color: var(--text-dim);
  }

  .clear-btn {
    align-self: flex-start;
    padding: 6px 14px;
    font-size: 0.8rem;
  }

  /* Sim result */
  .sim-result {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
  }

  .sim-score-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }

  .sim-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 140px;
  }

  .sim-total {
    font-size: 2rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .sim-breakdown {
    font-size: 0.75rem;
    color: var(--text-dim);
    font-variant-numeric: tabular-nums;
  }

  .sim-vs {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-dim);
  }
</style>
