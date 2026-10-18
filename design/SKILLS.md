# Movid — Installed Agent Skills (design + Android quality)

Installed 2026-10-18 for the Movid premium rebuild (reusable for FetchCUT).
Location: `~/.config/opencode/skills/<dir>/SKILL.md` (global OpenCode skills dir).

Vetting policy applied (per project safety rules):
- Read SKILL.md + every bundled script before enabling.
- Nothing that installs binaries at runtime, calls remote services, or reads secrets was enabled.
- Skills are *instructions only*; user constraints (strict black/white, no emojis, fast motion) always override any skill's taste.

## Installed

| # | Dir | Source repo @ commit | License | Payload kept | Notes |
|---|-----|----------------------|---------|--------------|-------|
| 1 | frontend-design | anthropics/skills@dbd4588 | Apache-2.0 (LICENSE.txt inside) | SKILL.md + LICENSE.txt | Aesthetic direction, anti-template rules |
| 2 | impeccable | pbakaus/impeccable@9304afa | Apache-2.0 | SKILL.md + reference/*.md | `scripts/` + `allowed-tools` REMOVED: its CLI downloads an engine binary at runtime and uses browser hooks. Guidance text only. |
| 3 | ui-ux-pro-max | nextlevelbuilder/ui-ux-pro-max-skill@56ea9cf | MIT | full (data CSVs + local python search) | Local search only (stdlib python3); test files use subprocess but are not executed |
| 4 | design-system | nextlevelbuilder/ui-ux-pro-max-skill@56ea9cf | MIT | full | Design-system extraction/definition helper |
| 5 | ui-styling | nextlevelbuilder/ui-ux-pro-max-skill@56ea9cf | MIT | full | Styling guidance |
| 6 | design | nextlevelbuilder/ui-ux-pro-max-skill@56ea9cf | MIT | full | Design reasoning |
| 7 | taste-minimalist | Leonxlnx/taste-skill@f624f37 | MIT | SKILL.md | "Premium utilitarian minimalism" — closest match to this app's identity |
| 8 | taste-soft | Leonxlnx/taste-skill@f624f37 | MIT | SKILL.md | Alternative direction if minimalist ever feels cold |
| 9 | taste-core | Leonxlnx/taste-skill@f624f37 | MIT | SKILL.md + references/ + library/ | `scripts/` (Chrome/CDP page inspection) skipped — web-only tooling |
| 10 | taste-redesign | Leonxlnx/taste-skill@f624f37 | MIT | SKILL.md | Edit-mode audit flow (used for AUDIT/review passes) |
| 11 | web-design-guidelines | vercel-labs/agent-skills@063bee9 | not declared at repo root (note) | SKILL.md | Web-only audit; fetches Vercel's public guideline doc at runtime. Used for principle extraction, not directly on Compose. |
| 12 | emil-design-eng | emilkowalski/skills@2d22863 | MIT | SKILL.md | UI polish, animation decisions, invisible details |
| 13 | apple-design | emilkowalski/skills@2d22863 | MIT | SKILL.md | Fluid interfaces: springs, velocity, interruptibility, materials — transferred to Compose (see BRIEF.md) |
| 14 | android-edge-to-edge | android/skills@5bda39f | Apache-2.0 | full | First-party guidance; directly relevant to the status-bar overlap bug |
| 15 | android-jetpack-compose-performance | android/skills@5bda39f | Apache-2.0 | full | First-party Compose perf |
| 16 | android-adaptive | android/skills@5bda39f | Apache-2.0 | full | Adaptive layouts |
| 17 | android-r8-analyzer | android/skills@5bda39f | Apache-2.0 | full | R8/release shrinking review |
| 18 | android-testing-setup | android/skills@5bda39f | Apache-2.0 | full | Test setup guidance |
| 19 | android-permissions-security | android/skills@5bda39f | Apache-2.0 | full | Permission/component security review |
| 20 | android-intent-security | android/skills@5bda39f | Apache-2.0 | full | Intent/redirection security (share-intent phase) |
| 21+ | skydoves: 26 skills | skydoves/compose-performance-skills@1b32f81 | Apache-2.0 | full (markdown only) | recomposition/*, stability/*, lists/*, side-effects/*, modifiers/*, measurement/*, hot-reload/*, audit/*, build/configuring-r8-for-compose |

Skipped from those repos (with reason):
- uipro `brand`, `banner-design`, `slides` — marketing artifacts, not app UI.
- taste `imagegen-*`, `stitch-skill`, `brandkit`, `output-skill`, `taste-skill-v1/v2-experimental` — web/image generation or superseded.
- android/skills `wear`, `tv`, `cars`, `xr`, `device-ai`, `identity`, `play`, `profilers`, `navigation-3`, `navigation-event`, `media` (Cast), `build-system` (AGP 9), `devtools`, `camera` — out of scope for this app (no wearables/TV/Cast; AGP stays pinned at 8.9.1).
- `aldefy/compose-skill` — single-author, redundant with the official android/skills set; available if wanted later.

## Usage map (phase → skills)

| Phase | Skills to load |
|-------|----------------|
| P0 bugfixes (RTL field, insets, a11y) | android-edge-to-edge, taste-redesign, android-permissions-security |
| P1 architecture (Hilt/WorkManager/ViewModel) | android-testing-setup, skydoves measurement/* |
| P3 premium UI/UX | frontend-design, impeccable (reference), ui-ux-pro-max, design-system, taste-minimalist, taste-core, apple-design, emil-design-eng, android-adaptive |
| P5 performance | android-jetpack-compose-performance, skydoves (all), android-r8-analyzer |
| Security passes | android-intent-security, android-permissions-security + project vuln-hunting skills |

## Governance

- The design BRIEF (`design/BRIEF.md`) is the single source of truth for tokens/components; skills inform, never override it.
- Compose/Material 3 guidance always supplements these (mostly web-oriented) skills.
- Dynamic color is OFF by default (user constraint: strict black/white + grays); dark/light/AMOLED are supported.
