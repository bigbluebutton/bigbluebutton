import styled, { keyframes } from 'styled-components';
import {
  colorWhite,
  colorWhiteSurface,
  colorOffWhite,
  colorBackground,
  colorOverlay,
  colorGrayDark,
  colorGrayLabel,
  colorPrimary,
  colorBorder,
  colorText,
  colorDanger,
  itemFocusBorder,
  previewControlBg,
  webcamBackgroundColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  lgBorderRadius,
  mdPaddingX,
  lgPaddingX,
  jumboPaddingY,
  smPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  fontSizeLarge,
  fontSizeLarger,
  fontSizeSmall,
  titlesFontWeight,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly, mediumOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import ProfileStyled from '/imports/ui/components/profile-settings/styles';

const Page = styled.div`
  display: flex;
  gap: ${lgPaddingX};
  box-sizing: border-box;
  width: 100%;
  height: 100vh;
  padding: ${lgPaddingX};
  background-color: ${colorBackground};
  overflow: auto;

  @media ${smallOnly} {
    flex-direction: column;
    gap: 0;
    height: 100%;
    padding: 0;
    /* No cards to sit behind on a phone: the screen is one flat surface. */
    background-color: ${colorWhiteSurface};
  }
`;

const Card = styled.div`
  background-color: ${colorWhiteSurface};
  border: 1px solid ${colorBorder};
  border-radius: ${lgBorderRadius};
  overflow: hidden;
`;

const SetupColumn = styled(Card)`
  display: flex;
  flex-direction: column;
  flex: 0 0 30rem;
  max-width: 100%;
  min-height: 0;

  /* Without min-height: 0 the panel's scrollbox overflows the card, which then
     clips its bottom sections. */
  & > ${ProfileStyled.RootContainer} {
    flex: 1;
    min-height: 0;
  }

  @media ${mediumOnly} {
    flex: 0 0 22rem;
  }

  @media ${smallOnly} {
    flex: 0 0 auto;
    border-width: 0;
    border-radius: 0;

    ${ProfileStyled.VideoPreview} {
      max-height: none;
      height: 15.5rem;
    }

    /* The panel's own scrollbox nested inside the page's scroll leaves its
       lower sections (virtual background) out of reach: on phones the card
       grows and the page is the only thing that scrolls. */
    & > ${ProfileStyled.RootContainer} {
      flex: 0 0 auto;
    }

    ${ProfileStyled.RootContainer} {
      height: auto;
    }

    ${ProfileStyled.ProfileSettings} {
      flex: 0 0 auto;
      /* Both axes: a lone overflow-y: visible computes back to auto while
         overflow-x stays hidden, keeping the nested scrollbox alive. */
      overflow: visible;
    }
  }
`;

// Not a <main>: client/main.html already wraps the client in one.
const ContentColumn = styled(Card)`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: ${lgPaddingX};
  text-align: center;

  @media ${smallOnly} {
    flex: 0 0 auto;
    min-height: auto;
    padding: 0;
    border-width: 0;
    border-radius: 0;
  }
`;

const CenterStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${mdPaddingX};
  margin: auto 0;
  max-width: 100%;
`;

// Phone only: the session heading belongs above the setup panel, so it is
// rendered there rather than moved by `order`, which leaves the reading and
// focus sequence behind the boxes it shifts.
const HeaderColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${mdPaddingX};
  box-sizing: border-box;
  width: 100%;
  padding: 2rem ${mdPaddingX} ${lgPaddingX};
  border-bottom: 1px solid ${colorBorder};
  background-color: ${colorWhiteSurface};
  text-align: center;
`;

const PanelTitle = styled.h2`
  margin: 0;
  padding: ${lgPaddingX} ${lgPaddingX} 0;
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
  font-weight: ${titlesFontWeight};
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media ${smallOnly} {
    padding: ${lgPaddingX} ${mdPaddingX} 0;
    font-size: ${fontSizeBase};
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  width: 6.25rem;
  height: 6.25rem;
  border: 0.625rem solid transparent;
  border-top-color: ${colorPrimary};
  border-left-color: ${colorPrimary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 4s;
  }
`;

const Heading = styled.h1`
  margin: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  color: ${colorGrayDark};
  /* 32px: the design sits between the XL and XXL type tokens. */
  font-size: 2rem;
  font-weight: ${textFontWeight};

  @media ${smallOnly} {
    font-size: ${fontSizeLarger};
    /* Neither type token: the design goes semibold on the phone heading. */
    font-weight: 600;
  }
`;

const Description = styled.p`
  margin: 0;
  max-width: 32rem;
  color: ${colorText};
  font-size: ${fontSizeLarge};
  font-weight: ${textFontWeight};
  line-height: 1.4;

  @media ${smallOnly} {
    font-size: ${fontSizeBase};
  }
`;

const Position = styled.div`
  color: ${colorText};
  font-size: ${fontSizeLarge};
  font-weight: ${textFontWeight};
`;

const MessageContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 34rem;
  padding: ${jumboPaddingY};
  border-radius: ${lgBorderRadius};
  background-color: ${colorOffWhite};
`;

const MessageLabel = styled.div`
  margin-bottom: ${mdPaddingX};
  color: ${colorPrimary};
  font-size: ${fontSizeBase};
  font-weight: ${titlesFontWeight};
`;

const MessageText = styled.div`
  margin: 0;
  color: ${colorText};
  font-size: ${fontSizeBase};
  font-style: italic;
  line-height: 1.4;
`;

const ErrorMessage = styled.p`
  margin: 0;
  max-width: 32rem;
  color: ${colorDanger};
  font-size: ${fontSizeBase};
  line-height: 1.4;
`;

const ActionsWrapper = styled.div`
  display: flex;
  gap: ${mdPaddingX};
  align-items: center;
  justify-content: center;

  & > button {
    min-width: 8.5rem;
    height: 3.375rem;
  }

  @media ${smallOnly} {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 3;
    box-sizing: border-box;
    padding: ${jumboPaddingY};
    background-color: ${colorWhiteSurface};
    border-top: 1px solid ${colorBorder};

    & > button {
      width: 100%;
      height: 3.5rem;
    }
  }
`;

// Holds the space the pinned bar takes out of the flow, so only the states that
// render one reserve any.
const ActionBar = styled.div`
  @media ${smallOnly} {
    /* The bar is jumboPaddingY + the 3.5rem button + jumboPaddingY + its border. */
    height: 6.5625rem;
  }
`;

const PreviewPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${smPadding};
  box-sizing: border-box;
  width: 100%;
  min-height: 14rem;
  padding: ${lgPaddingX};
  border-radius: 0.5rem;
  color: ${colorWhite};
  background-color: ${webcamBackgroundColor};
  font-size: ${fontSizeBase};
  text-align: center;
  overflow-wrap: anywhere;

  @media ${smallOnly} {
    min-height: 15.5rem;
  }
`;

// Lifts the toggles off the preview, as the design has them.
const PREVIEW_CONTROL_SHADOW = '0 0.125rem 0.5rem rgba(0, 0, 0, 0.25)';

// Positioned against ProfileStyled.VideoPreviewWrapper, the preview's ancestor.
const PreviewControls = styled.div`
  position: absolute;
  bottom: ${mdPaddingX};
  left: 0;
  right: 0;
  display: flex;
  gap: ${mdPaddingX};
  justify-content: center;
  align-items: center;
  z-index: 2;
`;

// Same row, with no preview to overlay (enableVideo off).
const PreviewControlsRow = styled.div`
  display: flex;
  gap: ${mdPaddingX};
  justify-content: center;
  align-items: center;
  padding: ${mdPaddingX} 0;
`;

const PreviewControlButton = styled.button.attrs({ type: 'button' })<{
  $active: boolean;
  // Laid over the camera preview, where a translucent white reads well. Off the
  // preview it would blend into the panel, so it falls back to the dark overlay.
  $overMedia?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: ${colorWhite};
  background-color: ${({ $active, $overMedia = true }) => {
    if ($active) return colorPrimary;
    return $overMedia ? previewControlBg : colorOverlay;
  }};
  box-shadow: ${PREVIEW_CONTROL_SHADOW};

  &:hover {
    filter: brightness(90%);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${itemFocusBorder}, ${PREVIEW_CONTROL_SHADOW};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const AudioModeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${smPadding};
  padding: 0 ${mdPaddingX};
`;

const AudioModeLabel = styled.div`
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
  font-weight: ${titlesFontWeight};
`;

export default {
  Page,
  SetupColumn,
  ContentColumn,
  CenterStack,
  PanelTitle,
  Spinner,
  Heading,
  Description,
  Position,
  MessageContainer,
  MessageLabel,
  MessageText,
  ErrorMessage,
  PreviewPlaceholder,
  HeaderColumn,
  ActionBar,
  ActionsWrapper,
  PreviewControls,
  PreviewControlsRow,
  PreviewControlButton,
  AudioModeContainer,
  AudioModeLabel,
};
