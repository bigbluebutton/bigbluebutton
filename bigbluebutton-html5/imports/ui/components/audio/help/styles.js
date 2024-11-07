import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  mdPaddingY,
  smPaddingX,
  jumboPaddingY,
  smPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  fontSizeSmall,
  fontSizeSmaller,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorLink,
  colorGrayDark,
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
  font-size: ${fontSizeBase};

  @media ${smallOnly} {
    font-size: ${fontSizeSmall};
  }
`;

const Subtitle = styled.div`
  margin-bottom: ${mdPaddingY};
  justify-content: center;
  text-align: center;
  font-size: calc(${fontSizeBase} + 0.05rem);
  color: ${colorGrayDark};
  white-space: normal;

  @media ${smallOnly} {
    font-size: ${fontSizeSmall};
    padding: 0 ${smPaddingX};
  }
`;

const EnterAudio = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${jumboPaddingY};
`;

const HelpActionButton = styled(Button)`
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

const HelpItems = styled.ul`
  text-align: left;
  justify-content: center;
  li {
    margin-bottom: ${smPaddingY};
  }
  font-size: ${fontSizeBase};

  @media ${smallOnly} {
    font-size: ${fontSizeSmall};
  }
`;

export default {
  Help,
  Text,
  EnterAudio,
  HelpActionButton,
  TroubleshootLink,
  UnknownError,
  HelpItems,
  Subtitle,
};
