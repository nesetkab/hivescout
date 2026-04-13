<script>
  let name = $state("");
</script>

<div class="landing">
  <img src="/logo.svg" alt="HiveScout" class="logo" />

  <div class="entry">
    <input bind:value={name} placeholder="Your name" />
    <div class="buttons">
      <a href="/scout?name={encodeURIComponent(name)}">
        <button class="primary" disabled={!name.trim()}>Scout</button>
      </a>
      <a href="/manager">
        <button>Manage</button>
      </a>
    </div>
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
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 300px;
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
