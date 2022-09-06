import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { smPaddingX, smPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const ActionsBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
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

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  > * {
    margin: 8px;
  }
`;

const InteractionsDropdown = styled.div`
  position: relative;
`;

const Wrapper = styled.div`
  .emoji-mart-bar {
    display: none;
  }
  .emoji-mart-search {
    display: none;
  }
  .emoji-mart-category[aria-label="Frequently Used"] {
    display: none;
  }
  .emoji-mart-category-label{
    display: none;
  }
  .emoji-mart-scroll{
    overflow:hidden;
    padding: 0;
    height: 300px;
  }
  .emoji-mart{
    border: none;
  }
`;

export default {
  ActionsBar,
  Left,
  Center,
  Right,
  RaiseHandButton,
  ButtonContainer,
  InteractionsDropdown,
  Wrapper,
};
