/**
 * Controller for the Sunnah Assistant Backend
 */

import { Hono } from 'hono';
import { Env } from './models';
import { GeocodingService } from './service';
import { RateLimiter } from './rate-limiter';

// Create a Hono app with the Env type
const app = new Hono<{ Bindings: Env }>();

// Apply the rate limiter middleware globally
app.use('*', RateLimiter.middleware());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'UP' });
});

// Geocoding endpoint
app.get('/geocoding-data', async (c) => {
  const address = c.req.query('address');
  const language = c.req.query('language') || 'en';

  if (!address) {
    return c.json({ results: [], status: 'INVALID_REQUEST' });
  }

  try {
    const geocodingService = new GeocodingService(c.env);
    const geocodingData = await geocodingService.getGeocodingData(address, language);
    return c.json(geocodingData);
  } catch (error) {
    console.error('Controller error:', error);
    return c.json({ results: [], status: 'AN_ERROR_OCCURRED' }, 500);
  }
});

// Resources links endpoint
app.get('/resources/links', (c) => {
  return c.json({
    translationLink: c.env.TRANSLATION_LINK,
    adhkaarLink: c.env.ADHKAAR_LINK,
    quranZipFileLink: c.env.QURAN_ZIP_FILE_LINK,
    quranPagesLink: c.env.QURAN_PAGES_LINK
  });
});

export { app };