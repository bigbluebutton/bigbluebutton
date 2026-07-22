import styled from 'styled-components';
import { FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';
import {
  colorBackgroundDarkTheme,
  colorOverlaysDarkTheme,
  colorTextDarkTheme,
  colorPrimaryDarkTheme,
  colorHoverBgDark,
  colorToggleBgDisabledDarkTheme,
  colorTldrawBackground,
} from '/imports/ui/stylesheets/styled-components/palette';

const Layout = styled(FlexColumn)``;

const DtfInvert = `
  :root {
    --darkreader-bg-neutral-background: ${colorBackgroundDarkTheme} !important;
    --darkreader-bg--color-background: ${colorBackgroundDarkTheme} !important;
    --darkreader-bg--color-white: ${colorOverlaysDarkTheme} !important;
    --darkreader-bg--btn-default-bg: ${colorOverlaysDarkTheme} !important;
    --darkreader-text--btn-default-color: ${colorTextDarkTheme} !important;
    --darkreader-text--color-gray-light: ${colorTextDarkTheme} !important;
    --darkreader-text--color-text: ${colorTextDarkTheme} !important;
    --darkreader-text--color-gray: ${colorTextDarkTheme} !important;
    --darkreader-text--color-white: ${colorTextDarkTheme} !important;
    --darkreader-text--color-gray-dark: ${colorTextDarkTheme} !important;
    --darkreader-bg--color-primary: ${colorPrimaryDarkTheme} !important;
    --darkreader-text--color-primary: ${colorPrimaryDarkTheme} !important;
    --darkreader-bg--item-focus-border: ${colorPrimaryDarkTheme} !important;
    --darkreader-bg--list-item-bg-hover: ${colorHoverBgDark} !important;
    --list-item-bg-hover: ${colorHoverBgDark} !important;
  }
  body {
    background-color: var(--darkreader-bg-neutral-background) !important;
  }
  header[id="Navbar"] {
    background-color: var(--darkreader-bg-neutral-background) !important;
  }
  section[id="ActionsBar"] {
    background-color: var(--darkreader-bg-neutral-background) !important;
  }
  div[id="app"] {
    background-color: var(--darkreader-bg-neutral-background) !important;
  }
  select {
    border: 0.1rem solid #FFFFFF !important;
  }
  select[data-test="skipSlide"] {
    border: unset !important;
  }
  div[data-test="presentationContainer"] {
    background-color: var(--darkreader-bg-neutral-background) !important;
  }
  select {
    border-top: unset !important;
    border-right: unset !important;
    border-left: unset !important;
  }
  .tl-container {
    .tl-image {
      background-color: white !important;
    }
    .tl-background {
      background-color: ${colorTldrawBackground} !important;
    }
  }
  .tlui-slider__thumb {
    background-color: var(--darkreader-text--color-text-1) !important;
  }
  .tlui-button[data-state="hinted"]::after {
    background-color: var(--darkreader-selection-background) !important;
  }
  div.tlui-toolbar__inner > div.tlui-toolbar__tools.fade-in {
    background: var(--darkreader-border--color-selected) !important;
  }
  div[id="cameraDock"] {
    background-color: var(--darkreader-bg-neutral-background) !important;
  }
  .bnjzQC > div span div:hover {
    background-color: var(--darkreader-selection-background) !important;
  }
  .tl-note__scrim,.tl-arrow-label[data-isediting="true"] > .tl-arrow-label__inner {
    background-color: unset !important;
  }
  textarea {
    caret-color: white !important;
  }
  #connectionBars > div {
    background-color: var(--darkreader-neutral-text) !important;
  }
  div[id^="layout"] {
    background-color: var(--darkreader-bg-neutral-background) !important;
  }
  div[id^="scroll-box"],
  div[id^="chat-list"],
  div[id^="breakoutBox"] {
    background-image: 
      linear-gradient(rgb(45 47 56 / 0%) 30%, rgba(34, 36, 37, 0)),
      linear-gradient(rgba(34, 36, 37, 0), rgb(45 47 56 / 0%) 70%),
      radial-gradient(farthest-side at 50% 0px, rgba(13, 13, 13, 0.2), rgba(13, 13, 13, 0)),
      radial-gradient(farthest-side at 50% 100%, rgba(13, 13, 13, 0.2), rgba(13, 13, 13, 0));
  }
  button[data-test="increaseFontSize"],
  button[data-test="decreaseFontSize"] {
    & > span > i {
      color: var(--darkreader-text--btn-default-color) !important;
    }
  }
  .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track {
    background-color: ${colorToggleBgDisabledDarkTheme} !important;
  }
  [data-test="selectDefaultBackground"],
  [data-test="selectCustomBackground"] {
    background-image: var(--original-background-image) !important;
  }
  [data-test="selectDefaultBackground"][style*="background-image"],
  [data-test="selectCustomBackground"][style*="background-image"] {
    background-image: inherit !important;
  }
  button[data-test*="Background"][style*="background-image"] {
    background-image: var(--original-background-image, inherit) !important;
  }
`;

const DtfBrandingInvert = `
  ${DtfInvert},
  div[data-test="brandingArea"]
`;

const DtfCss = `
  [id="colorPicker"],
  path,
  svg,
  g,
  line,
  textarea,
  rect,
  circle,
  .tlui-buttons__grid > button,
  .tlui-popover > button,
  .tl-html-container > div.tl-text-shape__wrapper.tl-text-shadow,
  .tl-text,
  .tl-text-input,
  .tl-text-content,
  .tl-text-label__inner,
  .tl-note__container,
  .tl-text.tl-text-content,
  .tl-arrow-label,
  .tl-arrow-label__inner,
  .bn-mantine *,
  [data-test="selectDefaultBackground"],
  [data-test="selectCustomBackground"],
  [data-test="noneBackgroundButton"],
  [data-test="inputBackgroundButton"]
`;

const DtfAvatars = `
  [data-test="moderatorAvatar"],
  [data-test="viewerAvatar"]
`;

const DtfImages = `
  svg,
  [data-test="selectDefaultBackground"],
  [data-test="selectCustomBackground"],
  [data-test="noneBackgroundButton"],
  [data-test="inputBackgroundButton"]
`;

export default {
  Layout,
  DtfInvert,
  DtfBrandingInvert,
  DtfCss,
  DtfAvatars,
  DtfImages,
};
