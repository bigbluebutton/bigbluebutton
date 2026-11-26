import { expect, Locator } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from './multiusers';
import { setPresentationPermission } from './util';

// opens the media area and asks to become presenter
async function requestPresenter(testPage: Page) {
  await testPage.waitAndClick(e.mediaAreaButton);
  await testPage.waitAndClick(e.requestPresenterButton);
  await testPage.hasElement(e.waitingPresenterButton, `should show ${testPage.username} as waiting for an answer`);
}

export class PresenterRequest extends MultiUsers {
  async denyRequest() {
    await requestPresenter(this.userPage);
    const request = this.requestNotification(this.userPage.username);
    await expect(request, 'should show the request of the attendee to the moderator').toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await request.locator(e.denyPresenter).click();
    await expect(request, 'should close the request for the moderator once it is denied').toBeHidden();

    await this.userPage.hasText(
      e.smallToastMsg,
      e.presenterRequestDeniedToast,
      'should tell the attendee that the request was denied',
    );
    await this.userPage.wasRemoved(e.waitingPresenterButton, 'should stop showing the attendee as waiting');
    await this.userPage.hasElement(e.requestPresenterButton, 'should let the attendee request again');
    await this.userPage.wasRemoved(e.startScreenSharing, 'should not make the attendee presenter');
    await this.modPage.hasElement(e.startScreenSharing, 'should keep the moderator as presenter');

    // a denied request does not block the next one
    await this.userPage.waitAndClick(e.requestPresenterButton);
    await this.userPage.hasElement(e.waitingPresenterButton, 'should show the attendee as waiting again');
    await expect(request, 'should show the new request to the moderator').toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
  }

  async approveOneOfTwoRequests() {
    await requestPresenter(this.userPage);
    await requestPresenter(this.userPage2);
    const firstRequest = this.requestNotification(this.userPage.username);
    const secondRequest = this.requestNotification(this.userPage2.username);
    await expect(firstRequest, 'should show the request of the first attendee').toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await expect(secondRequest, 'should show the request of the second attendee').toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });

    await secondRequest.locator(e.approvePresenter).click();
    await this.userPage2.hasElement(
      e.startScreenSharing,
      'should make the second attendee presenter',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.wasRemoved(e.startScreenSharing, 'should take the presenter role from the moderator');
    await this.userPage.wasRemoved(e.startScreenSharing, 'should not make the first attendee presenter');
    await expect(secondRequest, 'should close the approved request').toBeHidden();
    // the other request is still pending: it was neither approved nor dropped
    await expect(firstRequest, 'should keep the request of the first attendee for the moderator').toBeVisible();
    await this.userPage.hasElement(e.waitingPresenterButton, 'should keep the first attendee waiting');

    await firstRequest.locator(e.approvePresenter).click();
    await this.userPage.hasElement(
      e.startScreenSharing,
      'should make the first attendee presenter once the request is approved',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.wasRemoved(e.startScreenSharing, 'should take the presenter role from the second attendee');
    await expect(firstRequest, 'should close the second approved request').toBeHidden();
  }

  async policySwitchWithPendingRequest() {
    await requestPresenter(this.userPage);
    const request = this.requestNotification(this.userPage.username);
    await expect(request, 'should show the request of the attendee to the moderator').toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });

    await setPresentationPermission(this.modPage, e.presModeratorOnly);
    await this.userPage.hasText(
      e.smallToastMsg,
      e.presenterRequestDisabledToast,
      'should tell the attendee that presenter requests are disabled',
    );
    // switching the policy does not drop a request made before: the attendee
    // keeps waiting and the moderator can still answer it
    await this.userPage.hasElement(e.waitingPresenterButton, 'should keep the pending request of the attendee');
    await expect(request, 'should keep the pending request for the moderator').toBeVisible();

    await request.locator(e.denyPresenter).click();
    await this.userPage.hasText(
      e.smallToastMsg,
      e.presenterRequestDeniedToast,
      'should tell the attendee that the request was denied',
    );
    await this.userPage.wasRemoved(e.waitingPresenterButton, 'should stop showing the attendee as waiting');
    await this.userPage.wasRemoved(
      e.requestPresenterButton,
      'should not let the attendee request again while the policy is moderator only',
    );
    await this.userPage.wasRemoved(e.startScreenSharing, 'should not make the attendee presenter');
  }

  // the request notification of one user, with its allow and cancel buttons
  requestNotification(userName: string): Locator {
    return this.modPage.page
      .locator(e.toastContainer)
      .filter({ hasText: `${userName} ${e.presenterRequestDescription}` });
  }
}
