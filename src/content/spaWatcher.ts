export const SPAWatcher = {
  watch(onNavigate: () => void): void {
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => onNavigate(), 1200);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
};
