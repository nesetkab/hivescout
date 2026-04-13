<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import { matchActive } from '$lib/stores';
  let { children } = $props();
  let scouting = $derived($matchActive);

  let currentPath = $derived($page.url.pathname);
  let scouterName = $derived($page.url.searchParams.get('name') || 'Unknown');

  let now = $state(new Date());
  onMount(() => {
    const iv = setInterval(() => { now = new Date(); }, 1000);
    // Auto-refresh dashboard/prescout every 30s (not during active match scouting)
    const refreshIv = setInterval(() => {
      if (!$matchActive) invalidateAll();
    }, 30000);
    return () => { clearInterval(iv); clearInterval(refreshIv); };
  });
  let clockStr = $derived(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const tabs = [
    { path: '/scout', label: 'Dashboard' },
    { path: '/scout/prescout', label: 'Pre-Scout' },
    { path: '/scout/match', label: 'Match' },
  ];
</script>

<div class="scout-layout">
  <header>
    <img src="/logo-long.svg" alt="HiveScout" class="header-logo" />
    <span class="clock">{clockStr}</span>
    <span class="scouter-name">{scouterName}</span>
  </header>

  <main class:scouting>
    {@render children()}
  </main>

  {#if !scouting}
    <nav>
      {#each tabs as tab}
        <a
          href="{tab.path}?name={encodeURIComponent(scouterName)}"
          class:active={currentPath === tab.path}
        >
          {tab.label}
        </a>
      {/each}
    </nav>
  {/if}
</div>

<style>
  .scout-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: 480px;
    margin: 0 auto;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--bg-lighter);
  }

  .header-logo {
    height: 24px;
    width: auto;
  }

  .clock {
    font-size: 0.9rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .scouter-name {
    color: var(--text-dim);
    font-size: 0.85rem;
  }

  main {
    flex: 1;
    padding: 16px;
    padding-bottom: 80px;
    overflow-y: auto;
  }

  main.scouting {
    padding-bottom: 16px;
  }

  nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    display: flex;
    background: var(--bg-light);
    border-top: 1px solid var(--bg-lighter);
  }

  nav a {
    flex: 1;
    text-align: center;
    padding: 12px 8px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-dim);
    text-decoration: none;
  }

  nav a.active {
    color: var(--accent);
  }
</style>
