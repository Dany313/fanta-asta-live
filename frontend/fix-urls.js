const fs = require('fs');
const path = require('path');

function replaceUrls(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceUrls(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Replace in backticks: `http://localhost:3000/api/...` -> `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/...`
      content = content.replace(/`http:\/\/localhost:3000/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:3000\'}');
      
      // Replace in quotes: 'http://localhost:3000/api/...' -> `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/...`
      // We convert the quotes to backticks for simplicity
      content = content.replace(/'http:\/\/localhost:3000([^']*)'/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:3000\'}$1`');
      content = content.replace(/"http:\/\/localhost:3000([^"]*)"/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:3000\'}$1`');

      // Replace localhost:5173
      content = content.replace(/`http:\/\/localhost:5173/g, '`${window.location.origin}');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceUrls(path.join(__dirname, 'src'));
console.log("Done!");
