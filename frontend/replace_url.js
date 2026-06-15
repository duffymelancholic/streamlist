const fs = require('fs');
const path = require('path');

const directory = '/home/abala/streamlist/frontend/src';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(directory, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('http://localhost:4000')) {
      // Replace single quoted string starts
      content = content.replace(/'http:\/\/localhost:4000/g, '`${process.env.NEXT_PUBLIC_API_URL || \\'http://localhost:4000\\'}/');
      // Replace inside template literals
      content = content.replace(/http:\/\/localhost:4000/g, '${process.env.NEXT_PUBLIC_API_URL || \\'http://localhost:4000\\'}');
      // Fix cases where it was a single quote string that we turned into a template literal, we need to end it with a backtick instead of single quote
      content = content.replace(/\/'/g, "/`");
      content = content.replace(/\\', \{/g, "\\`, {"); // for fetch options
      content = content.replace(/login', \{/g, "login\\`, {"); 
      content = content.replace(/signup', \{/g, "signup\\`, {"); 
      content = content.replace(/browse'\)/g, "browse\\`)"); 
      content = content.replace(/list', \{/g, "list\\`, {"); 
      content = content.replace(/add', \{/g, "add\\`, {"); 
      content = content.replace(/me', \{/g, "me\\`, {"); 
      
      fs.writeFileSync(filePath, content);
      console.log('Updated: ' + filePath);
    }
  }
});
