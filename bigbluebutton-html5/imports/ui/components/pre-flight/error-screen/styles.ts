import styled from 'styled-components';
import ReactModal from 'react-modal';
import {
  colorGrayLabel,
  colorGrayIcons,
  colorWhiteSurface,
  noticeWarningBg,
  noticeWarningBorder,
  noticeWarningText,
  noticeWarningIcon,
} from '/imports/ui/stylesheets/styled-components/palette';
import { mdPaddingX, jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  fontSizeMedium,
  fontSizeSmall,
  btnFontWeight,
  headingsFontWeight,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import PreFlightStyled from '../styles';

const NoticeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid ${noticeWarningBorder};
  border-radius: 62.5rem;
  color: ${noticeWarningText};
  background-color: ${noticeWarningBg};
  font-size: ${fontSizeSmall};
  font-weight: ${btnFontWeight};
  line-height: 1.25rem;

  & > svg {
    width: 1rem;
    height: 1rem;
    color: ${noticeWarningIcon};
  }
`;

const ErrorBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
`;

const ErrorText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${mdPaddingX};
  max-width: 100%;
`;

const ErrorHeading = styled(PreFlightStyled.Heading)`
  max-width: 27rem;
  font-weight: ${headingsFontWeight};
  line-height: 2.75rem;

  /* On a phone the heading sits in a dialog, which the design sets smaller. */
  @media ${smallOnly} {
    font-size: 1.25rem;
    line-height: 1.6875rem;
  }
`;

// The description and the notice keep the palette's text colour: the design's
// #717C91 is 4.2:1 on white, under WCAG AA at these sizes.
const ErrorDescription = styled(PreFlightStyled.Description)`
  max-width: 25rem;
  font-size: ${fontSizeMedium};

  @media ${smallOnly} {
    font-size: ${fontSizeBase};
    line-height: 1.375rem;
  }
`;

const ErrorNotice = styled.div`
  max-width: 25rem;
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

// The error's own buttons: on a phone they sit in the dialog and share its
// width, rather than in the join button's fixed bar.
const ErrorActions = styled.div`
  display: flex;
  gap: ${mdPaddingX};
  align-items: center;
  justify-content: center;

  & > button {
    min-width: 8.5rem;
    height: 3.375rem;
  }

  @media ${smallOnly} {
    align-self: stretch;

    & > button {
      flex: 1;
    }
  }
`;

// Phone only: the error opens over the screen it interrupts. The content's
// class replaces react-modal's inline defaults; the doubled selector outranks
// the global .ReactModal__Content width.
const Dialog = styled(ReactModal)`
  && {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${jumboPaddingY};
    box-sizing: border-box;
    width: min(25rem, calc(100vw - 2.5rem));
    max-height: calc(100% - 2.5rem);
    padding: ${jumboPaddingY};
    border-radius: 0.5rem;
    background-color: ${colorWhiteSurface};
    text-align: center;
    overflow-y: auto;
    outline: none;
  }
`;

const DialogClose = styled.div`
  position: absolute;
  top: ${mdPaddingX};
  right: ${mdPaddingX};

  & svg {
    color: ${colorGrayIcons};
  }
`;

export default {
  ErrorActions,
  Dialog,
  DialogClose,
  NoticeBadge,
  ErrorBlock,
  ErrorText,
  ErrorHeading,
  ErrorDescription,
  ErrorNotice,
};
