import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  appsGalleryOutlineColor,
  colorGray,
  colorGrayDark,
  colorGrayUserListToolbar,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeBase,
  fontSizeMedium,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { $2xlPadding, barsPadding } from '/imports/ui/stylesheets/styled-components/general';
import { ActionButtonProps } from './types';

const ActionButtonsWrapper = styled.div<{ $isMinWidth?: boolean }>`
  display: grid;
  grid-template-columns: repeat(${({ $isMinWidth }) => ($isMinWidth ? 1 : 2)}, minmax(0, 1fr));
  padding: ${$2xlPadding} ${barsPadding};
  align-items: end;
  gap: 0.5rem 1.5rem;
`;

const ActionButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
  max-height: 5rem;
  padding: 0.2rem;
`;

const ActionButtonLabel = styled.span`
  color: ${colorGrayDark};
  font-size: ${fontSizeBase};
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

// @ts-ignore - Button is JSX element
const ClearReactionsButton = styled(Button)`
  grid-column: 1 / -1;
  padding: ${$2xlPadding} 0.2rem;
  border: none;
  font-size: ${fontSizeMedium};
  font-weight: ${textFontWeight};
  line-height: 1.5;
  text-align: center;
  white-space: normal;

  &,
  &:hover,
  &:focus,
  &:active {
    color: ${colorGray};
    background: transparent;
    text-decoration: underline;
  }
`;

export default {
  ActionButtonsWrapper,
  ActionButtonWrapper,
  ActionButtonLabel,
  ActionButton,
  ClearReactionsButton,
};
