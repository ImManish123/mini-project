const fs = require('fs');
let file = 'src/pages/customer/BookingDetail.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/subscribe\\\([^,]+,/g, 'subscribe(\/topic/booking-location/\\,');
content = content.replace(/className=\{\\\	imeline-step.*?\\\\}/g, 'className={\	imeline-step \\}');
content = content.replace(/className=\{\\\cursor-pointer.*?\\\\}/g, 'className={\cursor-pointer \\}');
content = content.replace(/className=\{\\\adge.*?\\\\}/g, 'className={\adge \ fs-6\}');
content = content.replace(/description:.*?\\\[Service/g, 'description: \[Service');
content = content.replace(/complaint.description\\\}\\\/g, 'complaint.description}\');

fs.writeFileSync(file, content);
