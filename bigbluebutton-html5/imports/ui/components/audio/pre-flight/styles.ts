import styled from 'styled-components';
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
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderSize,
  mdPaddingX,
  lgPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';

const PreFlightModal = styled(ModalSimple)`
  padding: 1rem;
  min-height: 20rem;
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
  background-color: #1b3c4b;
  border-radius: ${borderSize};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #fff;
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
  background-color: #fff;
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
  align-items: center;
  gap: ${borderSize};
  margin-top: ${mdPaddingX};
`;

const JoinButton = styled(Button)`
  min-width: 12rem;
`;

const ListenOnlyLink = styled.button`
  background: none;
  border: none;
  color: ${colorPrimary};
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  padding: 0.25rem;

  &:hover,
  &:focus {
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
};
