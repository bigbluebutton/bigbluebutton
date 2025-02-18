import styled from 'styled-components';
import { Select, ButtonBase } from '@mui/material';
import {
  colorGrayDark,
  colorWhite,
  btnPrimaryBg,
  colorOffWhite,
} from '../../../stylesheets/styled-components/palette';
import {
  fontSizeSmall,
  textFontWeight,
} from '../../../stylesheets/styled-components/typography';
import {
  contentSidebarBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';

export const GuestManagementContainer = styled.div`
  border-radius: ${contentSidebarBorderRadius};
  background: ${colorWhite};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

export const ClickableArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${contentSidebarBorderRadius};
  transition: background-color 0.3s ease;
  width: fit-content;

  &:focus-within {
    outline: 2px solid ${colorGrayDark};
    outline-offset: -2px;
  }
`;

export const ToggleButton = styled(ButtonBase)`
  width: 100%;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
  border-radius: ${contentSidebarBorderRadius};

  &:focus {
    outline: 2px solid ${colorOffWhite};
    border-radius: ${contentSidebarBorderRadius};
    outline-offset: -2px;
  }
`;

export const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: ${colorOffWhite};
`;

export const ExpandIcon = styled.div<{ $expanded: boolean }>`
  width: 1.375rem;
  height: 1.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ $expanded }) => ($expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: all 0.3s ease;
  margin-right: 0.75rem;
  border-radius: 50%;
  background-color: ${btnPrimaryBg};

  svg {
    color: ${colorWhite};
    font-size: 1.25rem;
    transition: transform 0.3s ease;
  }

  &:hover {
    filter: brightness(0.9);
  }
`;

export const TitleText = styled.span`
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
  color: ${colorGrayDark};
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CircleButton = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background-color: ${btnPrimaryBg};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export const ExpandedContent = styled.div`
  padding: 0px 0.5rem 0.5rem;
  animation: expand 0.3s ease-out;

  @keyframes expand {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const GuestPolicyContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  margin-top: 0.5rem;
`;

export const GuestPolicySelector = styled(Select)`
  height: 2.5rem;
  border-radius: 0.5rem !important;
  width: 100%;
  fieldset {
    border-color: ${colorGrayDark} !important;
  }
`;

export default {
  GuestManagementContainer,
  ToggleButton,
  ButtonContent,
  CircleButton,
  ClickableArea,
  TitleText,
  ExpandIcon,
  ExpandedContent,
  GuestPolicyContainer,
  GuestPolicySelector,
};
