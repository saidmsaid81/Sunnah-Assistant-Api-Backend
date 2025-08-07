/**
 * Rate limiting middleware for Cloudflare Workers
 */

import { Context, Next } from 'hono';
import { Env } from './models';
import { EmailService } from "./email-service";

// Constants
const USER_AGENT_HEADER = 'User-Agent';
const APP_VERSION_HEADER = 'App-Version';
const RATE_LIMIT = 15; // 15 requests per hour
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds

export class RateLimiter {
  /**
   * Middleware for rate limiting and authentication
   */
  static middleware() {
    return async (c: Context<{ Bindings: Env }>, next: Next) => {
      if (!c.req.path.startsWith('/geocoding-data')) {
        return next();
      }

      const env = c.env;
      const ip = c.req.header('CF-Connecting-IP') || 
                 c.req.header('X-Forwarded-For') || 
                 c.req.header('X-Real-IP') ||
                 c.req.raw.ip;
      
      const userAgent = c.req.header(USER_AGENT_HEADER);
      const appVersion = c.req.header(APP_VERSION_HEADER);

      // Check User-Agent
      if (!userAgent || !new RegExp(`^${env.EXPECTED_USER_AGENT}$`).test(userAgent)) {
        return new Response(null, { status: 401 });
      }

      // Check App-Version
      if (!appVersion) {
        return new Response(null, { status: 401 });
      }

      // Check if app version is outdated
      const appVersionNum = parseInt(appVersion, 10);
      const currentVersionNum = parseInt(env.CURRENT_APP_VERSION, 10);
      if (!isNaN(appVersionNum) && !isNaN(currentVersionNum) && appVersionNum < currentVersionNum) {
        return new Response(null, { status: 426 });
      }

      // Rate limiting
      const key = `rate-limit:${ip}`;
      let success = false;
      
      try {
        const data = await env.RATE_LIMITS.get(key, { type: 'json' }) as { count: number, timestamp: number } | null;
        const now = Math.floor(Date.now() / 1000);
        
        if (!data || (now - data.timestamp > RATE_LIMIT_WINDOW)) {
          await env.RATE_LIMITS.put(key, JSON.stringify({ count: 1, timestamp: now }), 
            { expirationTtl: RATE_LIMIT_WINDOW });
          success = true;
        } else if (data.count >= RATE_LIMIT) {
          const retryAfter = RATE_LIMIT_WINDOW - (now - data.timestamp);
          c.header('Retry-After', retryAfter.toString());
          success = false;
        } else {
          await env.RATE_LIMITS.put(key, JSON.stringify({ 
            count: data.count + 1, 
            timestamp: data.timestamp 
          }), { expirationTtl: RATE_LIMIT_WINDOW });
          success = true;
        }

        if (!success) {
          // c.executionCtx.waitUntil(
          //   // new EmailService(env.MY_EMAIL, env.SENDGRID_API_KEY)
          //   //   .sendEmailToDeveloper(`Too many requests ${ip}`)
          // );
          return new Response(null, { status: 429 });
        }

        return await next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        return await next();
      }
    };
  }
}