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
  #layout[data-mobile] [data-layout-region="sidebar-navigation"][data-collapsed] { height: 0; }

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
`;

export default LayoutShellStyles;
