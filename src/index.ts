/**
 * Main entry point for the Sunnah Assistant Backend Cloudflare Worker
 */

import { app } from './controller';
import { RateLimiter } from './rate-limiter';

// Add rate limiting middleware
app.use('*', RateLimiter.middleware());

// Export the Hono app as the default export
export default app;