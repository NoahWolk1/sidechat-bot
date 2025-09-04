/* This is a base64 representation of a purple favicon */
const favicon = Buffer.from('AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAACMuAAAjLgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7u7uAO7u7jXu7u6/7u7u/+7u7v/u7u7/7u7uv+7u7jXu7u4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7u7uAO7u7nXu7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7ude7u7gAAAAAAAAAAAAAAAAAAAAAAAAAAAO7u7jXu7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u417u7uAAAAAAAAAAAA7u7uAO7u7r/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7uv+7u7gDu7u4A7u7uNe7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7jXu7u4A7u7ude7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7nXu7u4A7u7uv+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7r/u7u4A7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u4A7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u4A7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u4A7u7uv+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7r/u7u4A7u7ude7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7nXu7u4A7u7uNe7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7uNe7u7gAAAAAA7u7uAO7u7r/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7r/u7u4AAAAAAAAAAAAAAAAAAAAAAAAAAO7u7jXu7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7uNe7u7gAAAAAAAAAAAAAAAAAAAAAAAAAAAO7u7gDu7u517u7u/+7u7v/u7u7/7u7u/+7u7v/u7u517u7uAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Save favicon
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);
console.log('Favicon created successfully');
