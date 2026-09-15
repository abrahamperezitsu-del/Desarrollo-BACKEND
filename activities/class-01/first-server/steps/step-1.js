// Step 1: the smallest server that can answer a request.

const http = require('http');

const server = http.createServer((request, response) => {
  response.end('Hello from the server');
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
