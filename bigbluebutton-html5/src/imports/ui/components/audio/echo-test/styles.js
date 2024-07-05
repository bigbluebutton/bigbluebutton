import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const EchoTest = styled.span`
  margin-top: auto;
  margin-bottom: auto;
`;

const EchoTestButton = styled(Button)`
  &:focus {
    outline: none !important;
  }

  &:first-child {
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

  span:last-child {
    color: black;
    font-size: 1rem;
    font-weight: 600;
  }
`;

export default {
  EchoTest,
  EchoTestButton,
};
