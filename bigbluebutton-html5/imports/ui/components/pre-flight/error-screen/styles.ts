import styled from 'styled-components';
import ReactModal from 'react-modal';
import {
  colorGrayLabel,
  colorGrayIcons,
  colorLink,
  colorWhiteSurface,
  noticeWarningBg,
  noticeWarningBorder,
  noticeWarningText,
  noticeWarningIcon,
  noticeDangerBg,
  noticeDangerBorder,
  noticeDangerText,
  noticeDangerIcon,
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
import type { PreFlightErrorTone } from './component';

const NOTICE_TONES = {
  warning: {
    bg: noticeWarningBg,
    border: noticeWarningBorder,
    text: noticeWarningText,
    icon: noticeWarningIcon,
  },
  danger: {
    bg: noticeDangerBg,
    border: noticeDangerBorder,
    text: noticeDangerText,
    icon: noticeDangerIcon,
  },
};

const BadgeIcon = styled.span`
  display: inline-flex;

  & > svg {
    width: 1rem;
    height: 1rem;
  }
`;

const NoticeBadge = styled.div<{ $tone: PreFlightErrorTone }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid ${({ $tone }) => NOTICE_TONES[$tone].border};
  border-radius: 62.5rem;
  color: ${({ $tone }) => NOTICE_TONES[$tone].text};
  background-color: ${({ $tone }) => NOTICE_TONES[$tone].bg};
  font-size: ${fontSizeSmall};
  font-weight: ${btnFontWeight};
  line-height: 1.25rem;

  & ${BadgeIcon} {
    color: ${({ $tone }) => NOTICE_TONES[$tone].icon};
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

const ErrorHeading = styled(PreFlightStyled.Heading)<{ $wide: boolean }>`
  max-width: ${({ $wide }) => ($wide ? '30.9375rem' : '27rem')};
  font-weight: ${headingsFontWeight};
  line-height: 2.75rem;

  /* On a phone the heading sits in a dialog, which the design sets smaller. */
  @media ${smallOnly} {
    ${({ $wide }) => $wide && 'max-width: 17.1875rem;'}
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

// A text button in the design: its padding is the click target and, with the
// stack's gap, the spec's 24px above the link and 40px down to the actions.
const HelpLink = styled.a`
  display: inline-flex;
  padding: ${mdPaddingX};
  margin: -0.5rem 0 0.5rem;
  border-radius: 1rem;
  color: ${colorLink};
  font-size: ${fontSizeBase};
  font-weight: ${btnFontWeight};
  line-height: 1.375rem;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }

  /* In the phone dialog the stack's gap is 24px, not 16px: the same 24px and
     40px come out of a deeper pull-up and no bottom margin. The link spans the
     dialog, as the design's text button does. */
  @media ${smallOnly} {
    align-self: stretch;
    justify-content: center;
    margin: -1rem 0 0;
  }
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
    /* The library underlines its subtle variant; the design's secondary
       action is a plain text button. */
    text-decoration: none;
  }

  @media ${smallOnly} {
    align-self: stretch;
    flex-wrap: wrap;

    /* Side by side while both labels fit, one per row otherwise: a fixed
       min-width alone lets a long label overflow the dialog. */
    & > button {
      flex: 1 0 8.5rem;
      min-width: fit-content;
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
  BadgeIcon,
  HelpLink,
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
