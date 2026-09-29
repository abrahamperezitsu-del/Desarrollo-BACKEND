// Application setup: middlewares and module mounting. It does not open any
// port.
//
// TODO(OPS-703): this file will grow during the workshop. The new pieces
// live in src/middleware/ and src/routes/ as guided skeletons:
//   - requestId       every request gets one identifier (src/middleware/request-id.js)
//   - requestLogger   one JSON log line per finished request (src/middleware/request-logger.js)
//   - healthRoutes    GET /health and GET /ready (src/routes/health.routes.js)
//   - notFound        a JSON answer when no route matched (src/middleware/not-found.js)
//   - errorHandler    ONE place that turns errors into responses (src/middleware/error-handler.js)
// Before registering each one, answer: WHERE does it belong, and why?
// An error middleware only sees what happened BEFORE it in this file.
import express from 'express';
import { corsPolicy } from './middleware/cors.js';
import { requestId } from './middleware/request-id.js';
import { requestLogger } from './middleware/request-logger.js';
import { authenticate } from './middleware/authenticate.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRoutes } from './routes/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import requestsRoutes from './modules/requests/requests.routes.js';

const app = express();

// CORS first: preflights must be answered before anything else runs.
app.use(corsPolicy);

// Request ID must run early so every subsequent piece sees req.requestId
app.use(requestId);

// Request logger runs after requestId so it can include the id in its line
app.use(requestLogger);

// Parses incoming JSON bodies into req.body.
app.use(express.json());

// Health endpoints are public and do not require authentication
app.use(healthRoutes);

// /auth mixes public routes (register, login) and one protected route
// (/me), so the module applies `authenticate` internally where needed.
app.use('/auth', authRoutes);

// Every requests route needs a trusted actor: authenticate runs first and
// builds req.auth, or answers 401 and the router never runs.
app.use('/requests', authenticate, requestsRoutes);

// Not-found runs after all routes so it only triggers when nothing matched
app.use(notFound);

// Error handler is LAST: it catches everything from the chain above
app.use(errorHandler);

export default app;
