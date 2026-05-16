const fs = require('fs');
const path = require('path');

const PACKS_DIR = path.join(__dirname, '..', '..', 'data', 'skill-packs');
const KNOWLEDGE_MANIFEST = path.join(PACKS_DIR, 'knowledge-library-v1.json');

/**
 * Skill template archives shipped with SANSA (drop .zip files here).
 * @returns {{ name: string, size: number }[]}
 */
function listBundledSkillZips() {
  try {
    if (!fs.existsSync(PACKS_DIR)) return [];
    return fs
      .readdirSync(PACKS_DIR)
      .filter((f) => f.toLowerCase().endsWith('.zip'))
      .map((name) => {
        const full = path.join(PACKS_DIR, name);
        const st = fs.statSync(full);
        return { name, size: st.size };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/**
 * Static catalog for inner packs described in Skill & knowladge.zip (see JSON file).
 * @returns {object|null}
 */
function readKnowledgeLibraryManifest() {
  try {
    if (!fs.existsSync(KNOWLEDGE_MANIFEST)) return null;
    const raw = JSON.parse(fs.readFileSync(KNOWLEDGE_MANIFEST, 'utf8'));
    const installed = new Set(listBundledSkillZips().map((p) => p.name));
    const entries = Array.isArray(raw.entries) ? raw.entries : [];
    return {
      ...raw,
      entries: entries.map((e) => ({
        ...e,
        installed: installed.has(String(e.file || '')),
      })),
    };
  } catch {
    return null;
  }
}

module.exports = {
  listBundledSkillZips,
  readKnowledgeLibraryManifest,
  skillPacksDir: PACKS_DIR,
};
