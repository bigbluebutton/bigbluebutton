import { checkRootPermission } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { ANNOTATION_HISTORY_STREAM_FIELD, Reconnection } from './reconnection';
import { routeGraphqlSockets } from './util';

test.describe.parallel('Reconnection', () => {
  // drops the graphql websocket from inside the browser: no root permission needed
  test(
    'Hidden presentation stays hidden after a reconnection when the slide has annotations',
    { tag: '@ci' },
    async ({ browser, context, page }, testInfo) => {
      const graphqlSockets = await routeGraphqlSockets(page, [ANNOTATION_HISTORY_STREAM_FIELD]);
      const reconnection = new Reconnection(browser, context);
      await reconnection.initModPage(page, { testInfo });
      await reconnection.initUserPage(context, { testInfo });
      await reconnection.hiddenPresentationStaysHiddenAfterReconnection(graphqlSockets);
    },
  );

  test('Chat', async ({ browser, context, page }, testInfo) => {
    await checkRootPermission(); // check sudo permission before starting test
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, { testInfo });
    await reconnection.chat();
  });

  test('Audio', async ({ browser, context, page }, testInfo) => {
    await checkRootPermission(); // check sudo permission before starting test
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, { testInfo });
    await reconnection.microphone();
  });
});
