const fs = require('fs');
const path = require('path');

const PACKS_DIR = path.join(__dirname, '..', '..', 'data', 'skill-packs');

/**
 * Skill template archives shipped with SANSA (from Skill & knowladge.zip).
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

module.exports = {
  listBundledSkillZips,
  skillPacksDir: PACKS_DIR,
};
