import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function openConnectionStatus(testPage: Page) {
  await testPage.waitAndClick(e.connectionStatusBtn);
  await testPage.waitForSelector(e.connectionStatusModal);
}

export async function checkNetworkStatus(dataContainer: string): Promise<boolean> {
  const values = Array.from(document.querySelectorAll(`${dataContainer} > div`));
  values.splice(4, values.length - 4);
  const check = values.filter((elem) => elem.textContent?.includes(' 0 k'))[0];

  return !check;
}
