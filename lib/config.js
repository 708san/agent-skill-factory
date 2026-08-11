export function config() {
  const required = [
    'GITHUB_OWNER', 'FACTORY_REPO', 'PUBLIC_SKILLS_REPO',
    'PRIVATE_SKILLS_REPO', 'GITHUB_TOKEN', 'ACTION_API_KEY'
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  return {
    owner: process.env.GITHUB_OWNER,
    factoryRepo: process.env.FACTORY_REPO,
    publicRepo: process.env.PUBLIC_SKILLS_REPO,
    privateRepo: process.env.PRIVATE_SKILLS_REPO,
    token: process.env.GITHUB_TOKEN,
    actionKey: process.env.ACTION_API_KEY,
    allowDirectMain: process.env.ALLOW_DIRECT_MAIN === 'true',
    baseBranch: process.env.DEFAULT_BASE_BRANCH || 'main'
  };
}

export function repoForVisibility(visibility) {
  const c = config();
  if (visibility === 'public') return c.publicRepo;
  if (visibility === 'private') return c.privateRepo;
  throw new Error('visibility must be public or private');
}
