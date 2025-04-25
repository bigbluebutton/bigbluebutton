import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  HeaderContainer as BaseHeaderContainer,
  PanelContent as BasePanelContent,
  Separator as BaseSeparator,
} from '/imports/ui/components/sidebar-content/styles';

const Container = styled.div`
  background-color: ${colorWhite};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
  height: 100%;

  @media ${smallOnly} {
    transform: none !important;
    &.no-padding {
      padding: 0;
    }
  }
`;

const HeaderContainer = styled(BaseHeaderContainer)``;

const PanelContent = styled(BasePanelContent)`
  display: flex;
  flex-direction: column;
`;

const Separator = styled(BaseSeparator)``;

export default {
  Container,
  HeaderContainer,
  PanelContent,
  Separator,
};
