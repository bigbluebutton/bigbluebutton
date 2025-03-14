import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const LKAutoplayModal = styled(ModalSimple)`
  padding: 1rem;
  min-height: 20rem;
`;

const LKAutoplayModalContent = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  margin-top: auto;
  margin-bottom: auto;
  padding: 0.5rem 0;

  button:first-child {
    margin: 0 3rem 0 0;

    [dir="rtl"] & {
      margin: 0 0 0 3rem;
    }

    @media ${smallOnly} {
      margin: 0 1rem 0 0;

      [dir="rtl"] & {
        margin: 0 0 0 1rem;
      }
    }
  }

  button:only-child {
    margin: inherit 0 inherit inherit;

    [dir="rtl"] & {
      margin: inherit inherit inherit 0 !important;
    }
  }
`;

export default {
  LKAutoplayModal,
  LKAutoplayModalContent,
};
