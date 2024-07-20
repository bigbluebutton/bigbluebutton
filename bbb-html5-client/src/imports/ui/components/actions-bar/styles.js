import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { smPaddingX, smPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

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
${({ ghost }) => ghost && `
  & > span {
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

const ReactionsDropdown = styled.div`
  position: relative;
`;

const Wrapper = styled.div`
  overflow: hidden;
  margin: 0.2em 0.2em 0.2em 0.2em;
  text-align: center;
  max-height: 270px;
  width: 270px;
  em-emoji {
    cursor: pointer;
  }
`;

const Separator = styled.div`
  height: 2.5rem;
  width: 0;
  border: 1px solid ${colorWhite};
  align-self: center;
  opacity: .75;
`;

export default {
  ActionsBar,
  Left,
  Center,
  Right,
  RaiseHandButton,
  ButtonContainer,
  ReactionsDropdown,
  Wrapper,
  Separator,
};
