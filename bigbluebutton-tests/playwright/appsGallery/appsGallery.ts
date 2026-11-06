import { expect, Locator } from '@playwright/test';

import { elements as e } from '../core/elements';
import { ClientSettingsOverrides } from '../core/page';
import { MultiUsers } from '../user/multiusers';

// A moderator who is also presenter gets these three apps, all pinned by default
// (app.appsGallery.maxPinnedApps is 3).
const APP_SIDEBAR_BUTTONS: Record<string, string> = {
  [e.breakoutRoomsApp]: e.breakoutRoomSidebarButton,
  [e.pollingApp]: e.pollSidebarButton,
  [e.timerApp]: e.timerStopwatchFeature,
};
const APP_NAMES = Object.keys(APP_SIDEBAR_BUTTONS);

export const TWO_PINNED_APPS_SETTINGS_OVERRIDE: ClientSettingsOverrides = {
  public: { app: { appsGallery: { maxPinnedApps: 2 } } },
};

export class AppsGallery extends MultiUsers {
  async searchAndLaunchApp() {
    await this.openGallery();
    await this.hasGalleryApps(APP_NAMES, 'should list every app of a moderator presenter');

    await this.modPage.fill(e.appsGallerySearch, 'poll');
    await this.hasGalleryApps([e.pollingApp], 'should list only the app matching the search');
    await this.modPage.fill(e.appsGallerySearch, 'TIMER');
    await this.hasGalleryApps([e.timerApp], 'should match regardless of letter case');
    await this.modPage.fill(e.appsGallerySearch, 'zzz');
    await this.hasGalleryApps([], 'should list no app when nothing matches');
    await this.modPage.fill(e.appsGallerySearch, '');
    await this.hasGalleryApps(APP_NAMES, 'should list every app again once the search is emptied');

    await this.galleryApp(e.pollingApp).click();
    await this.modPage.hasElement(e.pollPaneTitle, 'should open the polling panel from the gallery');
    await this.modPage.hasElement(e.pollQuestionArea, 'should show the poll creation form');
    await this.modPage.wasRemoved(e.appsGalleryTitle, 'should replace the gallery with the app');
  }

  async unpinAndPinApp() {
    await this.openGallery();
    await this.modPage.hasText(
      e.pinnedAppsCounter,
      '3 out of 3 pinned apps',
      'should count the apps pinned by default',
    );
    const timerPinToggle = this.pinToggle(e.timerApp);
    await expect(timerPinToggle, 'should show the timer as pinned').toHaveAttribute('aria-pressed', 'true');
    await this.modPage.hasElement(e.timerStopwatchFeature, 'should show the pinned timer in the sidebar');

    await timerPinToggle.click();
    await expect(timerPinToggle, 'should show the timer as unpinned').toHaveAttribute('aria-pressed', 'false');
    await expect(timerPinToggle, 'should offer to pin the timer').toHaveAttribute('aria-label', 'Pin app');
    await this.modPage.wasRemoved(e.timerStopwatchFeature, 'should remove the timer button from the sidebar');
    await this.modPage.hasText(e.pinnedAppsCounter, '2 out of 3 pinned apps', 'should count one pinned app less');
    await this.hasGalleryApps(APP_NAMES, 'should keep the unpinned timer in the gallery');

    await timerPinToggle.click();
    await expect(timerPinToggle, 'should show the timer as pinned again').toHaveAttribute('aria-pressed', 'true');
    await this.modPage.hasElement(e.timerStopwatchFeature, 'should bring the timer button back to the sidebar');
    await this.modPage.hasText(e.pinnedAppsCounter, '3 out of 3 pinned apps', 'should count the timer again');
    await this.modPage.waitAndClick(e.timerStopwatchFeature);
    await this.modPage.hasElement(e.timerHeader, 'should open the timer from its sidebar button');
  }

  // with the maximum lowered to 2, one of the three apps starts unpinned
  async pinBeyondTheMaximum() {
    await this.openGallery();
    await this.modPage.hasText(e.pinnedAppsCounter, '2 out of 2 pinned apps', 'should pin no more apps than allowed');
    await expect.poll(() => this.sidebarPinnedApps(), { message: 'should show two pinned apps' }).toHaveLength(2);
    const [oldestPinnedApp, newestPinnedApp] = await this.sidebarPinnedApps();
    const unpinnedApp = APP_NAMES.find((name) => name !== oldestPinnedApp && name !== newestPinnedApp)!;
    await expect(this.pinToggle(unpinnedApp), 'should show the third app as unpinned').toHaveAttribute(
      'aria-pressed',
      'false',
    );

    // there is no warning: the app pinned first makes room for the new one
    await this.pinToggle(unpinnedApp).click();
    await expect(this.pinToggle(unpinnedApp), 'should pin the third app').toHaveAttribute('aria-pressed', 'true');
    await expect(this.pinToggle(oldestPinnedApp), 'should unpin the app pinned first').toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect
      .poll(() => this.sidebarPinnedApps(), { message: 'should replace the app pinned first in the sidebar' })
      .toEqual([newestPinnedApp, unpinnedApp]);
    await this.modPage.hasText(e.pinnedAppsCounter, '2 out of 2 pinned apps', 'should still count two pinned apps');
  }

  async openGallery() {
    await this.modPage.waitAndClick(e.appsGallerySidebarButton);
    await this.modPage.hasElement(e.appsGalleryTitle, 'should open the apps gallery');
  }

  galleryApp(name: string): Locator {
    return this.modPage.page.locator(`${e.appsGalleryItem}[aria-label="${name}"]`);
  }

  pinToggle(name: string): Locator {
    return this.galleryApp(name).locator('xpath=..').locator(e.appsGalleryPinToggle);
  }

  async hasGalleryApps(names: string[], description: string) {
    const galleryAppNames = () =>
      this.modPage.page
        .locator(e.appsGalleryItem)
        .evaluateAll((items) => items.map((item) => item.getAttribute('aria-label') ?? ''));
    await expect
      .poll(async () => (await galleryAppNames()).sort(), { message: description })
      .toEqual([...names].sort());
  }

  // the apps pinned to the sidebar, in the order they were pinned
  async sidebarPinnedApps(): Promise<string[]> {
    const sidebarButtons = await this.modPage.page
      .locator(e.navigationSidebarContainer)
      .locator(Object.values(APP_SIDEBAR_BUTTONS).join(', '))
      .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-test') ?? ''));
    return sidebarButtons.map(
      (dataTest) => APP_NAMES.find((name) => APP_SIDEBAR_BUTTONS[name].includes(`"${dataTest}"`)) ?? dataTest,
    );
  }
}
