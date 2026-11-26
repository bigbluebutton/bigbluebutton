import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const LKAutoplayModalContent = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  margin-top: auto;
  margin-bottom: auto;
  padding: 0.5rem 0;
  min-height: 20rem;

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
    margin: 0 !important;

    [dir="rtl"] & {
      margin: inherit inherit inherit 0 !important;
    }
  }
`;

export default {
  LKAutoplayModalContent,
};
