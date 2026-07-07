import styled, { keyframes } from 'styled-components';
import Select from '@mui/material/Select';
import Button from '/imports/ui/components/common/button/component';
import Icon from '/imports/ui/components/common/icon/component';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  colorGrayLighter,
  colorPrimary,
  colorText,
  colorDanger,
  colorSuccess,
  colorWhite,
  colorOffWhite,
  colorGrayDark,
  colorBackground,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderSize,
  borderRadius,
  borderRadiusRounded,
  mdPaddingX,
  lgPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const PreFlightModal = styled(ModalSimple)`
  padding: 1rem;
  min-height: 20rem;
  max-height: 90vh;
  overflow-y: auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${lgPaddingX};
  width: 100%;

  @media ${smallOnly} {
    flex-direction: column;
  }
`;

const CameraColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 55%;
  min-width: 0;
`;

const DevicesColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 45%;
  gap: ${mdPaddingX};
  min-width: 0;
`;

const VideoPreview = styled.video<{ mirrored: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: ${borderSize};
  object-fit: cover;
  ${({ mirrored }) => mirrored && `transform: scale(-1, 1);`}
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: ${colorBackground};
  border-radius: ${borderRadiusRounded};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: ${colorWhite};
  text-align: center;
`;

const PlaceholderText = styled.span`
  padding: ${mdPaddingX};
  font-size: 0.9rem;
`;

const DeviceGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${borderSize};
  font-size: 0.85rem;
  font-weight: 600;
  color: ${colorText};
`;

const CameraSelect = styled(Select)`
  width: 100%;
  background-color: ${colorWhite};
  border: 0.1rem solid ${colorGrayLighter};
  border-radius: ${borderSize};
  font-size: 0.9rem;

  & > div:first-child {
    padding: 0.45rem 0.5rem;
  }

  fieldset {
    border: none;
  }
`;

const StreamVolumeWrapper = styled.div`
  width: 100%;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${borderSize};
  margin-top: ${mdPaddingX};
`;

const JoinButton = styled(Button)`
  width: 100%;
  font-weight: 600;

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
    outline-offset: 2px;
  }
`;

const ListenOnlyLink = styled.button`
  align-self: center;
  background: none;
  border: none;
  color: ${colorPrimary};
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  padding: 0.25rem;

  &:hover,
  &:focus-visible {
    opacity: 0.8;
  }
`;

const CameraToggle = styled.label`
  display: flex;
  align-items: center;
  gap: ${borderSize};
  font-size: 0.85rem;
  color: ${colorText};
  cursor: pointer;
  margin-top: ${borderSize};
`;

const ToggleInput = styled.input`
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: ${colorPrimary};

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
    outline-offset: 2px;
  }
`;

const PermissionDenied = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${borderSize};
  padding: ${mdPaddingX} 0;
  font-size: 0.85rem;
  color: ${colorText};
`;

const PermissionIcon = styled(Icon)`
  color: ${colorDanger};
  font-size: 1.25rem;
`;

const RetryButton = styled.button`
  background: none;
  border: none;
  color: ${colorPrimary};
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  padding: 0.25rem 0;

  &:hover,
  &:focus-visible {
    opacity: 0.8;
  }
`;

const LockedNote = styled.div`
  font-size: 0.85rem;
  color: ${colorText};
  padding: ${mdPaddingX} 0;
`;

const GuestRoomContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: ${lgPaddingX};
`;

const GuestRoomCard = styled.section`
  background-color: ${colorWhite};
  border-radius: ${borderRadiusRounded};
  padding: ${lgPaddingX};
  width: 100%;
  max-width: 48rem;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
`;

const GuestRoomTitle = styled.h1`
  font-size: ${fontSizeLarge};
  font-weight: 600;
  color: ${colorGrayDark};
  margin: 0 0 ${mdPaddingX} 0;
  text-align: center;
`;

const WaitingFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${borderSize};
  margin-top: ${mdPaddingX};
  color: ${colorText};
`;

const WaitingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${borderSize};
  font-size: 0.85rem;
`;

const WaitingDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: ${colorSuccess};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const WaitingPosition = styled.div`
  font-size: 0.85rem;
  opacity: 0.85;
`;

const HostMessage = styled.div`
  background-color: ${colorOffWhite};
  border-radius: ${borderRadius};
  padding: ${mdPaddingX};
  margin-top: ${borderSize};
  font-size: 0.85rem;
  color: ${colorText};
  text-align: center;
`;

const HostMessageLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: ${borderSize};
`;

export default {
  PreFlightModal,
  Content,
  CameraColumn,
  DevicesColumn,
  VideoPreview,
  VideoWrapper,
  PlaceholderText,
  DeviceGroup,
  CameraSelect,
  StreamVolumeWrapper,
  Footer,
  JoinButton,
  ListenOnlyLink,
  CameraToggle,
  ToggleInput,
  PermissionDenied,
  PermissionIcon,
  RetryButton,
  LockedNote,
  GuestRoomContainer,
  GuestRoomCard,
  GuestRoomTitle,
  WaitingFooter,
  WaitingIndicator,
  WaitingDot,
  WaitingPosition,
  HostMessage,
  HostMessageLabel,
};
