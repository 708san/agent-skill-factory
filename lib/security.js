const patterns = [
  /github_pat_[A-Za-z0-9_]+/g,
  /ghp_[A-Za-z0-9]+/g,
  /sk-[A-Za-z0-9_-]{20,}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g
];

export function scanSecrets(text) {
  const hits = [];
  for (const p of patterns) {
    const matches = text.match(p);
    if (matches) hits.push(...matches.map((m) => `${p.source}: ${m.slice(0, 12)}…`));
  }
  return { ok: hits.length === 0, hits };
}
