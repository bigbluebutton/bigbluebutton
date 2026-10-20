import { test } from '../core/setup/fixtures';
import { ANNOTATION_HISTORY_STREAM_FIELD, Reconnection } from './reconnection';
import { routeGraphqlSockets, routeServerConnection, SHOW_RECONNECTING_TOAST } from './util';

// the connection is dropped from inside the browser: no root permission needed
test.describe.parallel('Reconnection', () => {
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

  test('Chat', { tag: '@ci' }, async ({ browser, context, page }, testInfo) => {
    const connection = await routeServerConnection(page);
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, { testInfo, clientSettingsOverrides: SHOW_RECONNECTING_TOAST });
    await reconnection.chat(connection);
  });

  test('Audio', { tag: '@ci' }, async ({ browser, context, page }, testInfo) => {
    const connection = await routeServerConnection(page);
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, { testInfo, clientSettingsOverrides: SHOW_RECONNECTING_TOAST });
    await reconnection.microphone(connection);
  });
});
