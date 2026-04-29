<script lang="ts">
  import { onMount } from 'svelte';

  let configured = $state(false);
  let loading = $state(false);
  let error = $state('');

  let events = $state<any[]>([]);
  let selectedEvent = $state('');
  let eventData = $state<any>(null);
  let eventLoading = $state(false);

  let autoRefresh = $state(false);
  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  let lastUpdated = $state('');

  onMount(async () => {
    try {
      const res = await fetch('/api/nexus?action=status');
      const data = await res.json();
      configured = data.configured;
    } catch {
      configured = false;
    }
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  });

  async function loadEvents() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/nexus?action=events');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // API returns {eventKey: {name, start, end}, ...}
      if (Array.isArray(data)) {
        events = data;
      } else {
        events = Object.entries(data).map(([code, info]: [string, any]) => ({
          eventCode: code,
          name: info.name,
          start: info.start,
          end: info.end,
        })).sort((a, b) => (a.start || 0) - (b.start || 0));
      }
    } catch (err: any) {
      error = err.message;
    }
    loading = false;
  }

  async function loadEvent() {
    if (!selectedEvent) return;
    eventLoading = true;
    error = '';
    try {
      const res = await fetch(`/api/nexus?action=event&event=${encodeURIComponent(selectedEvent)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      eventData = data;
      if (data.dataAsOfTime) {
        lastUpdated = new Date(data.dataAsOfTime).toLocaleTimeString();
      }
    } catch (err: any) {
      error = err.message;
      eventData = null;
    }
    eventLoading = false;
  }

  function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
    if (autoRefresh) {
      refreshInterval = setInterval(loadEvent, 30000);
    } else {
      if (refreshInterval) clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  function matchStatusClass(status: string) {
    if (status === 'Complete') return 'completed';
    if (status === 'On field' || status === 'On deck') return 'active';
    if (status === 'Now queuing') return 'queuing';
    return 'upcoming';
  }

  function formatTime(ms: number | null) {
    if (!ms) return '--';
    return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="nexus-page">
  <h2>Nexus Live</h2>
  <p class="subtitle">Live event data from <a href="https://ftc.nexus" target="_blank" rel="noopener">ftc.nexus</a></p>

  {#if !configured}
    <div class="card setup-card">
      <h3>Setup Required</h3>
      <p>Add your Nexus API key to the <code>.env</code> file:</p>
      <pre>NEXUS_API_KEY=your_api_key_here</pre>
      <p class="dim">Get your free API key at <a href="https://ftc.nexus/api" target="_blank" rel="noopener">ftc.nexus/api</a></p>
    </div>
  {:else}
    <div class="controls">
      {#if events.length === 0}
        <button class="primary" onclick={loadEvents} disabled={loading}>
          {loading ? 'Loading...' : 'Load Events'}
        </button>
      {:else}
        <select bind:value={selectedEvent} onchange={loadEvent}>
          <option value="">Select event...</option>
          {#each events as evt}
            <option value={evt.eventCode}>
              {evt.eventCode} — {evt.name}
              {#if evt.start}({new Date(evt.start).toLocaleDateString()}){/if}
            </option>
          {/each}
        </select>
        <button onclick={loadEvent} disabled={eventLoading || !selectedEvent}>
          {eventLoading ? 'Loading...' : 'Refresh'}
        </button>
        <button class:active={autoRefresh} onclick={toggleAutoRefresh}>
          {autoRefresh ? 'Auto ON (30s)' : 'Auto OFF'}
        </button>
        <button onclick={() => { events = []; selectedEvent = ''; eventData = null; }}>
          Reset
        </button>
      {/if}
    </div>

    {#if error}
      <div class="error-banner">{error}</div>
    {/if}

    {#if eventData}
      <div class="event-header card">
        <h3>{selectedEvent}</h3>
        {#if lastUpdated}
          <span class="dim">Data as of {lastUpdated}</span>
        {/if}
        {#if autoRefresh}
          <span class="refresh-dot"></span>
        {/if}
      </div>

      <!-- Matches -->
      {#if eventData.matches?.length > 0}
        {@const matches = eventData.matches}
        {@const activeMatch = matches.find((m: any) => m.status === 'On field' || m.status === 'On deck')}
        {@const completedCount = matches.filter((m: any) => m.status === 'Complete').length}

        <div class="section">
          <div class="section-head">
            <h3>Matches ({completedCount}/{matches.length} complete)</h3>
          </div>

          {#if activeMatch}
            <div class="card active-card">
              <div class="active-header">
                <span class="live-badge">{activeMatch.status.toUpperCase()}</span>
                <span class="active-label">{activeMatch.label}</span>
              </div>
              <div class="active-alliances">
                <div class="active-alliance red-border">
                  <span class="alliance-label red-text">RED</span>
                  {#each activeMatch.redTeams || [] as team}
                    <span class="active-team">#{team}</span>
                  {/each}
                </div>
                <span class="active-vs">vs</span>
                <div class="active-alliance blue-border">
                  <span class="alliance-label blue-text">BLUE</span>
                  {#each activeMatch.blueTeams || [] as team}
                    <span class="active-team">#{team}</span>
                  {/each}
                </div>
              </div>
              {#if activeMatch.times?.estimatedStartTime}
                <span class="dim">Est. start: {formatTime(activeMatch.times.estimatedStartTime)}</span>
              {/if}
            </div>
          {/if}

          <div class="match-list">
            {#each matches as match}
              {@const cls = matchStatusClass(match.status)}
              <div class="match-row" class:completed={cls === 'completed'} class:active-match={cls === 'active'} class:queuing={cls === 'queuing'}>
                <div class="match-info">
                  <span class="match-label">{match.label || '?'}</span>
                  {#if cls === 'active'}
                    <span class="live-badge-sm">{match.status}</span>
                  {:else if cls === 'queuing'}
                    <span class="queue-badge">QUEUING</span>
                  {/if}
                </div>
                <div class="match-teams">
                  <span class="red-text">{(match.redTeams || []).join(', ')}</span>
                  <span class="vs-sm">vs</span>
                  <span class="blue-text">{(match.blueTeams || []).join(', ')}</span>
                </div>
                {#if match.times?.estimatedStartTime && cls === 'upcoming'}
                  <span class="match-time">{formatTime(match.times.estimatedStartTime)}</span>
                {/if}
                {#if match.status === 'Complete'}
                  <span class="match-status-done">Done</span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="card">
          <p class="dim">No matches yet for this event.</p>
          {#if eventData.eventKey}
            <p class="dim">Event key: {eventData.eventKey}</p>
          {/if}
          <details>
            <summary class="dim">Raw response</summary>
            <pre class="raw-json">{JSON.stringify(eventData, null, 2)}</pre>
          </details>
        </div>
      {/if}

      <!-- Announcements -->
      {#if eventData.announcements?.length > 0}
        <div class="section">
          <h3>Announcements ({eventData.announcements.length})</h3>
          <div class="list-col">
            {#each eventData.announcements as ann}
              <div class="card announcement">
                {ann.announcement || ann.text || JSON.stringify(ann)}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Parts Requests -->
      {#if eventData.partsRequests?.length > 0}
        <div class="section">
          <h3>Parts Requests ({eventData.partsRequests.length})</h3>
          <div class="list-col">
            {#each eventData.partsRequests as req}
              <div class="card parts-req">
                <span class="parts-team">#{req.requestedByTeam || req.team}</span>
                <span class="parts-desc">{req.parts || req.description || JSON.stringify(req)}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .nexus-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .subtitle {
    color: var(--text-dim);
    font-size: 0.85rem;
    margin-top: -8px;
  }

  .subtitle a { color: var(--accent); }

  .setup-card { border-left: 4px solid var(--yellow); }

  .setup-card code, .setup-card pre {
    background: var(--bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .setup-card pre {
    padding: 10px 14px;
    margin: 8px 0;
    overflow-x: auto;
  }

  .controls {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .controls select { flex: 1; max-width: 450px; }

  .controls button.active {
    background: var(--green);
    color: #1a1a1a;
  }

  .error-banner {
    padding: 10px 14px;
    background: rgba(255, 107, 107, 0.15);
    border: 1px solid var(--red);
    border-radius: 6px;
    color: var(--red);
    font-size: 0.85rem;
  }

  .event-header {
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 4px solid var(--accent);
  }

  .event-header h3 { margin: 0; flex: 1; }

  .refresh-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse-live 1.5s infinite;
  }

  .section { display: flex; flex-direction: column; gap: 8px; }
  .section-head { display: flex; justify-content: space-between; align-items: center; }
  .section h3 { font-size: 1rem; color: var(--text-dim); }

  /* Active match highlight */
  .active-card {
    border-left: 4px solid var(--green);
    background: rgba(107, 255, 138, 0.05);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .active-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .active-label {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .active-alliances {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .active-alliance {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg);
    border-radius: 6px;
  }

  .red-border { border-left: 3px solid var(--red); }
  .blue-border { border-left: 3px solid var(--blue); }

  .alliance-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .active-team {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .active-vs {
    font-weight: 600;
    color: var(--text-dim);
  }

  .live-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 3px;
    background: var(--green);
    color: #1a1a1a;
    animation: pulse-live 1.5s infinite;
  }

  @keyframes pulse-live {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* Match list */
  .match-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 500px;
    overflow-y: auto;
  }

  .match-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-light);
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .match-row.completed { opacity: 0.6; }

  .match-row.active-match {
    border-left: 4px solid var(--green);
    background: rgba(107, 255, 138, 0.08);
    opacity: 1;
  }

  .match-row.queuing {
    border-left: 4px solid var(--yellow);
    background: rgba(255, 217, 107, 0.08);
  }

  .match-info {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 130px;
  }

  .match-label { font-weight: 600; }

  .live-badge-sm {
    font-size: 0.55rem;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 3px;
    background: var(--green);
    color: #1a1a1a;
  }

  .queue-badge {
    font-size: 0.55rem;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 3px;
    background: var(--yellow);
    color: #1a1a1a;
  }

  .match-teams {
    flex: 1;
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .vs-sm { color: var(--text-dim); font-size: 0.75rem; }
  .red-text { color: var(--red); }
  .blue-text { color: var(--blue); }

  .match-time {
    font-size: 0.75rem;
    color: var(--text-dim);
    font-variant-numeric: tabular-nums;
  }

  .match-status-done {
    font-size: 0.7rem;
    color: var(--text-dim);
    font-weight: 500;
  }

  .dim { color: var(--text-dim); font-size: 0.85rem; }

  .list-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .announcement {
    border-left: 4px solid var(--yellow);
    padding: 10px 14px;
    font-size: 0.85rem;
  }

  .parts-req {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    border-left: 4px solid var(--blue);
    font-size: 0.85rem;
  }

  .parts-team {
    font-weight: 700;
    color: var(--accent);
    white-space: nowrap;
  }

  .raw-json {
    background: var(--bg);
    padding: 12px;
    border-radius: 6px;
    font-size: 0.75rem;
    max-height: 400px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }

  details summary { cursor: pointer; }
</style>
