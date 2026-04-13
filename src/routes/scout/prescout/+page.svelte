<script>
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  let selectedTeam = $state('');
  let drivetrain = $state('');
  let intakeType = $state('');
  let canScoreGoal = $state(false);
  let canClassify = $state(false);
  let canOpenGate = $state(false);
  let autoCap = $state('');
  let teleopCap = $state('');
  let endgameCap = $state('');
  let strengths = $state('');
  let weaknesses = $state('');
  let notes = $state('');
  let submitting = $state(false);

  async function submit() {
    if (!selectedTeam || !data.scouter) return;
    submitting = true;
    await fetch('/api/prescout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_number: Number(selectedTeam),
        scouter_id: data.scouter.id,
        drivetrain,
        intake_type: intakeType,
        can_score_goal: canScoreGoal ? 1 : 0,
        can_classify: canClassify ? 1 : 0,
        can_open_gate: canOpenGate ? 1 : 0,
        auto_capabilities: autoCap,
        teleop_capabilities: teleopCap,
        endgame_capabilities: endgameCap,
        strengths,
        weaknesses,
        notes
      })
    });
    selectedTeam = '';
    drivetrain = '';
    intakeType = '';
    canScoreGoal = false;
    canClassify = false;
    canOpenGate = false;
    autoCap = '';
    teleopCap = '';
    endgameCap = '';
    strengths = '';
    weaknesses = '';
    notes = '';
    submitting = false;
    invalidateAll();
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
      Drivetrain
      <select bind:value={drivetrain}>
        <option value="">Select...</option>
        <option value="mecanum">Mecanum</option>
        <option value="tank">Tank / Differential</option>
        <option value="swerve">Swerve</option>
        <option value="other">Other</option>
      </select>
    </label>

    <label>
      Intake Type
      <select bind:value={intakeType}>
        <option value="">Select...</option>
        <option value="claw">Claw / Gripper</option>
        <option value="roller">Roller Intake</option>
        <option value="vacuum">Vacuum / Suction</option>
        <option value="scoop">Scoop</option>
        <option value="none">No Intake</option>
        <option value="other">Other</option>
      </select>
    </label>

    <fieldset class="capability-checks">
      <legend>DECODE Capabilities</legend>
      <label class="check-row">
        <input type="checkbox" bind:checked={canScoreGoal} />
        <span>Can score ARTIFACTS in GOAL</span>
      </label>
      <label class="check-row">
        <input type="checkbox" bind:checked={canClassify} />
        <span>Can CLASSIFY (artifacts go to RAMP)</span>
      </label>
      <label class="check-row">
        <input type="checkbox" bind:checked={canOpenGate} />
        <span>Can open GATE</span>
      </label>
    </fieldset>

    <label>
      Auto Capabilities
      <textarea bind:value={autoCap} placeholder="Can they LEAVE? Score in auto? Read the OBELISK MOTIF?"></textarea>
    </label>

    <label>
      Teleop Strategy
      <textarea bind:value={teleopCap} placeholder="Scoring speed? Use LOADING ZONE? Go for PATTERN?"></textarea>
    </label>

    <label>
      Endgame / BASE
      <textarea bind:value={endgameCap} placeholder="Can they return to BASE? Partial or full?"></textarea>
    </label>

    <label>
      Strengths
      <textarea bind:value={strengths} placeholder="What are they good at?"></textarea>
    </label>

    <label>
      Weaknesses
      <textarea bind:value={weaknesses} placeholder="Areas of concern?"></textarea>
    </label>

    <label>
      Additional Notes
      <textarea bind:value={notes} placeholder="Anything else..."></textarea>
    </label>

    <button type="submit" class="primary" disabled={!selectedTeam || submitting}>
      {submitting ? 'Saving...' : 'Submit Pre-Scout'}
    </button>
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
            {#if ps.drivetrain}<span>Drivetrain: {ps.drivetrain}</span>{/if}
            {#if ps.strengths}<span>Strengths: {ps.strengths}</span>{/if}
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

  fieldset {
    border: 1px solid var(--bg-lighter);
    border-radius: 6px;
    padding: 12px;
  }

  legend {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-dim);
    padding: 0 4px;
  }

  .capability-checks {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .check-row {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .check-row input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }

  .check-row span {
    font-size: 0.9rem;
    color: var(--text);
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
</style>
