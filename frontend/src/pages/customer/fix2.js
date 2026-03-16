const fs = require('fs');
let file = 'c:/Users/balam/Downloads/mini project/mini project extract/frontend/src/pages/customer/BookingDetail.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<div key=\{status\} className=\{[^>]*\}>/g, '<div key={status} className={\	imeline-step \\}>');
fs.writeFileSync(file, content);
