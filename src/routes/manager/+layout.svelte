<script>
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  let { children } = $props();
  let currentPath = $derived($page.url.pathname);

  // Auto-refresh every 30s
  onMount(() => {
    const iv = setInterval(() => invalidateAll(), 30000);
    return () => clearInterval(iv);
  });

  const tabs = [
    { path: '/manager', label: 'Overview' },
    { path: '/manager/scouters', label: 'Scouters' },
    { path: '/manager/scouts', label: 'Scouts' },
    { path: '/manager/analytics', label: 'Analytics' },
    { path: '/manager/predictions', label: 'Predictions' },
    { path: '/manager/setup', label: 'Setup' },
  ];
</script>

<div class="manager-layout">
  <header>
    <a href="/" class="title"><img src="/logo-long.svg" alt="HiveScout" class="header-logo" /></a>
    <span class="subtitle">Manager</span>
    <nav>
      {#each tabs as tab}
        <a href={tab.path} class:active={currentPath === tab.path || (tab.path !== '/manager' && currentPath.startsWith(tab.path + '/'))}>{tab.label}</a>
      {/each}
    </nav>
  </header>

  <main>
    {@render children()}
  </main>
</div>

<style>
  .manager-layout {
    min-height: 100vh;
  }

  header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 24px;
    border-bottom: 1px solid var(--bg-lighter);
  }

  .title {
    text-decoration: none;
    display: flex;
    align-items: center;
  }

  .header-logo {
    height: 26px;
    width: auto;
  }

  .subtitle {
    color: var(--text-dim);
    font-size: 0.85rem;
    padding-right: 16px;
    border-right: 1px solid var(--bg-lighter);
  }

  nav {
    display: flex;
    gap: 8px;
  }

  nav a {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-dim);
    text-decoration: none;
  }

  nav a.active {
    background: var(--bg-lighter);
    color: var(--text);
  }

  nav a:hover {
    background: var(--bg-light);
    text-decoration: none;
  }

  main {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }
</style>
