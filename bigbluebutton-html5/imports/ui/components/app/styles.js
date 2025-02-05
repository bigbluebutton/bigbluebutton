import styled from 'styled-components';
import { FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';
import {
  colorBackgroundDarkTheme,
  colorOverlaysDarkTheme,
  colorTextDarkTheme,
  colorPrimaryDarkTheme,
} from '/imports/ui/stylesheets/styled-components/palette';

const CaptionsWrapper = styled.div`
  height: auto;
  bottom: 100px;
  left: 20%;
  z-index: 5;
  pointer-events: none;
  user-select:none;
`;

const Layout = styled(FlexColumn)``;

const DtfInvert = `
  :root {
    --darkreader-bg-neutral-background: ${colorBackgroundDarkTheme};
    --darkreader-bg--color-background: ${colorBackgroundDarkTheme};
    --darkreader-bg--color-white: ${colorOverlaysDarkTheme};
    --darkreader-bg--btn-default-bg: ${colorOverlaysDarkTheme};
    --darkreader-text--btn-default-color: ${colorTextDarkTheme};
    --darkreader-text--color-gray-light: ${colorTextDarkTheme};
    --darkreader-text--color-text: ${colorTextDarkTheme};
    --darkreader-text--color-gray: ${colorTextDarkTheme};
    --darkreader-text--color-white: ${colorTextDarkTheme};
    --darkreader-text--color-gray-dark: ${colorTextDarkTheme};
    --darkreader-bg--color-primary: ${colorPrimaryDarkTheme};
    --darkreader-text--color-primary: ${colorPrimaryDarkTheme};
    --darkreader-bg--item-focus-border: ${colorPrimaryDarkTheme};
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
    caret-color: black !important;
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
  .tl-arrow-label__inner
`;

const DtfImages = `
  svg
`;

export default {
  CaptionsWrapper,
  Layout,
  DtfInvert,
  DtfBrandingInvert,
  DtfCss,
  DtfImages,
};
