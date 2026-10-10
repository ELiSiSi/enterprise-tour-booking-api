import fs from 'fs';
import path from 'path';

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) walk(file, files);
    else files.push(file);
  });
  return files;
}

const files = walk('./src').filter(f => f.endsWith('.ts'));

let hasError = false;
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  const imports = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
  imports.forEach(imp => {
    const matched = imp.match(/from\s+['"]([^'"]+)['"]/)[1];
    if (matched.startsWith('.')) {
      let resolved = path.resolve(path.dirname(f), matched);
      if (resolved.endsWith('.js')) {
          resolved = resolved.slice(0, -3) + '.ts';
      }
      const dir = path.dirname(resolved);
      if (fs.existsSync(dir)) {
        const actualFiles = fs.readdirSync(dir);
        const targetBase = path.basename(resolved);
        const actualBase = actualFiles.find(af => af.toLowerCase() === targetBase.toLowerCase());
        if (actualBase && actualBase !== targetBase) {
          console.log(`Mismatch in ${f}: imports '${matched}' but actual file is '${actualBase}'`);
          hasError = true;
        }
      }
    }
  });
});
if (!hasError) console.log('No case mismatches found.');
