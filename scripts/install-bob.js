// Installs IBM Bob CLI on Linux servers (Railway, Render, etc.)
// On non-Linux or if bob is already installed, this is a no-op.
const { execSync, spawnSync } = require('child_process');
const os = require('os');

// Skip if not Linux
if (os.platform() !== 'linux') {
  console.log('[bob-install] Not Linux — skipping Bob CLI install.');
  process.exit(0);
}

// Skip if bob is already available
const check = spawnSync('which', ['bob']);
if (check.status === 0) {
  console.log('[bob-install] Bob CLI already installed.');
  process.exit(0);
}

console.log('[bob-install] Linux detected — installing IBM Bob CLI...');

try {
  // Detect architecture
  const arch = os.arch(); // 'x64' or 'arm64'
  const debArch = arch === 'arm64' ? 'arm64' : 'amd64';

  // Download the .deb package from IBM Bob's download page
  const url = `https://bob.ibm.com/download/linux/deb/${debArch}/bob-latest.deb`;
  console.log(`[bob-install] Downloading from ${url}`);

  execSync(`curl -fsSL "${url}" -o /tmp/bob.deb`, { stdio: 'inherit' });
  execSync('dpkg -i /tmp/bob.deb || apt-get install -f -y', { stdio: 'inherit' });
  execSync('rm /tmp/bob.deb', { stdio: 'inherit' });

  console.log('[bob-install] IBM Bob CLI installed successfully.');
} catch (err) {
  // Non-fatal — app still runs, Bob API calls will fail gracefully
  console.warn('[bob-install] Could not install Bob CLI:', err.message);
  console.warn('[bob-install] Search/analysis features will be unavailable.');
}
