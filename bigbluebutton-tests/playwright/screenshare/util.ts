import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function startScreenshare(testPage: Page) {
  await testPage.waitAndClick(e.startScreenSharing);
  await testPage.hasElement(
    e.screenShareVideo,
    'should display the screen share video when start sharing',
    ELEMENT_WAIT_EXTRA_LONG_TIME,
  );
  await testPage.hasElement(e.stopScreenSharing, 'should display the stop screen sharing button when start sharing');
}
