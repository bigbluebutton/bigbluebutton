import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const Help = styled.span`
  display: flex;
  flex-flow: column;
  height: 10rem;
`;

const Text = styled.div`
  text-align: center;
  margin-top: auto;
  margin-bottom: auto;
`;

const EnterAudio = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
`;

const BackButton = styled(Button)`
  margin-right: 0.5rem;
  margin-left: inherit;
  border: none;

  [dir="rtl"] & {
    margin-right: inherit;
    margin-left: 0.5rem;
  }

  @media ${smallOnly} {
    margin-right: none;
    margin-left: inherit;

    [dir="rtl"] & {
      margin-right: inherit;
      margin-left: auto;
    }
  }
`;

export default {
  Help,
  Text,
  EnterAudio,
  BackButton,
};
