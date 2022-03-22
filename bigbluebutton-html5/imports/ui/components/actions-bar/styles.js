import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { smPaddingX, smPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const ActionsBar = styled.div`
  display: flex;
  flex-direction: row;
`;

const Left = styled.div`
  display: inherit;
  flex: 0;

  > * {
    margin: 0 ${smPaddingX};

    @media ${smallOnly} {
      margin: 0 ${smPaddingY};
    }
  }

  @media ${smallOnly} {
    bottom: ${smPaddingX};
    left: ${smPaddingX};
    right: auto;

    [dir="rtl"] & {
      left: auto;
      right: ${smPaddingX};
    }
  }

`;

const Center = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: center;

  > * {
    margin: 0 ${smPaddingX};

    @media ${smallOnly} {
      margin: 0 ${smPaddingY};
    }
  }

`;

const Right = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  position: relative;

  [dir="rtl"] & {
    right: auto;
    left: ${smPaddingX};
  }

  @media ${smallOnly} {
    right: 0;
    left: 0;
    display: contents;
  }

  > * {
    margin: 0 ${smPaddingX};

    @media ${smallOnly} {
      margin: 0 ${smPaddingY};
    }
  }
`;

const RaiseHandButton = styled(Button)`
  ${({ emoji }) => emoji !== 'raiseHand' && `
      span {
        box-shadow: none;
        background-color: transparent !important;
        border-color: ${colorWhite} !important;
      }
   `}
`;

export default {
  ActionsBar,
  Left,
  Center,
  Right,
  RaiseHandButton,
};
