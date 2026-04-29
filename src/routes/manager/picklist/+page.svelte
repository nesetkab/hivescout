<script lang="ts">
  let { data } = $props();

  interface PickTeam {
    number: number;
    name: string;
    matches: number;
    avgScored: number;
    accuracy: number;
    parkRate: number;
    avgReliability: number;
    totalScore: number;
    notes: string;
    tier: string;
  }

  const TIERS = ['none', 'S', 'A', 'B', 'C', 'DNP'] as const;
  const tierColors: Record<string, string> = {
    'S': '#ffd96b',
    'A': 'var(--green)',
    'B': 'var(--accent)',
    'C': 'var(--text-dim)',
    'DNP': 'var(--red)',
    'none': 'var(--bg-lighter)',
  };

  // Build initial state from saved picklist + team stats
  function buildInitialState() {
    const statsMap = new Map<number, any>(data.teamStats.map((t: any) => [t.number, t]));
    const savedMap = new Map<number, any>(data.savedPicklist.map((p: any) => [p.team_number, p]));

    const ranked: PickTeam[] = [];
    const unranked: PickTeam[] = [];

    // Add saved picklist teams in order
    for (const p of data.savedPicklist) {
      const stats = statsMap.get(p.team_number) as any;
      if (stats) {
        ranked.push({
          number: stats.number,
          name: stats.name,
          matches: stats.matches,
          avgScored: stats.avgScored,
          accuracy: stats.accuracy,
          parkRate: stats.parkRate,
          avgReliability: stats.avgReliability,
          totalScore: stats.totalScore,
          notes: p.notes || '',
          tier: p.tier || 'none',
        });
      }
    }

    // Add remaining teams to unranked
    for (const t of data.teamStats) {
      if (!savedMap.has(t.number)) {
        unranked.push({ ...t, notes: '', tier: 'none' });
      }
    }

    // Sort unranked by totalScore desc
    unranked.sort((a, b) => b.totalScore - a.totalScore);

    return { ranked, unranked };
  }

  const initial = buildInitialState();
  let rankedList = $state<PickTeam[]>(initial.ranked);
  let unrankedList = $state<PickTeam[]>(initial.unranked);
  let saving = $state(false);
  let saveMessage = $state('');
  let dragIndex = $state<number | null>(null);
  let dragSource = $state<'ranked' | 'unranked' | null>(null);
  let dropTarget = $state<number | null>(null);

  // Drag start
  function onDragStart(index: number, source: 'ranked' | 'unranked') {
    dragIndex = index;
    dragSource = source;
  }

  function onDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    dropTarget = index;
  }

  function onDragLeave() {
    dropTarget = null;
  }

  function onDropOnRanked(e: DragEvent, targetIndex: number) {
    e.preventDefault();
    dropTarget = null;

    if (dragIndex === null || dragSource === null) return;

    if (dragSource === 'ranked') {
      // Reorder within ranked
      const item = rankedList[dragIndex];
      const newList = [...rankedList];
      newList.splice(dragIndex, 1);
      newList.splice(targetIndex, 0, item);
      rankedList = newList;
    } else {
      // Move from unranked to ranked
      const item = unrankedList[dragIndex];
      unrankedList = unrankedList.filter((_, i) => i !== dragIndex);
      const newList = [...rankedList];
      newList.splice(targetIndex, 0, item);
      rankedList = newList;
    }

    dragIndex = null;
    dragSource = null;
  }

  function onDropOnUnranked(e: DragEvent) {
    e.preventDefault();
    dropTarget = null;

    if (dragIndex === null || dragSource !== 'ranked') return;

    const item = rankedList[dragIndex];
    rankedList = rankedList.filter((_, i) => i !== dragIndex);
    item.tier = 'none';
    item.notes = '';
    unrankedList = [...unrankedList, item].sort((a, b) => b.totalScore - a.totalScore);

    dragIndex = null;
    dragSource = null;
  }

  function onDragEnd() {
    dragIndex = null;
    dragSource = null;
    dropTarget = null;
  }

  // Cycle tier
  function cycleTier(team: PickTeam) {
    const idx = TIERS.indexOf(team.tier as any);
    team.tier = TIERS[(idx + 1) % TIERS.length];
  }

  // Auto-rank by totalScore
  function autoRank() {
    const all = [...rankedList, ...unrankedList];
    all.sort((a, b) => b.totalScore - a.totalScore);
    const scouted = all.filter(t => t.matches > 0);
    const unscouted = all.filter(t => t.matches === 0);
    rankedList = scouted;
    unrankedList = unscouted;
  }

  // Remove from ranked
  function removeFromRanked(index: number) {
    const item = rankedList[index];
    rankedList = rankedList.filter((_, i) => i !== index);
    item.tier = 'none';
    item.notes = '';
    unrankedList = [...unrankedList, item].sort((a, b) => b.totalScore - a.totalScore);
  }

  // Add to ranked
  function addToRanked(index: number) {
    const item = unrankedList[index];
    unrankedList = unrankedList.filter((_, i) => i !== index);
    rankedList = [...rankedList, item];
  }

  // Save
  async function save() {
    saving = true;
    saveMessage = '';
    try {
      const payload = {
        teams: rankedList.map(t => ({
          number: t.number,
          notes: t.notes,
          tier: t.tier,
        })),
      };
      const res = await fetch('/api/picklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        saveMessage = `Saved ${result.count} teams`;
        setTimeout(() => saveMessage = '', 3000);
      } else {
        saveMessage = `Error: ${result.error}`;
      }
    } catch (err: any) {
      saveMessage = `Error: ${err.message}`;
    } finally {
      saving = false;
    }
  }
</script>

<div class="picklist-page">
  <div class="header-row">
    <h2>Pick List</h2>
    <div class="header-actions">
      <span class="count">{rankedList.length} ranked / {unrankedList.length} unranked</span>
      <button class="btn auto" onclick={autoRank}>Auto-rank</button>
      <button class="btn save" onclick={save} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      {#if saveMessage}
        <span class="save-msg" class:error={saveMessage.startsWith('Error')}>{saveMessage}</span>
      {/if}
    </div>
  </div>

  <!-- Ranked list -->
  <div class="section-label">Ranked Teams</div>
  {#if rankedList.length === 0}
    <div
      class="empty-drop"
      ondragover={(e) => { e.preventDefault(); }}
      ondrop={(e) => onDropOnRanked(e, 0)}
    >
      Drag teams here or click + to add them to the pick list
    </div>
  {:else}
    <div class="ranked-list">
      {#each rankedList as team, i}
        <div
          class="pick-row"
          class:drag-over={dropTarget === i && dragSource !== null}
          class:dragging={dragIndex === i && dragSource === 'ranked'}
          draggable="true"
          ondragstart={() => onDragStart(i, 'ranked')}
          ondragover={(e) => onDragOver(e, i)}
          ondragleave={onDragLeave}
          ondrop={(e) => onDropOnRanked(e, i)}
          ondragend={onDragEnd}
          role="listitem"
        >
          <div class="drag-handle">&#x2630;</div>
          <div class="rank-num">#{i + 1}</div>
          <div class="team-info">
            <span class="team-number">{team.number}</span>
            <span class="team-name">{team.name}</span>
          </div>
          <div class="stats">
            <div class="stat">
              <span class="stat-val">{team.avgScored}</span>
              <span class="stat-label">Avg</span>
            </div>
            <div class="stat">
              <span class="stat-val">{team.accuracy}%</span>
              <span class="stat-label">Acc</span>
            </div>
            <div class="stat">
              <span class="stat-val">{team.parkRate}%</span>
              <span class="stat-label">Park</span>
            </div>
            <div class="stat">
              <span class="stat-val">{team.avgReliability}</span>
              <span class="stat-label">Rel</span>
            </div>
          </div>
          <button
            class="tier-badge"
            style="background: {tierColors[team.tier]}; color: {team.tier === 'none' ? 'var(--text-dim)' : (team.tier === 'S' || team.tier === 'A') ? '#1a1a1a' : '#fff'}"
            onclick={() => cycleTier(team)}
            title="Click to cycle tier"
          >
            {team.tier === 'none' ? '--' : team.tier}
          </button>
          <input
            class="notes-input"
            type="text"
            placeholder="Notes..."
            bind:value={team.notes}
          />
          <button class="remove-btn" onclick={() => removeFromRanked(i)} title="Remove from ranked">x</button>
        </div>
      {/each}
      <!-- Drop zone at end -->
      <div
        class="drop-zone-end"
        class:drag-over={dropTarget === rankedList.length}
        ondragover={(e) => onDragOver(e, rankedList.length)}
        ondragleave={onDragLeave}
        ondrop={(e) => onDropOnRanked(e, rankedList.length)}
      ></div>
    </div>
  {/if}

  <!-- Unranked section -->
  {#if unrankedList.length > 0}
    <div class="section-label unranked-label">Unranked Teams ({unrankedList.length})</div>
    <div
      class="unranked-list"
      ondragover={(e) => { e.preventDefault(); }}
      ondrop={onDropOnUnranked}
    >
      {#each unrankedList as team, i}
        <div
          class="unranked-row"
          draggable="true"
          ondragstart={() => onDragStart(i, 'unranked')}
          ondragend={onDragEnd}
          class:unscouted={team.matches === 0}
          role="listitem"
        >
          <div class="drag-handle">&#x2630;</div>
          <div class="team-info">
            <span class="team-number">{team.number}</span>
            <span class="team-name">{team.name}</span>
          </div>
          {#if team.matches > 0}
            <div class="stats compact">
              <span class="stat-inline">{team.avgScored} avg</span>
              <span class="stat-inline">{team.accuracy}% acc</span>
              <span class="stat-inline">{team.totalScore} pts</span>
            </div>
          {:else}
            <span class="no-data">No scout data</span>
          {/if}
          <button class="add-btn" onclick={() => addToRanked(i)} title="Add to ranked">+</button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .picklist-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .count {
    font-size: 0.8rem;
    color: var(--text-dim);
  }

  .btn {
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }

  .btn.auto {
    background: var(--bg-lighter);
    color: var(--text);
  }

  .btn.auto:hover {
    background: var(--accent);
    color: #1a1a1a;
  }

  .btn.save {
    background: var(--accent);
    color: #1a1a1a;
  }

  .btn.save:hover {
    opacity: 0.9;
  }

  .btn.save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .save-msg {
    font-size: 0.8rem;
    color: var(--green);
  }

  .save-msg.error {
    color: var(--red);
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-dim);
    padding-top: 8px;
  }

  .unranked-label {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--bg-lighter);
  }

  /* Ranked list */
  .ranked-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pick-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--bg-light);
    border-radius: 6px;
    border: 1px solid transparent;
    transition: background 0.1s, border-color 0.1s;
    cursor: grab;
  }

  .pick-row:hover {
    background: var(--bg-lighter);
  }

  .pick-row.drag-over {
    border-color: var(--accent);
    border-top: 2px solid var(--accent);
  }

  .pick-row.dragging {
    opacity: 0.4;
  }

  .drag-handle {
    color: var(--text-dim);
    font-size: 0.8rem;
    cursor: grab;
    user-select: none;
    flex-shrink: 0;
  }

  .rank-num {
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--text-dim);
    min-width: 32px;
    font-variant-numeric: tabular-nums;
  }

  .team-info {
    display: flex;
    flex-direction: column;
    min-width: 100px;
  }

  .team-number {
    font-weight: 700;
    color: var(--accent);
    font-size: 0.9rem;
  }

  .team-name {
    font-size: 0.7rem;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }

  .stats {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 40px;
  }

  .stat-val {
    font-size: 0.8rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .stat-label {
    font-size: 0.55rem;
    color: var(--text-dim);
    text-transform: uppercase;
  }

  .tier-badge {
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    min-width: 40px;
    text-align: center;
    flex-shrink: 0;
    transition: transform 0.1s;
  }

  .tier-badge:hover {
    transform: scale(1.1);
  }

  .notes-input {
    flex: 1;
    min-width: 80px;
    max-width: 200px;
    padding: 4px 8px;
    background: var(--bg);
    border: 1px solid var(--bg-lighter);
    border-radius: 4px;
    color: var(--text);
    font-size: 0.75rem;
    font-family: 'Instrument Sans', sans-serif;
  }

  .notes-input::placeholder {
    color: var(--text-dim);
    opacity: 0.5;
  }

  .notes-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .remove-btn:hover {
    background: var(--red);
    color: #fff;
  }

  .drop-zone-end {
    height: 4px;
    border-radius: 2px;
    transition: height 0.15s, background 0.15s;
  }

  .drop-zone-end.drag-over {
    height: 32px;
    background: var(--bg-lighter);
    border: 1px dashed var(--accent);
    border-radius: 6px;
  }

  .empty-drop {
    padding: 32px;
    text-align: center;
    color: var(--text-dim);
    font-size: 0.85rem;
    border: 1px dashed var(--bg-lighter);
    border-radius: 8px;
    background: var(--bg-light);
  }

  /* Unranked list */
  .unranked-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .unranked-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    background: var(--bg-light);
    border-radius: 6px;
    cursor: grab;
    opacity: 0.75;
    transition: opacity 0.1s;
  }

  .unranked-row:hover {
    opacity: 1;
  }

  .unranked-row.unscouted {
    opacity: 0.45;
  }

  .stats.compact {
    display: flex;
    gap: 10px;
    flex: 1;
  }

  .stat-inline {
    font-size: 0.75rem;
    color: var(--text-dim);
    font-variant-numeric: tabular-nums;
  }

  .no-data {
    font-size: 0.75rem;
    color: var(--text-dim);
    opacity: 0.5;
    flex: 1;
  }

  .add-btn {
    background: none;
    border: 1px solid var(--bg-lighter);
    color: var(--text-dim);
    cursor: pointer;
    font-size: 1rem;
    padding: 0 8px;
    border-radius: 4px;
    flex-shrink: 0;
    line-height: 1.4;
  }

  .add-btn:hover {
    background: var(--accent);
    color: #1a1a1a;
    border-color: var(--accent);
  }
</style>
