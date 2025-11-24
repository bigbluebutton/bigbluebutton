import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import Icon from '/imports/ui/components/common/icon/component';
import MenuItem from '@mui/material/MenuItem';
import {
  colorWhite,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeLarge,
  headingsFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Menu from '@mui/material/Menu';

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

  ${({ isMobile }) => isMobile && `
    flex-flow: column;
    align-items: center;
  `}
  ${({ hasSpaceBetween }) => hasSpaceBetween && `
    justify-content: space-between;
  `}
`;

const TitleAction = styled(Button)`
  z-index: 3;
  margin-left: .1rem;
  & > span:first-child {
    margin: 0;
    padding: 0;
  }
`;

const Option = styled.div`
  line-height: 1;
  margin-right: 1.65rem;
  ${({ hasIcon }) => hasIcon && `
    margin-left: .5rem;
  `}
  white-space: normal;
  overflow-wrap: anywhere;
  padding: .1rem 0;

  ${({ isTitle }) => isTitle && `
    margin-left: .1rem;
    padding: .1rem 0 0 0;
    font-size: 1.1rem;
    font-weight: ${headingsFontWeight};
  `}

  ${({ textColor }) => textColor && `
    color: ${textColor};
  `}

  ${({ isHorizontal, isMobile }) => (isHorizontal || isMobile) && `
    margin-right: 0;
    margin-left: 0;
  `}

  ${({ $isToggle }) => $isToggle && `
    margin: 0 !important;
    padding: .1rem 0 0 0;
    width: 100%;
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

const BBBMenuInformation = styled.div`
  ${({ isGenericContent }) => ((isGenericContent) ? `
    padding: 0 16px;
  ` : `
    padding: 12px 16px;
  `)}
  ${({ isTitle }) => (isTitle) && `
    min-width: 15rem;
    padding: 12px 16px 8px 16px;
  `}
  margin: 0;
`;

const BBBMenuItem = styled(MenuItem)`
  transition: none !important;
  font-size: 90% !important;
  
  &:focus,
  &:hover {
    i { 
      color: #FFF !important;
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
  ${({ $roundButtons, $isToggle }) => $roundButtons && !$isToggle && `
    @media (hover: hover) {
      &:focus,
      &:hover {
        background-color: ${colorWhite} !important;
        div div div {
          background-color: ${colorPrimary} !important;
          border: 1px solid ${colorPrimary} !important;
        }
      }
    }

    @media (hover: none) {
      &:focus {
        background-color: ${colorWhite} !important;
      }
      &:hover {
        background-color: ${colorWhite} !important;
        div div div {
          background-color: none !important;
        }
      }
    }
  `}
  ${({ $isToggle }) => $isToggle && `
    &:focus,
    &:hover {
        color: inherit !important;
    }
  `}
`;

const Skeleton = styled.div`
  padding: 12px 16px;
  font-size: 0.9em !important;
  line-height: 1;
`;

const SkeletonWrapper = styled.span`
  width: 100%;
`;

export default {
  TitleAction,
  MenuWrapper,
  MenuItemWrapper,
  Option,
  CloseButton,
  IconRight,
  BBBMenuItem,
  BBBMenuInformation,
  Skeleton,
  SkeletonWrapper,
};
