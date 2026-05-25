import styled, { css, keyframes } from 'styled-components';
import {
  colorWhite, colorText, colorPrimary, colorDanger,
  colorGrayDark, colorLink, colorBorder, colorSuccess, colorGrayLight,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPadding,
  contentSidebarPadding,
  contentSidebarBorderRadius,
  lgBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall, fontSizeBase, textFontWeight, titlesFontWeight, fontSizeLarge,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly, mediumOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import CameraIcon from '@mui/icons-material/Videocam';
import WbSunny from '@mui/icons-material/WbSunny';
import Headphones from '@mui/icons-material/Headphones';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowCircleLeft from '@mui/icons-material/ArrowCircleLeftTwoTone';
import ArrowCircleRight from '@mui/icons-material/ArrowCircleRightTwoTone';
import Mic from '@mui/icons-material/Mic';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import { styled as materialStyled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '/imports/ui/components/common/button/component';

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${colorWhite};
`;

const ProfileSettings = styled(ScrollboxVertical)`
  display: flex;
  flex: 1;
  margin: 0 ${smPadding} 0;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: ${contentSidebarBorderRadius};
  background: ${colorWhite};
  overflow-y: auto;
  overflow-x: hidden;
`;

interface VideoPreviewProps {
  mirroredVideo: boolean;
}

const VideoPreview = styled.video<VideoPreviewProps>`
  max-height: 14rem;
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 8px 8px 24px 0px rgba(0, 0, 0, 0.10);

  @media ${smallOnly} {
    height: 10rem;
  }

  ${({ mirroredVideo }) => mirroredVideo && `
    transform: scale(-1, 1);
  `}
`;

const VideoPreviewContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0px ${contentSidebarPadding};
`;

const VideoPreviewWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
`;

const PreviewArrowButton = styled.button<{ position: 'left' | 'right' }>`
  background: transparent;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  align-self: stretch;
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  ${({ position }) => (position === 'left' ? 'left: 0;' : 'right: 0;')}

  &:hover {
    & > svg {
      opacity: 0.8;
    }
  }
`;

const VideoPreviewContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colorWhite};

  color: ${colorText};
  font-weight: normal;

  @media ${smallOnly} {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    margin: 5px;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;

  @media ${smallOnly}, ${mediumOnly} {
    justify-content: space-between;
    align-items: center;
    overflow: auto;
    margin: 0;
  }
`;

const VideoCol = styled(Col)`
  align-items: center;
`;

interface FetchingAnimationProps {
  animations: boolean;
}

const ellipsis = keyframes`
  to {
    width: 1.5em;
  }
`;

const FetchingAnimation = styled.span<FetchingAnimationProps>`
  margin: auto;
  display: inline-block;
  width: 1.5em;

  &:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    content: "\\2026"; /* ascii code for the ellipsis character */
    width: 0;
    margin-left: 0.25em;

    ${({ animations }) => animations && css`
      animation: ${ellipsis} steps(4, end) 900ms infinite;
    `}
  }
`;

const UsernameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0.5rem ${contentSidebarPadding} 0px ${contentSidebarPadding};
`;

const UsernameTitle = styled.div`
  color: ${colorGrayDark};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

const Username = styled.div`
  color: ${colorGrayDark};
  font-size: ${fontSizeLarge};
  font-weight: ${titlesFontWeight};
`;

const UserPresenceRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  width: 100%;
  padding: 0px ${contentSidebarPadding};
`;

const UserPresenceField = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;

const UserPresenceIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  flex-shrink: 0;
`;

const UserPresenceDropdown = styled(Select)`
  flex: 1;
  height: 3rem;
  border-radius: 0.5rem !important;
  overflow: hidden;
`;

const UserPresenceValueContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserPresenceStatusDot = styled.div<{ away?: boolean }>`
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${({ away }) => (away ? colorGrayLight : colorSuccess)};
`;

const UserPresenceText = styled.span`
  color: ${colorGrayDark};
  font-size: ${fontSizeBase};
  font-weight: ${textFontWeight};
`;

const Separator = styled.hr`
  width: 100%;
  border: 0;
  border-bottom: 1px solid ${colorBorder};
`;

const DevicesSettingsContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
  padding: 0px ${contentSidebarPadding};
`;

const DeviceContainer = styled.div<{ extraPadding?: boolean }>`
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: 1rem;
  align-items: center;
  ${({ extraPadding }) => extraPadding && `
    padding-left: 2.5rem;
  `}
`;

const Icon = `
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  color: ${colorPrimary};
`;

const IconCamera = styled(CameraIcon)`
  ${Icon}
`;

const WbSunnyIcon = styled(WbSunny)`
  ${Icon}
`;

const HeadphonesIcon = styled(Headphones)`
  ${Icon}
`;

const MicIcon = styled(Mic)`
  ${Icon}
`;

const ArrowLeftIcon = styled(ArrowCircleLeft)`
  ${Icon}
  width: 2rem !important;
  height: 2rem !important;
  & path:first-of-type {
    fill: ${colorPrimary};
    fill-opacity: 1;
    opacity: 1;
  }

  & path:last-of-type {
    fill: ${colorWhite};
  }
`;

const ArrowRightIcon = styled(ArrowCircleRight)`
  ${Icon}
  width: 2rem !important;
  height: 2rem !important;
  & path:first-of-type {
    fill: ${colorPrimary};
    fill-opacity: 1;
    opacity: 1;
  }

  & path:last-of-type {
    fill: ${colorWhite};
  }
`;

const AddCameraIcon = styled(AddCircleIcon)`
  ${Icon}
`;

const DeviceSelector = styled(Select)`
  height: 3rem;
  border-radius: 0.5rem !important;
  overflow: hidden;
  width: 100%;
`;

const CameraQualityContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 0.5rem;
`;

const CameraQualityText = styled.div`
  color: ${colorGrayDark};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

const CameraQualitySelector = styled(DeviceSelector)`
  width: 100%;
`;

const CameraNameLabel = styled.div`
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: ${colorWhite};
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: ${fontSizeSmall};
  z-index: 2;
`;

const VirtualBackgroundContainer = styled.div<{ extraPadding?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${contentSidebarPadding};
  align-self: stretch;
  padding: 0px ${contentSidebarPadding};
  ${({ extraPadding }) => extraPadding && `
    padding-left: 3.5rem;
  `}
`;

const SwitchTitle = styled(FormControlLabel)`
  flex-shrink: 0;
  .MuiFormControlLabel-label {
    color: ${colorGrayDark};
    font-size: ${fontSizeBase}
    font-weight: ${textFontWeight};
  }
`;

const MaterialSwitch = materialStyled(Switch)(({ theme }) => ({
  width: 24,
  height: 14,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      // width: 10,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: colorPrimary,
        ...theme.applyStyles('dark', {
          backgroundColor: colorPrimary,
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 7,
    height: 7,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
    transform: 'translateY(1px)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

const BrightnessSlider = styled(Slider)`
  & .MuiSlider-thumb {
    height: 1rem;
    width: 1rem;
  };
  & .MuiSlider-track {
    height: 5px;
  }
`;

const VirtualBgSelectorBorder = styled.div`
  width: 100%;
  border-radius: 0.25rem;
  border: 1px solid ${colorBorder};
`;

const CaptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  gap: 1.0rem;
  padding: 0px ${contentSidebarPadding};
`;

const CaptionsToggleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
`;

const CaptionsSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 0.5rem;
`;

const CaptionsLanguageText = styled.div`
  color: ${colorGrayDark};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

const CaptionsTerms = styled.div`
  padding-left: 2.7rem;
  color: ${colorGrayDark};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

const CaptionsTermsLink = styled.a`
  color: ${colorLink};
`;

const AddCameraContainer = styled.div`
  padding: 0 0.8rem;
`;

const AddCameraButtonAndText = styled.div<{ disabled?: boolean }>`
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  &:hover {
    border-radius: 0.5rem;
    background: #E9F0FF;
  }

  ${({ disabled }) => disabled && `
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none;
  `}
`;

const SaveButtonContainer = styled.div`
  padding: 0.5rem 1rem 1rem 1rem;
`;

// @ts-ignore - JS code
const SaveButton = styled(Button)`
  border-radius: ${lgBorderRadius};
  height: 3.5rem;
  width: 100%;
`;

const StopSharingButtonText = styled.div<{ extraPadding?: boolean }>`
  padding: 0 1rem;
  ${({ extraPadding }) => extraPadding && `
    padding-left: 3.5rem;
  `}
  cursor: pointer;
  color: ${colorDanger};
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: auto;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
`;

export default {
  RootContainer,
  ProfileSettings,
  VideoPreview,
  VideoPreviewContainer,
  VideoPreviewWrapper,
  PreviewArrowButton,
  VideoPreviewContent,
  VideoCol,
  FetchingAnimation,
  UsernameContainer,
  UsernameTitle,
  Username,
  UserPresenceRoot,
  UserPresenceField,
  UserPresenceIndicator,
  UserPresenceDropdown,
  UserPresenceValueContainer,
  UserPresenceStatusDot,
  UserPresenceText,
  Separator,
  DevicesSettingsContainer,
  DeviceContainer,
  IconCamera,
  WbSunnyIcon,
  HeadphonesIcon,
  MicIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  AddCameraIcon,
  DeviceSelector,
  CameraQualityContainer,
  CameraQualityText,
  CameraQualitySelector,
  CameraNameLabel,
  VirtualBackgroundContainer,
  SwitchTitle,
  MaterialSwitch,
  BrightnessSlider,
  VirtualBgSelectorBorder,
  CaptionsContainer,
  CaptionsToggleContainer,
  CaptionsSelectorContainer,
  CaptionsLanguageText,
  CaptionsTerms,
  CaptionsTermsLink,
  SaveButton,
  SaveButtonContainer,
  AddCameraContainer,
  AddCameraButtonAndText,
  StopSharingButtonText,
};
