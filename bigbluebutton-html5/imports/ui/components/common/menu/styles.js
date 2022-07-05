import styled from 'styled-components';
import Button from "/imports/ui/components/common/button/component";
import Icon from '/imports/ui/components/common/icon/component';
import MenuItem from "@material-ui/core/MenuItem";
import { colorWhite, colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';
import { mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';

const MenuItemWrapper = styled.div`
  display: flex;
  flex-flow: row;
  width: 100%;
  align-items: center;
`;

const Option = styled.div`
  line-height: 1;
  margin-right: 1.65rem;
  margin-left: .5rem;
  white-space: normal;
  overflow-wrap: anywhere;
  padding: .1rem 0;

  [dir="rtl"] & {
    margin-right: .5rem;
    margin-left: 1.65rem;
  }
`;

const CloseButton = styled(Button)`
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 5rem;
  background-color: ${colorWhite};
  padding: 1rem;

  border-radius: 0;
  z-index: 1011;
  font-size: calc(${fontSizeLarge} * 1.1);
  box-shadow: 0 0 0 2rem ${colorWhite} !important;
  border: ${colorWhite} !important;
  cursor: pointer !important;

  @media ${mediumUp} {
    display: none;
  }
`;

const IconRight = styled(Icon)`
  display: flex;
  justify-content: flex-end;
  flex: 1;
`;

const BBBMenuItem = styled(MenuItem)`
  transition: none !important;
  font-size: 90% !important;
  
  &:focus,
  &:hover {
    i { 
      color: #FFF;
    }
    color: #FFF !important;
    background-color: ${colorPrimary} !important;
  }

  ${({ emoji }) => emoji === 'yes' && `
    div,
    i {
      color: ${colorPrimary};
    }

    &:focus,
    &:hover {
      div,
      i {
        color: #FFF ;
      }
    }
  `}
`;

export default {
  MenuItemWrapper,
  Option,
  CloseButton,
  IconRight,
  BBBMenuItem,
};
