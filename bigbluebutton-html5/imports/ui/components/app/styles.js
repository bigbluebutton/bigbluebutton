import styled from 'styled-components';
import { barsPadding } from '/imports/ui/stylesheets/styled-components/general';
import { FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';
import { colorBackground } from '/imports/ui/stylesheets/styled-components/palette';

const CaptionsWrapper = styled.div`
  height: auto;
  bottom: 100px;
  left: 20%;
  z-index: 5;
  pointer-events: none;
  user-select:none;
`;

const ActionsBar = styled.section`
  flex: 1;
  padding: ${barsPadding};
  background-color: ${colorBackground};
  position: relative;
  order: 3;
`;

const Layout = styled(FlexColumn)``;

const DtfInvert = `
  body {
    background-color: var(--darkreader-neutral-background) !important;
  }
  header[id="Navbar"] {
    background-color: var(--darkreader-neutral-background) !important;
  }
  section[id="ActionsBar"] {
    background-color: var(--darkreader-neutral-background) !important;
  }
  div[id="app"] {
    background-color: var(--darkreader-neutral-background) !important;
  }
  select {
    border: 0.1rem solid #FFFFFF !important;
  }
  select[data-test="skipSlide"] {
    border: unset !important;
  }
  div[data-test="presentationContainer"] {
    background-color: var(--darkreader-neutral-background) !important;
  }
  select {
    border-top: unset !important;
    border-right: unset !important;
    border-left: unset !important;
  }
  .tl-container {
    background-color: var(--tl-background) !important;
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
    background-color: var(--darkreader-neutral-background) !important;
  }
  .bnjzQC > div span div:hover {
    background-color: var(--darkreader-selection-background) !important;
  }
  #connectionBars > div
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
  .tl-html-container > div.tl-text-shape__wrapper.tl-text-shadow
`;

const DtfImages = `
  svg
`;

export default {
  CaptionsWrapper,
  ActionsBar,
  Layout,
  DtfInvert,
  DtfBrandingInvert,
  DtfCss,
  DtfImages,
};
