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
  #TD-Tools button, #TD-TopPanel-Undo, #TD-TopPanel-Redo, #TD-Styles {
    border-color: transparent !important;
  }
  [id="TD-StylesMenu"],
  [id="TD-Styles-Color-Container"],
  div[data-test="brandingArea"],
  #connectionBars > div
`;

const DtfCss = `
  [id="colorPicker"],
  path,
  svg
`;

const DtfImages = `
  svg
`;

const TextMeasure = styled.pre`
  white-space: pre;
  width: auto;
  border: 1px solid red;
  padding: 4px;
  margin: 0px;
  letter-spacing: -0.03em;
  opacity: 0;
  position: absolute;
  top: -500px;
  left: 0px;
  z-index: 9999;
  pointer-events: none;
  user-select: none;
  alignment-baseline: mathematical;
  dominant-baseline: mathematical;
  font-family: "Source Code Pro";
`;

export default {
  CaptionsWrapper,
  ActionsBar,
  Layout,
  DtfInvert,
  DtfCss,
  DtfImages,
  TextMeasure,
};
