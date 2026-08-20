/**
 * No `.post` suffix, deliberately: Vercel Cron invokes its target with a **GET**
 * request and cannot be configured otherwise, so a `.post.ts` handler would
 * return 405 on every scheduled run. A method-agnostic handler serves the cron
 * (GET) and the existing POST callers unchanged. Scheduled in vercel.json.
 */
import { getRepositories } from '~~/server/repositories/factory';
import { logger } from '~~/server/utils/logger';
import { isCronRequest } from '~~/server/utils/cron-auth';

export default defineEventHandler(async (event) => {
  if (!isCronRequest(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const repos = getRepositories();
  const result = await repos.gdpr.runScheduledCleanup();

  logger.info('GDPR cleanup cron completed', result);
  return result;
});
