import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { smPaddingX, smPaddingY, barsPadding } from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorBackground,
  btnDefaultBg,
  btnDefaultColor,
  defaultBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const ActionsBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;

  ${({ $overflowEnabled }) => $overflowEnabled && `
    /* An item that shrank instead would never free enough room to trigger the collapse. */
    [data-overflow-item] {
      flex-shrink: 0;
      /* Items that render several buttons (the mobile mic and speaker) keep the group's spacing. */
      gap: inherit;
    }

    /* Items that render nothing (e.g. captions off) must not add a gap. */
    [data-overflow-item]:empty {
      display: none;
    }

    /* Flex hands the free room out unevenly (an empty side gives its share to the other), so the
       room the bar reserves around the center group is held as margins, one group gap each. On
       small screens the last group is display: contents and its first child has this margin. */
    > :first-child {
      margin-inline-end: ${smPaddingX};
    }

    > :last-child {
      margin-inline-start: ${smPaddingX};

      /* Its RTL offset would push it over that margin. */
      [dir="rtl"] & {
        left: auto;
      }
    }
  `}
`;

const ActionsBarWrapper = styled.section`
  flex: 1;
  padding: ${barsPadding};
  background-color: ${colorBackground};
  position: relative;
  order: 3;
`;

const ItemsGroup = `
  display: flex;
  align-items: center;
  flex-grow: 1;
  flex-shrink: 1;
  gap: ${smPaddingX};
`;

const Left = styled.div`
  ${ItemsGroup}
  flex-basis: 0;
  justify-content: flex-start;
  > *:not(span):not([data-overflow-item]),
  > [data-overflow-item] > *:not(span) {
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
  ${ItemsGroup}
  justify-content: center;
`;

const Right = styled.div`
  ${ItemsGroup}
  flex-basis: 0;
  justify-content: flex-end;
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
  height: 100%;
`;

const PresentationButtonsWrapper = styled.div`
  color: ${btnDefaultColor};
  background-color: ${btnDefaultBg};
  border-radius: 3rem;
  display: flex;
  gap: .2rem;
  align-items: center;
  height: 100%;

  @media ${smallOnly} {
    height: 2.5rem;
    margin-left: ${smPaddingX};
    [dir="rtl"] & {
      margin-left: 0;
      margin-right: ${smPaddingX};
    }
  }
`;

const Divider = styled.div`
  border: .5px solid ${defaultBorder};
  height: 50%;
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

const Gap = styled.div`
  display: flex;
  gap: .5rem;
`;

export default {
  ActionsBar,
  Left,
  Center,
  Right,
  PresentationButtonsWrapper,
  Divider,
  RaiseHandButton,
  ButtonContainer,
  ReactionsDropdown,
  Wrapper,
  ActionsBarWrapper,
  Gap,
  Separator,
};
