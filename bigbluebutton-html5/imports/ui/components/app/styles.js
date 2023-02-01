import styled from 'styled-components';
import { barsPadding } from '/imports/ui/stylesheets/styled-components/general';
import { FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';
import { colorBackground } from '/imports/ui/stylesheets/styled-components/palette';

const CaptionsWrapper = styled.div`
  height: auto;
  bottom: 100px;
  left: 20%;
  z-index: 5;
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
  #connectionBars > div
`;

const DtfCss = `
  [id="colorPicker"]
`;

export default {
  CaptionsWrapper,
  ActionsBar,
  Layout,
  DtfInvert,
  DtfCss,
};
