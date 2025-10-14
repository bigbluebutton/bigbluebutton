const { test } = require('../fixtures');
const { ErrorLogs } = require('./errorLogs');

test.describe('Error Logs Monitoring', { tag: '@ci' }, () => {
  test('Should not log any errors when joining a session', async ({ browser, context, page }, testInfo) => {
    const errorLogs = new ErrorLogs(browser, context);
    await errorLogs.initPages(page, testInfo);
    errorLogs.monitorErrorLogs();
    await errorLogs.joinSession();
  });

  test('Should not log any errors when sharing audio', async ({ browser, context, page }, testInfo) => {
    const errorLogs = new ErrorLogs(browser, context);
    await errorLogs.initPages(page, testInfo);
    errorLogs.monitorErrorLogs();
    await errorLogs.joinAudioWithMicrophone();
  });

  test('Should not log any errors when sharing webcam', async ({ browser, context, page }, testInfo) => {
    const errorLogs = new ErrorLogs(browser, context);
    await errorLogs.initPages(page, testInfo);
    errorLogs.monitorErrorLogs();
    await errorLogs.joinWebcam();
  });

  test('Should not log any errors when sending public chat message', async ({ browser, context, page }, testInfo) => {
    const errorLogs = new ErrorLogs(browser, context);
    await errorLogs.initPages(page, testInfo);
    errorLogs.monitorErrorLogs();
    await errorLogs.sendPublicChatMessage();
  });

  test('Should not log any errors when sharing a reaction', async ({ browser, context, page }, testInfo) => {
    const errorLogs = new ErrorLogs(browser, context);
    await errorLogs.initPages(page, testInfo);
    errorLogs.monitorErrorLogs();
    await errorLogs.shareReaction();
  });
});
