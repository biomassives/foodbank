/**
 * Generate a 6-character invite code with space-weather entropy.
 * Extracted from AdminPage for reuse in the onboarding wizard.
 */
export async function buildInviteCode(): Promise<string> {
  let spaceEntropy = 0;
  try {
    const res = await fetch(
      'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
      { signal: AbortSignal.timeout(3000) }
    );
    const data = await res.json();
    const latest = data[data.length - 1];
    const kp = parseFloat(latest[2]) || 0;
    const stations = parseInt(latest[4]) || 0;
    spaceEntropy = Math.floor((kp * 10000 + stations) * 7919);
  } catch {
    spaceEntropy = 0;
  }

  const uiEntropy = Math.floor(performance.now() * 1000) ^ Date.now();
  const mixed = (spaceEntropy ^ uiEntropy ^ Math.floor(Math.random() * 0xFFFFFF))
    .toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '');

  const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = mixed.substring(0, 6);
  while (code.length < 6) {
    const arr = new Uint8Array(1);
    crypto.getRandomValues(arr);
    code += pool[arr[0] % pool.length];
  }
  return code.substring(0, 6);
}
