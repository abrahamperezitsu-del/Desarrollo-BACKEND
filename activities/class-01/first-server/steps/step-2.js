// Step 2: log every incoming request so the terminal shows the traffic.

const http = require('http');

const server = http.createServer((request, response) => {
  console.log(`${request.method} ${request.url}`);

  response.end('Hello from the server');
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
