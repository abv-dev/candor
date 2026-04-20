fetch('https://api.github.com/repos/abv-dev/candor/releases/latest')
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then((release) => {
    const msi = release.assets.find((a) => /\.msi$/i.test(a.name));
    if (!msi) return;
    document.querySelectorAll('[data-download-msi]').forEach((el) => {
      el.href = msi.browser_download_url;
    });
  })
  .catch(() => {});
