import styled, { css } from 'styled-components';
import {
  BBButton, borderRadiusDefault, spacingSmall, spacingSmallMedium,
} from '@bigbluebutton/bbb-ui-components-react';
import {
  colorWhite, colorGrayUserListToolbar, colorPrimary, appsGalleryOutlineColor,
  colorText, colorGrayIcons, appsPanelTextColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import { lgBorderRadius } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';

const MODAL_WIDTH = '26.25rem';
const MODAL_VIEWPORT_MARGIN = '1rem';

// This overlay covers the entire viewport and is used to catch outside clicks.
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 1000;
`;

// Modal container positioned in the bottom right corner.
const ModalContainer = styled.div<{
  isMobile: boolean,
  isRTL: boolean,
  actionsBarHeight: number,
}>`
  position: fixed;
  background: ${colorWhite};
  box-shadow: -4px 4px 8px 0px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  z-index: 1100;
  bottom: ${({ actionsBarHeight }) => actionsBarHeight}px;
  border-radius: ${lgBorderRadius};
  /* Never taller than the space above the actions bar: the content scrolls
     inside instead of pushing the header off the top of the screen. dvh is
     what the mobile browser bars leave visible; vh is the fallback. */
  max-height: calc(100vh - ${({ actionsBarHeight }) => actionsBarHeight}px - ${MODAL_VIEWPORT_MARGIN});
  max-height: calc(100dvh - ${({ actionsBarHeight }) => actionsBarHeight}px - ${MODAL_VIEWPORT_MARGIN});

  ${({
    isMobile, isRTL,
  }) => (isMobile ? `
    width: min(${MODAL_WIDTH}, 92%);
    ${isRTL ? `
      left: 4%;
      right: auto;
    ` : `
      right: 4%;
      left: auto;
    `}
  ` : `
    width: ${MODAL_WIDTH};
    ${isRTL ? `
      left: 24px;
      right: auto;
    ` : `
      right: 24px;
      left: auto;
    `}
  `)}
`;

// Header container to hold the title and close button.
const HeaderContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid ${appsGalleryOutlineColor};

  h2 {
    margin: 0;
    font-size: ${fontSizeBase};
    font-weight: ${headingsFontWeight};
    text-transform: uppercase;
  }
`;

// Content container for the media grid or sub-view.
const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Allows content to fill available space if modal has fixed height */
  min-height: 0; /* Lets it shrink below its content, so it scrolls instead of overflowing the modal */
  overflow-y: auto; /* Add scroll if content overflows */
`;

// Grid layout for displaying media options.
const MediaGrid = styled.div<{ isMobile: boolean }>`
  padding: ${({ isMobile }) => (isMobile ? '0.5rem' : '1rem')};
  gap: ${({ isMobile }) => (isMobile ? '0.5rem' : '1rem')};
  display: grid;
  grid-template-columns: ${({ isMobile }) => (isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)')};
  text-align: center;
  justify-items: center;
`;

// Footer container for the start/stop sharing button.
const FooterContainer = styled.div`
  flex-shrink: 0;
  padding: 1rem;
  border-top: 1px solid ${appsGalleryOutlineColor};
  display: flex;
  justify-content: center;
`;

// Styles for the sub-view (when presentation/externalvideo/cameraAsContent is selected)
const SubViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
`;

const SubHeader = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding: 1rem;
`;

const BackButtonIcon = styled(ExpandCircleDownIcon)`
  transform: rotate(90deg);
  color: ${colorPrimary};
`;

const SubHeaderTitle = styled.span`
  font-size: 1.1rem;
  color: ${appsPanelTextColor};
  margin-left: 0.5rem;
  flex-grow: 1;
  text-align: left;
`;

const SubHeaderIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto; /* Pushes icon to the far right of the title's flex space */
  margin-right: 0.5rem;
  color: ${colorGrayIcons};
  i {
    font-size: 1.5rem;
    line-height: 1;
  }
`;

const SubViewContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  text-align: center;

  p {
    margin-bottom: 16px;
  }
`;

const SubViewContentText = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 1.5rem;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex: 1 0 0;
  border-radius: 0.5rem;
  border: 1px dashed ${colorPrimary};
  background: ${colorGrayUserListToolbar};
`;

const BecomePresenterViewContainer = styled.div`
  display: inline-flex;
  padding: 1rem;
  flex-direction: column;
  gap: 1rem;
`;

// The take/request presenter button spans the popover, so it keeps one size
// whatever the label. BBButton never wraps its label and some translations are
// wider than the popover, so let them wrap instead of overflowing.
const BecomePresenterButton = styled(BBButton)`
  white-space: normal;
`;

const BecomePresenterText = styled.div`
  color: ${colorText};
`;

// Not a BBButton: the library's disabled style would make this status even
// fainter. It takes BBButton's `sm` box instead, so the button keeps its size
// when a request turns into a wait.
const WaitingButton = styled.button<{ $animations?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacingSmall};
  padding: ${spacingSmall} ${spacingSmallMedium};
  border-radius: ${borderRadiusDefault};
  font-size: 1rem;
  font-weight: 600;
  background-color: #e0e0e0;
  color: #666;
  border: 1px solid transparent;
  cursor: not-allowed;
  opacity: 0.7;

  svg {
    ${({ $animations }) => $animations && css`
      animation: spin 1.5s linear infinite;
    `}
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export default {
  Overlay,
  BecomePresenterButton,
  ModalContainer,
  HeaderContainer,
  ContentContainer,
  MediaGrid,
  FooterContainer,
  SubViewWrapper,
  SubHeader,
  SubHeaderTitle,
  SubHeaderIconContainer,
  SubViewContent,
  SubViewContentText,
  BackButtonIcon,
  BecomePresenterViewContainer,
  BecomePresenterText,
  WaitingButton,
};
