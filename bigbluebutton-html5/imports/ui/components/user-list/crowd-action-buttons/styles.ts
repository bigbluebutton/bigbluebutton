import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  appsGalleryOutlineColor,
  colorGrayDark,
  colorGrayUserListToolbar,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeSmall,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { ActionButtonProps } from './types';

const ActionButtonsWrapper = styled.div`
  display: flex;
  padding: 0rem 0.8rem 0.8rem 0.8rem;
  align-items: flex-end;
  gap: 1.5rem;
`;

const ActionButtonWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
  max-height: 5rem;
  padding: 0.2rem;
`;

const ActionButtonLabel = styled.span`
  color: ${colorGrayDark};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
  text-align: center;
  line-height: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// @ts-ignore - Button is JSX element
const ActionButton = styled<ActionButtonProps>(Button)`
  justify-content: center;
  align-items: center;
  height: 3rem;
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
