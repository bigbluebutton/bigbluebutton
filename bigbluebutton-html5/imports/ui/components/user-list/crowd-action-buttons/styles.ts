import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  appsGalleryOutlineColor,
  appsPanelTextColor,
  colorGrayUserListToolbar,
} from '/imports/ui/stylesheets/styled-components/palette';
import { ActionButtonProps } from './types';

const ActionButtonsWrapper = styled.div`
  display: flex;
  padding: 1.5rem;
  align-items: flex-end;
  gap: 1.5rem;
`;

const ActionButtonWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ActionButtonLabel = styled.span`
  color: ${appsPanelTextColor}; 
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

// @ts-ignore - Button is JSX element
const ActionButton = styled<ActionButtonProps>(Button)`
  justify-content: center;
  align-items: center;
  border-radius: 1rem;
  border: 1px solid ${appsGalleryOutlineColor};
  background: ${colorGrayUserListToolbar};
`;

export default {
  ActionButtonsWrapper,
  ActionButtonWrapper,
  ActionButtonLabel,
  ActionButton,
};
