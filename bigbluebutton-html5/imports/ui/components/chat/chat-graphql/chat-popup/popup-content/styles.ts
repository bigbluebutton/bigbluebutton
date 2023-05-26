import styled from "styled-components";
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
  display: flex;
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
`;

export const CloseButton = styled(Button)`
  background-color: transparent;
  padding: 0;
`;


