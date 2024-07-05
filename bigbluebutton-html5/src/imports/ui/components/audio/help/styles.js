import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { jumboPaddingY, smPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmaller,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorLink,
} from '/imports/ui/stylesheets/styled-components/palette';

const Help = styled.span`
  display: flex;
  flex-flow: column;
  min-height: 10rem;
`;

const Text = styled.div`
  text-align: center;
  justify-content: center;
  margin-top: auto;
  margin-bottom: auto;
`;

const EnterAudio = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${jumboPaddingY};
`;

const RetryButton = styled(Button)`
  margin-right: 0.5rem;
  margin-left: inherit;

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

const TroubleshootLink = styled.a`
  color: ${colorLink};
`;

const UnknownError = styled.label`
  font-size: ${fontSizeSmaller};
  justify-content: center;
  text-align: center;
  margin-top: ${smPaddingY};
  margin-bottom: ${smPaddingY};
`;

const PermissionHelpSteps = styled.ul`
  text-align: left;
  justify-content: center;
  li {
    margin-bottom: ${smPaddingY};
  }
`;

export default {
  Help,
  Text,
  EnterAudio,
  RetryButton,
  TroubleshootLink,
  UnknownError,
  PermissionHelpSteps,
};
