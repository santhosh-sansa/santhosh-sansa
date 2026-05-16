# Bundled skill packs

These `.zip` files are extracted from the repo root archive `Skill & knowladge.zip` (Anthropic-style document skills and related templates). They are stored on disk for download, tooling, or future Claude / MCP integration.

The API exposes them in aggregate form via `GET /api/skills/status` (`bundledSkillPacks`) and `GET /api/skills/packs`.

Do not commit secrets inside these archives; they are third-party skill scaffolds only.
