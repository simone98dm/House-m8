/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRepositories } from '~~/server/repositories/factory';
import { sendEmail } from '~~/server/utils/email';
import { isCronRequest } from '~~/server/utils/cron-auth';

vi.stubGlobal(
  'defineEventHandler',
  (fn: (...args: unknown[]) => unknown) => fn,
);
vi.stubGlobal('createError', (o: object) => Object.assign(new Error(), o));

vi.mock('~~/server/repositories/factory', () => ({ getRepositories: vi.fn() }));
vi.mock('~~/server/utils/email', () => ({ sendEmail: vi.fn() }));
vi.mock('~~/server/utils/cron-auth', () => ({ isCronRequest: vi.fn() }));
vi.mock('~~/server/utils/pdf-report', () => ({
  generateMonthlyReportPdf: vi.fn(),
}));
vi.mock('~~/server/utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

const ev = {} as never;

describe('cron handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(['bills-reminder', 'monthly-reports'])(
    '%s is method-agnostic and rejects unauthenticated callers',
    async (name) => {
      vi.mocked(isCronRequest).mockReturnValue(false);
      const { default: h } = await import(`../../../api/cron/${name}`);
      await expect((h as Function)(ev)).rejects.toMatchObject({
        statusCode: 401,
      });
    },
  );

  it('bills-reminder escapes the description and first name in the HTML body', async () => {
    vi.mocked(isCronRequest).mockReturnValue(true);
    const due = new Date();
    due.setDate(due.getDate() + 3);
    const iso = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`;
    vi.mocked(getRepositories).mockReturnValue({
      bills: {
        getActiveBills: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'b1',
              house_id: 'h1',
              description: '<img src=x onerror=alert(1)>',
              next_due_date: iso,
            },
          ],
        }),
        checkReminderSent: vi.fn().mockResolvedValue(false),
        markReminderSent: vi.fn(),
      },
      houses: {
        getMembers: vi.fn().mockResolvedValue({
          data: [{ user: { email: 'a@b.c', first_name: '<b>Eve</b>' } }],
        }),
      },
    } as never);

    const { default: h } = await import('../../../api/cron/bills-reminder');
    await (h as Function)(ev);

    const html = vi.mocked(sendEmail).mock.calls[0]![0].html as string;
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>Eve');
    expect(html).toContain('&lt;img');
    expect(html).toContain('&lt;b&gt;Eve');
  });
});
