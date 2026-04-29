<script>
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  let selectedTeam = $state('');
  let transferType = $state('');
  let autoRating = $state(5);
  let autoCap = $state('');
  let teleopRating = $state(5);
  let teleopCap = $state('');
  let endgameCap = $state('');
  let submitting = $state(false);
  let submitError = $state('');

  async function submit() {
    if (!selectedTeam || !data.scouter) return;
    submitting = true;
    submitError = '';
    try {
      const res = await fetch('/api/prescout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_number: Number(selectedTeam),
          scouter_id: data.scouter.id,
          drivetrain: '',
          intake_type: transferType,
          can_score_goal: autoRating,
          can_classify: teleopRating,
          can_open_gate: 0,
          auto_capabilities: autoCap,
          teleop_capabilities: teleopCap,
          endgame_capabilities: endgameCap,
          strengths: '',
          weaknesses: '',
          notes: ''
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        submitError = body?.error || `Submit failed (${res.status})`;
        submitting = false;
        return;
      }
      selectedTeam = '';
      transferType = '';
      autoRating = 5;
      autoCap = '';
      teleopRating = 5;
      teleopCap = '';
      endgameCap = '';
      invalidateAll();
    } catch {
      submitError = 'Network error — your data has NOT been saved. Check your connection and try again.';
    }
    submitting = false;
  }
</script>

<div class="prescout">
  <h2>Pre-Scout</h2>
  <p class="subtitle">Interview a team before their matches</p>

  <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <label>
      Team
      <select bind:value={selectedTeam}>
        <option value="">Select team...</option>
        {#each data.teams as team}
          <option value={team.number}>#{team.number} - {team.name}</option>
        {/each}
      </select>
    </label>

    <label>
      Type of Transfer
      <select bind:value={transferType}>
        <option value="">Select...</option>
        <option value="passthrough">Passthrough</option>
        <option value="spindexer">Spindexer</option>
        <option value="other_indexer">Other Indexer</option>
        <option value="other_nonindexer">Other Non-Indexer</option>
      </select>
    </label>

    <div class="rating-field">
      <span class="rating-label">Auto Rating</span>
      <div class="rating-row">
        {#each Array.from({length: 10}, (_, i) => i + 1) as n}
          <button type="button" class="rating-btn" class:selected={autoRating === n} onclick={() => autoRating = n}>{n}</button>
        {/each}
      </div>
    </div>

    <label>
      Auto Capabilities
      <textarea bind:value={autoCap} placeholder="What do they do in auto?"></textarea>
    </label>

    <div class="rating-field">
      <span class="rating-label">Teleop Rating</span>
      <div class="rating-row">
        {#each Array.from({length: 10}, (_, i) => i + 1) as n}
          <button type="button" class="rating-btn" class:selected={teleopRating === n} onclick={() => teleopRating = n}>{n}</button>
        {/each}
      </div>
    </div>

    <label>
      Teleop Capabilities
      <textarea bind:value={teleopCap} placeholder="What do they do in teleop?"></textarea>
    </label>

    <label>
      Endgame
      <select bind:value={endgameCap}>
        <option value="">Select...</option>
        <option value="lift">Lift</option>
        <option value="tilt">Tilt</option>
        <option value="normal_park">Normal Park</option>
        <option value="none">None</option>
      </select>
    </label>

    <button type="submit" class="primary" disabled={!selectedTeam || submitting}>
      {submitting ? 'Saving...' : 'Submit Pre-Scout'}
    </button>
    {#if submitError}
      <div class="submit-error">{submitError}</div>
    {/if}
  </form>

  {#if data.myPrescouts.length > 0}
    <section>
      <h3>Your Previous Pre-Scouts</h3>
      {#each data.myPrescouts as ps}
        <div class="card">
          <div class="ps-header">
            <span class="team-num">#{ps.team_number}</span>
            <span>{ps.team_name}</span>
          </div>
          <div class="ps-detail">
            {#if ps.intake_type}<span>Transfer: {ps.intake_type}</span>{/if}
            {#if ps.can_score_goal}<span>Auto: {ps.can_score_goal}/10</span>{/if}
            {#if ps.can_classify}<span>Teleop: {ps.can_classify}/10</span>{/if}
            {#if ps.endgame_capabilities}<span>Endgame: {ps.endgame_capabilities}</span>{/if}
          </div>
        </div>
      {/each}
    </section>
  {/if}
</div>

<style>
  .prescout {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .subtitle {
    color: var(--text-dim);
    font-size: 0.85rem;
    margin-top: -8px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-dim);
  }

  .rating-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rating-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-dim);
  }

  .rating-row {
    display: flex;
    gap: 4px;
  }

  .rating-btn {
    flex: 1;
    padding: 10px 0;
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
    border-radius: 6px;
    background: var(--bg-light);
    border: 2px solid var(--bg-lighter);
    color: var(--text);
    cursor: pointer;
    font-family: 'Instrument Sans', sans-serif;
  }

  .rating-btn.selected {
    background: var(--accent);
    color: #1a1a1a;
    border-color: var(--accent);
  }

  section {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  h3 {
    font-size: 1rem;
    color: var(--text-dim);
  }

  .ps-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 4px;
  }

  .team-num {
    font-weight: 600;
    color: var(--accent);
  }

  .ps-detail {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.8rem;
    color: var(--text-dim);
  }

  .submit-error {
    padding: 10px 12px;
    background: rgba(255, 107, 107, 0.15);
    border: 1px solid var(--red);
    border-radius: 6px;
    color: var(--red);
    font-size: 0.85rem;
    font-weight: 500;
  }
</style>
