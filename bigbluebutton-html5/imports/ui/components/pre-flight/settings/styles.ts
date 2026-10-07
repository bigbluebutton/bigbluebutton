import styled from 'styled-components';
import ButtonWrappers from '/imports/ui/components/common/button-wrapper/styles';
import { colorBorder } from '/imports/ui/stylesheets/styled-components/palette';
import { jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const Footer = styled.div`
  display: flex;
  flex: 0 0 auto;
  gap: ${jumboPaddingY};
  padding: ${jumboPaddingY};
  border-top: 1px solid ${colorBorder};
`;

// An equal share of the row: the whole of it while it is the only button.
const SettingsButtonWrapper = ButtonWrappers.FullWidthFlexItem;

export default {
  Footer,
  SettingsButtonWrapper,
};
