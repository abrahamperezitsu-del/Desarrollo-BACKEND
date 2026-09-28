import { requests, generateId } from './src/data/requests.js';
import app from './src/app.js';

const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  
  // Close after 5 seconds
  setTimeout(() => {
    server.close();
    process.exit(0);
  }, 5000);
});