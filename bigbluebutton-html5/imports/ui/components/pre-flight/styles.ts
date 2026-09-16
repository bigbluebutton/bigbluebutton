import styled, { keyframes } from 'styled-components';
import {
  colorWhite,
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
  borderRadiusRounded,
  mdPaddingX,
  lgPaddingX,
  smPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  fontSizeLarge,
  fontSizeXL,
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
    height: 100%;
  }
`;

const Card = styled.div`
  background-color: ${colorWhite};
  border: 1px solid ${colorBorder};
  border-radius: ${lgBorderRadius};
  overflow: hidden;
`;

const SetupColumn = styled(Card)`
  display: flex;
  flex-direction: column;
  flex: 0 0 26rem;
  max-width: 100%;
  min-height: 0;

  /* Without min-height: 0 the panel's scrollbox overflows the card, which then
     clips its bottom sections. */
  & > *:last-child {
    flex: 1;
    min-height: 0;
  }

  @media ${mediumOnly} {
    flex: 0 0 22rem;
  }

  @media ${smallOnly} {
    flex: 0 0 auto;

    /* The panel's own scrollbox nested inside the page's scroll leaves its
       lower sections (virtual background) out of reach: on phones the card
       grows and the page is the only thing that scrolls. */
    & > *:last-child {
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
  justify-content: center;
  gap: ${mdPaddingX};
  padding: ${lgPaddingX};
  text-align: center;

  @media ${smallOnly} {
    flex: 0 0 auto;
    min-height: 18rem;
  }
`;

const PanelTitle = styled.h2`
  margin: 0;
  padding: ${lgPaddingX} ${lgPaddingX} 0;
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
  font-weight: ${titlesFontWeight};
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  width: 4rem;
  height: 4rem;
  border: 0.375rem solid transparent;
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
  font-size: ${fontSizeXL};
  font-weight: ${titlesFontWeight};
`;

const Description = styled.p`
  margin: 0;
  max-width: 32rem;
  color: ${colorText};
  font-size: ${fontSizeLarge};
  font-weight: ${textFontWeight};
  line-height: 1.4;
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
  padding: ${lgPaddingX};
  border-radius: ${borderRadiusRounded};
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

const JoinButtonWrapper = styled.div`
  & > button {
    min-width: 14rem;
    height: 3rem;
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
    min-height: 10rem;
  }
`;

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
  width: 3rem;
  height: 3rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: ${colorWhite};
  background-color: ${({ $active, $overMedia = true }) => {
    if ($active) return colorPrimary;
    return $overMedia ? previewControlBg : colorOverlay;
  }};

  &:hover {
    filter: brightness(90%);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${itemFocusBorder};
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
  JoinButtonWrapper,
  PreviewControls,
  PreviewControlsRow,
  PreviewControlButton,
  AudioModeContainer,
  AudioModeLabel,
};
