<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';

  let { data } = $props();

  // Scouter accuracy
  let accuracy = $state<any[]>([]);
  let loadingAccuracy = $state(false);

  onMount(async () => {
    loadingAccuracy = true;
    const res = await fetch('/api/scouter-accuracy');
    accuracy = await res.json();
    loadingAccuracy = false;
  });

  // Group management
  let newGroupName = $state('');
  let addToGroup = $state('');
  let addScouter = $state('');

  // Schedule generation
  let shiftLength = $state(5);
  let generating = $state(false);

  // Group colors for visual coding
  const groupColors = ['#ffd96b', '#6bff8a', '#6ba3ff', '#ff6b6b', '#b07aff', '#6bffd9'];

  function groupColor(index: number) {
    return groupColors[index % groupColors.length];
  }

  async function createGroup() {
    if (!newGroupName.trim()) return;
    await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGroupName.trim() })
    });
    newGroupName = '';
    invalidateAll();
  }

  async function deleteGroup(id: number) {
    if (!confirm('Delete this group?')) return;
    await fetch('/api/groups', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    invalidateAll();
  }

  async function addMember() {
    if (!addToGroup || !addScouter) return;
    await fetch('/api/groups/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: Number(addToGroup), scouter_id: Number(addScouter) })
    });
    addScouter = '';
    invalidateAll();
  }

  async function removeMember(groupId: number, scouterId: number) {
    await fetch('/api/groups/members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: groupId, scouter_id: scouterId })
    });
    invalidateAll();
  }

  async function generateSchedule() {
    generating = true;
    const groupOrder = data.groups.map((g: any) => g.id);
    await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shift_length: shiftLength, group_order: groupOrder })
    });
    generating = false;
    invalidateAll();
  }

  async function clearSchedule() {
    if (!confirm('Clear the entire schedule?')) return;
    await fetch('/api/schedule', { method: 'DELETE' });
    invalidateAll();
  }

  // Unassigned scouters (not in any group)
  let unassigned = $derived(data.scouters.filter((s: any) => !s.group_id));

  // Group schedule by match for preview
  let scheduleByMatch = $derived.by(() => {
    const map = new Map<number, any[]>();
    for (const a of data.schedulePreview) {
      if (!map.has(a.match_number)) map.set(a.match_number, []);
      map.get(a.match_number)!.push(a);
    }
    return Array.from(map.entries()).map(([num, assignments]) => ({ match_number: num, assignments }));
  });
</script>

<div class="scouters-page">
  <h2>Scouters & Shifts</h2>

  <!-- Groups section -->
  <div class="section-grid">
    <div class="section">
      <h3>Groups</h3>
      <div class="create-row">
        <input bind:value={newGroupName} placeholder="Group name..." />
        <button class="primary" onclick={createGroup} disabled={!newGroupName.trim()}>Create</button>
      </div>

      {#if data.groups.length === 0}
        <p class="dim">Create groups to organize your scouters into shifts</p>
      {:else}
        <div class="groups-grid">
          {#each data.groups as group, i}
            <div class="card group-card" style="border-left: 4px solid {groupColor(i)}">
              <div class="group-header">
                <span class="group-name">{group.name}</span>
                <button class="small danger" onclick={() => deleteGroup(group.id)}>x</button>
              </div>
              <div class="member-list">
                {#each data.groupMembers.filter((m: any) => m.group_id === group.id) as member}
                  <span class="member-tag">
                    {member.scouter_name}
                    <button class="remove-x" onclick={() => removeMember(group.id, member.scouter_id)}>x</button>
                  </span>
                {/each}
                {#if data.groupMembers.filter((m: any) => m.group_id === group.id).length === 0}
                  <span class="dim small-text">No members</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if data.groups.length > 0 && unassigned.length > 0}
        <div class="assign-row">
          <select bind:value={addScouter}>
            <option value="">Scouter...</option>
            {#each unassigned as s}
              <option value={s.id}>{s.name}</option>
            {/each}
          </select>
          <select bind:value={addToGroup}>
            <option value="">Group...</option>
            {#each data.groups as g}
              <option value={g.id}>{g.name}</option>
            {/each}
          </select>
          <button onclick={addMember} disabled={!addScouter || !addToGroup}>Add</button>
        </div>
      {/if}
    </div>

    <!-- Schedule generator -->
    <div class="section">
      <h3>Schedule Generator</h3>
      {#if data.groups.length < 2}
        <p class="dim">Create at least 2 groups to generate a rotation schedule</p>
      {:else}
        <div class="gen-controls">
          <label class="gen-label">
            Matches per shift
            <input type="number" bind:value={shiftLength} min="1" max="50" style="width: 70px;" />
          </label>
          <div class="gen-preview">
            <span class="dim">Rotation:</span>
            {#each data.groups as g, i}
              <span class="rotation-tag" style="background: {groupColor(i)}">{g.name}</span>
              {#if i < data.groups.length - 1}<span class="dim">then</span>{/if}
            {/each}
            <span class="dim">repeat</span>
          </div>
          <div class="gen-buttons">
            <button class="primary" onclick={generateSchedule} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Schedule'}
            </button>
            {#if data.assignmentCount > 0}
              <button class="danger" onclick={clearSchedule}>Clear</button>
            {/if}
          </div>
          {#if data.assignmentCount > 0}
            <span class="dim">{data.assignmentCount} assignments active</span>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Schedule preview -->
  {#if scheduleByMatch.length > 0}
    <div class="section">
      <h3>Schedule ({scheduleByMatch.length} matches)</h3>
      <div class="schedule-table-wrap">
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Match</th>
              <th>Group</th>
              <th>Assignments</th>
            </tr>
          </thead>
          <tbody>
            {#each scheduleByMatch as row, i}
              {@const prevGroup = i > 0 ? scheduleByMatch[i-1].assignments[0]?.group_name : null}
              {@const currentGroup = row.assignments[0]?.group_name}
              {#if prevGroup && currentGroup !== prevGroup}
                <tr class="shift-break">
                  <td colspan="3">SHIFT CHANGE</td>
                </tr>
              {/if}
              <tr>
                <td class="match-col">Q{row.match_number}</td>
                <td>
                  <span class="group-badge" style="background: {groupColor(data.groups.findIndex((g: any) => g.name === row.assignments[0]?.group_name))}">
                    {row.assignments[0]?.group_name}
                  </span>
                </td>
                <td class="assign-col">
                  {#each row.assignments as a}
                    <span class="assign-chip">
                      <span class="assign-scouter">{a.scouter_name}</span>
                      <span class="assign-team">#{a.team_number}</span>
                    </span>
                  {/each}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- All scouters list -->
  <div class="section">
    <h3>All Scouters ({data.scouters.length})</h3>
    {#if data.scouters.length === 0}
      <p class="dim">No scouters have joined yet. Scouters are created when they enter the app.</p>
    {:else}
      <div class="scouter-grid">
        {#each data.scouters as scouter}
          <div class="card scouter-card">
            <div class="scouter-header">
              <span class="scouter-name">{scouter.name}</span>
              <span class="scout-count">{scouter.scout_count} scouts</span>
            </div>
            {#if scouter.group_name}
              <span class="group-badge small" style="background: {groupColor(data.groups.findIndex((g: any) => g.name === scouter.group_name))}">{scouter.group_name}</span>
            {:else}
              <span class="dim small-text">No group</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Scouter Accuracy -->
  <div class="section">
    <h3>Scouter Accuracy</h3>
    <p class="dim small-text">Compares scouted data against actual FTC match scores. Lower deviation = more accurate.</p>
    {#if loadingAccuracy}
      <p class="dim">Loading...</p>
    {:else if accuracy.length === 0}
      <p class="dim">No accuracy data. Sync match scores first (Setup > Sync Match Scores).</p>
    {:else}
      <div class="accuracy-grid">
        {#each accuracy as s}
          <div class="card accuracy-card">
            <div class="acc-header">
              <span class="acc-name">{s.name}</span>
              <span class="acc-count">{s.withScores} scored</span>
            </div>
            {#if s.withScores > 0}
              <div class="acc-stats">
                <div class="acc-stat">
                  <span class="acc-val" class:green={s.avgAbsDev < 10} class:yellow-c={s.avgAbsDev >= 10 && s.avgAbsDev < 20} class:red-c={s.avgAbsDev >= 20}>
                    {s.avgAbsDev}
                  </span>
                  <span class="acc-label">Avg |Dev|</span>
                </div>
                <div class="acc-stat">
                  <span class="acc-val">{s.avgDev > 0 ? '+' : ''}{s.avgDev}</span>
                  <span class="acc-label">{s.avgDev > 0 ? 'Over' : s.avgDev < 0 ? 'Under' : 'Exact'}</span>
                </div>
              </div>
              <div class="acc-bar-track">
                <div class="acc-bar-fill" class:green={s.avgAbsDev < 10} class:yellow-c={s.avgAbsDev >= 10 && s.avgAbsDev < 20} class:red-c={s.avgAbsDev >= 20}
                  style="width: {Math.max(5, 100 - s.avgAbsDev * 2)}%"></div>
              </div>
            {:else}
              <span class="dim small-text">No matches with actual scores</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .scouters-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .section { display: flex; flex-direction: column; gap: 10px; }
  .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  h3 { font-size: 1rem; color: var(--text-dim); }

  .create-row, .assign-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .create-row input, .assign-row select { flex: 1; }

  .groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
  }

  .group-card { padding: 10px; }
  .group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .group-name { font-weight: 600; font-size: 0.95rem; }

  .member-list { display: flex; flex-wrap: wrap; gap: 4px; }
  .member-tag {
    display: inline-flex; align-items: center; gap: 3px;
    background: var(--bg-lighter); padding: 2px 8px; border-radius: 4px;
    font-size: 0.8rem;
  }
  .remove-x {
    background: none; padding: 0 2px; font-size: 0.7rem; color: var(--red); border-radius: 0; cursor: pointer; border: none;
  }

  .dim { color: var(--text-dim); font-size: 0.85rem; }
  .small-text { font-size: 0.75rem; }

  /* Generator */
  .gen-controls { display: flex; flex-direction: column; gap: 10px; }
  .gen-label { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-dim); }
  .gen-label input { font-size: 0.9rem; }
  .gen-preview { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 0.8rem; }
  .rotation-tag {
    padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; color: #1a1a1a;
  }
  .gen-buttons { display: flex; gap: 8px; }

  .group-badge {
    display: inline-block; padding: 2px 8px; border-radius: 4px;
    font-size: 0.7rem; font-weight: 600; color: #1a1a1a;
  }
  .group-badge.small { font-size: 0.65rem; }

  /* Schedule table */
  .schedule-table-wrap { overflow-x: auto; max-height: 500px; overflow-y: auto; }
  .schedule-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
  .schedule-table th {
    text-align: left; padding: 6px 8px; color: var(--text-dim);
    font-weight: 500; border-bottom: 1px solid var(--bg-lighter);
    position: sticky; top: 0; background: var(--bg);
  }
  .schedule-table td { padding: 5px 8px; border-bottom: 1px solid var(--bg-light); }
  .match-col { font-weight: 600; color: var(--accent); white-space: nowrap; }

  .shift-break td {
    text-align: center; font-size: 0.7rem; font-weight: 600;
    color: var(--text-dim); background: var(--bg-lighter); padding: 3px;
    letter-spacing: 1px;
  }

  .assign-col { display: flex; gap: 6px; flex-wrap: wrap; }
  .assign-chip {
    display: inline-flex; gap: 3px; background: var(--bg-lighter);
    padding: 1px 6px; border-radius: 3px; font-size: 0.75rem;
  }
  .assign-scouter { font-weight: 500; }
  .assign-team { color: var(--text-dim); }

  /* Scouter grid */
  .scouter-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px;
  }
  .scouter-card { display: flex; flex-direction: column; gap: 4px; padding: 10px; }
  .scouter-header { display: flex; justify-content: space-between; align-items: center; }
  .scouter-name { font-weight: 600; }
  .scout-count { font-size: 0.75rem; color: var(--text-dim); }

  button.small { padding: 3px 8px; font-size: 0.7rem; }

  /* Accuracy */
  .accuracy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 8px;
  }

  .accuracy-card { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
  .acc-header { display: flex; justify-content: space-between; align-items: center; }
  .acc-name { font-weight: 600; }
  .acc-count { font-size: 0.7rem; color: var(--text-dim); }

  .acc-stats { display: flex; gap: 16px; }
  .acc-stat { display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .acc-val { font-size: 1.1rem; font-weight: 700; }
  .acc-val.green { color: var(--green); }
  .acc-val.yellow-c { color: var(--yellow); }
  .acc-val.red-c { color: var(--red); }
  .acc-label { font-size: 0.65rem; color: var(--text-dim); }

  .acc-bar-track {
    height: 4px; background: var(--bg-lighter); border-radius: 2px; overflow: hidden;
  }
  .acc-bar-fill {
    height: 100%; border-radius: 2px; transition: width 0.3s;
  }
  .acc-bar-fill.green { background: var(--green); }
  .acc-bar-fill.yellow-c { background: var(--yellow); }
  .acc-bar-fill.red-c { background: var(--red); }
</style>
