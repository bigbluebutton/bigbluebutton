# Layout

The page is laid out by CSS. JavaScript decides the *semantic* state of the layout (which layout, which
sidebars are open, where the cameras sit, what the user resized) and writes it on `#layout` as data
attributes and custom properties; the stylesheet in `shell/styles.ts` turns that state into the boxes of
the regions. Nothing outside `layout-manager/` and `context.jsx` reads geometry from the layout state.

The layout managers in `layout-manager/` still run and still keep the layout state (input, sidebar
widths, the stored camera dock size). Their output is no longer read by any component.

## How it fits together

```
layout state (context.jsx) ──► shell/useLayoutShell.ts ──► shell/shellState.ts
                                   │                            │
                                   │                      attributes + custom properties
                                   ▼                            ▼
                          shell/context.ts            <div id="layout" data-… style="--…">
                    (regions that act in JS)                    │
                                                     shell/styles.ts (createGlobalStyle)
                                                                │
                                         [data-layout-region="…"] boxes
```

- `shell/selectors.ts`: the engine's semantic decisions as pure functions (dock position and state,
  whether the media box has an area, which dock edges resize, whether the dock drags).
- `shell/shellState.ts`: maps the layout state to the attributes and custom properties of `#layout`.
- `shell/useLayoutShell.ts`: selects each field from the layout state on its own, so `#layout` re-renders
  on a semantic change only, never on a window resize.
- `shell/styles.ts`: the CSS layout. Every rule names the engine formula it reproduces.
- `shell/context.ts`: the shell state for the few regions that act on it in JS (the presentation
  unmounts while the media box has no area; the dock reads its position and edges).
- `shell/ResizeHandle.tsx`: the resize handle of the sidebars and the camera dock (Pointer Events with
  pointer capture, one report per animation frame, primary button only).
- `shell/mediaOnlyFit.ts`: measures the mediaOnly area for the content fit (see below).

## Regions

Every region is an absolutely positioned descendant of `#layout` whose containing block is `<body>`
(`position: fixed`, the size of the window). A percentage in a horizontal property is therefore a share
of the window width, one in a vertical property a share of the window height. The rules never mix axes;
the one engine formula that did (the dock below the sidebar adds 1% of the width to a vertical position)
uses `1vw`.

| `data-layout-region` | Element |
|---|---|
| `navbar` | the nav bar (`header#Navbar`) |
| `actionbar`, `actionbar-inner` | the actions bar and its inner row |
| `sidebar-navigation` | the navigation sidebar |
| `sidebar-content`, `sidebar-content-auxiliary` | the sidebar backdrops |
| `sidebar-panel` | the panel inside a sidebar backdrop |
| `presentation`, `screenshare`, `external-video`, `generic-content`, `pinned-notes` | the media regions |
| `captions` | live captions |
| `camera-dock` | the camera dock's box (`#cameraDock` fills it) |
| `camera-dock-limit` | an invisible box as wide as a side dock may be (presenter clamp) |
| `drop-zone`, `drop-zone-bg` | the dock's drop zones while dragging (`data-zone` = position) |
| `media-only-area` | an invisible box the size of the mediaOnly media area (measured) |

## Data attributes on `#layout`

| Attribute | Values | Source |
|---|---|---|
| `data-shell-layout` | `unified`, `camerasOnly`, `presentationOnly`, `participantsAndChatOnly`, `mediaOnly` (unknown types render as unified) | `layoutType`; absent while an enforced layout loads (`waitLayout`) |
| `data-layout` | same | still written by the layout engine; kept for the contract with plugins and tests |
| `data-cam-position` | a dock position | still written after a drop only, as before |
| `data-device` | `mobile`, `tablet_portrait`, `tablet_landscape`, `tablet`, `desktop` | `deviceType` |
| `data-navbar` | `full`, `half`, `hidden` | `hasNavBar`, `bbb_hide_controls` |
| `data-actionbar` | `shown`, `hidden` | `hasActionBar` |
| `data-banners` | `0`, `1`, `2` | banner bar + notifications bar |
| `data-mobile`, `data-rtl` | flag | device type, locale direction |
| `data-nav-open`, `data-content-open`, `data-aux-open` | flag | sidebar inputs |
| `data-cameras` | flag | at least one camera stream |
| `data-presentation-open`, `data-has-slides`, `data-media-off` | flag | presentation input, slides, no media content at all |
| `data-dock` | a dock position, or empty | `cameraDockPosition` (phone landscape forces `contentRight`) |
| `data-dock-state` | `hidden`, `fill`, `fullscreen`, `positioned` | `cameraDockState` (engine branch order) |
| `data-dock-enforced`, `data-phone-landscape` | flag | phone landscape side-by-side lock |
| `data-dragging`, `data-resizing` | flag | camera dock input |
| `data-presenter` | flag | the current user presents (side dock limit) |
| `data-fullscreen-media` | flag | a media region is in fullscreen |
| `data-media-beside-dock` | flag | the media box makes room for the dock |
| `data-media-box` | `none`, `zero`, `negative` | `mediaBoxCollapse` |
| `data-media-only-fit` | `height`, `width`, `none` | mediaOnly only, `mediaOnlyFit.ts` |

## Custom properties

Set by JavaScript (the user's sizes and measured values), inline on `#layout`:

| Property | Meaning |
|---|---|
| `--bbb-sidebar-content-size`, `--bbb-sidebar-aux-size` | the width the user dragged a sidebar to (absent: 20% default) |
| `--bbb-camera-dock-size` | the dock size along its axis: live while resizing, else the stored one (absent: default) |
| `--bbb-camera-grid-width`, `--bbb-camera-grid-height` | the camera grid size, the dock's size while dragged |
| `--bbb-media-only-ratio` | mediaOnly: the content's aspect ratio |
| `--bbb-media-only-width`, `--bbb-media-only-height` | mediaOnly: the measured media area, in px |

Derived in CSS (read them, do not set them): `--bbb-banners`, `--bbb-navbar-height`,
`--bbb-actionbar-height`, `--bbb-nav-width`, `--bbb-nav-space`, `--bbb-content-width`, `--bbb-aux-width`,
`--bbb-sidebars-width`, `--bbb-sidebar-space`, `--bbb-media-left`, `--bbb-media-width`,
`--bbb-media-height`, `--bbb-media-top`, `--bbb-work-width`, `--bbb-work-height`, `--bbb-dock-*`,
`--bbb-mb-*` (the media box), `--bbb-hcd`, `--bbb-dz-*`, `--bbb-mo-*`.

## Constants and their sources

| Constant | Value | Source |
|---|---|---|
| banner / notification bar | 34 px each | `defaultValues.bannerHeight` |
| nav bar | 85 px; 42.5 px with `bbb_hide_controls` | `defaultValues.navBarHeight` |
| actions bar | `3rem + 22.4px` (inner `3rem`, padding 11.2 px) | `layoutEngine calculatesActionbarHeight` |
| navigation sidebar | `60px + 2%` desktop, 48 px floating on phones | `SIDEBAR_NAVIGATION_PANEL_WIDTH`, `SIDEBAR_NAVIGATION_MARGIN_PERCENTAGE_WIDTH`, `defaultValues.sidebarNavWidthMobile` |
| sidebar content | 20% by default, between 283.2 and 800 px; full width on phones | `defaultValues.sidebarContentMinWidth`, `sidebarContentMaxWidth` |
| margin to the media | 1% of the width; 4vh above and below the panel | `general.contentSidebarMarginToMedia`, `contentSidebarVerticalMargin` |
| camera dock | 20% by default, at least 120 px, leaving 120 px; side docks at most 80% (presenter: area less 440 px); phone landscape 25% | `unifiedLayout calculatesCameraDockBounds` |
| dock gaps | 10 px from a top or bottom dock, 20 px from a side dock, 20 px below a side dock | `unifiedLayout calculatesMediaBounds` |
| drop zones | 100 px bands, fixed 85 px nav bar | `unifiedLayout calculatesDropAreas` |
| mediaOnly | 10 px margin; content up to 80%; cameras as if the content were 430 px wide | `mediaOnlyLayout` |

## Adding a region

1. Give the region's root element `data-layout-region="<name>"` and remove any inline geometry.
2. If its box depends on new state, add the field to `ShellInputs` / `ShellState`, select it in
   `useLayoutShell.ts` on its own, and expose it in `shellState.ts` as a data attribute (a decision) or a
   custom property (a size the user chose). Add the cases to `shellState.test.ts`.
3. Write the rule in `shell/styles.ts`: one axis per property, `min(max())` rather than `clamp()` where a
   formula can invert, and a comment naming the formula it follows.
4. If another component needs the region's rendered size, measure it where it renders with
   `useMeasureRegion` (`measuredRegions.ts`) and read it with `useRegionSize`.
5. Pin the box in a geometry golden (`bigbluebutton-tests/playwright/layouts/geometry`).

## Components that measure themselves

| Component | What | Who reads it |
|---|---|---|
| presentation (`presentation/container.jsx`) | its own box (`useElementSize`) | the slide fit and the toolbar |
| sidebar content backdrop | `useMeasureRegion('sidebarContent')` | poll charts, the user list's crowd buttons |
| camera dock (`#cameraDock`) | `useMeasureRegion('cameraDock', { hold: isDragging })` | the push-layout rate |
| camera dock | its own box at resize start and end, the `camera-dock-limit` box | the stored dock size, the presenter clamp |
| sidebar backdrops | their own box at resize start | the stored sidebar width |
| mediaOnly area | `media-only-area` (`mediaOnlyFit.ts`) | `--bbb-media-only-*`, `data-media-only-fit` |

## Push layout rate

The presenter pushes the dock position (`data-dock`'s value) and a rate: for a left or right dock the
dock's rendered width over the window width, otherwise its rendered height over the window height,
rounded to 2 decimals and held within [0, 1] (`push-layout/service.ts`). The size is the measured
`#cameraDock` box, held at its committed size during a drag. A phone in landscape keeps its forced dock
position to itself.

## CSS features

| Feature | Chrome | Firefox | Safari |
|---|---|---|---|
| custom properties | 49 | 31 | 9.1 |
| `calc()` (incl. a length divided by a number) | 26 | 16 | 7 |
| `min()` / `max()` | 79 | 75 | 11.1 |
| `:not()` with a single argument | 1 | 1 | 3.1 |
| `vw` / `vh` | 26 | 19 | 6.1 |
| ResizeObserver | 64 | 69 | 13.1 |
| Pointer Events, `setPointerCapture` | 55 | 59 | 13 |
