import styled from 'styled-components';
import { visuallyHidden } from '/imports/ui/components/common/visually-hidden/styles';

export const ExternalVideoOverlay = styled.div`
  z-index: 1;
  position: absolute;
  inset: 0;
  outline: none;
`;

export const KeyboardHint = styled.span`
  ${visuallyHidden}
`;

export default {
  ExternalVideoOverlay,
  KeyboardHint,
};
