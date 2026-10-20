const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('catch (error: any)') || content.includes('catch (err: any)')) {
    content = content.replace(/catch \((err|error): any\)/g, 'catch ($1: unknown)');
    content = content.replace(/err\.message/g, '(err instanceof Error ? err.message : String(err))');
    content = content.replace(/error\.message/g, '(error instanceof Error ? error.message : String(error))');
    changed = true;
  }
  
  if (content.includes(': any')) {
    // some manual fixes for specific files like exportUtils
    if (file.includes('export.ts') || file.includes('exportUtils.ts')) {
        content = content.replace(/val: any/g, 'val: unknown');
        content = content.replace(/data: any\[\]/g, 'data: Record<string, unknown>[]');
        content = content.replace(/newRow: any/g, 'newRow: Record<string, unknown>');
        content = content.replace(/iterationsData: any\[\]/g, 'iterationsData: Record<string, unknown>[]');
        changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
});
