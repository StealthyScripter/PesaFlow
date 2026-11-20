# PesaFlow marketing

Project marketing assets and maintenance home. The shared folder name is `marketing/` across all eight projects.

**Status:** starter campaign package with editable graphics and copy. Graphics are drafts; genuine current screenshots and final store exports remain pending. Nothing has been published.

## Positioning

Keep SACCO operations flowing. Organize member accounts, transactions and approval workflows.

Audience: SACCO administrators and members.

Do not claim regulatory compliance, guaranteed financial outcomes or banking accreditation.

## Structure

| Location | Contents |
| --- | --- |
| `graphics/logos/` | Existing branding where available and a labeled concept mark |
| `graphics/posters/` | 1080×1350 editable launch poster |
| `graphics/merch/` | Transparent print artwork and production notes |
| `graphics/playstore/` | Feature graphic, icon concept and export guidance |
| `graphics/social/` | 1200×630 social card |
| `screenshots/desktop/` | Genuine desktop captures; currently pending |
| `screenshots/mobile/` | Genuine mobile captures; currently pending |
| `copy/` | Messaging, social caption and store description draft |
| `brand/` | Working palette, audience and brand usage notes |
| `sources/` | Provenance, capture log and asset inventory |
| `scripts/` | Repeatable public-page screenshot helper |

## Maintain and release

1. Review product changes and refresh copy with supported features only.
2. Edit SVG sources in a vector editor. Prefer existing logos over fallback concepts. Resolve brand approval before export.
3. Capture the workflows listed in [screenshots/README.md](screenshots/README.md) with demo data and log the application revision.
4. Export campaign images to PNG; obtain printer specifications for merchandise and check current store requirements for store assets.
5. Review text, legibility, rights, data privacy and destination links before publication.
6. Update `sources/assets.json` when adding or replacing assets. Keep editable sources alongside release exports and retire obsolete captures.

Use lowercase kebab-case names; include workflow, device, language and version on release variants, for example `01-dashboard-mobile-en-v01.png`. Keep assets in Git; use Git LFS if adding large videos or layered design files. Review assets after meaningful UI changes and before every campaign or app release.

See [asset inventory](sources/assets.json), [messaging](copy/messaging.md), and [provenance](sources/README.md).

## Project profile

[project.json](project.json) contains the title, slug, excerpt, evidence-based project story, technologies, features, repository URL and related links. It also records missing media and unverified metadata explicitly. Actual start dates remain unknown; earliest Git commit dates are recorded separately. Latest commit dates exclude uncommitted work.

No synthetic data was added during this review. Existing concept graphics remain labeled drafts and are not used as product screenshots. Cover artwork is unassigned because no suitable existing cover was established.
