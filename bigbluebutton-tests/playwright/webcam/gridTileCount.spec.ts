import { test } from '../core/setup/fixtures';
import {
  BOT_LABEL_SETTINGS,
  GEOMETRY_CLIENT_SETTINGS_OVERRIDE,
  GridTileCount,
  MAX_GRID_SIZE,
  PAGINATION_CLIENT_SETTINGS_OVERRIDE,
  SMALL_GRID_SETTINGS,
} from './gridTileCount';

// Regression test for issue 25073 (backport of PR 25103):
// "Unified Layout: tile count plus aggregated users does not match total participant count".
//
// Each scenario provisions a small grid size per meeting through the
// clientSettingsOverride create module, so the overflow path can be exercised
// with a practical number of webcams. (The issue's own reproduction likewise
// required a custom pagination config.) The server must allow that module
// (allowOverrideClientSettingsOnCreateCall=true); Page.init fails with the
// remedy otherwise. When the effective grid size is larger than MAX_GRID_SIZE
// the test is skipped.
test.describe('Grid layout participant tile count', { tag: '@ci' }, () => {
  test('tile count plus aggregated overflow equals total participants', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const gridTileCount = new GridTileCount(browser, context);
    await gridTileCount.initModPage(page, {
      testInfo,
      createClientSettingsOverride: PAGINATION_CLIENT_SETTINGS_OVERRIDE,
    });

    const gridSize = await gridTileCount.getConfiguredGridSize();
    test.skip(
      !Number.isFinite(gridSize) || gridSize < 1 || gridSize > MAX_GRID_SIZE,
      `requires public.kurento.pagination.desktopGridSizes <= ${MAX_GRID_SIZE} ` +
        `to exercise the overflow path with a practical number of webcams (configured: ${gridSize})`,
    );

    // The test joins gridSize + 1 webcam users sequentially, so the timeout has to
    // scale with the grid size (the default would be too short for large grids).
    test.setTimeout((gridSize + 2) * 25_000 + 60_000);

    await gridTileCount.checkTileCountMatchesParticipants(gridSize);
  });

  // Regression: the overflow tile must never consume a camera slot (grid grows
  // to the page instead), its count must reflect the actually-hidden users, and
  // pagination must reach every camera, ie no camera stranded across pages.
  test(
    'overflow tile never hides a camera and pagination reaches every camera',
    { tag: '@nightly' },
    async ({ browser, context, page }, testInfo) => {
      const gridTileCount = new GridTileCount(browser, context);
      await gridTileCount.initModPage(page, {
        testInfo,
        createClientSettingsOverride: PAGINATION_CLIENT_SETTINGS_OVERRIDE,
      });

      const gridSize = await gridTileCount.getConfiguredGridSize();
      test.skip(
        !Number.isFinite(gridSize) || gridSize < 1 || gridSize > MAX_GRID_SIZE,
        `requires public.kurento.pagination.desktopGridSizes <= ${MAX_GRID_SIZE} ` +
          `to exercise the overflow path with a practical number of webcams (configured: ${gridSize})`,
      );

      // Encodes "page size == grid size" (full-camera first page + a second
      // page), provisioned above; the guard reads the effective settings.
      const pageSize = await gridTileCount.getEffectiveModeratorPageSize(gridSize + 2);
      test.skip(
        pageSize !== gridSize,
        `effective moderator page size (${pageSize}) must equal the grid size (${gridSize}) - ` +
          'configure a matching paginationThresholds entry',
      );

      test.setTimeout((gridSize + 2) * 25_000 + 60_000);

      await gridTileCount.checkCameraPrecedenceAcrossPages(gridSize);
    },
  );

  // Regression: the overflow tile mounting on an otherwise unchanged grid (a
  // camera-less late join) must trigger a grid-template recompute; a stale
  // template squashes the tile into an implicit auto-height row. Provisions
  // the smallest grid (2) that exercises the mechanism to keep CI cost down.
  test('overflow tile keeps camera-cell geometry when appearing on a static grid', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const gridTileCount = new GridTileCount(browser, context);
    await gridTileCount.initModPage(page, {
      testInfo,
      createClientSettingsOverride: GEOMETRY_CLIENT_SETTINGS_OVERRIDE,
    });

    const gridSize = await gridTileCount.getConfiguredGridSize();
    test.skip(
      !Number.isFinite(gridSize) || gridSize < 1 || gridSize > MAX_GRID_SIZE,
      `requires public.kurento.pagination.desktopGridSizes <= ${MAX_GRID_SIZE} ` +
        `to exercise the overflow path with a practical number of webcams (configured: ${gridSize})`,
    );

    test.setTimeout((gridSize + 2) * 25_000 + 60_000);

    await gridTileCount.checkOverflowTileGeometryOnLateJoin(gridSize);
  });
});

// Regression tests for issue 25826. A bot without a camera must not count as a hidden grid user.
test.describe('Grid layout with bots', { tag: '@ci' }, () => {
  test('a bot joining and leaving does not replace the moderator avatar', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const grid = new GridTileCount(browser, context);
    await grid.initModPage(page, { testInfo, clientSettingsOverrides: BOT_LABEL_SETTINGS });
    await grid.checkModeratorAvatarWithBot();
  });

  test('a bot without a camera does not add an overflow tile beside the moderator camera', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const grid = new GridTileCount(browser, context);
    await grid.initModPage(page, { testInfo, clientSettingsOverrides: BOT_LABEL_SETTINGS });
    await grid.checkModeratorCameraWithBot();
  });

  test(
    'a bot joining and leaving does not change the hidden human count',
    { tag: '@nightly' },
    async ({ browser, context, page }, testInfo) => {
      const grid = new GridTileCount(browser, context);
      await grid.initModPage(page, { testInfo, clientSettingsOverrides: SMALL_GRID_SETTINGS });
      await grid.checkHumanOverflowWithBot();
    },
  );

  test('a bot camera is reachable across pages and stops counting when its camera stops', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const grid = new GridTileCount(browser, context);
    await grid.initModPage(page, { testInfo, clientSettingsOverrides: SMALL_GRID_SETTINGS });
    await grid.checkBotCameraAcrossPages();
  });
});
