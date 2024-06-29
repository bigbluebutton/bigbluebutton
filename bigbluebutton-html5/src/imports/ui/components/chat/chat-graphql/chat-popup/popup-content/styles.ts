import styled from 'styled-components';
import {
  borderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, btnFontWeight } from '/imports/ui/stylesheets/styled-components/typography';
import {
  systemMessageBackgroundColor,
  systemMessageBorderColor,
  systemMessageFontColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

export const PopupContentBox = styled.div`
  display: inherit;
  flex-direction: column;
  align-items: flex-start;
  background-color: ${systemMessageBackgroundColor};
  border: 1px solid ${systemMessageBorderColor};
  border-radius: ${borderRadius};
  padding: ${fontSizeBase};
  margin-top: 0;
  margin-bottom: 1rem;
  z-index: 10;
`;

export const PopupContentHeader = styled.div`
  align-self: flex-end;
`;

export const PopupContentBody = styled.div`
  color: ${systemMessageFontColor};
  font-weight: ${btnFontWeight};
  overflow-wrap: break-word;
  word-break: break-word;
`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - as button comes from JS, we can't provide its props
export const CloseButton = styled(Button)`
  border: none;
  background-color: transparent;
  grid-area: 1 / 1 / 2 / 2;
  justify-self: end;
  cursor: pointer;
  transition: background-color 0.3s ease;
  float: right;
`;
