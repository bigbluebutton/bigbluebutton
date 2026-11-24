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
  /* a dock below the sidebar shortens it, while cameras show next to open media */
  #layout[data-cameras][data-presentation-open][data-dock="sidebarContentBottom"]:not([data-media-off]):not(
    [data-mobile]):not([data-dock-state="hidden"]) {
    --bbb-sidebar-height: calc(100% - var(--bbb-dock-sidebar-h) - var(--bbb-banners));
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
     area (of the window, below the sidebar), at least 120 px and leaving 120 px; min(max()) because the
     engine inverts when the area is under 240 px. Locked side by side on a phone: 25%, never under 120 px.
     While resizing, the live size is first held within the dock's max size, as the resizable box did. */
  #layout {
    --bbb-dock-src: var(--bbb-camera-dock-size);
    /* the widest a side dock may be: 80% of the media area, for the presenter the area less 440 px */
    --bbb-dock-max-w: calc(var(--bbb-media-width) * 0.8);
    --bbb-dock-positioned-h: min(
      max(var(--bbb-dock-src, calc(var(--bbb-media-height) * 0.2)), 120px),
      calc(var(--bbb-media-height) - 120px)
    );
    --bbb-dock-positioned-w: min(
      max(var(--bbb-dock-src, calc(var(--bbb-media-width) * 0.2)), 120px),
      calc(var(--bbb-media-width) - 120px)
    );
    --bbb-dock-sidebar-h: min(max(var(--bbb-dock-src, 20%), 120px), calc(100% - 120px));
    --bbb-dock-h: 0px;
    --bbb-dock-w: 0px;
  }
  #layout[data-presenter] { --bbb-dock-max-w: calc(var(--bbb-media-width) - 440px); }
  #layout[data-dock-enforced] { --bbb-dock-max-w: var(--bbb-dock-w); }
  #layout[data-resizing][data-dock="contentTop"],
  #layout[data-resizing][data-dock="contentBottom"] {
    --bbb-dock-src: min(var(--bbb-camera-dock-size), calc(var(--bbb-media-height) * 0.8));
  }
  #layout[data-resizing][data-dock="contentLeft"],
  #layout[data-resizing][data-dock="contentRight"] {
    --bbb-dock-src: min(var(--bbb-camera-dock-size), var(--bbb-dock-max-w));
  }
  #layout[data-resizing][data-dock="sidebarContentBottom"] {
    --bbb-dock-src: min(var(--bbb-camera-dock-size), calc(100% - var(--bbb-banners) - 300px));
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

  /* the camera dock's box (calculatesCameraDockBounds, drawn by webcam/component.tsx): the --bbb-dock-box-*
     properties hold the branch; x is the distance from the left edge, or from the right one in RTL */
  #layout {
    --bbb-dock-box-top: calc(var(--bbb-navbar-height) + var(--bbb-banners));
    --bbb-dock-box-x: var(--bbb-media-left);
    --bbb-dock-box-w: var(--bbb-media-width);
    --bbb-dock-box-h: var(--bbb-dock-h);
    --bbb-dock-box-z: 1;
  }
  #layout[data-rtl] { --bbb-dock-box-x: var(--bbb-sidebar-space); }
  #layout[data-dock="contentBottom"] {
    --bbb-dock-box-top: calc(var(--bbb-navbar-height) + var(--bbb-banners) + var(--bbb-media-height)
      - var(--bbb-dock-h));
  }
  #layout[data-dock="contentLeft"],
  #layout[data-dock="contentRight"] {
    --bbb-dock-box-w: var(--bbb-dock-w);
    /* leaves room for the buttons below a vertical dock */
    --bbb-dock-box-h: calc(var(--bbb-media-height) - 20px);
  }
  #layout[data-dock="contentRight"]:not([data-rtl]) {
    --bbb-dock-box-x: calc(var(--bbb-media-left) + var(--bbb-media-width) - var(--bbb-dock-w));
  }
  #layout[data-dock="contentRight"][data-rtl] {
    --bbb-dock-box-x: calc(var(--bbb-media-width) - var(--bbb-dock-w) + var(--bbb-sidebar-space));
  }
  /* below the sidebar: the engine added the 1% horizontal margin to this vertical position */
  #layout[data-dock="sidebarContentBottom"] {
    --bbb-dock-box-top: calc(100% - var(--bbb-dock-sidebar-h) - var(--bbb-banners) - 4% + 1vw);
    --bbb-dock-box-x: var(--bbb-nav-space);
    --bbb-dock-box-w: var(--bbb-sidebars-width);
    --bbb-dock-box-h: var(--bbb-dock-sidebar-h);
  }
  #layout[data-dock-state="fill"] {
    --bbb-dock-box-top: var(--bbb-media-top);
    --bbb-dock-box-w: var(--bbb-media-width);
    --bbb-dock-box-h: var(--bbb-media-height);
    --bbb-dock-box-z: auto;
  }
  #layout[data-dock-state="fill"]:not([data-rtl]) { --bbb-dock-box-x: var(--bbb-media-left); }
  #layout[data-dock-state="fill"][data-rtl] { --bbb-dock-box-x: var(--bbb-sidebar-space); }
  #layout[data-dock-state="fullscreen"] {
    --bbb-dock-box-top: 0px;
    --bbb-dock-box-x: 0px;
    --bbb-dock-box-w: 100%;
    --bbb-dock-box-h: 100%;
    --bbb-dock-box-z: 99;
  }
  /* below the sidebar the dock always sat at z-index 0 (webcam/component.tsx), even in fullscreen */
  #layout[data-dock="sidebarContentBottom"] { --bbb-dock-box-z: 0; }
  /* while dragged, the dock shrinks to the camera grid, centred on where it was, above everything */
  #layout[data-dragging] {
    --bbb-dock-box-z: 99;
  }
  #layout[data-dragging][data-dock="contentTop"],
  #layout[data-dragging][data-dock="contentBottom"],
  #layout[data-dragging][data-dock="sidebarContentBottom"] {
    --bbb-dock-box-x-shift: calc((var(--bbb-dock-box-w) - var(--bbb-camera-grid-width, 0px)) / 2);
  }
  #layout [data-layout-region="camera-dock"] {
    position: absolute;
    box-sizing: border-box;
    top: var(--bbb-dock-box-top);
    left: calc(var(--bbb-dock-box-x) + var(--bbb-dock-box-x-shift, 0px));
    width: var(--bbb-dock-box-w);
    height: var(--bbb-dock-box-h);
    z-index: var(--bbb-dock-box-z);
  }
  #layout[data-rtl] [data-layout-region="camera-dock"] {
    left: auto;
    right: calc(var(--bbb-dock-box-x) + var(--bbb-dock-box-x-shift, 0px));
  }
  #layout[data-dragging] [data-layout-region="camera-dock"] {
    width: var(--bbb-camera-grid-width, 0px);
    height: var(--bbb-camera-grid-height, 0px);
  }
  #layout[data-dragging][data-dock="contentLeft"] [data-layout-region="camera-dock"],
  #layout[data-dragging][data-dock="contentRight"] [data-layout-region="camera-dock"] {
    top: calc(var(--bbb-dock-box-top) + (var(--bbb-dock-box-h) - var(--bbb-camera-grid-height, 0px)) / 2);
  }
  #layout [data-layout-region="camera-dock"] > #cameraDock {
    width: 100%;
    height: 100%;
  }
  /* the dock's max width, measured by the dock to hold the user's size within it (webcam/component.tsx) */
  #layout [data-layout-region="camera-dock-limit"] {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--bbb-dock-max-w);
    height: 0;
    visibility: hidden;
    pointer-events: none;
  }

  /* drop zones while the dock is dragged (calculatesDropAreas): 100 px bands along the media area, which
     the engine measured with a fixed 85 px nav bar and no banners; the hit area above its background */
  #layout {
    --bbb-dz-width: calc(100% - var(--bbb-sidebar-space) - 1%);
    --bbb-dz-height: calc(100% - 85px - var(--bbb-actionbar-height));
  }
  #layout [data-layout-region="drop-zone"],
  #layout [data-layout-region="drop-zone-bg"] {
    position: absolute;
    left: var(--bbb-sidebar-space);
    width: var(--bbb-dz-width);
    height: 100px;
  }
  #layout [data-layout-region="drop-zone"] { z-index: 100; }
  #layout [data-layout-region="drop-zone-bg"] { z-index: 99; }
  #layout[data-rtl] [data-layout-region^="drop-zone"] {
    left: auto;
    right: var(--bbb-sidebar-space);
  }
  #layout [data-layout-region^="drop-zone"][data-zone="contentTop"] { top: 85px; }
  #layout [data-layout-region^="drop-zone"][data-zone="contentBottom"] {
    top: calc(100% - var(--bbb-actionbar-height) - 100px);
  }
  #layout [data-layout-region^="drop-zone"][data-zone="contentLeft"],
  #layout [data-layout-region^="drop-zone"][data-zone="contentRight"] {
    top: 185px;
    width: 100px;
    height: calc(var(--bbb-dz-height) - 200px);
  }
  /* the right zone sits at a physical left, 1% in from the window edge in either direction */
  #layout [data-layout-region^="drop-zone"][data-zone="contentRight"],
  #layout[data-rtl] [data-layout-region^="drop-zone"][data-zone="contentRight"] {
    left: calc(100% - 100px - 1%);
    right: auto;
  }
  #layout[data-rtl] [data-layout-region^="drop-zone"][data-zone="contentRight"] { left: 1%; }
  #layout [data-layout-region^="drop-zone"][data-zone="sidebarContentBottom"] {
    top: calc(100% - 100px);
    left: var(--bbb-nav-space);
    width: 0;
  }
  #layout[data-content-open] [data-layout-region^="drop-zone"][data-zone="sidebarContentBottom"] {
    width: calc(var(--bbb-sidebars-width) - 1%);
  }
  #layout[data-rtl] [data-layout-region^="drop-zone"][data-zone="sidebarContentBottom"] {
    left: auto;
    right: var(--bbb-nav-space);
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
  /* a dock with no box: no cameras outside unified (layoutEngine baseCameraDockBounds) */
  #layout[data-dock-state="hidden"] {
    --bbb-dock-box-w: 0px;
    --bbb-dock-box-h: 0px;
  }

  /* ---- special layouts (layout-manager/*.jsx). They close the sidebars on every pass but
     participantsAndChatOnly, so the sidebar terms are 0 in their steady state. ---- */

  /* camerasOnly: the media area has no 1% gap; with the presentation open and media on (a transient,
     the layout closes the presentation) the dock leaves the banners' height again at its bottom */
  #layout[data-shell-layout="camerasOnly"]:not([data-mobile]) {
    --bbb-media-width: calc(100% - var(--bbb-sidebar-space));
  }
  #layout[data-shell-layout="camerasOnly"][data-dock-state="positioned"] {
    --bbb-dock-box-h: calc(var(--bbb-media-height) - var(--bbb-banners));
  }
  #layout[data-shell-layout="camerasOnly"][data-dock-state="positioned"][data-mobile] {
    --bbb-dock-box-h: calc(var(--bbb-media-height) * 0.7 - var(--bbb-banners));
  }

  /* participantsAndChatOnly: full-width bars, and the sidebars below the nav bar (without the banners'
     offset) down to the actions bar, the content filling the rest of the width */
  #layout[data-shell-layout="participantsAndChatOnly"] {
    --bbb-media-width: 100%;
    --bbb-media-left: 0px;
    --bbb-content-width: calc(100% - var(--bbb-nav-space));
    --bbb-sidebar-top: var(--bbb-navbar-height);
    --bbb-sidebar-height: calc(100% - var(--bbb-banners) - var(--bbb-navbar-height)
      - var(--bbb-actionbar-height));
  }
  #layout[data-shell-layout="participantsAndChatOnly"][data-mobile] { --bbb-content-width: 100%; }
  #layout[data-shell-layout="participantsAndChatOnly"]
    [data-layout-region="sidebar-navigation"]:not([data-collapsed]) {
    top: var(--bbb-navbar-height);
    height: var(--bbb-sidebar-height);
  }
  #layout[data-shell-layout="participantsAndChatOnly"] [data-layout-region="sidebar-content"] {
    max-width: none;
    min-height: 0;
  }
  #layout[data-shell-layout="participantsAndChatOnly"] [data-layout-region="captions"] {
    left: calc(100% + 10px);
  }
  #layout[data-shell-layout="participantsAndChatOnly"][data-rtl] [data-layout-region="captions"] {
    left: 20%;
    right: calc(100% + 10px);
  }

  /* mediaOnly: a 10 px margin around the media area, bars included (flush left in RTL). With cameras,
     the content keeps its own aspect ratio: limited by the area's height, it sits on the right at up to
     80% of the width with the cameras on its left; otherwise at the bottom, up to 80% of the height, with
     the cameras on top (20% when there is no content size). Those widths come from the area's height and
     the other way round, so they use the measured area (--bbb-media-only-width / -height, in px). */
  #layout[data-shell-layout="mediaOnly"] {
    --bbb-media-width: calc(100% - 20px);
    --bbb-media-left: 10px;
    --bbb-media-height: calc(100% - var(--bbb-navbar-height) - var(--bbb-actionbar-height)
      - var(--bbb-banners) - 20px);
    --bbb-media-top: calc(var(--bbb-navbar-height) + var(--bbb-banners) + 10px);
    --bbb-dock-max-w: calc(var(--bbb-media-width) * 0.8);
    --bbb-hcd: 0px;
    --bbb-mo-top: var(--bbb-media-top);
    --bbb-mo-left: 10px;
    --bbb-mo-width: var(--bbb-media-width);
    --bbb-mo-height: var(--bbb-media-height);
  }
  #layout[data-shell-layout="mediaOnly"][data-rtl] { --bbb-media-left: 0px; }
  #layout[data-shell-layout="mediaOnly"][data-cameras][data-media-only-fit="none"] {
    --bbb-mo-height: calc(var(--bbb-media-height) * 0.8);
    --bbb-mo-top: calc(var(--bbb-media-top) + var(--bbb-media-height) * 0.2);
  }
  #layout[data-shell-layout="mediaOnly"][data-cameras][data-media-only-fit="width"] {
    --bbb-mo-height: min(
      var(--bbb-media-only-height) * 0.8,
      var(--bbb-media-only-width) / var(--bbb-media-only-ratio, 1)
    );
    --bbb-mo-top: calc(var(--bbb-media-top) + var(--bbb-media-height) - var(--bbb-mo-height));
  }
  #layout[data-shell-layout="mediaOnly"][data-cameras][data-media-only-fit="height"] {
    --bbb-mo-width: min(
      var(--bbb-media-only-height) * var(--bbb-media-only-ratio, 1),
      var(--bbb-media-only-width) * 0.8
    );
    --bbb-mo-left: calc(10px + var(--bbb-media-width) - var(--bbb-mo-width));
    /* the cameras take the rest, as if the content were at least 430 px wide */
    --bbb-mo-dock-width: calc(var(--bbb-media-width) - max(var(--bbb-mo-width), 430px) - 10px);
    --bbb-hcd: calc(var(--bbb-mo-dock-width) + 20px);
  }
  #layout[data-shell-layout="mediaOnly"]:not([data-fullscreen-media]) {
    --bbb-mb-top: var(--bbb-mo-top);
    --bbb-mb-left: var(--bbb-mo-left);
    --bbb-mb-width: var(--bbb-mo-width);
    --bbb-mb-height: var(--bbb-mo-height);
  }
  #layout[data-shell-layout="mediaOnly"][data-rtl]:not([data-fullscreen-media]) {
    --bbb-mb-left: auto;
    --bbb-mb-right: var(--bbb-hcd);
  }
  #layout[data-shell-layout="mediaOnly"][data-fullscreen-media][data-rtl] { --bbb-mb-right: 0px; }
  /* the dock: the engine moved it 10 px from its static position, past the right edge in RTL */
  #layout[data-shell-layout="mediaOnly"][data-dock-state="positioned"] {
    --bbb-dock-box-top: var(--bbb-media-top);
    --bbb-dock-box-x: 10px;
    --bbb-dock-box-w: var(--bbb-media-width);
    --bbb-dock-box-h: calc(var(--bbb-media-height) - var(--bbb-mo-height) - 10px);
    --bbb-dock-box-z: 1;
  }
  #layout[data-shell-layout="mediaOnly"][data-dock-state="positioned"][data-rtl] { --bbb-dock-box-x: -10px; }
  #layout[data-shell-layout="mediaOnly"][data-dock-state="positioned"][data-dock="contentLeft"] {
    --bbb-dock-box-w: var(--bbb-mo-dock-width);
    --bbb-dock-box-h: var(--bbb-media-height);
  }
  /* the measured area: where the content may go */
  #layout [data-layout-region="media-only-area"] {
    position: absolute;
    top: var(--bbb-media-top);
    left: 10px;
    width: var(--bbb-media-width);
    height: var(--bbb-media-height);
    visibility: hidden;
    pointer-events: none;
  }
`;

export default LayoutShellStyles;
