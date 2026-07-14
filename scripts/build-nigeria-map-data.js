import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '..', 'temp-nigeria-index.js');
const outputPath = path.join(__dirname, '..', 'src', 'components', 'dashboard', 'nigeria-map-data.ts');

const content = fs.readFileSync(inputPath, 'utf8');
const js = content.replace('export default', 'const map =');
const map = eval(js);

const lines: string[] = [];
lines.push('export const NIGERIA_MAP = {');
lines.push(`  viewBox: ${JSON.stringify(map.viewBox)},`);
lines.push('  locations: [');
for (const loc of map.locations) {
  lines.push('    {');
  lines.push(`      id: ${JSON.stringify(loc.id)},`);
  lines.push(`      name: ${JSON.stringify(loc.name)},`);
  lines.push(`      path: ${JSON.stringify(loc.path)},`);
  lines.push('    },');
}
lines.push('  ],');
lines.push('} as const;');

fs.writeFileSync(outputPath, lines.join('\n'));
console.log(`Wrote ${outputPath}`);
