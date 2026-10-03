export function mountShadowRoot(hostId = 'dsa-thinking-coach-host'): ShadowRoot {
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement('div');
    host.id = hostId;
    host.style.position = 'fixed';
    host.style.bottom = '20px';
    host.style.right = '20px';
    host.style.zIndex = '2147483647';
    host.style.display = 'block';
    host.style.margin = '0';
    host.style.padding = '0';
    host.style.border = 'none';
    host.style.pointerEvents = 'auto';
    host.style.lineHeight = 'normal';
    host.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const parent = document.body || document.documentElement;
    parent.appendChild(host);
  }

  if (host.shadowRoot) {
    return host.shadowRoot;
  }

  return host.attachShadow({ mode: 'open' });
}
