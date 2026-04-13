<script>
  import { goto } from '$app/navigation';
  let name = $state("");

  function enterScout() {
    if (!name.trim()) return;
    if (name.trim().toLowerCase() === 'mngr') {
      goto('/manager');
    } else {
      goto(`/scout?name=${encodeURIComponent(name)}`);
    }
  }
</script>

<div class="landing">
  <img src="/logo.svg" alt="HiveScout" class="logo" />

  <div class="entry">
    <form onsubmit={(e) => { e.preventDefault(); enterScout(); }}>
      <input bind:value={name} placeholder="Your name" />
      <div class="buttons">
        <button type="submit" class="primary" disabled={!name.trim()}>Enter</button>
      </div>
    </form>
  </div>
</div>

<style>
  .landing {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 16px;
    padding: 24px;
  }

  .logo {
    width: 320px;
    height: auto;
  }

  p {
    color: var(--text-dim);
    margin-bottom: 24px;
  }

  .entry {
    width: 100%;
    max-width: 300px;
  }

  .entry form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .buttons {
    display: flex;
    gap: 12px;
  }

  .buttons a {
    flex: 1;
  }

  .buttons button {
    width: 100%;
  }
</style>
