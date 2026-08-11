# Web-only Setup Guide

This guide assumes you want to use the system from ChatGPT Web only after setup. No Codex, CLI, Desktop app, or local MCP is required for daily use.

## What you are building

```
ChatGPT Web
  ↓  @Agent Skill Factory
Custom GPT
  ↓  GPT Action (Bearer API key)
Vercel Factory API
  ↓  GitHub REST API
GitHub
  ├─ agent-skill-factory      Public
  ├─ agent-skills-public      Public
  └─ agent-skills-private     Private
```

---

# Part A — Download and unzip

Download the provided ZIP and unzip it once.
You will see three top-level folders:

- `agent-skill-factory`
- `agent-skills-public`
- `agent-skills-private`

Each folder becomes a separate GitHub repository.

---

# Part B — Create the 3 GitHub repositories in the browser

Repeat the following three times.

1. Open GitHub.
2. Top-right `+` → `New repository`.
3. Create:
   - `agent-skill-factory` → **Public**
   - `agent-skills-public` → **Public**
   - `agent-skills-private` → **Private**
4. To avoid file conflicts, do not add a README, .gitignore, or license during creation; the supplied folders already contain what they need.
5. Click `Create repository`.
6. On the empty repository screen choose the link to upload existing files, or `Add file` → `Upload files` if available.
7. Drag the *contents* of the matching folder into the browser. Do not upload the outer folder as an extra nesting layer.
8. Commit the upload to `main` for this one-time bootstrap.

Expected repository roots:

`agent-skill-factory` should show `factory/`, `api/`, `gpt/`, `lib/`, `docs/`, etc. at the root.

`agent-skills-public` should show `skills/` at the root.

`agent-skills-private` should show `skills/` at the root.

---

# Part C — Create a fine-grained GitHub PAT in the browser

The Vercel API needs a server-side token that can read/write only these repositories.

1. GitHub profile picture → `Settings`.
2. Left sidebar → `Developer settings`.
3. `Personal access tokens` → `Fine-grained tokens`.
4. `Generate new token`.
5. Name: `agent-skill-factory-web`.
6. Choose your GitHub account as `Resource owner`.
7. Repository access → `Only select repositories`.
8. Select only:
   - `agent-skill-factory`
   - `agent-skills-public`
   - `agent-skills-private`
9. Repository permissions:
   - `Contents`: **Read and write**
   - `Pull requests`: **Read and write**
   - Metadata remains available as required by GitHub.
10. Choose a sensible expiration.
11. Generate and copy the token once.

Do not paste this GitHub token into ChatGPT or into any repository file.

---

# Part D — Create the Vercel project in the browser

1. Sign in to Vercel with GitHub.
2. Dashboard → `New Project`.
3. Import `agent-skill-factory`.
4. Framework Preset: use the detected/default setting; this repository uses plain Vercel Functions under `/api` and has no build step requirement.
5. Before deploying, add Environment Variables:

| Key | Value |
|---|---|
| `GITHUB_OWNER` | your GitHub username/org |
| `FACTORY_REPO` | `agent-skill-factory` |
| `PUBLIC_SKILLS_REPO` | `agent-skills-public` |
| `PRIVATE_SKILLS_REPO` | `agent-skills-private` |
| `GITHUB_TOKEN` | the fine-grained PAT from Part C |
| `ACTION_API_KEY` | a long random secret you create yourself |
| `ALLOW_DIRECT_MAIN` | `false` |
| `DEFAULT_BASE_BRANCH` | `main` |

6. Click `Deploy`.
7. When deployment succeeds, copy the Production URL, e.g. `https://agent-skill-factory-xxxx.vercel.app`.
8. Open `<YOUR_URL>/api/health` in your browser. You should see an `ok: true` JSON response.
9. Open `<YOUR_URL>/api/openapi`. You should see an OpenAPI JSON document. This is the URL you will import into the Custom GPT.

Whenever `main` of `agent-skill-factory` changes, Vercel's Git integration will create a new production deployment automatically.

---

# Part E — Create the Custom GPT in ChatGPT Web

1. Open ChatGPT Web.
2. Sidebar → `Explore GPTs` / `GPTを探す`.
3. Click `Create` / `作成`.
4. Open the configuration view if needed.
5. Set:
   - Name: `Agent Skill Factory`
   - Description: `Designs, creates, audits, refactors, uses and publishes GitHub-backed Agent Skills.`
6. Open `gpt/INSTRUCTIONS.md` from the `agent-skill-factory` GitHub repository and copy its contents into the GPT `Instructions` field.
7. Add the conversation starters from `gpt/conversation-starters.md` if useful.

Keep the GPT instructions small. Architect/Author/Reviewer/Publisher rules stay in GitHub and are fetched dynamically.

---

# Part F — Connect the Action

1. In the GPT editor scroll to `Actions` / `アクション`.
2. Click `Create new action` / `新しいアクションを作成`.
3. Authentication → `API Key`.
4. Auth type → `Bearer`.
5. Secret value → enter the exact same `ACTION_API_KEY` you placed in Vercel.
6. For the schema choose import from URL if shown.
7. Enter:

   `https://YOUR-VERCEL-DOMAIN.vercel.app/api/openapi`

   If your editor does not expose URL import, open that URL in a browser and paste the returned OpenAPI JSON into the schema editor.
8. Confirm the operations are detected, including:
   - `getFactoryModule`
   - `listSkills`
   - `getSkill`
   - `getSkillFile`
   - `createChangeBranch`
   - `writeRegistryFiles`
   - `validateSkill`
   - `compareChangeBranch`
   - `openSkillPullRequest`
9. Use `Preview` to test before saving the GPT.

Important: a GPT can use Apps or Actions, but not both at the same time. This Factory is designed around Actions.

---

# Part G — First read test

In Preview, ask:

`orchestrator moduleを取得して、利用できるmodeを教えて。`

Expected:
- the Action `getFactoryModule` runs;
- the GPT reports the current GitHub orchestrator modes.

Then ask:

`private Skill一覧を取得して。`

Expected initially: empty or no real Skills yet.

---

# Part H — First write test

Ask in Preview:

`private repositoryに skill/test-web-setup という変更branchを作って。mainには直接書かないで。`

Then:

`そのbranchに skills/web-setup-test/SKILL.md を作成して。最小のテストSkillでよい。`

Then:

`validateしてmainとの差分を見せて。問題なければPRを作って。`

Open GitHub in another browser tab and confirm the PR exists.

After successful testing, merge or close the test PR, then delete the test branch if desired.

---

# Daily use — Create a new Skill

From a normal ChatGPT Web conversation, type `@` and select `Agent Skill Factory`.

Example:

```
@Agent Skill Factory
AIっぽい文章を検出・改善するSkillを作りたい。
mode: create
visibility: private
まずSkill化すべきか、1 Skillか複数Skillかを判断してから実装して。
```

Expected flow:

orchestrator → architect → Skill System Spec → author → reviewer → branch → write → validate → diff → PR

---

# Daily use — Refactor an existing Skill

```
@Agent Skill Factory
web-ad-imageをrefactorして。
今回、同サイズの3カード構成をまた生成した。
既存のknown-goodを壊さず、この失敗を再発防止して。
```

Expected flow:

get existing Skill → reviewer → root cause → author → reviewer/regression → PR

---

# Daily use — Use an existing Skill

```
@Agent Skill Factory
privateのhuman-writing-reviewを使って、この文章をレビューして。
```

The Factory retrieves the current GitHub `SKILL.md` instead of relying on a stale ChatGPT-local copy.

---

# Daily use — Publish a private Skill

```
@Agent Skill Factory
human-writing-reviewを公開版にしたい。
mode: publish
```

Expected flow:

private Skill → publisher → confidential/private dependency scan → generalization → public review → branch in `agent-skills-public` → PR

---

# Daily use — Improve the Factory itself

```
@Agent Skill Factory
Factoryのarchitectをrefactorしたい。
ProducerとReviewerを分ける基準を改善して。
Factory自身なので必ずbranch→diff→PRで変更して。
```

The `target: factory` Action path writes to `agent-skill-factory` rather than a Skill repository.

---

# What stays manual

- First GitHub repository creation.
- First PAT creation.
- First Vercel deployment/configuration.
- First Custom GPT creation and Action authentication.
- Reviewing/merging a PR if you choose to keep human approval.

Everything after that can be initiated from ChatGPT Web.

---

# Important current limitations

1. The Action layer in this starter is optimized for UTF-8 text Skill resources. Binary image assets can be stored in GitHub, but dynamically loading private image assets as *visual model inputs* needs a separate asset-delivery design.
2. Actions may ask for confirmation before state-changing requests depending on ChatGPT behavior/settings.
3. If you make the Custom GPT publicly shareable and it uses Actions, OpenAI requires a valid privacy-policy URL.
4. Do not enable direct writes to `main` unless you intentionally want to remove the PR safety gate.

