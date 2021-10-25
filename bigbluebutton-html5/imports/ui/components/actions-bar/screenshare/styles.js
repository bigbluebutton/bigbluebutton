import styled from 'styled-components';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';

const ScreenShareModal = styled(Modal)`
  padding: var(--jumbo-padding-y);
  min-height: var(--min-modal-height);
  text-align: center;
`;

const Title = styled.h3`
  font-weight: var(--headings-font-weight);
  font-size: var(--font-size-large);
  color: var(--color-background);
  white-space: normal;
  padding-bottom: var(--md-padding-x);
`;

const ScreenShareButton = styled(Button)`
  ${({ ghost }) => ghost && `
      span {
        box-shadow: none;
        background-color: transparent !important;
        border-color: var(--color-white) !important;
      }
   `}
`;

export default {
  ScreenShareModal,
  Title,
  ScreenShareButton,
};
