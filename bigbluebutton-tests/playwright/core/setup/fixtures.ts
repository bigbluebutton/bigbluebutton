import { test as base, type Video } from '@playwright/test';

interface TestFixtures {
  sharedBeforeEachTestHook: void;
}

const testWithValidation = base.extend<TestFixtures>({
  sharedBeforeEachTestHook: [
    async ({ browser }, use, testInfo) => {
      // Before test
      await use();
      // After test — collect video refs before closing (videos finalize on context close)
      const contexts = browser.contexts();
      const videos: Video[] = [];
      for (const ctx of contexts) {
        for (const pg of ctx.pages()) {
          const v = pg.video();
          if (v) videos.push(v);
        }
      }
      await Promise.all(contexts.map((context) => context.close()));
      // Only attach videos for failed/timed-out tests to avoid bloating CI artifacts on passing runs
      if (testInfo.status !== 'passed') {
        for (let i = 0; i < videos.length; i++) {
          try {
            const videoPath = await videos[i].path();
            await testInfo.attach(`video-${i + 1}`, { path: videoPath, contentType: 'video/webm' });
          } catch {
            // skip if video file unavailable
          }
        }
      }
    },
    { scope: 'test', auto: true },
  ],
});

export const test = testWithValidation;
