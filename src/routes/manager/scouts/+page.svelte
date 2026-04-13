<script lang="ts">
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  let search = $state('');
  let filterTeam = $state('');
  let editingId = $state<number | null>(null);

  // Edit form state
  let editForm = $state<Record<string, any>>({});

  let filtered = $derived.by(() => {
    let arr = data.scouts as any[];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((s: any) =>
        String(s.match_number).includes(q) ||
        String(s.team_number).includes(q) ||
        s.team_name.toLowerCase().includes(q) ||
        s.scouter_name.toLowerCase().includes(q) ||
        (s.notes || '').toLowerCase().includes(q)
      );
    }
    if (filterTeam) {
      arr = arr.filter((s: any) => s.team_number === Number(filterTeam));
    }
    return arr;
  });

  function startEdit(scout: any) {
    editingId = scout.id;
    editForm = {
      auto_leave: scout.auto_leave,
      auto_classified: scout.auto_classified,
      auto_overflow: scout.auto_overflow,
      teleop_classified: scout.teleop_classified,
      teleop_overflow: scout.teleop_overflow,
      opened_gate: scout.opened_gate,
      endgame_base: scout.endgame_base,
      defense_rating: scout.defense_rating,
      driver_skill: scout.driver_skill,
      reliability: scout.reliability,
      notes: scout.notes || '',
    };
  }

  function cancelEdit() {
    editingId = null;
    editForm = {};
  }

  async function saveEdit() {
    if (!editingId) return;
    await fetch('/api/matchscout', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, ...editForm })
    });
    editingId = null;
    editForm = {};
    invalidateAll();
  }

  async function deleteScout(id: number) {
    if (!confirm('Delete this scout entry?')) return;
    await fetch('/api/matchscout', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    invalidateAll();
  }
</script>

<div class="scouts-page">
  <div class="header-row">
    <h2>All Scouts ({data.scouts.length})</h2>
    <div class="filters">
      <input bind:value={search} placeholder="Search..." class="search-input" />
      <select bind:value={filterTeam}>
        <option value="">All teams</option>
        {#each data.teams as t}
          <option value={t.number}>#{t.number} {t.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if filtered.length === 0}
    <p class="empty">No scouts found</p>
  {:else}
    <div class="scouts-list">
      {#each filtered as scout}
        <div class="card scout-row" class:editing={editingId === scout.id}>
          <div class="scout-header">
            <span class="match-num">Q{scout.match_number}</span>
            <span class="team">#{scout.team_number} {scout.team_name}</span>
            <span class="scouter">{scout.scouter_name}</span>
            <div class="actions">
              {#if editingId === scout.id}
                <button class="primary small" onclick={saveEdit}>Save</button>
                <button class="small" onclick={cancelEdit}>Cancel</button>
              {:else}
                <button class="small" onclick={() => startEdit(scout)}>Edit</button>
                <button class="small danger" onclick={() => deleteScout(scout.id)}>Delete</button>
              {/if}
            </div>
          </div>

          {#if editingId === scout.id}
            <div class="edit-form">
              <div class="edit-grid">
                <label>
                  <span>Auto Leave</span>
                  <select bind:value={editForm.auto_leave}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </label>
                <label>
                  <span>Auto Cls</span>
                  <input type="number" bind:value={editForm.auto_classified} min="0" />
                </label>
                <label>
                  <span>Auto Ovf</span>
                  <input type="number" bind:value={editForm.auto_overflow} min="0" />
                </label>
                <label>
                  <span>Tel Cls</span>
                  <input type="number" bind:value={editForm.teleop_classified} min="0" />
                </label>
                <label>
                  <span>Tel Ovf</span>
                  <input type="number" bind:value={editForm.teleop_overflow} min="0" />
                </label>
                <label>
                  <span>Gate</span>
                  <select bind:value={editForm.opened_gate}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </label>
                <label>
                  <span>BASE</span>
                  <select bind:value={editForm.endgame_base}>
                    <option value="none">None</option>
                    <option value="partial">Partial</option>
                    <option value="full">Full</option>
                  </select>
                </label>
                <label>
                  <span>Skill</span>
                  <input type="number" bind:value={editForm.driver_skill} min="1" max="5" />
                </label>
                <label>
                  <span>Reliability</span>
                  <input type="number" bind:value={editForm.reliability} min="1" max="5" />
                </label>
                <label>
                  <span>Defense</span>
                  <input type="number" bind:value={editForm.defense_rating} min="1" max="5" />
                </label>
              </div>
              <label class="notes-edit">
                <span>Notes</span>
                <textarea bind:value={editForm.notes}></textarea>
              </label>
            </div>
          {:else}
            <div class="scout-stats">
              <span>A: {scout.auto_classified}c {scout.auto_overflow}o{scout.auto_leave ? ' +L' : ''}</span>
              <span>T: {scout.teleop_classified}c {scout.teleop_overflow}o</span>
              <span>BASE: {scout.endgame_base}</span>
              <span>Gate: {scout.opened_gate ? 'Y' : 'N'}</span>
              <span>Skill: {scout.driver_skill}</span>
              <span>Rel: {scout.reliability}</span>
            </div>
            {#if scout.notes}
              <div class="scout-notes">{scout.notes}</div>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .scouts-page { display: flex; flex-direction: column; gap: 16px; }

  .header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }

  .filters { display: flex; gap: 8px; align-items: center; }
  .search-input { width: 200px; }
  .filters select { width: auto; }

  .empty { color: var(--text-dim); }

  .scouts-list { display: flex; flex-direction: column; gap: 6px; }

  .scout-row { padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; }
  .scout-row.editing { border-left: 3px solid var(--accent); }

  .scout-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .match-num { font-weight: 700; color: var(--accent); min-width: 36px; }
  .team { font-weight: 600; min-width: 120px; }
  .scouter { color: var(--text-dim); font-size: 0.8rem; flex: 1; }
  .actions { display: flex; gap: 4px; }

  button.small { padding: 3px 10px; font-size: 0.75rem; }

  .scout-stats {
    display: flex; gap: 12px; font-size: 0.8rem; color: var(--text-dim); flex-wrap: wrap;
  }

  .scout-notes { font-size: 0.8rem; color: var(--text-dim); font-style: italic; }

  .edit-form { display: flex; flex-direction: column; gap: 8px; }

  .edit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 6px;
  }

  .edit-grid label {
    display: flex; flex-direction: column; gap: 2px; font-size: 0.75rem; color: var(--text-dim);
  }

  .edit-grid input, .edit-grid select { font-size: 0.8rem; padding: 4px 6px; }

  .notes-edit { display: flex; flex-direction: column; gap: 2px; font-size: 0.75rem; color: var(--text-dim); }
  .notes-edit textarea { min-height: 40px; font-size: 0.8rem; }
</style>
