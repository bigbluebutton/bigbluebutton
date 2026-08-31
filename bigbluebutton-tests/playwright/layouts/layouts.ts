import { expect } from '@playwright/test';

import { ELEMENT_WAIT_TIME, VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { checkDefaultLocationReset, checkScreenshots } from './util';

// Comfortably away from the 600px mobile breakpoint on both sides: getDeviceType()
// reads documentElement.clientWidth, which differs from the viewport width by the
// scrollbar, so near-threshold values would make the legs ambiguous.
// Both legs run under Playwright's default desktop user-agent: the layout device
// type is derived from width alone, so resizing is enough to flip it, but the
// UA-based deviceInfo.isMobile stays false throughout. Running these specs under
// mobile device emulation (mobile UA) would exercise a different mount path.
export const DESKTOP_VIEWPORT = { width: 1366, height: 768 };
export const MOBILE_VIEWPORT = { width: 500, height: 768 };

// Width of the open sidebar content panel relative to the viewport: ~1 on the
// mobile layout (panel takes the whole width), a fraction on the desktop layout.
// NaN when the panel is absent: it fails both the mobile (> 0.95) and the desktop
// (< 0.6) bounds, so a panel that never renders cannot pass either leg vacuously.
async function getSidebarContentWidthRatio(page: Page): Promise<number> {
  const box = await page.page.locator(e.sidebarContentMain).boundingBox();
  const viewport = page.page.viewportSize();
  if (!box || !viewport) return NaN;
  return box.width / viewport.width;
}

async function assertMobileLayoutActive(page: Page) {
  await page.hasElement(
    e.toggleSidebarNavigation,
    'the sidebar navigation toggle should be rendered on the mobile layout',
  );
  // entering mobile must also collapse the navigation rail; when it stays
  // expanded it overlays the open panel header and the media area
  await assertNavigationRailExpanded(
    page,
    false,
    'the sidebar navigation rail should be collapsed on the mobile layout',
  );
  await expect
    .poll(() => getSidebarContentWidthRatio(page), {
      message: 'the open panel should take the full viewport width on the mobile layout',
      timeout: ELEMENT_WAIT_TIME,
    })
    .toBeGreaterThan(0.95);
}

async function assertNavigationRailExpanded(page: Page, expanded: boolean, message: string) {
  await expect(page.page.locator(e.toggleSidebarNavigation), message).toHaveAttribute(
    'aria-expanded',
    String(expanded),
    { timeout: ELEMENT_WAIT_TIME },
  );
}

async function assertDesktopLayoutActive(page: Page) {
  await page.wasRemoved(
    e.toggleSidebarNavigation,
    'the sidebar navigation toggle should not be rendered on the desktop layout',
  );
  await expect
    .poll(() => getSidebarContentWidthRatio(page), {
      message: 'the open panel should take a fraction of the viewport width on the desktop layout',
      timeout: ELEMENT_WAIT_TIME,
    })
    .toBeLessThan(0.6);
}

export class Layouts extends MultiUsers {
  async focusOnPresentation() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnPresentation);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container after closing all');

    await checkScreenshots(
      this,
      'should be the layout focus on presentation',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'focus-on-presentation',
    );
  }

  async gridLayout() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnVideo);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container after closing all');

    await checkScreenshots(
      this,
      'should be the grid layout',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'grid-layout',
    );
  }

  async smartLayout() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.smartLayout);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container after closing all');

    await checkScreenshots(
      this,
      'should the cameras be above the presentation',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'smart-layout',
      1,
    );

    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.wasRemoved(e.sendButton, 'should not be displayed the chat button after opening the user list');
    await this.modPage.page.waitForTimeout(1000); // wait for the whiteboard zoom to stabilize

    await checkScreenshots(
      this,
      'should the cameras be on the side of presentation',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'smart-layout',
      2,
    );
  }

  async customLayout() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container after closing all');

    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 1);

    // checking the default location being reset when dropping into a non-available location
    await this.modPage.page.locator(e.webcamContainer).first().hover({ timeout: 5000 });
    await this.modPage.page.mouse.down();
    await this.modPage.page.locator(e.whiteboard).hover({ timeout: 5000 });
    // checking all dropAreas being displayed
    await this.modPage.hasElement(e.dropAreaBottom, 'should be displayed the bottom drop area');
    await this.modPage.hasElement(e.dropAreaLeft, 'should be displayed the left drop area');
    await this.modPage.hasElement(e.dropAreaRight, 'should be displayed the right drop area');
    await this.modPage.hasElement(e.dropAreaTop, 'should be displayed the top drop area');
    await this.modPage.hasElement(e.dropAreaSidebarBottom, 'should be displayed the sidebar bottom drop area');
    await this.modPage.page.mouse.up();
    await checkDefaultLocationReset(this.modPage);

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 2);

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 3);

    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.wasRemoved(e.sendButton, 'should not be displayed the chat button');

    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 4);
  }

  async updateEveryone() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClickElement(e.updateEveryoneLayoutToggle);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container after closing all');

    // Presenter minimizes presentation
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'presentation should be minimized for the moderator after clicking the minimize button',
    );
    await this.modPage.hasElement(
      e.restorePresentation,
      'should have the presentation minimized and the restore presentation button should appear for the moderator',
    );
    await this.userPage.wasRemoved(
      e.presentationContainer,
      'presentation should be minimized for the attendee after the moderator clicks the minimize button',
    );
    await this.userPage.hasElement(
      e.restorePresentation,
      'presentation should be minimized and the restore presentation button should appear for the attendee after the moderator clicks the minimize button',
    );

    // Only the user restores presentation
    await this.userPage.waitAndClick(e.restorePresentation);
    await this.userPage.hasElement(
      e.presentationContainer,
      'restored presentation should be visible to the attendee after clicking the restore button',
    );
    await this.userPage.hasElement(
      e.minimizePresentation,
      'should appear the minimize presentation button for the attendee',
    );
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'presentation should remain minimized for the moderator after the attendee clicks the restore button',
    );
    await this.modPage.hasElement(
      e.restorePresentation,
      'restore presentation button should remain visible for the moderator after the attendee clicks the restore button',
    );

    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.closeAllToastNotifications();

    // Drag and drop webcams to different locations
    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(
      this,
      'layout should be updated for everyone after dragging and dropping webcam in sidebar bottom dock area',
      'video',
      'update-everyone',
      1,
    );

    await this.modPage.dragAndDropWebcams(e.dropAreaRight);
    await checkScreenshots(
      this,
      'layout should be updated for everyone after dragging and dropping webcam in right dock area',
      'video',
      'update-everyone',
      2,
    );

    await this.modPage.dragAndDropWebcams(e.dropAreaBottom);
    await checkScreenshots(
      this,
      'layout should be updated for everyone after dragging and dropping webcam in bottom dock area',
      'video',
      'update-everyone',
      3,
    );

    await this.modPage.dragAndDropWebcams(e.dropAreaLeft);
    await checkScreenshots(
      this,
      'layout should be updated for everyone after dragging and dropping webcam in left dock area',
      'video',
      'update-everyone',
      4,
    );

    await this.modPage.dragAndDropWebcams(e.dropAreaTop);
    await checkScreenshots(
      this,
      'layout should be updated for everyone after dragging and dropping webcam in top dock area',
      'video',
      'update-everyone',
      5,
    );
  }

  async getNewPageTab() {
    return this.modPage.browser.newPage();
  }

  async videoPagination() {
    const pages = [];
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnPresentation);
    await this.modPage.waitAndClickElement(e.updateEveryoneLayoutToggle);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container');

    for (let i = 1; i <= 5; i++) {
      const userName = `User-${i}`;
      const newPage = await this.getNewPageTab();
      const userPage = new Page(this.modPage.browser, newPage, this.modPage?.testInfo);
      await userPage.init(false, {
        fullName: userName,
        meetingId: this.modPage.meetingId,
        testInfo: this.modPage?.testInfo,
      });
      await userPage.waitForSelector(e.whiteboard);
      await userPage.shareWebcam();
      pages.push(userPage);
    }

    await this.modPage.hasElementCount(e.webcamVideoItem, 7, 'should display 7 webcams for the moderator');
    const nextPageVideoPaginationLocator = await this.modPage.page.locator(e.nextPageVideoPagination);
    await expect(
      nextPageVideoPaginationLocator,
      'should not display the next page button for the video pagination',
    ).toBeHidden();
    const previousPageVideoPaginationLocator = await this.modPage.page.locator(e.previousPageVideoPagination);
    await expect(
      previousPageVideoPaginationLocator,
      'should not display the previous page button for the video pagination',
    ).toBeHidden();

    await Promise.all(
      pages.map(async (page) => {
        await page.hasElement(
          e.nextPageVideoPagination,
          'should display the next page button for the video pagination',
        );
        await page.hasElement(
          e.previousPageVideoPagination,
          'should display the previous page button for the video pagination',
        );
      }),
    );
    await this.userPage.hasElementCount(e.webcamVideoItem, 6, 'should display 6 webcams for the attendee');
    await checkScreenshots(this, 'pagination should work for the attendees', 'video', 'pagination');
    await this.userPage.waitAndClick(e.nextPageVideoPagination);
    await this.userPage.hasElementCount(e.webcamVideoItem, 2, 'should display 2 webcams for the attendee');
    await checkScreenshots(this, 'pagination should work for the attendees', 'video', 'pagination-second-page');
  }

  private async attachPageVideos() {
    const { testInfo } = this.modPage;
    if (!testInfo) return;

    // Register future video paths without closing anything — Playwright's fixture
    // teardown closes the context, which writes the .webm files, and the reporter
    // then finds them via these registered paths.
    const modVideoPath = await this.modPage.page.video()?.path();
    if (modVideoPath) {
      testInfo.attachments.push({ name: 'Moderator screen recording', contentType: 'video/webm', path: modVideoPath });
    }

    const userVideoPath = this.userPage ? await this.userPage.page.video()?.path() : undefined;
    if (userVideoPath) {
      testInfo.attachments.push({ name: 'Attendee screen recording', contentType: 'video/webm', path: userVideoPath });
    }

    const user2VideoPath = this.userPage2 ? await this.userPage2.page.video()?.path() : undefined;
    if (user2VideoPath) {
      testInfo.attachments.push({
        name: 'Attendee2 screen recording',
        contentType: 'video/webm',
        path: user2VideoPath,
      });
    }

    const mod2VideoPath = this.modPage2 ? await this.modPage2.page.video()?.path() : undefined;
    if (mod2VideoPath) {
      testInfo.attachments.push({
        name: 'Moderator2 screen recording',
        contentType: 'video/webm',
        path: mod2VideoPath,
      });
    }
  }

  async unifiedLayoutMinimizeShowsTiles() {
    // Wait for the whiteboard canvas to confirm the presentation is fully loaded and
    // the minimize button is in an enabled/clickable state (isThereCurrentPresentation = true).
    await this.modPage.waitForSelector(e.whiteboard);

    await this.modPage.waitAndClick(e.minimizePresentation);
    // Allow the server round-trip that triggers the race condition (layout push → GraphQL
    // subscription → hasMeetingLayout: false→true → first useEffect re-fires) to settle.
    await this.modPage.page.waitForTimeout(3000);

    // Regression: the race condition reset presentationIsOpen=true for the presenter,
    // hiding the camera dock. The moderator must see the camera dock after minimize.
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'presentation should remain hidden for moderator after the layout push settles in unified layout',
    );
    await this.modPage.hasElement(
      e.restorePresentation,
      'restore presentation button should be visible for moderator in unified layout after minimize',
    );
    await this.modPage.hasElement(
      e.cameraDock,
      'camera dock with participant tiles should be visible for moderator after minimizing in unified layout',
    );

    await this.attachPageVideos();
  }

  async unifiedLayoutHidesTilesWhenPresentationVisible() {
    // Wait for the whiteboard so the presentation is fully loaded and the minimize
    // button is enabled.
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // Nobody shares a webcam. Both users join audio and unmute so they become
    // talking, camera-less users (audio-only speakers with a voice floor).
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone({ shouldUnmute: true });
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone({ shouldUnmute: true });

    // Minimize the presentation: in the media-only state the audio-only tiles SHOULD
    // appear. This is the intended feature and must keep working after the fix.
    await this.modPage.waitAndClick(e.minimizePresentation);
    // Fixed wait (matches the sibling test's style): the layout passes through transient
    // states while the audio-only subscription settles, so we wait it out before asserting
    // the tiles are present - otherwise the check could read a transient mid-transition
    // frame instead of the settled state. A settled-attribute signal would be better but
    // is out of scope.
    await this.modPage.page.waitForTimeout(3000);
    await this.modPage.hasElement(
      e.cameraDock,
      'audio-only participant tiles should be shown when the presentation is minimized (media-only state)',
    );

    // Restore the presentation: with no webcams shared and the presentation visible,
    // the speaking-user avatar tiles must NOT be shown at the top (issue #25235). The
    // "who is talking" indicators remain visible in the navbar regardless, so the tiles
    // are redundant and must not steal space from the presentation.
    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.hasElement(e.presentationContainer, 'presentation should be visible again after restore');
    // Fixed wait is load-bearing here: on restore the camera dock re-appears in a transient
    // window before the layout settles, so wasRemoved() would false-pass instantly against
    // that window and miss the regression. We wait the transient out, then assert the dock
    // stays hidden. (A settled-attribute signal would be better but is out of scope; this
    // matches the sibling test's style.)
    await this.modPage.page.waitForTimeout(4000);
    await this.modPage.wasRemoved(
      e.cameraDock,
      'no webcam/avatar tiles should be shown at the top when no webcams are shared and the presentation is visible',
    );
    // The tiles are redundant precisely because the navbar "who is talking" indicator keeps
    // showing the speakers. Assert the indicator is still visible so the redundancy claim is
    // verified, not just asserted in a comment. (Use the single indicator wrapper rather than
    // the per-user isTalking buttons: with both users talking there are several of those, and
    // this matches the sibling breakout test's assertion.)
    await this.modPage.hasElement(
      e.talkingIndicator,
      'the navbar "who is talking" indicator must remain visible after restore, making the top tiles redundant',
    );

    await this.attachPageVideos();
  }

  async unifiedLayoutViewerMinimizeSticksOnCameraChanges() {
    // Wait for the whiteboard so the presentation is fully loaded and the minimize
    // button is enabled on every participant.
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.userPage2.waitForSelector(e.whiteboard);

    // The viewer minimizes the presentation. This is a local action: it does not
    // propagate to the meeting layout record.
    await this.userPage.waitAndClick(e.minimizePresentation);
    await this.userPage.wasRemoved(e.presentationContainer, 'presentation should minimize for the viewer');
    await this.userPage.hasElement(e.restorePresentation, 'restore presentation button should appear for the viewer');

    // A third participant turns their webcam on. This updates the meeting layout
    // record (cameraDockAspectRatio + updatedAt) without changing the meeting's
    // presentation state, and must not clobber the viewer's local minimize.
    await this.userPage2.shareWebcam();
    // Fixed wait (matches the sibling tests' style): the wrongful reopen fires ~2s
    // after the layout record updates, so wait past that window before asserting.
    await this.userPage.page.waitForTimeout(4000);
    await this.userPage.wasRemoved(
      e.presentationContainer,
      'presentation should stay minimized for the viewer after a webcam turns on',
    );
    await this.userPage.hasElement(
      e.restorePresentation,
      'restore presentation button should remain visible for the viewer after a webcam turns on',
    );

    // Same assertion for the symmetric trigger: the webcam turning off also
    // updates the meeting layout record.
    await this.userPage2.waitAndClick(e.leaveVideo);
    await this.userPage2.wasRemoved(
      e.webcamMirroredVideoContainer,
      'webcam should stop sharing for the third participant',
    );
    await this.userPage.page.waitForTimeout(4000);
    await this.userPage.wasRemoved(
      e.presentationContainer,
      'presentation should stay minimized for the viewer after a webcam turns off',
    );
    await this.userPage.hasElement(
      e.restorePresentation,
      'restore presentation button should remain visible for the viewer after a webcam turns off',
    );

    // Control (issue's third control): the presenter minimizing is NOT affected by
    // camera changes - presenters never replicate the meeting layout onto themselves.
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.wasRemoved(e.presentationContainer, 'presentation should minimize for the presenter');
    // Non-regression: the presenter's minimize is a genuine value change in the
    // meeting layout record, so viewers must still follow it.
    await this.userPage2.wasRemoved(
      e.presentationContainer,
      'viewers should follow the presenter minimize (value-change replication)',
    );
    // Share the webcam without the shareWebcam() helper: with the presentation
    // minimized every participant renders as a tile, so the helper's strict-mode
    // check on the connecting placeholder resolves to more than one element.
    await this.userPage2.waitAndClick(e.joinVideo);
    await this.userPage2.hasElement(
      e.webcamMirroredVideoPreview,
      'should display the video preview when sharing webcam',
    );
    await this.userPage2.waitAndClick(e.startSharingWebcam);
    await this.userPage2.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.modPage.page.waitForTimeout(4000);
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'presentation should stay minimized for the presenter after a webcam turns on',
    );

    await this.attachPageVideos();
  }

  async unifiedLayoutViewerFocusFollowSticksOnCameraChanges() {
    // Wait for the whiteboard so the presentation is fully loaded on every participant.
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.userPage2.waitForSelector(e.whiteboard);
    await this.modPage2.waitForSelector(e.whiteboard);

    // Three webcams: the focus action only exists with more than two streams, and
    // it must keep existing after the fourth participant toggles their webcam below.
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();
    await this.userPage2.shareWebcam();

    // The presenter focuses the second attendee's camera. This is a genuine value
    // change of the meeting layout record (cameraWithFocus), so the viewer must
    // still follow it (value-change replication). The focused camera moves to the
    // first tile; without the focus the viewer's own webcam would be first, which
    // makes the assertion discriminating.
    await this.modPage.page.locator(e.dropdownWebcamButton).filter({ hasText: this.userPage2.username }).click();
    await this.modPage.getVisibleLocator(e.focusWebcamBtn).click();
    await this.userPage.hasText(
      `:nth-match(${e.dropdownWebcamButton}, 1)`,
      this.userPage2.username,
      'viewer should follow the presenter focusing a camera (value-change replication)',
    );

    // A fourth participant turns their webcam on: webcam churn is the original
    // trigger of issue 25592 and must not disturb the viewer's followed focus.
    await this.modPage2.shareWebcam();
    // Fixed wait (matches the sibling tests' style): the wrongful re-assert fires
    // ~2s after the layout record updates, so wait past that window before asserting.
    await this.userPage.page.waitForTimeout(4000);
    await this.userPage.hasText(
      `:nth-match(${e.dropdownWebcamButton}, 1)`,
      this.userPage2.username,
      'viewer should keep the followed camera focus after a webcam turns on',
    );

    // The viewer unfocuses locally. This is a local choice that diverges from the
    // meeting layout record, which stays focused on the second attendee. Probe the
    // local state through the tile dropdown - the focused camera's tile offers
    // "unfocus" while focused and "focus" once the local unfocus applied. (The
    // first-tile text is not a safe probe here: hasText matches by containment and
    // the viewer's own username is a prefix of the focused user's.)
    await this.userPage.page.locator(e.dropdownWebcamButton).filter({ hasText: this.userPage2.username }).click();
    await this.userPage.getVisibleLocator(e.unfocusWebcamBtn).click();
    await this.userPage.page.locator(e.dropdownWebcamButton).filter({ hasText: this.userPage2.username }).click();
    // Every tile keeps its dropdown menu in the DOM, so scope the probe to the
    // visible (open) menu.
    await expect(
      this.userPage.getVisibleLocator(e.focusWebcamBtn),
      'the focused camera tile should offer focus again after the viewer unfocuses locally',
    ).toBeVisible();
    await this.userPage.press('Escape');

    // The presenter minimizes and restores the presentation: two genuine meeting
    // layout record writes that do not touch the focused camera. Through the
    // updatedAt clause each write re-asserted the meeting's focused camera onto
    // the viewer, clobbering the local unfocus (issue 25592 mechanism). The viewer
    // is expected to follow the presentation state itself - only the focused
    // camera must keep the local choice.
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.userPage.wasRemoved(
      e.presentationContainer,
      'viewer should follow the presenter minimize (value-change replication)',
    );
    await this.modPage.waitAndClick(e.restorePresentation);
    await this.userPage.hasElement(
      e.presentationContainer,
      'viewer should follow the presenter restore (value-change replication)',
    );
    await this.userPage.page.waitForTimeout(4000);
    await this.userPage.page.locator(e.dropdownWebcamButton).filter({ hasText: this.userPage2.username }).click();
    await expect(
      this.userPage.getVisibleLocator(e.focusWebcamBtn),
      'viewer local unfocus should persist after unrelated meeting layout writes',
    ).toBeVisible();
    await this.userPage.press('Escape');

    // Control: the meeting layout record kept its focused camera - the presenter
    // still renders the focused camera on the first tile.
    await this.modPage.hasText(
      `:nth-match(${e.dropdownWebcamButton}, 1)`,
      this.userPage2.username,
      'presenter should still render the meeting focused camera first',
    );

    await this.attachPageVideos();
  }

  async desktopLayoutRestoredAfterMobileBreakpointRoundTrip() {
    await this.modPage.waitForSelector(e.whiteboard);
    await assertDesktopLayoutActive(this.modPage);

    // crossing into the mobile breakpoint must switch to the mobile layout
    await this.modPage.setHeightWidthViewPortSize(MOBILE_VIEWPORT);
    await assertMobileLayoutActive(this.modPage);

    // crossing back must restore the desktop layout: with the regression the client
    // stayed stuck in the mobile layout until a page reload (issue 25590)
    await this.modPage.setHeightWidthViewPortSize(DESKTOP_VIEWPORT);
    await assertDesktopLayoutActive(this.modPage);

    await this.attachPageVideos();
  }

  async navigationRailToggleStillWorksAfterAutoCollapse() {
    await this.modPage.waitForSelector(e.whiteboard);
    await assertDesktopLayoutActive(this.modPage);

    // entering mobile auto-collapses the rail (asserted inside)
    await this.modPage.setHeightWidthViewPortSize(MOBILE_VIEWPORT);
    await assertMobileLayoutActive(this.modPage);

    // the auto-collapse must not swallow the user's toggle afterwards: the user
    // can still expand the rail and collapse it again
    await this.modPage.waitAndClick(e.toggleSidebarNavigation);
    await assertNavigationRailExpanded(
      this.modPage,
      true,
      'the user should be able to expand the rail after the automatic collapse',
    );
    await this.modPage.waitAndClick(e.toggleSidebarNavigation);
    await assertNavigationRailExpanded(
      this.modPage,
      false,
      'the user should be able to collapse the rail again with the toggle',
    );

    // a rail the user expanded is collapsed again on the next entry into mobile:
    // the collapse fires on every device type change, not only on the first one
    await this.modPage.waitAndClick(e.toggleSidebarNavigation);
    await assertNavigationRailExpanded(
      this.modPage,
      true,
      'the rail should be expanded by the user before the desktop round trip',
    );
    await this.modPage.setHeightWidthViewPortSize(DESKTOP_VIEWPORT);
    await assertDesktopLayoutActive(this.modPage);
    await this.modPage.setHeightWidthViewPortSize(MOBILE_VIEWPORT);
    await assertMobileLayoutActive(this.modPage);

    await this.attachPageVideos();
  }

  async mobileLayoutRestoredAfterDesktopBreakpointRoundTrip() {
    // the context was created with the mobile viewport, so the client mounted mobile
    await assertMobileLayoutActive(this.modPage);

    // widening past the breakpoint must switch to the desktop layout
    await this.modPage.setHeightWidthViewPortSize(DESKTOP_VIEWPORT);
    await assertDesktopLayoutActive(this.modPage);

    // narrowing again must restore the mobile layout: the regression followed the
    // mount-time device type, so mounted-narrow clients got stuck in the desktop
    // layout instead (mirror of issue 25590)
    await this.modPage.setHeightWidthViewPortSize(MOBILE_VIEWPORT);
    await assertMobileLayoutActive(this.modPage);

    await this.attachPageVideos();
  }
}
