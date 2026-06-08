import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

// Above this grid size, exceeding the grid would require too many simultaneous
// webcams to be practical in CI. The environment under test must therefore set
// public.kurento.pagination.desktopGridSizes to a small value (the issue's own
// reproduction also required a custom pagination config). It can be raised via
// GRID_TILE_COUNT_MAX_GRID_SIZE on a host with enough capacity to run the exact
// pagination config from the issue (e.g. 24).
export const MAX_GRID_SIZE = Number(process.env.GRID_TILE_COUNT_MAX_GRID_SIZE) || 8;

export class GridTileCount extends MultiUsers {
  // Reads the effective grid size delivered to the client through meetingClientSettings.
  async getConfiguredGridSize(): Promise<number> {
    return this.modPage.page.evaluate(() => {
      // @ts-ignore - injected on window by the client at runtime
      const sizes = window.meetingClientSettings?.public?.kurento?.pagination?.desktopGridSizes;
      return Number(sizes?.viewer ?? sizes?.moderator);
    });
  }

  // Reproduces issue 25073: in the grid (video focus) layout, when the number of
  // webcams exceeds the grid size, the sum of the visible tiles and the aggregated
  // "+N" overflow tile must equal the total number of participants, and the number
  // of visible tiles must never exceed the configured grid size.
  async checkTileCountMatchesParticipants(gridSize: number): Promise<void> {
    // One webcam more than the grid size guarantees the overflow tile appears.
    const webcamUsers = gridSize + 1;
    const totalParticipants = webcamUsers + 1; // + the moderator (observer, no webcam)

    const viewers: Page[] = [];
    for (let i = 0; i < webcamUsers; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const viewerPage = await this.context.newPage();
      const viewer = new Page(this.browser, viewerPage, this.modPage.testInfo);
      // eslint-disable-next-line no-await-in-loop
      await viewer.init(false, {
        fullName: `Attendee${i + 1}`,
        meetingId: this.modPage.meetingId,
      });
      // eslint-disable-next-line no-await-in-loop
      await viewer.shareWebcam({ shouldConfirmSharing: true });
      viewers.push(viewer);
    }

    // Switch the moderator to the grid (video focus) layout, which renders every
    // participant as a tile.
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnVideo);
    await this.modPage.waitAndClick(e.updateLayoutBtn);

    // The layout may keep a second, off-screen video list for measurement. Both are
    // the same component rendering the same data, so scope the counts to the single
    // list that owns an overflow tile (its tiles are siblings of the overflow tile).
    const overflowTile = this.modPage.page.locator(e.overflowTile).first();
    await expect(
      overflowTile,
      'the aggregated overflow tile should appear when webcams exceed the grid size',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    const videoList = overflowTile.locator('xpath=..');
    const visibleTiles = await videoList.locator(e.webcamVideoItem).count();
    const overflowText = await overflowTile.innerText();
    const overflowCount = Number(overflowText.match(/\+\s*(\d+)/)?.[1] ?? '0');

    // Core invariant from the bug report: visible tiles + aggregated users === total participants.
    expect(
      visibleTiles + overflowCount,
      `visible tiles (${visibleTiles}) plus aggregated overflow (${overflowCount}) ` +
        `should equal the ${totalParticipants} participants`,
    ).toBe(totalParticipants);

    // The grid must never render more tiles than its configured size.
    expect(
      visibleTiles,
      `visible tiles (${visibleTiles}) should not exceed the grid size (${gridSize})`,
    ).toBeLessThanOrEqual(gridSize);
  }
}
