import { elements as e } from '../core/elements.ts';
import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants.ts';

export async function startScreenshare(test) {
  await test.waitAndClick(e.startScreenSharing);
  await test.hasElement(e.screenShareVideo, ELEMENT_WAIT_EXTRA_LONG_TIME);
  await test.hasElement(e.stopScreenSharing);
}
