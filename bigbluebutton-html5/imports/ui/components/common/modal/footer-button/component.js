import styled, { css } from 'styled-components';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import { confirmationButtonMinWidth } from '/imports/ui/stylesheets/styled-components/general';

// The footer button every modal shares, so a dialog's buttons have the same
// width whichever modal they sit in. A filled or outlined button gets the
// Design System floor; a subtle one (a text action such as Cancel) keeps the
// width of its label. BBButton has no width prop, hence styled().
const ModalFooterButton = styled(BBButton)`
  ${({ variant }) => variant !== 'subtle' && css`
    min-width: ${confirmationButtonMinWidth};
  `}
`;

export default ModalFooterButton;
