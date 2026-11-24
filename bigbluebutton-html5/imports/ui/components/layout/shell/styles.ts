import { createGlobalStyle } from 'styled-components';

/*
 * The CSS layout. Every region is an absolutely positioned child of #layout whose containing block is
 * <body> (position: fixed, the size of the viewport), so a percentage in a horizontal property is a share
 * of the window width and one in a vertical property a share of the window height. The rules transcribe
 * the box formulas of the layout engine (layout-manager/*.jsx) one to one; each constant names its source.
 * #layout carries the semantic state as data attributes and the sizes the user chose as custom properties
 * (layout/shell/shellState.ts).
 */
const LayoutShellStyles = createGlobalStyle`
  #layout {
    /* banners: 34 px reserved per bar (defaultValues.bannerHeight) */
    --bbb-banners: 0px;
    /* nav bar: 85 px (defaultValues.navBarHeight), half with bbb_hide_controls, 0 when hidden */
    --bbb-navbar-height: 85px;
    /* actions bar: (42 / 14) * fontSize + 2 * 11.2 px (layoutEngine calculatesActionbarHeight) */
    --bbb-actionbar-height: calc(3rem + 22.4px);
    --bbb-actionbar-inner-height: 3rem;
    --bbb-actionbar-padding: 11.2px;

    /* sidebar navigation: 60 px + 2 x 1% of the width on desktop; 48 px floating on phones */
    --bbb-nav-width: 0px;
    --bbb-nav-space: 0px;

    /* sidebar content and auxiliary: clamp(283.2px, the user's width or 20%, 800px); full width on phones */
    --bbb-content-width: 0px;
    --bbb-aux-width: 0px;
    --bbb-sidebars-width: calc(var(--bbb-content-width) + var(--bbb-aux-width));
    --bbb-sidebar-space: calc(var(--bbb-nav-space) + var(--bbb-sidebars-width));

    /* the engine's media area M (calculatesMediaAreaBounds) */
    --bbb-media-left: var(--bbb-sidebar-space);
    --bbb-media-width: calc(100% - var(--bbb-sidebar-space) - 1%);
    --bbb-media-height: calc(100% - var(--bbb-navbar-height) - var(--bbb-actionbar-height) - var(--bbb-banners));
    --bbb-media-top: calc(var(--bbb-navbar-height) + var(--bbb-banners));
    /* the media working box (unifiedLayout calculatesMediaBounds): a fixed 85 px for the nav bar */
    --bbb-work-width: calc(100% - var(--bbb-sidebar-space) - 1%);
    --bbb-work-height: calc(100% - 85px - var(--bbb-actionbar-height) - var(--bbb-banners));
  }

  #layout[data-banners="1"] { --bbb-banners: 34px; }
  #layout[data-banners="2"] { --bbb-banners: 68px; }
  #layout[data-navbar="half"] { --bbb-navbar-height: 42.5px; }
  #layout[data-navbar="hidden"] { --bbb-navbar-height: 0px; }
  #layout[data-actionbar="hidden"] {
    --bbb-actionbar-height: 0px;
    --bbb-actionbar-inner-height: 0px;
    --bbb-actionbar-padding: 0px;
  }

  #layout[data-nav-open] {
    --bbb-nav-width: calc(60px + 2%);
    --bbb-nav-space: var(--bbb-nav-width);
  }
  #layout[data-nav-open][data-mobile] {
    --bbb-nav-width: 48px;
    --bbb-nav-space: 0px;
  }

  #layout[data-content-open] {
    --bbb-content-width: min(max(var(--bbb-sidebar-content-size, 20%), 283.2px), 800px);
  }
  #layout[data-aux-open] {
    --bbb-aux-width: min(max(var(--bbb-sidebar-aux-size, 20%), 283.2px), 800px);
  }
  #layout[data-content-open][data-mobile] { --bbb-content-width: 100%; }
  #layout[data-aux-open][data-mobile] { --bbb-aux-width: 100%; }

  #layout[data-rtl] { --bbb-media-left: 0px; }
  #layout[data-mobile] {
    --bbb-media-left: 0px;
    --bbb-media-width: 100%;
    --bbb-work-width: calc(100% - var(--bbb-sidebars-width));
  }

  /* nav bar (unifiedLayout SET_NAVBAR_OUTPUT): pinned to the physical left in RTL, not mirrored */
  #layout [data-layout-region="navbar"] {
    position: absolute;
    top: var(--bbb-banners);
    left: var(--bbb-media-left);
    width: var(--bbb-media-width);
    height: var(--bbb-navbar-height);
  }

  /* actions bar (SET_ACTIONBAR_OUTPUT) */
  #layout [data-layout-region="actionbar"] {
    position: absolute;
    top: calc(100% - var(--bbb-actionbar-height));
    left: var(--bbb-media-left);
    width: var(--bbb-media-width);
    height: var(--bbb-actionbar-height);
    padding: var(--bbb-actionbar-padding);
  }
  #layout [data-layout-region="actionbar"] > [data-layout-region="actionbar-inner"] {
    height: var(--bbb-actionbar-inner-height);
  }

  /* sidebar navigation (calculatesSidebarNavBounds) */
  #layout [data-layout-region="sidebar-navigation"] {
    position: absolute;
    top: var(--bbb-banners);
    left: 0;
    width: var(--bbb-nav-width);
    height: calc(100% - var(--bbb-banners));
    z-index: 2;
  }
  #layout[data-rtl] [data-layout-region="sidebar-navigation"] { left: auto; right: 0; }
  #layout[data-mobile] [data-layout-region="sidebar-navigation"] {
    top: calc(var(--bbb-banners) + 0.8rem);
    left: 5px;
    height: calc(98% - var(--bbb-actionbar-height) - 20px);
    z-index: 12;
  }
  #layout[data-mobile][data-rtl] [data-layout-region="sidebar-navigation"] { left: auto; right: 5px; }
  #layout [data-layout-region="sidebar-navigation"][data-collapsed] { height: 0; }

  /* sidebar content and auxiliary (calculatesSidebarContentBounds, calculatesSidebarContentHeight) */
  #layout {
    --bbb-sidebar-height: calc(100% - var(--bbb-banners));
    --bbb-sidebar-top: var(--bbb-banners);
  }
  #layout[data-mobile] {
    --bbb-sidebar-height: calc(100% - 85px - var(--bbb-banners));
    --bbb-sidebar-top: calc(85px + var(--bbb-banners));
  }
  #layout [data-layout-region="sidebar-content"],
  #layout [data-layout-region="sidebar-content-auxiliary"] {
    position: absolute;
    top: var(--bbb-sidebar-top);
    height: var(--bbb-sidebar-height);
    max-width: 800px;
    min-height: 300px;
  }
  #layout[data-mobile] [data-layout-region="sidebar-content"],
  #layout[data-mobile] [data-layout-region="sidebar-content-auxiliary"] { max-width: 100%; }
  #layout [data-layout-region="sidebar-content"] {
    left: var(--bbb-nav-space);
    width: var(--bbb-content-width);
  }
  #layout [data-layout-region="sidebar-content-auxiliary"] {
    left: calc(var(--bbb-nav-space) + var(--bbb-content-width));
    width: var(--bbb-aux-width);
  }
  #layout[data-rtl] [data-layout-region="sidebar-content"] {
    left: auto;
    right: var(--bbb-nav-space);
  }
  #layout[data-rtl] [data-layout-region="sidebar-content-auxiliary"] {
    left: auto;
    right: calc(var(--bbb-nav-space) + var(--bbb-content-width));
  }
  /* the panel inside the backdrop (its containing block): less the 1% margin to the media and the
     2 x 4% vertical margins (sidebar-content/component.tsx innerPanel) */
  #layout [data-layout-region="sidebar-content"] > [data-layout-region="sidebar-panel"],
  #layout [data-layout-region="sidebar-content-auxiliary"] > [data-layout-region="sidebar-panel"] {
    position: absolute;
    display: flex;
    width: calc(100% - 1vw);
    height: calc(100% - 8vh);
    z-index: 2;
  }
  #layout[data-mobile] [data-layout-region="sidebar-content"] > [data-layout-region="sidebar-panel"],
  #layout[data-mobile] [data-layout-region="sidebar-content-auxiliary"] > [data-layout-region="sidebar-panel"] {
    width: 100%;
    height: 100%;
    z-index: 11;
  }

  /* camera dock size along its axis (calculatesCameraDockBounds): the user's size or 20% of the media
     area, at least 120 px and leaving 120 px; min(max()) because the engine inverts when the area is
     under 240 px. Locked side by side on a phone: 25%, never under 120 px. */
  #layout {
    --bbb-dock-positioned-h: min(
      max(var(--bbb-camera-dock-size, calc(var(--bbb-media-height) * 0.2)), 120px),
      calc(var(--bbb-media-height) - 120px)
    );
    --bbb-dock-positioned-w: min(
      max(var(--bbb-camera-dock-size, calc(var(--bbb-media-width) * 0.2)), 120px),
      calc(var(--bbb-media-width) - 120px)
    );
    --bbb-dock-h: 0px;
    --bbb-dock-w: 0px;
  }
  #layout[data-dock-state="positioned"][data-dock="contentTop"],
  #layout[data-dock-state="positioned"][data-dock="contentBottom"] {
    --bbb-dock-h: var(--bbb-dock-positioned-h);
  }
  #layout[data-dock-state="positioned"][data-dock="contentLeft"],
  #layout[data-dock-state="positioned"][data-dock="contentRight"] {
    --bbb-dock-w: var(--bbb-dock-positioned-w);
  }
  #layout[data-dock-state="positioned"][data-dock-enforced] {
    --bbb-dock-w: min(
      max(calc(var(--bbb-media-width) * 0.25), 120px),
      max(calc(var(--bbb-media-width) - 120px), 120px)
    );
  }
  #layout[data-dock-state="fill"] {
    --bbb-dock-h: var(--bbb-media-height);
    --bbb-dock-w: var(--bbb-media-width);
  }
  #layout[data-dock-state="fullscreen"] {
    --bbb-dock-h: 100%;
    --bbb-dock-w: 100%;
  }

  /* the media box shared by the presentation, screen share, external video, plugin content and pinned
     notes (unifiedLayout calculatesMediaBounds). Without cameras, or while the dock is dragged, it is the
     working box; the --bbb-mb-* properties hold the branch, the regions read them. */
  #layout {
    --bbb-mb-top: calc(var(--bbb-navbar-height) + var(--bbb-banners));
    --bbb-mb-left: var(--bbb-sidebar-space);
    --bbb-mb-right: auto;
    --bbb-mb-width: var(--bbb-work-width);
    --bbb-mb-height: var(--bbb-work-height);
    /* RTL only: the media shifts by the side dock's room (horizontalCameraDiff), whatever the branch */
    --bbb-hcd: 0px;
  }
  #layout[data-dock="contentLeft"] { --bbb-hcd: calc(var(--bbb-dock-w) + 20px); }
  #layout[data-dock="contentRight"] { --bbb-hcd: 20px; }
  #layout[data-rtl] {
    --bbb-mb-left: auto;
    --bbb-mb-right: calc(var(--bbb-sidebar-space) + var(--bbb-hcd));
  }

  /* beside the dock (cameras on, no dock being dragged, no media in fullscreen): 10 px from a top or
     bottom dock (the bottom one pulls the media 10 px up into the nav bar), 20 px from a side dock */
  #layout[data-media-beside-dock][data-dock="contentTop"],
  #layout[data-media-beside-dock][data-dock="contentBottom"] {
    --bbb-mb-height: max(0px, calc(var(--bbb-work-height) - var(--bbb-dock-h) - 10px));
  }
  #layout[data-media-beside-dock][data-dock="contentTop"] {
    --bbb-mb-top: calc(var(--bbb-navbar-height) + var(--bbb-dock-h) + 10px + var(--bbb-banners));
  }
  #layout[data-media-beside-dock][data-dock="contentBottom"] {
    --bbb-mb-top: calc(var(--bbb-navbar-height) - 10px + var(--bbb-banners));
  }
  /* a negative height is dropped by the browser and the region keeps the height it had beside the dock */
  #layout[data-media-beside-dock][data-media-box="negative"] {
    --bbb-mb-height: max(0px, calc(var(--bbb-work-height) - var(--bbb-dock-positioned-h) - 10px));
  }
  #layout[data-media-beside-dock][data-dock="contentLeft"],
  #layout[data-media-beside-dock][data-dock="contentRight"] {
    --bbb-mb-width: max(0px, calc(var(--bbb-work-width) - var(--bbb-dock-w) - 20px));
  }
  #layout[data-media-beside-dock][data-dock="contentLeft"]:not([data-rtl]) {
    --bbb-mb-left: calc(var(--bbb-sidebar-space) + var(--bbb-work-width) - var(--bbb-mb-width));
  }
  #layout[data-media-beside-dock][data-dock="contentRight"][data-rtl] {
    --bbb-mb-right: calc(var(--bbb-sidebar-space) - 20px + var(--bbb-hcd));
  }

  /* presentationOnly: the media area, not the working box, and no dock to make room for */
  #layout[data-shell-layout="presentationOnly"] {
    --bbb-mb-top: var(--bbb-media-top);
    --bbb-mb-width: var(--bbb-media-width);
    --bbb-mb-height: var(--bbb-media-height);
    --bbb-hcd: 0px;
  }
  #layout[data-shell-layout="presentationOnly"][data-rtl] {
    --bbb-mb-right: var(--bbb-sidebar-space);
  }

  /* a media region in fullscreen takes the window (in RTL still shifted by a side dock's room) */
  #layout[data-fullscreen-media] {
    --bbb-mb-top: 0px;
    --bbb-mb-left: 0px;
    --bbb-mb-width: 100%;
    --bbb-mb-height: 100%;
  }
  #layout[data-fullscreen-media][data-rtl] {
    --bbb-mb-left: auto;
    --bbb-mb-right: var(--bbb-hcd);
  }

  #layout [data-layout-region="presentation"],
  #layout [data-layout-region="screenshare"],
  #layout [data-layout-region="external-video"],
  #layout [data-layout-region="generic-content"],
  #layout [data-layout-region="pinned-notes"] {
    position: absolute;
    top: var(--bbb-mb-top);
    left: var(--bbb-mb-left);
    right: var(--bbb-mb-right);
    width: var(--bbb-mb-width);
    height: var(--bbb-mb-height);
  }
  #layout[data-media-box="zero"] [data-layout-region="screenshare"],
  #layout[data-media-box="zero"] [data-layout-region="external-video"],
  #layout[data-media-box="zero"] [data-layout-region="generic-content"],
  #layout[data-media-box="zero"] [data-layout-region="pinned-notes"] {
    display: none;
  }
  /* presentationOnly: the presentation covers the whole window, whatever else is on */
  #layout[data-shell-layout="presentationOnly"] [data-layout-region="presentation"] {
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
  }

  /* live captions (SET_CAPTIONS_OUTPUT): past the sidebars, the phone's floating rail included. In RTL
     the engine left 'left' unset, so the stylesheet's 20% still applies next to 'right'. */
  #layout [data-layout-region="captions"] {
    position: absolute;
    left: calc(var(--bbb-sidebars-width) + var(--bbb-nav-width) + 10px);
    max-width: calc(var(--bbb-media-width) - 20px);
  }
  #layout[data-rtl] [data-layout-region="captions"] {
    left: 20%;
    right: calc(var(--bbb-sidebars-width) + var(--bbb-nav-width) + 10px);
  }
`;

export default LayoutShellStyles;
