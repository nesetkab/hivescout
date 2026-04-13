<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { matchActive } from '$lib/stores';

  let { data } = $props();

  let selectedMatch = $state('');
  let selectedTeam = $state('');
  let manualMode = $state(false);

  // Upcoming scheduled assignments (not yet scouted)
  let upcomingAssignments = $derived(
    (data.schedule || []).filter((a: any) => !data.scoutedMatchIds?.includes(a.match_id))
  );
  let nextAssignment = $derived(upcomingAssignments.length > 0 ? upcomingAssignments[0] : null);
  let hasSchedule = $derived((data.schedule || []).length > 0);

  function selectAssignment(a: any) {
    selectedMatch = a.match_id;
    selectedTeam = a.team_number;
  }

  let timerRunning = $state(false);
  let startedAt = $state('');
  let elapsed = $state(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let phase = $state<'setup' | 'auto' | 'transition' | 'teleop' | 'endgame' | 'review'>('setup');
  let disconnected = $state(false);

  // Field tap
  let tapX = $state<number | null>(null);
  let tapY = $state<number | null>(null);
  let attempted = $state<number | null>(null);

  let scoringEvents = $state<Array<{
    phase: string; x: number; y: number;
    attempted: number; scored: number; time: number;
  }>>([]);

  // Toggles
  let autoLeave = $state(false);
  let openedGate = $state(false);
  let gateFlash = $state(false);
  let endgameBase = $state<'none' | 'partial' | 'full'>('none');
  let parkMethod = $state<'none' | 'normal' | 'tilt' | 'lift'>('none');
  let parkFailed = $state(false);
  let defenseRating = $state(3);
  let driverSkill = $state(3);
  let reliability = $state(3);
  let notes = $state('');
  let submitting = $state(false);

  let matchTeams = $derived.by(() => {
    if (!selectedMatch) return [];
    const m = data.matches.find((m: any) => m.id == selectedMatch);
    if (!m) return [];
    return [
      { number: m.red1, name: m.red1_name, alliance: 'red' },
      { number: m.red2, name: m.red2_name, alliance: 'red' },
      { number: m.blue1, name: m.blue1_name, alliance: 'blue' },
      { number: m.blue2, name: m.blue2_name, alliance: 'blue' },
    ].filter(t => t.number);
  });

  let autoClassified = $derived(scoringEvents.filter(e => e.phase === 'auto').reduce((s, e) => s + e.scored, 0));
  let autoOverflow = $derived(scoringEvents.filter(e => e.phase === 'auto').reduce((s, e) => s + (e.attempted - e.scored), 0));
  let teleopClassified = $derived(scoringEvents.filter(e => e.phase === 'teleop').reduce((s, e) => s + e.scored, 0));
  let teleopOverflow = $derived(scoringEvents.filter(e => e.phase === 'teleop').reduce((s, e) => s + (e.attempted - e.scored), 0));

  function startTimer() {
    startedAt = new Date().toISOString();
    timerRunning = true;
    phase = 'auto';
    matchActive.set(true);
    elapsed = 0;
    timerInterval = setInterval(() => {
      elapsed += 1;
      if (elapsed === 30 && phase === 'auto') {
        phase = 'transition';
      }
      if (elapsed === 45 && phase === 'transition') {
        phase = 'teleop';
      }
      if (elapsed === 145 && phase === 'teleop') {
        phase = 'endgame';
      }
    }, 1000);
  }

  function toggleGate() {
    openedGate = true;
    gateFlash = true;
    setTimeout(() => { gateFlash = false; }, 2000);
  }

  function setEndgameBase(val: 'none' | 'partial' | 'full') {
    if (endgameBase === val) {
      endgameBase = 'none';
      parkMethod = 'none';
      parkFailed = false;
    } else {
      endgameBase = val;
      parkMethod = 'none';
      parkFailed = false;
    }
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerRunning = false;
    phase = 'review';
  }

  let displayTime = $derived.by(() => {
    if (phase === 'auto') {
      // Auto counts down from 0:30
      const remaining = Math.max(0, 30 - elapsed);
      return `0:${String(remaining).padStart(2, '0')}`;
    }
    if (phase === 'transition') {
      const remaining = Math.max(0, 45 - elapsed);
      return `0:${String(remaining).padStart(2, '0')}`;
    }
    // Teleop/endgame counts down from 2:00
    const remaining = Math.max(0, 165 - elapsed);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  });

  function handleFieldTap(e: MouseEvent | TouchEvent) {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    tapX = ((clientX - rect.left) / rect.width) * 100;
    tapY = ((clientY - rect.top) / rect.height) * 100;
    attempted = null;
  }

  function selectAttempted(n: number) {
    attempted = n;
  }

  function selectScored(n: number) {
    if (tapX === null || tapY === null || attempted === null) return;
    scoringEvents = [...scoringEvents, {
      phase: (phase === 'review' || phase === 'endgame' || phase === 'transition') ? 'teleop' : phase,
      x: Math.round(tapX * 10) / 10,
      y: Math.round(tapY * 10) / 10,
      attempted,
      scored: n,
      time: elapsed
    }];
    tapX = null;
    tapY = null;
    attempted = null;
  }

  function undoLast() {
    if (scoringEvents.length > 0) {
      scoringEvents = scoringEvents.slice(0, -1);
    }
  }

  async function submit() {
    if (!data.scouter || !selectedMatch || !selectedTeam) return;
    submitting = true;
    await fetch('/api/matchscout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: Number(selectedMatch),
        team_number: Number(selectedTeam),
        scouter_id: data.scouter.id,
        auto_leave: autoLeave ? 1 : 0,
        auto_classified: autoClassified,
        auto_overflow: autoOverflow,
        auto_pattern_matches: 0,
        teleop_classified: teleopClassified,
        teleop_overflow: teleopOverflow,
        teleop_depot: 0,
        teleop_pattern_matches: 0,
        opened_gate: openedGate ? 1 : 0,
        endgame_base: endgameBase,
        defense_rating: defenseRating,
        driver_skill: driverSkill,
        reliability,
        minor_fouls: 0,
        major_fouls: 0,
        yellow_card: 0,
        red_card: 0,
        notes: [
          disconnected ? '[DISCONNECTED]' : '',
          parkFailed ? '[PARK FAILED]' : '',
          parkMethod !== 'none' ? `[PARK: ${parkMethod}]` : '',
          notes
        ].filter(Boolean).join(' '),
        scoring_events: scoringEvents,
        started_at: startedAt,
        ended_at: new Date().toISOString()
      })
    });
    resetAll();
    submitting = false;
    invalidateAll();
  }

  function resetAll() {
    matchActive.set(false);
    selectedMatch = '';
    selectedTeam = '';
    manualMode = false;
    phase = 'setup';
    elapsed = 0;
    timerRunning = false;
    startedAt = '';
    tapX = null;
    tapY = null;
    attempted = null;
    scoringEvents = [];
    autoLeave = false;
    openedGate = false;
    gateFlash = false;
    disconnected = false;
    endgameBase = 'none';
    parkMethod = 'none';
    parkFailed = false;
    defenseRating = 3;
    driverSkill = 3;
    reliability = 3;
    notes = '';
    if (timerInterval) clearInterval(timerInterval);
  }
</script>

<div class="match-scout">
  {#if phase === 'setup'}
    <h2>Match Scout - DECODE</h2>

    {#if hasSchedule && !manualMode}
      <!-- Schedule-driven selection -->
      <div class="setup">
        {#if upcomingAssignments.length > 0}
          <div class="assignment-list">
            {#each upcomingAssignments.slice(0, 5) as a, i}
              <button
                class="assignment-btn"
                class:next={i === 0}
                class:selected={selectedMatch == a.match_id && selectedTeam == a.team_number}
                onclick={() => selectAssignment(a)}
              >
                <span class="asgn-q">Q{a.match_number}</span>
                <span class="asgn-team">#{a.team_number}</span>
                <span class="asgn-name">{a.team_name}</span>
                {#if i === 0}<span class="asgn-badge">NEXT</span>{/if}
              </button>
            {/each}
            {#if upcomingAssignments.length > 5}
              <span class="dim-text">+{upcomingAssignments.length - 5} more</span>
            {/if}
          </div>
        {:else}
          <p class="dim-text">All scheduled matches scouted</p>
        {/if}

        <button class="link-btn" onclick={() => manualMode = true}>Choose manually</button>

        {#if selectedTeam}
          <button class="primary start-btn" onclick={startTimer}>
            Start Match Timer
          </button>
        {/if}
      </div>

    {:else}
      <!-- Manual selection -->
      <div class="setup">
        {#if hasSchedule}
          <button class="link-btn" onclick={() => { manualMode = false; selectedMatch = ''; selectedTeam = ''; }}>Back to schedule</button>
        {/if}

        <label>
          Match
          <select bind:value={selectedMatch} onchange={() => selectedTeam = ''}>
            <option value="">Select match...</option>
            {#each data.matches as match}
              <option value={match.id}>Q{match.match_number}</option>
            {/each}
          </select>
        </label>

        {#if selectedMatch}
          <label>
            Team to Scout
            <select bind:value={selectedTeam}>
              <option value="">Select team...</option>
              {#each matchTeams as t}
                <option value={t.number}>
                  [{t.alliance.toUpperCase()}] #{t.number} {t.name || ''}
                </option>
              {/each}
            </select>
          </label>
        {/if}

        {#if selectedTeam}
          <button class="primary start-btn" onclick={startTimer}>
            Start Match Timer
          </button>
        {/if}
      </div>
    {/if}
  {/if}

  {#if phase === 'auto' || phase === 'transition' || phase === 'teleop' || phase === 'endgame'}
    <div class="timer-bar" class:auto={phase === 'auto'} class:transition={phase === 'transition'} class:teleop={phase === 'teleop'} class:endgame={phase === 'endgame'}>
      <span class="timer-phase">{phase.toUpperCase()}</span>
      <span class="timer-clock">{displayTime}</span>
      <button class="danger" onclick={stopTimer}>Stop</button>
    </div>

    {#if phase === 'transition'}
      <div class="transition-banner">TRANSITION - pick up controllers</div>
    {/if}

    <div class="quick-actions">
      {#if phase === 'auto'}
        <button
          class="quick-btn"
          class:active={autoLeave}
          onclick={() => autoLeave = !autoLeave}
        >
          LEFT LAUNCH
        </button>
      {/if}
      <button
        class="quick-btn"
        class:active={gateFlash}
        onclick={toggleGate}
      >
        {gateFlash ? 'GATE OPENED' : 'OPEN GATE'}
      </button>
    </div>

    <!-- Field map -->
    <div
      class="field-container"
      onclick={handleFieldTap}
      ontouchstart={(e) => { e.preventDefault(); handleFieldTap(e); }}
      role="button"
      tabindex="0"
    >
      <div class="field">
        <img src="/field.png" alt="DECODE field" class="field-img" draggable="false" />

        {#each scoringEvents as evt}
          <div
            class="event-dot"
            class:auto-dot={evt.phase === 'auto'}
            class:teleop-dot={evt.phase === 'teleop'}
            style="left: {evt.x}%; top: {evt.y}%"
          >
            {evt.scored}/{evt.attempted}
          </div>
        {/each}

        {#if tapX !== null && tapY !== null}
          <div class="tap-marker" style="left: {tapX}%; top: {tapY}%"></div>
        {/if}
      </div>
      <div class="field-hint">Tap where robot is scoring from</div>
    </div>

    <!-- Attempted / Scored -->
    {#if tapX !== null}
      <div class="action-panel">
        <div class="action-row">
          <span class="action-label">Attempted</span>
          <div class="action-buttons">
            <button class:selected={attempted === 1} onclick={() => selectAttempted(1)}>1</button>
            <button class:selected={attempted === 2} onclick={() => selectAttempted(2)}>2</button>
            <button class:selected={attempted === 3} onclick={() => selectAttempted(3)}>3</button>
          </div>
        </div>

        {#if attempted !== null}
          <div class="action-row">
            <span class="action-label">Scored</span>
            <div class="action-buttons">
              {#each Array.from({length: attempted + 1}, (_, i) => i) as n}
                <button onclick={() => selectScored(n)}>{n}</button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <div class="event-log">
      <div class="log-header">
        <span>Events ({scoringEvents.length})</span>
        {#if scoringEvents.length > 0}
          <button class="small" onclick={undoLast}>Undo</button>
        {/if}
      </div>
      <div class="log-summary">
        <span>Classified: {autoClassified + teleopClassified}</span>
        <span>Overflow: {autoOverflow + teleopOverflow}</span>
      </div>
    </div>

    {#if phase === 'endgame'}
      <div class="endgame-section">
        <h3>Endgame - BASE</h3>
        <div class="park-buttons">
          <button class="park-btn" class:active={endgameBase === 'none'} onclick={() => setEndgameBase('none')}>NO PARK</button>
          <button class="park-btn" class:active={endgameBase === 'partial'} onclick={() => setEndgameBase('partial')}>PARTIAL</button>
          <button class="park-btn" class:active={endgameBase === 'full'} onclick={() => setEndgameBase('full')}>FULL</button>
        </div>

        {#if endgameBase === 'partial' || endgameBase === 'full'}
          <div class="park-buttons">
            <button class="park-btn method" class:active={parkMethod === 'normal'} onclick={() => parkMethod = parkMethod === 'normal' ? 'none' : 'normal'}>NORMAL PARK</button>
            <button class="park-btn method" class:active={parkMethod === 'tilt'} onclick={() => parkMethod = parkMethod === 'tilt' ? 'none' : 'tilt'}>TILT</button>
            <button class="park-btn method" class:active={parkMethod === 'lift'} onclick={() => parkMethod = parkMethod === 'lift' ? 'none' : 'lift'}>LIFT</button>
          </div>
        {/if}
      </div>
    {/if}

  {/if}

  {#if phase === 'review'}
    <div class="timer-bar">
      <span class="timer-phase">REVIEW</span>
      <span>{scoringEvents.length} events</span>
    </div>

    <div class="field-container" style="pointer-events: none;">
      <div class="field">
        <img src="/field.png" alt="DECODE field" class="field-img" draggable="false" />
        {#each scoringEvents as evt}
          <div
            class="event-dot"
            class:auto-dot={evt.phase === 'auto'}
            class:teleop-dot={evt.phase === 'teleop'}
            style="left: {evt.x}%; top: {evt.y}%"
          >
            {evt.scored}/{evt.attempted}
          </div>
        {/each}
      </div>
    </div>

    <div class="review-stats card">
      <div class="stat-row"><span>Auto Leave</span><span>{autoLeave ? 'Yes' : 'No'}</span></div>
      <div class="stat-row"><span>Auto Classified</span><span>{autoClassified}</span></div>
      <div class="stat-row"><span>Auto Overflow</span><span>{autoOverflow}</span></div>
      <div class="stat-row"><span>Teleop Classified</span><span>{teleopClassified}</span></div>
      <div class="stat-row"><span>Teleop Overflow</span><span>{teleopOverflow}</span></div>
      <div class="stat-row"><span>Opened Gate</span><span>{openedGate ? 'Yes' : 'No'}</span></div>
      <div class="stat-row"><span>BASE</span><span>{endgameBase}{parkMethod !== 'none' ? ` (${parkMethod})` : ''}{parkFailed ? ' - FAILED' : ''}</span></div>
      {#if disconnected}
        <div class="stat-row" style="color: var(--red);"><span>Disconnected</span><span>Yes</span></div>
      {/if}
    </div>

    <section>
      <h3>Ratings (1-5)</h3>
      <div class="counters">
        <div class="counter-row">
          <span>Driver Skill</span>
          <div class="counter">
            <button onclick={() => { if (driverSkill > 1) driverSkill--; }}>-</button>
            <span class="count">{driverSkill}</span>
            <button onclick={() => { if (driverSkill < 5) driverSkill++; }}>+</button>
          </div>
        </div>
        <div class="counter-row">
          <span>Reliability</span>
          <div class="counter">
            <button onclick={() => { if (reliability > 1) reliability--; }}>-</button>
            <span class="count">{reliability}</span>
            <button onclick={() => { if (reliability < 5) reliability++; }}>+</button>
          </div>
        </div>
        <div class="counter-row">
          <span>Defense</span>
          <div class="counter">
            <button onclick={() => { if (defenseRating > 1) defenseRating--; }}>-</button>
            <span class="count">{defenseRating}</span>
            <button onclick={() => { if (defenseRating < 5) defenseRating++; }}>+</button>
          </div>
        </div>
      </div>

      <label>
        Notes
        <textarea bind:value={notes} placeholder="Anything notable..."></textarea>
      </label>

      <button class="primary submit-btn" onclick={submit} disabled={submitting}>
        {submitting ? 'Saving...' : 'Submit Match Scout'}
      </button>
    </section>
  {/if}
</div>

{#if phase === 'auto' || phase === 'transition' || phase === 'teleop' || phase === 'endgame'}
  <div class="fixed-bottom-bar">
    <button
      class="fixed-btn disconnected-btn"
      class:active={disconnected}
      onclick={() => disconnected = !disconnected}
    >
      DISCONNECTED
    </button>
    {#if endgameBase !== 'none'}
      <button
        class="fixed-btn park-failed-btn"
        class:active={parkFailed}
        onclick={() => parkFailed = !parkFailed}
      >
        PARK FAILED
      </button>
    {/if}
  </div>
{/if}

<style>
  .match-scout {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .setup {
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

  .start-btn {
    margin-top: 8px;
    padding: 16px;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .assignment-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .assignment-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: var(--bg-light);
    border: 2px solid var(--bg-lighter);
    border-radius: 8px;
    text-align: left;
    width: 100%;
    cursor: pointer;
    font-family: 'Instrument Sans', sans-serif;
    color: var(--text);
    font-size: 0.9rem;
    transition: border-color 0.15s;
  }

  .assignment-btn.next {
    border-color: var(--accent);
  }

  .assignment-btn.selected {
    background: rgba(107, 163, 255, 0.15);
    border-color: var(--accent);
  }

  .asgn-q {
    font-weight: 700;
    font-size: 1.1rem;
    min-width: 40px;
  }

  .asgn-team {
    font-weight: 600;
    color: var(--accent);
  }

  .asgn-name {
    flex: 1;
    color: var(--text-dim);
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .asgn-badge {
    font-size: 0.6rem;
    font-weight: 700;
    background: var(--accent);
    color: #1a1a1a;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.5px;
  }

  .link-btn {
    background: none;
    border: none;
    color: var(--text-dim);
    font-size: 0.8rem;
    text-decoration: underline;
    cursor: pointer;
    padding: 4px 0;
    font-family: 'Instrument Sans', sans-serif;
    text-align: left;
  }

  .link-btn:hover { color: var(--text); background: none; }

  .dim-text { color: var(--text-dim); font-size: 0.8rem; }

  .timer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 8px;
    background: var(--bg-light);
    border-left: 4px solid var(--text-dim);
  }

  .timer-bar.auto { border-left-color: var(--yellow); }
  .timer-bar.transition { border-left-color: #b07aff; }
  .timer-bar.teleop { border-left-color: var(--green); }
  .timer-bar.endgame { border-left-color: var(--red); }

  .transition-banner {
    text-align: center;
    padding: 8px;
    background: rgba(176, 122, 255, 0.15);
    border: 1px solid rgba(176, 122, 255, 0.4);
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #b07aff;
  }

  .timer-phase { font-weight: 600; font-size: 0.9rem; }
  .timer-clock { font-size: 1.4rem; font-weight: 700; font-variant-numeric: tabular-nums; }

  /* Quick action buttons */
  .quick-actions {
    display: flex;
    gap: 8px;
  }

  .quick-btn {
    flex: 1;
    padding: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
    border-radius: 8px;
    background: var(--bg-light);
    border: 2px solid var(--bg-lighter);
    transition: all 0.15s;
  }

  .quick-btn.active {
    background: var(--accent);
    color: #1a1a1a;
    border-color: var(--accent);
  }

  /* Field map */
  .field-container {
    position: relative;
    width: 100%;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .field {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 6px;
    overflow: hidden;
  }

  .field-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }

  .field-hint {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-dim);
    margin-top: 4px;
  }

  .tap-marker {
    position: absolute;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid var(--accent);
    background: rgba(107, 163, 255, 0.3);
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.2); }
  }

  .event-dot {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 0.6rem;
    font-weight: 700;
    padding: 2px 4px;
    border-radius: 4px;
    pointer-events: none;
    line-height: 1;
  }

  .auto-dot { background: rgba(255, 217, 107, 0.8); color: #1a1a1a; }
  .teleop-dot { background: rgba(107, 255, 138, 0.8); color: #1a1a1a; }

  /* Action panel */
  .action-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: var(--bg-light);
    border-radius: 8px;
  }

  .action-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .action-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-dim);
    min-width: 70px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex: 1;
  }

  .action-buttons button {
    flex: 1;
    padding: 12px 8px;
    font-size: 1.1rem;
    font-weight: 700;
    text-align: center;
    border-radius: 8px;
  }

  .action-buttons button.selected {
    background: var(--accent);
    color: #1a1a1a;
  }

  /* Event log */
  .event-log { display: flex; flex-direction: column; gap: 4px; }

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: var(--text-dim);
  }

  .log-summary { display: flex; gap: 16px; font-size: 0.85rem; font-weight: 600; }

  button.small { padding: 4px 10px; font-size: 0.75rem; }

  /* Review */
  .review-stats { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; }
  .stat-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid var(--bg-lighter); }
  .stat-row span:last-child { font-weight: 600; }

  .submit-btn { padding: 14px; font-size: 1rem; margin-top: 4px; }

  /* Shared */
  section { display: flex; flex-direction: column; gap: 8px; }

  h3 {
    font-size: 1rem;
    color: var(--text-dim);
    border-bottom: 1px solid var(--bg-lighter);
    padding-bottom: 4px;
  }

  .counters { display: flex; flex-direction: column; gap: 8px; }

  .counter-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0; font-size: 0.9rem;
  }

  .counter { display: flex; align-items: center; gap: 12px; }

  .counter button {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; font-weight: 700; padding: 0;
  }

  .count {
    font-size: 1.1rem; font-weight: 600; min-width: 24px;
    text-align: center; font-variant-numeric: tabular-nums;
  }


  :global(.fixed-bottom-bar) {
    position: fixed;
    bottom: 56px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 448px;
    display: flex;
    gap: 8px;
    z-index: 10;
  }

  :global(.fixed-btn) {
    flex: 1;
    padding: 12px;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    text-align: center;
  }

  :global(.disconnected-btn) {
    background: var(--bg-light);
    border: 2px solid var(--red);
    color: var(--red);
  }

  :global(.disconnected-btn.active) {
    background: var(--red);
    color: #1a1a1a;
  }

  :global(.park-failed-btn) {
    background: var(--bg-light);
    border: 2px solid var(--yellow);
    color: var(--yellow);
  }

  :global(.park-failed-btn.active) {
    background: var(--yellow);
    color: #1a1a1a;
  }

  .endgame-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .park-buttons {
    display: flex;
    gap: 6px;
  }

  .park-btn {
    flex: 1;
    padding: 10px 4px;
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
    border-radius: 8px;
    background: var(--bg-light);
    border: 2px solid var(--bg-lighter);
  }

  .park-btn.active {
    background: var(--accent);
    color: #1a1a1a;
    border-color: var(--accent);
  }

  .park-btn.method {
    border-color: var(--bg-lighter);
  }

  .park-btn.method.active {
    background: #6bff8a;
    color: #1a1a1a;
    border-color: #6bff8a;
  }
</style>
