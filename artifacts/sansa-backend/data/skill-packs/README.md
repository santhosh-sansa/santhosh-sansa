# Bundled skill packs

These `.zip` files come from the outer archive `Skill & knowladge.zip` (Anthropic-style document skills and related templates). **Install one inner pack at a time:** unzip the outer archive, copy a single inner `.zip` from the `Skill/` folder into this directory, then restart the backend so `GET /api/skills/packs` lists it.

Static catalog metadata (titles, categories, expected filenames) lives in **`knowledge-library-v1.json`**. The API merges **`installed: true|false`** per entry by checking which `.zip` files exist here.

The API exposes them via:

- `GET /api/skills/status` — `bundledSkillPacks` plus `knowledgeLibrary` (manifest + `installed` flags)
- `GET /api/skills/packs` — `packs` plus `knowledgeLibrary`
- `GET /api/smithery/catalog` — Smithery-style catalog plus **`knowledgeZipLibrary`** (full manifest)
- `GET /api/smithery/status` — **`knowledgeZipLibrarySummary`** (counts and catalog id)

Do not commit secrets inside these archives; they are third-party skill scaffolds only.
