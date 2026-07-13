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

export const TARGET_GRID_SIZE = 4;

// Pagination config these scenarios encode, provisioned per-meeting as a
// clientSettingsOverride create module (bbb-web only reads the inline
// override from the POST body); the spec guards skip (naming the remedies)
// when it doesn't take effect.
const PAGINATION_SETTINGS_JSON = JSON.stringify({
  public: {
    kurento: {
      pagination: {
        desktopGridSizes: { moderator: TARGET_GRID_SIZE, viewer: TARGET_GRID_SIZE },
      },
      paginationThresholds: {
        enabled: true,
        thresholds: [
          {
            users: TARGET_GRID_SIZE,
            desktopPageSizes: { moderator: TARGET_GRID_SIZE, viewer: TARGET_GRID_SIZE },
          },
        ],
      },
    },
  },
});

export const PAGINATION_CLIENT_SETTINGS_MODULE = [
  '<modules><module name="clientSettingsOverride"><![CDATA[',
  PAGINATION_SETTINGS_JSON,
  ']]></module></modules>',
].join('');

// The geometry scenario is grid-size-agnostic, so it provisions the smallest
// grid that exercises the mechanism: 3 participants instead of 5.
export const GEOMETRY_GRID_SIZE = 2;

export const GEOMETRY_CLIENT_SETTINGS_MODULE = [
  '<modules><module name="clientSettingsOverride"><![CDATA[',
  JSON.stringify({
    public: {
      kurento: {
        pagination: {
          desktopGridSizes: { moderator: GEOMETRY_GRID_SIZE, viewer: GEOMETRY_GRID_SIZE },
        },
      },
    },
  }),
  ']]></module></modules>',
].join('');

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

    // Grid mode in this client (Unified Layout) = minimizing the presentation,
    // which renders every participant as a tile.
    await this.modPage.waitAndClick(e.minimizePresentation);

    const videoList = this.modPage.page.locator(e.webcamVideoList);
    const overflowTile = videoList.locator(e.overflowTile);
    await expect(
      overflowTile,
      'the aggregated overflow tile should appear when webcams exceed the grid size',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    const visibleTiles = await videoList.locator(e.webcamVideoItem).count();
    const overflowCount = Number(await overflowTile.getAttribute('data-overflow-count'));

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

  // Effective moderator page size for a given user count, mirroring the
  // client's threshold resolution: paginationThresholds (when enabled)
  // override the base desktopPageSizes once the user count reaches them.
  async getEffectiveModeratorPageSize(userCount: number): Promise<number> {
    return this.modPage.page.evaluate((count) => {
      // @ts-ignore - injected on window by the client at runtime
      const pagination = window.meetingClientSettings?.public?.kurento?.pagination;
      // @ts-ignore - injected on window by the client at runtime
      const thresholdsConf = window.meetingClientSettings?.public?.kurento?.paginationThresholds;
      let size = Number(pagination?.desktopPageSizes?.moderator ?? 0);
      if (thresholdsConf?.enabled && Array.isArray(thresholdsConf.thresholds)) {
        const applicable = thresholdsConf.thresholds
          .filter((t: { users: number }) => t.users <= count)
          .sort((a: { users: number }, b: { users: number }) => b.users - a.users)[0];
        if (applicable?.desktopPageSizes?.moderator != null) {
          size = Number(applicable.desktopPageSizes.moderator);
        }
      }
      return size;
    }, userCount);
  }

  // Regression for the grid-mode camera-precedence bug: the "+N" overflow tile
  // must never consume a camera's slot (a full page of cameras stays fully
  // visible, ie "grid == page"), the aggregated count must reflect the users
  // actually hidden, and page navigation must reach every active camera (no
  // camera may be unreachable on all pages).
  async checkCameraPrecedenceAcrossPages(gridSize: number): Promise<void> {
    // One camera more than the page size forces both a full-camera first page
    // and a second page.
    const webcamUsers = gridSize + 1;
    const totalParticipants = webcamUsers + 1; // + the moderator (observer, no webcam)
    const expectedNames: string[] = [];

    for (let i = 0; i < webcamUsers; i += 1) {
      const name = `Attendee${i + 1}`;
      // eslint-disable-next-line no-await-in-loop
      const viewerPage = await this.context.newPage();
      const viewer = new Page(this.browser, viewerPage, this.modPage.testInfo);
      // eslint-disable-next-line no-await-in-loop
      await viewer.init(false, {
        fullName: name,
        meetingId: this.modPage.meetingId,
      });
      // eslint-disable-next-line no-await-in-loop
      await viewer.shareWebcam({ shouldConfirmSharing: true });
      expectedNames.push(name);
    }

    // Grid mode in this client (Unified Layout) = minimizing the presentation.
    await this.modPage.waitAndClick(e.minimizePresentation);

    const videoList = this.modPage.page.locator(e.webcamVideoList);
    const overflowTile = videoList.locator(e.overflowTile);
    await expect(overflowTile, 'the aggregated overflow tile should appear (hidden users exist)').toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });

    const cameraTiles = videoList.locator(e.webcamStreamItem);

    // Camera precedence: the first page holds pageSize (== grid size here)
    // cameras, and the overflow tile must not have eaten one of them.
    await expect(
      cameraTiles,
      `a full page of ${gridSize} cameras must stay visible, ie the overflow tile must not consume a camera slot`,
    ).toHaveCount(gridSize, { timeout: ELEMENT_WAIT_LONGER_TIME });

    // Truthful aggregation: hidden users = participants − visible cameras
    // (no avatar was replaced, so no +1 correction applies).
    const overflowCount = Number(await overflowTile.getAttribute('data-overflow-count'));
    expect(
      overflowCount,
      `the overflow tile should count exactly the hidden users (${totalParticipants} − ${gridSize} visible cameras)`,
    ).toBe(totalParticipants - gridSize);

    // Geometry: the tile occupies a regular grid cell. A stale grid template
    // (not recomputed for the extra tile) drops it into an implicit auto-height
    // row, rendering it as a thin strip instead of a camera-sized cell.
    const tileBox = await overflowTile.boundingBox();
    const cameraBox = await cameraTiles.first().boundingBox();
    expect(tileBox, 'the overflow tile must have a bounding box').not.toBeNull();
    expect(cameraBox, 'camera tiles must have a bounding box').not.toBeNull();
    expect(
      Math.abs((tileBox?.height ?? 0) - (cameraBox?.height ?? 1)),
      `the overflow tile (${tileBox?.height}px) must be as tall as a camera cell (${cameraBox?.height}px)`,
    ).toBeLessThanOrEqual(2);

    // Reachability: every camera must be visible on some page.
    const cameraNames = async () =>
      cameraTiles.evaluateAll((tiles) => tiles.map((tile) => tile.getAttribute('data-user-name') ?? ''));
    const seenNames = new Set<string>(await cameraNames());
    const page1Signature = [...seenNames].sort().join('|');

    await this.modPage.waitAndClick(e.nextPageVideoPagination);
    await expect
      .poll(async () => (await cameraNames()).sort().join('|'), {
        message: 'navigating to the next page should change the visible cameras',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .not.toBe(page1Signature);

    (await cameraNames()).forEach((name) => seenNames.add(name));
    expectedNames.forEach((name) => {
      expect(seenNames.has(name), `camera of ${name} must be reachable on some page (no camera may be stranded)`).toBe(
        true,
      );
    });
  }

  // Regression for the squashed overflow tile: when the tile mounts on an
  // otherwise unchanged grid (a user joins without a camera, so no stream or
  // dock resize accompanies it), the grid template must be recomputed for the
  // extra tile; a stale template drops it into an implicit auto-height row.
  async checkOverflowTileGeometryOnLateJoin(gridSize: number): Promise<void> {
    // Everyone on the grid has a camera: moderator + (gridSize - 1) attendees.
    await this.modPage.shareWebcam();
    for (let i = 0; i < gridSize - 1; i += 1) {
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
    }

    // Grid mode with a full page of cameras and no hidden users: no tile yet.
    await this.modPage.waitAndClick(e.minimizePresentation);
    const videoList = this.modPage.page.locator(e.webcamVideoList);
    const overflowTile = videoList.locator(e.overflowTile);
    const cameraTiles = videoList.locator(e.webcamStreamItem);
    await expect(cameraTiles, `all ${gridSize} cameras should be on the grid before the late join`).toHaveCount(
      gridSize,
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
    await expect(overflowTile, 'no overflow tile while nobody is hidden').toBeHidden();

    // A user joins WITHOUT a camera: the tile mounts with no stream change.
    const lateViewerPage = await this.context.newPage();
    const lateViewer = new Page(this.browser, lateViewerPage, this.modPage.testInfo);
    await lateViewer.init(false, {
      fullName: 'LateJoiner',
      meetingId: this.modPage.meetingId,
    });
    await expect(overflowTile, 'the overflow tile should appear for the camera-less late joiner').toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });

    // The tile must occupy a regular, camera-sized grid cell.
    const tileBox = await overflowTile.boundingBox();
    const cameraBox = await cameraTiles.first().boundingBox();
    expect(tileBox, 'the overflow tile must have a bounding box').not.toBeNull();
    expect(cameraBox, 'camera tiles must have a bounding box').not.toBeNull();
    expect(
      Math.abs((tileBox?.height ?? 0) - (cameraBox?.height ?? 1)),
      `the overflow tile (${tileBox?.height}px) must be as tall as a camera cell (${cameraBox?.height}px)`,
    ).toBeLessThanOrEqual(2);
    expect(
      Math.abs((tileBox?.width ?? 0) - (cameraBox?.width ?? 1)),
      `the overflow tile (${tileBox?.width}px) must be as wide as a camera cell (${cameraBox?.width}px)`,
    ).toBeLessThanOrEqual(2);
  }
}
