import styled from 'styled-components';
import { barsPadding } from '/imports/ui/stylesheets/styled-components/general';
import { FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';

const CaptionsWrapper = styled.div`
  height: auto;
  bottom: 100px;
  left: 20%;
  z-index: 5;
`;

const ActionsBar = styled.section`
  flex: 1;
  padding: ${barsPadding};
  position: relative;
  order: 3;
`;

const Layout = styled(FlexColumn)``;

export default {
  CaptionsWrapper,
  ActionsBar,
  Layout,
};
