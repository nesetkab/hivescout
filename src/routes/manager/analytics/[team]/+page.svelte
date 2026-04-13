<script lang="ts">
  let { data } = $props();

  import { tick } from 'svelte';

  let heatmapMode = $state<'dots' | 'heatmap'>('dots');
  let heatCanvas = $state<HTMLCanvasElement | null>(null);

  function drawHeatmap(canvas: HTMLCanvasElement) {
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    if (data.allEvents.length === 0) return;

    // Draw radial gradients for each point
    const radius = size * 0.08;
    for (const evt of data.allEvents) {
      const x = (evt.x / 100) * size;
      const y = (evt.y / 100) * size;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, 'rgba(255, 80, 80, 0.35)');
      grad.addColorStop(1, 'rgba(255, 80, 80, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    // Read back pixels and colorize based on intensity
    const imageData = ctx.getImageData(0, 0, size, size);
    const px = imageData.data;
    for (let i = 0; i < px.length; i += 4) {
      const intensity = px[i + 3] / 255; // alpha channel is our density
      if (intensity > 0.01) {
        // Map intensity to color gradient: blue -> cyan -> green -> yellow -> red
        let r: number, g: number, b: number;
        if (intensity < 0.25) {
          const t = intensity / 0.25;
          r = 0; g = Math.round(t * 180); b = Math.round(200 + t * 55);
        } else if (intensity < 0.5) {
          const t = (intensity - 0.25) / 0.25;
          r = 0; g = Math.round(180 + t * 75); b = Math.round(255 * (1 - t));
        } else if (intensity < 0.75) {
          const t = (intensity - 0.5) / 0.25;
          r = Math.round(t * 255); g = 255; b = 0;
        } else {
          const t = (intensity - 0.75) / 0.25;
          r = 255; g = Math.round(255 * (1 - t)); b = 0;
        }
        px[i] = r;
        px[i + 1] = g;
        px[i + 2] = b;
        px[i + 3] = Math.round(Math.min(1, intensity * 1.5) * 200);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  $effect(() => {
    if (heatmapMode === 'heatmap' && heatCanvas) {
      tick().then(() => {
        if (heatCanvas) drawHeatmap(heatCanvas);
      });
    }
  });
</script>

<div class="team-detail">
  <div class="header">
    <a href="/manager/analytics" class="back">Analytics</a>
    <span class="sep">/</span>
    <h2>#{data.team.number} {data.team.name}</h2>
    <span class="match-badge">{data.matchCount} matches</span>
  </div>

  <div class="summary-card card">
    <p>{data.summary}</p>
  </div>

  {#if data.matchCount === 0}
    <p class="empty">No match scout data yet for this team.</p>
  {:else}
    <div class="grid">
      <!-- Left column: heatmap -->
      <div class="left-col">
        <div class="card heatmap-card">
          <div class="card-head">
            <h3>Scoring Heatmap</h3>
            <div class="mode-toggle">
              <button class:active={heatmapMode === 'dots'} onclick={() => heatmapMode = 'dots'}>Dots</button>
              <button class:active={heatmapMode === 'heatmap'} onclick={() => heatmapMode = 'heatmap'}>Heat</button>
            </div>
          </div>
          <div class="heatmap-container">
            <img src="/field.png" alt="DECODE field" class="field-bg" draggable="false" />
            {#if heatmapMode === 'dots'}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="field-overlay">
                {#each data.allEvents as evt}
                  {#if evt.scored > 0}
                    <circle
                      cx={evt.x} cy={evt.y} r="1.5"
                      fill={evt.phase === 'auto' ? '#ffd96b' : '#6ba3ff'}
                      opacity="0.7"
                    />
                  {:else}
                    <circle
                      cx={evt.x} cy={evt.y} r="1.5"
                      fill="none"
                      stroke={evt.phase === 'auto' ? '#ffd96b' : '#6ba3ff'}
                      stroke-width="0.5"
                      opacity="0.6"
                    />
                  {/if}
                {/each}
              </svg>
            {:else}
              <canvas class="field-overlay heat-canvas"
                bind:this={heatCanvas}
              ></canvas>
            {/if}
          </div>
          <div class="legend">
            {#if heatmapMode === 'dots'}
              <span class="legend-item"><span class="dot auto-color"></span> Auto</span>
              <span class="legend-item"><span class="dot teleop-color"></span> Teleop</span>
              <span class="legend-item">Filled = scored, Hollow = missed</span>
            {:else}
              <span class="legend-item">Brighter = more scoring attempts</span>
            {/if}
            <span class="legend-item">{data.allEvents.length} total events</span>
          </div>
        </div>

        <!-- Per-match bar chart -->
        <div class="card">
          <h3>Scoring by Match</h3>
          <div class="match-bars">
            {#each data.perMatch as m}
              <div class="bar-col">
                <div class="bar-stack" style="--max: {Math.max(...data.perMatch.map((p: any) => p.attempted), 1)}">
                  <div class="bar attempted" style="height: {(m.attempted / Math.max(...data.perMatch.map((p: any) => p.attempted), 1)) * 100}%"></div>
                  <div class="bar scored" style="height: {(m.scored / Math.max(...data.perMatch.map((p: any) => p.attempted), 1)) * 100}%"></div>
                </div>
                <span class="bar-label">Q{m.match_number}</span>
              </div>
            {/each}
          </div>
          <div class="legend">
            <span class="legend-item"><span class="dot" style="background: var(--bg-lighter);"></span> Attempted</span>
            <span class="legend-item"><span class="dot" style="background: var(--accent);"></span> Scored</span>
          </div>
        </div>
      </div>

      <!-- Right column: stat cards -->
      <div class="right-col">
        <!-- Scoring -->
        <div class="card">
          <h3>Scoring</h3>
          <div class="big-stats">
            <div class="big-stat">
              <span class="big-num">{data.scoring.avgAttempted}</span>
              <span class="big-label">Avg Attempted</span>
            </div>
            <div class="big-stat">
              <span class="big-num">{data.scoring.avgScored}</span>
              <span class="big-label">Avg Scored</span>
            </div>
            <div class="big-stat">
              <span class="big-num accent">{data.scoring.scoringRate}%</span>
              <span class="big-label">Accuracy</span>
            </div>
          </div>
          <div class="detail-row">
            <span>Consistency</span>
            <span>+/- {data.scoring.stdDevScored} per match</span>
          </div>
        </div>

        <!-- Auto -->
        <div class="card">
          <h3>Autonomous</h3>
          <div class="stat-bar-row">
            <span>Leave Rate</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {data.auto.leaveRate}%"></div>
            </div>
            <span class="stat-val">{data.auto.leaveRate}%</span>
          </div>
          <div class="detail-row">
            <span>Avg Classified</span>
            <span>{data.auto.avgClassified}</span>
          </div>
          <div class="detail-row">
            <span>Avg Overflow</span>
            <span>{data.auto.avgOverflow}</span>
          </div>
        </div>

        <!-- Park -->
        <div class="card">
          <h3>Park Analysis</h3>
          {#if data.park.attemptsCount > 0}
            <div class="big-stats">
              <div class="big-stat">
                <span class="big-num">{data.park.primaryMethod.toUpperCase()}</span>
                <span class="big-label">Primary Method</span>
              </div>
              <div class="big-stat">
                <span class="big-num" class:green={data.park.successRate >= 80} class:yellow-text={data.park.successRate >= 50 && data.park.successRate < 80} class:red-text={data.park.successRate < 50}>{data.park.successRate}%</span>
                <span class="big-label">Success Rate</span>
              </div>
              <div class="big-stat">
                <span class="big-num">{data.park.confidence}%</span>
                <span class="big-label">Confidence</span>
              </div>
            </div>
            <div class="park-breakdown">
              <div class="detail-row">
                <span>Full park</span>
                <span>{data.park.fullCount}</span>
              </div>
              <div class="detail-row">
                <span>Partial park</span>
                <span>{data.park.partialCount}</span>
              </div>
              <div class="detail-row">
                <span>No park</span>
                <span>{data.park.noCount}</span>
              </div>
              {#each Object.entries(data.park.methods) as [method, stats]}
                <div class="detail-row">
                  <span>{method}</span>
                  <span>{stats.total - stats.failed}/{stats.total} success</span>
                </div>
              {/each}
            </div>
          {:else}
            <p class="dim">Does not park</p>
          {/if}
        </div>

        <!-- Gate & Qualitative -->
        <div class="card">
          <h3>Other</h3>
          <div class="detail-row">
            <span>Gate Opens</span>
            <span>{data.avgGateOpens}/match{data.gateInterval ? ` (every ~${data.gateInterval}s)` : ''}</span>
          </div>
          <div class="detail-row">
            <span>Driver Skill</span>
            <span>{data.qualitative.avgDriverSkill} / 5</span>
          </div>
          <div class="detail-row">
            <span>Reliability</span>
            <span>{data.qualitative.avgReliability} / 5</span>
          </div>
          <div class="detail-row">
            <span>Defense</span>
            <span>{data.qualitative.avgDefense} / 5</span>
          </div>
          {#if data.qualitative.disconnectCount > 0}
            <div class="detail-row" style="color: var(--red);">
              <span>Disconnects</span>
              <span>{data.qualitative.disconnectCount} / {data.matchCount}</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .team-detail {
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
    flex: 1;
  }

  .match-badge {
    background: var(--bg-lighter);
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-dim);
  }

  .summary-card {
    background: var(--bg-light);
    border-left: 4px solid var(--accent);
  }

  .summary-card p {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .empty {
    color: var(--text-dim);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: start;
  }

  .left-col, .right-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Heatmap */
  .heatmap-card { display: flex; flex-direction: column; gap: 8px; }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-head h3 { margin: 0; }

  .mode-toggle {
    display: flex;
    gap: 4px;
  }

  .mode-toggle button {
    padding: 3px 10px;
    font-size: 0.75rem;
    border-radius: 4px;
  }

  .mode-toggle button.active {
    background: var(--accent);
    color: #1a1a1a;
  }

  .heatmap-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 6px;
    overflow: hidden;
  }

  .field-bg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .field-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .heat-canvas {
    border-radius: 6px;
  }

  .legend {
    display: flex;
    gap: 12px;
    font-size: 0.7rem;
    color: var(--text-dim);
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  .auto-color { background: #ffd96b; }
  .teleop-color { background: #6ba3ff; }

  /* Bar chart */
  .match-bars {
    display: flex;
    gap: 3px;
    align-items: flex-end;
    height: 100px;
    padding-top: 8px;
  }

  .bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 0;
  }

  .bar-stack {
    width: 100%;
    height: 80px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .bar {
    width: 100%;
    border-radius: 2px 2px 0 0;
    position: absolute;
    bottom: 0;
  }

  .bar.attempted {
    background: var(--bg-lighter);
  }

  .bar.scored {
    background: var(--accent);
  }

  .bar-label {
    font-size: 0.55rem;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
  }

  /* Stat cards */
  h3 {
    font-size: 0.95rem;
    color: var(--text-dim);
    margin-bottom: 4px;
  }

  .big-stats {
    display: flex;
    gap: 12px;
    margin: 8px 0;
  }

  .big-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .big-num {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .big-num.accent { color: var(--accent); }
  .big-num.green { color: var(--green); }
  .big-num.yellow-text { color: var(--yellow); }
  .big-num.red-text { color: var(--red); }

  .big-label {
    font-size: 0.7rem;
    color: var(--text-dim);
    text-align: center;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 0.85rem;
    border-bottom: 1px solid var(--bg-lighter);
  }

  .detail-row span:last-child {
    font-weight: 500;
  }

  .stat-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    font-size: 0.85rem;
  }

  .stat-bar-row > span:first-child {
    min-width: 80px;
    color: var(--text-dim);
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: var(--bg-lighter);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 4px;
    transition: width 0.3s;
  }

  .stat-val {
    font-weight: 600;
    min-width: 40px;
    text-align: right;
  }

  .dim { color: var(--text-dim); font-size: 0.85rem; }

  .park-breakdown {
    margin-top: 4px;
  }
</style>
