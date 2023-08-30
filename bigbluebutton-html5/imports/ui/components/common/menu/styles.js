import styled from 'styled-components';
import Button from "/imports/ui/components/common/button/component";
import Icon from '/imports/ui/components/common/icon/component';
import MenuItem from "@mui/material/MenuItem";
import { colorWhite, colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';
import { mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Menu from "@mui/material/Menu";

const MenuWrapper = styled(Menu)`
  ${({ isMobile }) => isMobile && `
    flex-direction: column;
    align-items: center;
    padding: .5rem 0;
  `}

  ${({ $isHorizontal, isMobile }) => ($isHorizontal || isMobile) && `
    ul {
      display: flex;
    }

    li:hover {
      background-color: unset !important;
    }

  `}
`;

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

  ${({ isHorizontal, isMobile }) => (isHorizontal || isMobile) && `
    margin-right: 0;
    margin-left: 0;
  `}
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
  ${({ $roundButtons }) => $roundButtons && `
    &:focus,
    &:hover {
      background-color: ${colorWhite} !important;
      div div div {
        background-color: ${colorPrimary} !important;
        border: 1px solid ${colorPrimary} !important;
      }
    }
  `}
`;

export default {
  MenuWrapper,
  MenuItemWrapper,
  Option,
  CloseButton,
  IconRight,
  BBBMenuItem,
};
