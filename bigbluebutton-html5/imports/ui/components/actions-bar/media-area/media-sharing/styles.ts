import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  colorDanger, colorWhite, colorGrayUserListToolbar, colorPrimary, appsGalleryOutlineColor,
  colorText, colorGrayIcons, appsPanelTextColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import { lgBorderRadius } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';

const MODAL_WIDTH = '26.25rem';
const MODAL_WIDTH_REDUCED = '250px';

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

// @ts-ignore - Button is JSX element
const ConfirmationButton = styled(Button)`
  display: flex;
  width: 100%;
  height: 3.5rem;
  padding: 1rem;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex: 1 0 0;
  border-radius: ${lgBorderRadius};
  font-size: 1rem;

  ${({ color }) => color === 'danger' && `
    border: 1px solid ${colorDanger};
  `}

  &:hover {
    opacity: 0.8;
  }

  i { 
    font-size: 1.5rem; 
  }
`;

// Modal container positioned in the bottom right corner.
const ModalContainer = styled.div<{
  isMobile: boolean,
  isRTL: boolean,
  actionsBarHeight: number,
  reducedWidth?: boolean,
}>`
  position: fixed;
  background: ${colorWhite};
  box-shadow: -4px 4px 8px 0px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  z-index: 1100;
  bottom: ${({ actionsBarHeight }) => actionsBarHeight}px;
  border-radius: ${lgBorderRadius};

  ${({
    isMobile, isRTL, reducedWidth,
  }) => (isMobile ? `
    width: 70%;
    right: 6%;
    left: auto;
  ` : `
    width: ${reducedWidth ? MODAL_WIDTH_REDUCED : MODAL_WIDTH};
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
  padding: 1rem;
  border-top: 1px solid ${appsGalleryOutlineColor};
  display: flex;
  justify-content: center;
`;

// Styles for the sub-view (when presentation/externalvideo/cameraAsContent is selected)
const SubViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const SubHeader = styled.div`
  display: flex;
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

  ${ConfirmationButton} {
    height: 2.5rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    min-width: 8.5rem;
  }
`;

const BecomePresenterText = styled.div`
  color: ${colorText};
`;

export default {
  Overlay,
  ConfirmationButton,
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
};
