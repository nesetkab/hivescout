<script lang="ts">
  let { data } = $props();

  let teamA = $state<number | null>(null);
  let teamB = $state<number | null>(null);
  let teamC = $state<number | null>(null);

  const statsMap = $derived.by(() => {
    const map = new Map<number, typeof data.teamStats[0]>();
    for (const s of data.teamStats) {
      map.set(s.number, s);
    }
    return map;
  });

  let statA = $derived(teamA !== null ? statsMap.get(teamA) ?? null : null);
  let statB = $derived(teamB !== null ? statsMap.get(teamB) ?? null : null);
  let statC = $derived(teamC !== null ? statsMap.get(teamC) ?? null : null);

  let selectedStats = $derived(
    [statA, statB, statC].filter((s): s is NonNullable<typeof s> => s !== null)
  );

  let hasSelection = $derived(selectedStats.length >= 2);

  interface MetricRow {
    label: string;
    key: string;
    suffix?: string;
    higherBetter: boolean;
    max5?: boolean;
  }

  const metrics: MetricRow[] = [
    { label: 'Matches Scouted', key: 'matches', higherBetter: true },
    { label: 'Avg Scored', key: 'avgScored', higherBetter: true },
    { label: 'Avg Attempted', key: 'avgAttempted', higherBetter: true },
    { label: 'Accuracy', key: 'accuracy', suffix: '%', higherBetter: true },
    { label: 'Auto Leave Rate', key: 'autoLeaveRate', suffix: '%', higherBetter: true },
    { label: 'Avg Auto Classified', key: 'avgAutoClassified', higherBetter: true },
    { label: 'Park Rate', key: 'parkRate', suffix: '%', higherBetter: true },
    { label: 'Park Success Rate', key: 'parkSuccessRate', suffix: '%', higherBetter: true },
    { label: 'Driver Skill', key: 'avgDriverSkill', higherBetter: true, max5: true },
    { label: 'Reliability', key: 'avgReliability', higherBetter: true, max5: true },
    { label: 'Defense', key: 'avgDefense', higherBetter: true, max5: true },
    { label: 'Disconnects', key: 'disconnectCount', higherBetter: false },
    { label: 'Avg Gate Opens', key: 'avgGateOpens', higherBetter: true },
  ];

  function getVal(stat: any, key: string): number {
    return stat?.[key] ?? 0;
  }

  function bestVal(metric: MetricRow): number {
    const vals = selectedStats.map(s => getVal(s, metric.key));
    if (metric.higherBetter) return Math.max(...vals);
    return Math.min(...vals);
  }

  function maxVal(metric: MetricRow): number {
    const vals = selectedStats.map(s => getVal(s, metric.key));
    return Math.max(...vals, 1);
  }

  function isBest(stat: any, metric: MetricRow): boolean {
    if (!stat || stat.matches === 0) return false;
    const val = getVal(stat, metric.key);
    const best = bestVal(metric);
    return val === best;
  }

  function barPct(stat: any, metric: MetricRow): number {
    if (!stat || stat.matches === 0) return 0;
    const val = getVal(stat, metric.key);
    if (metric.max5) return (val / 5) * 100;
    if (metric.suffix === '%') return val;
    const mx = maxVal(metric);
    return (val / mx) * 100;
  }

  function formatVal(stat: any, metric: MetricRow): string {
    if (!stat || stat.matches === 0) return 'No data';
    const val = getVal(stat, metric.key);
    return `${val}${metric.suffix ?? ''}`;
  }
</script>

<div class="compare">
  <div class="header">
    <a href="/manager/analytics" class="back">Analytics</a>
    <span class="sep">/</span>
    <h2>Compare Teams</h2>
  </div>

  <div class="selectors">
    <div class="selector">
      <label>Team A</label>
      <select bind:value={teamA}>
        <option value={null}>Select team...</option>
        {#each data.teams as t}
          <option value={t.number}>#{t.number} {t.name}</option>
        {/each}
      </select>
    </div>
    <div class="vs">vs</div>
    <div class="selector">
      <label>Team B</label>
      <select bind:value={teamB}>
        <option value={null}>Select team...</option>
        {#each data.teams as t}
          <option value={t.number}>#{t.number} {t.name}</option>
        {/each}
      </select>
    </div>
    <div class="vs">vs</div>
    <div class="selector">
      <label>Team C (optional)</label>
      <select bind:value={teamC}>
        <option value={null}>None</option>
        {#each data.teams as t}
          <option value={t.number}>#{t.number} {t.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if !hasSelection}
    <p class="empty">Select at least two teams to compare.</p>
  {:else}
    <div class="comparison-table">
      <!-- Header row -->
      <div class="comp-row comp-header">
        <div class="metric-label">Metric</div>
        {#each selectedStats as stat}
          <div class="team-col">
            <a href="/manager/analytics/{stat.number}" class="team-link">#{stat.number}</a>
            <span class="team-name-sm">{stat.name}</span>
          </div>
        {/each}
      </div>

      {#each metrics as metric}
        <div class="comp-row">
          <div class="metric-label">{metric.label}</div>
          {#each selectedStats as stat}
            <div class="team-col" class:best={isBest(stat, metric) && selectedStats.filter(s => s.matches > 0).length > 1}>
              <span class="val">{formatVal(stat, metric)}</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  class:bar-best={isBest(stat, metric) && stat.matches > 0}
                  style="width: {barPct(stat, metric)}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .compare {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back {
    color: var(--text-dim);
    font-size: 0.85rem;
  }

  .sep {
    color: var(--bg-lighter);
  }

  h2 {
    font-size: 1.4rem;
  }

  .selectors {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .selector {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 180px;
  }

  .selector label {
    font-size: 0.75rem;
    color: var(--text-dim);
    font-weight: 500;
  }

  .selector select {
    width: 100%;
  }

  .vs {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-dim);
    padding-bottom: 8px;
  }

  .empty {
    color: var(--text-dim);
    font-size: 0.9rem;
    padding: 24px 0;
  }

  .comparison-table {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--bg-lighter);
    border-radius: 8px;
    overflow: hidden;
  }

  .comp-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--bg-light);
  }

  .comp-row:last-child {
    border-bottom: none;
  }

  .comp-header {
    background: var(--bg-light);
    font-weight: 600;
    font-size: 0.8rem;
  }

  .metric-label {
    min-width: 160px;
    width: 160px;
    padding: 10px 14px;
    font-size: 0.8rem;
    color: var(--text-dim);
    flex-shrink: 0;
  }

  .comp-header .metric-label {
    color: var(--text);
  }

  .team-col {
    flex: 1;
    padding: 8px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .team-link {
    font-weight: 700;
    color: var(--accent);
    font-size: 1rem;
  }

  .team-name-sm {
    font-size: 0.7rem;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .val {
    font-size: 0.85rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .best .val {
    color: var(--green);
  }

  .bar-track {
    height: 6px;
    background: var(--bg-lighter);
    border-radius: 3px;
    overflow: hidden;
    width: 100%;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    background: var(--bg-lighter);
    transition: width 0.3s;
    min-width: 0;
  }

  .bar-fill.bar-best {
    background: var(--green);
  }

  @media (max-width: 700px) {
    .selectors {
      flex-direction: column;
    }

    .vs {
      display: none;
    }

    .metric-label {
      min-width: 110px;
      width: 110px;
      font-size: 0.7rem;
      padding: 8px 8px;
    }

    .team-col {
      padding: 6px 8px;
    }
  }
</style>
