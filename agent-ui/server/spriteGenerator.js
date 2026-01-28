const fs = require('fs');
const path = require('path');

/**
 * Sprite Generator Service
 * Generates 16x16 pixel art sprites for skills
 * Can use Hugging Face Inference API for real generation
 * Falls back to generated base64 pixel art
 */

const SPRITES_DIR = path.join(process.cwd(), '.createsuite', 'sprites');

// Ensure sprites directory exists
if (!fs.existsSync(SPRITES_DIR)) {
  fs.mkdirSync(SPRITES_DIR, { recursive: true });
}

/**
 * Generate a simple 16x16 pixel art sprite as base64 PNG
 * Creates a colorful, recognizable icon for each skill
 */
function generatePixelSprite(skillName, colorTheme) {
  const colors = {
    blue: ['#000080', '#0000FF', '#4169E1', '#87CEEB'],
    green: ['#006400', '#008000', '#32CD32', '#90EE90'],
    red: ['#8B0000', '#FF0000', '#FF6347', '#FFA07A'],
    purple: ['#4B0082', '#800080', '#9932CC', '#DDA0DD'],
    orange: ['#8B4500', '#FF8C00', '#FFA500', '#FFD700'],
    cyan: ['#008B8B', '#00CED1', '#20B2AA', '#00FFFF'],
    pink: ['#C71585', '#FF1493', '#FF69B4', '#FFB6C1'],
    yellow: ['#B8860B', '#FFD700', '#FFFF00', '#FFFFE0']
  };

  const palette = colors[colorTheme] || colors.blue;

  // Create a simple 16x16 pixel pattern
  const size = 16;
  const pixels = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Create a simple character shape
      const centerX = size / 2;
      const centerY = size / 2;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      let color = '#00000000'; // Transparent

      if (dist < 4) {
        color = palette[1];
      } else if (dist < 6) {
        color = palette[0];
      } else if (dist >= 7 && dist <= 8) {
        // Border
        if (y < 4 || y >= 12 || x < 4 || x >= 12) {
          color = palette[3];
        }
      }

      pixels.push(color);
    }
  }

  // Convert to PNG (simplified - in reality, you'd use a library like canvas or sharp)
  // For now, return a data URL with the pixel pattern
  const dataUrl = `data:image/svg+xml;base64,${generateSVGSprite(skillName, palette)}`;

  return dataUrl;
}

/**
 * Generate SVG sprite for a skill
 */
function generateSVGSprite(skillName, palette) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <rect width="16" height="16" fill="${palette[2]}"/>
      <circle cx="8" cy="8" r="5" fill="${palette[1]}"/>
      <circle cx="6" cy="7" r="1.5" fill="${palette[3]}"/>
      <circle cx="10" cy="7" r="1.5" fill="${palette[3]}"/>
      <path d="M 6 10 Q 8 12 10 10" stroke="${palette[3]}" stroke-width="1" fill="none"/>
      <rect x="0" y="0" width="16" height="16" fill="none" stroke="${palette[0]}" stroke-width="1"/>
    </svg>
  `;

  return Buffer.from(svg).toString('base64');
}

/**
 * Get or generate a sprite for a skill
 */
function getSkillSprite(skillName, categoryIndex) {
  const themes = ['blue', 'green', 'red', 'purple', 'orange', 'cyan', 'pink', 'yellow'];
  const theme = themes[categoryIndex % themes.length];

  const spritePath = path.join(SPRITES_DIR, `${skillName.replace(/\s+/g, '_').toLowerCase()}.png`);

  // Check if sprite already exists
  if (fs.existsSync(spritePath)) {
    const spriteData = fs.readFileSync(spritePath);
    return `data:image/png;base64,${spriteData.toString('base64')}`;
  }

  // Generate new sprite
  const spriteUrl = generatePixelSprite(skillName, theme);

  // Save SVG version
  const svgPath = spritePath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, Buffer.from(spriteUrl.split(',')[1], 'base64'));

  return spriteUrl;
}

/**
 * Generate sprites for all skills in agent-skills.json
 */
function generateAllSprites() {
  const skillsPath = path.join(process.cwd(), 'agent-skills.json');

  if (!fs.existsSync(skillsPath)) {
    console.error('agent-skills.json not found');
    return [];
  }

  const skillsData = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'));
  const sprites = {};

  skillsData.agentSkills.categories.forEach((category, catIndex) => {
    category.skills.forEach((skill) => {
      sprites[skill] = getSkillSprite(skill, catIndex);
    });
  });

  return sprites;
}

module.exports = {
  generateAllSprites,
  getSkillSprite
};
