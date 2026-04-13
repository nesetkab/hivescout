<script>
  let { data } = $props();

  // Find next assignment (first unfinished one)
  let nextAssignment = $derived.by(() => {
    return data.schedule.find((s) => !data.scoutedMatchIds.includes(s.match_id));
  });

  // Build timeline: assignments + breaks
  let timeline = $derived.by(() => {
    if (data.schedule.length === 0) return [];

    const allNums = data.allMatchNumbers;
    const assignedNums = new Set(data.schedule.map((s) => s.match_number));
    const items = [];
    let i = 0;

    while (i < allNums.length) {
      const num = allNums[i];
      if (assignedNums.has(num)) {
        const a = data.schedule.find((s) => s.match_number === num);
        items.push({
          type: 'match',
          match_number: num,
          team_number: a.team_number,
          team_name: a.team_name,
          scouted: data.scoutedMatchIds.includes(a.match_id),
          match_id: a.match_id,
        });
        i++;
      } else {
        // Count consecutive break matches
        const breakStart = num;
        let breakEnd = num;
        while (i < allNums.length && !assignedNums.has(allNums[i])) {
          breakEnd = allNums[i];
          i++;
        }
        items.push({
          type: 'break',
          from: breakStart,
          to: breakEnd,
          count: breakEnd - breakStart + 1,
        });
      }
    }
    return items;
  });

  let isOnBreak = $derived(!nextAssignment && data.schedule.length > 0);

  // Find next break
  let nextBreak = $derived.by(() => {
    if (!nextAssignment) return null;
    const idx = timeline.findIndex(
      (t) => t.type === 'break' && t.from > nextAssignment.match_number
    );
    return idx >= 0 ? timeline[idx] : null;
  });
</script>

<div class="dashboard">
  <h2>Dashboard</h2>

  {#if data.schedule.length > 0}
    <!-- Shift status -->
    <div class="status-card card" class:on-break={isOnBreak}>
      {#if nextAssignment}
        <div class="status-label">NEXT UP</div>
        <div class="next-match">
          <span class="next-q">Q{nextAssignment.match_number}</span>
          <span class="next-team">Scout #{nextAssignment.team_number} <span class="dim">{nextAssignment.team_name}</span></span>
        </div>
        {#if nextBreak}
          <div class="next-break">Break after Q{nextBreak.from - 1} ({nextBreak.count} matches off)</div>
        {/if}
      {:else if isOnBreak}
        <div class="status-label break-label">ON BREAK</div>
        <div class="break-msg">No more assignments</div>
      {:else}
        <div class="status-label">SCHEDULE COMPLETE</div>
      {/if}
      {#if data.groupInfo}
        <div class="group-tag">{data.groupInfo.group_name}</div>
      {/if}
    </div>

    <!-- Timeline -->
    <section>
      <h3>Your Schedule</h3>
      <div class="timeline">
        {#each timeline as item}
          {#if item.type === 'match'}
            <div class="tl-item" class:scouted={item.scouted} class:next={nextAssignment && item.match_number === nextAssignment.match_number}>
              <span class="tl-q">Q{item.match_number}</span>
              <span class="tl-team">#{item.team_number}</span>
              <span class="tl-name">{item.team_name}</span>
              {#if item.scouted}
                <span class="tl-done">done</span>
              {:else if nextAssignment && item.match_number === nextAssignment.match_number}
                <span class="tl-next">next</span>
              {/if}
            </div>
          {:else}
            <div class="tl-break">
              BREAK Q{item.from}-Q{item.to}
            </div>
          {/if}
        {/each}
      </div>
    </section>
  {:else}
    <div class="card">
      <p class="dim">No shift schedule assigned yet. Ask your manager to generate one.</p>
    </div>
  {/if}

  {#if data.assignments.length > 0}
    <section>
      <h3>Assigned Teams</h3>
      <div class="team-list">
        {#each data.assignments as a}
          <div class="card team-card">
            <span class="team-num">#{a.team_number}</span>
            <span>{a.team_name}</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <section>
    <h3>All Matches ({data.matches.length})</h3>
    {#if data.matches.length === 0}
      <p class="dim">No matches loaded yet</p>
    {:else}
      <div class="match-list">
        {#each data.matches.slice(0, 20) as match}
          <div class="card match-card">
            <div class="match-header">
              <span class="match-num">Q{match.match_number}</span>
            </div>
            <div class="alliances">
              <div class="alliance">
                <span class="badge red">RED</span>
                <span>{match.red1 || '?'} / {match.red2 || '?'}</span>
              </div>
              <div class="alliance">
                <span class="badge blue">BLUE</span>
                <span>{match.blue1 || '?'} / {match.blue2 || '?'}</span>
              </div>
            </div>
          </div>
        {/each}
        {#if data.matches.length > 20}
          <p class="dim">+ {data.matches.length - 20} more matches</p>
        {/if}
      </div>
    {/if}
  </section>
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  h2 { font-size: 1.4rem; }
  h3 { font-size: 1rem; color: var(--text-dim); margin-bottom: 4px; }
  section { display: flex; flex-direction: column; gap: 8px; }
  .dim { color: var(--text-dim); font-size: 0.85rem; }

  /* Status card */
  .status-card {
    border-left: 4px solid var(--green);
    position: relative;
  }

  .status-card.on-break {
    border-left-color: var(--yellow);
  }

  .status-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--green);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .break-label { color: var(--yellow); }

  .next-match {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-top: 4px;
  }

  .next-q {
    font-size: 1.8rem;
    font-weight: 700;
  }

  .next-team {
    font-size: 1rem;
    font-weight: 500;
  }

  .next-break {
    font-size: 0.8rem;
    color: var(--text-dim);
    margin-top: 4px;
  }

  .break-msg {
    font-size: 1rem;
    margin-top: 4px;
  }

  .group-tag {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    background: var(--bg-lighter);
    padding: 2px 8px;
    border-radius: 4px;
    color: var(--text-dim);
  }

  /* Timeline */
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tl-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    font-size: 0.85rem;
    border-radius: 4px;
    background: var(--bg-light);
  }

  .tl-item.scouted {
    opacity: 0.5;
  }

  .tl-item.next {
    border-left: 3px solid var(--accent);
    background: rgba(107, 163, 255, 0.1);
  }

  .tl-q {
    font-weight: 700;
    min-width: 36px;
    color: var(--accent);
  }

  .tl-team {
    font-weight: 600;
    min-width: 50px;
  }

  .tl-name {
    color: var(--text-dim);
    font-size: 0.8rem;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tl-done {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--green);
    text-transform: uppercase;
  }

  .tl-next {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--accent);
    text-transform: uppercase;
  }

  .tl-break {
    padding: 4px 10px;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--yellow);
    text-align: center;
    background: rgba(255, 217, 107, 0.08);
    border-radius: 4px;
    letter-spacing: 0.5px;
  }

  /* Teams and matches */
  .team-list, .match-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .team-card, .match-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
  }

  .match-card {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .match-header { display: flex; justify-content: space-between; align-items: center; }
  .match-num { font-weight: 600; font-size: 1rem; }
  .team-num { font-weight: 600; color: var(--accent); }

  .alliances { display: flex; gap: 12px; }
  .alliance { flex: 1; display: flex; flex-direction: column; gap: 2px; font-size: 0.8rem; }
</style>
