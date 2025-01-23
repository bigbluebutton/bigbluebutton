import styled, { css, keyframes } from 'styled-components';
import {
  colorWhite, colorText, colorPrimary, colorGrayLightest, colorGrayLighter,
  colorGrayDark, colorLink, listItemBgHover,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPadding,
  contentSidebarGap,
  contentSidebarPadding,
  contentSidebarBottomScrollPadding,
  contentSidebarBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall, fontSizeBase, textFontWeight, titlesFontWeight, fontSizeLarge,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly, mediumOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import CameraIcon from '@mui/icons-material/Videocam';
import WbSunny from '@mui/icons-material/WbSunny';
import Headphones from '@mui/icons-material/Headphones';
import Mic from '@mui/icons-material/Mic';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import { styled as materialStyled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  HeaderContainer as BaseHeaderContainer,
} from '/imports/ui/components/sidebar-content/styles';

const SimpleButton = styled.button`
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  outline: none; 
`;

const ProfileSettings = styled(ScrollboxVertical)`
  display: flex;
  height: 100%;
  padding: ${contentSidebarPadding} 0 ${contentSidebarBottomScrollPadding} 0;
  margin: 0 ${smPadding} 0;
  flex-direction: column;
  gap: ${contentSidebarGap};
  border-radius: ${contentSidebarBorderRadius};
  background: ${colorWhite};
  overflow-y: auto;
`;

const HeaderContainer = styled(BaseHeaderContainer)``;

interface VideoPreviewProps {
  mirroredVideo: boolean;
}

const VideoPreview = styled.video<VideoPreviewProps>`
  height: 100%;
  width: 100%;

  @media ${smallOnly} {
    height: 10rem;
  }

  ${({ mirroredVideo }) => mirroredVideo && `
    transform: scale(-1, 1);
  `}
`;

const VideoPreviewContent = styled.div`
  padding: 0px ${contentSidebarPadding};
  position: sticky;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
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
  padding: 0px ${contentSidebarPadding};
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
  width: 100%;
  padding: 0px ${contentSidebarPadding};
`;

const UserPresenceContainer = styled.div`
  display: flex;
  height: 3.5rem;
  padding: 0.5rem 1rem;
  align-items: center;
  gap: 1rem;
  border-radius: 1rem;
  border: 1px solid ${colorGrayLighter};
`;

const UserPresenceButton = styled(SimpleButton)<{ active?: boolean }>`
  display: flex;
  padding: 0.125rem 1rem;
  justify-content: center;
  align-items: center;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 0.5rem;

  ${({ active }) => active && `
    background: ${listItemBgHover};
    cursor: not-allowed;
    pointer-events: none;
    border-radius: 1.0rem;
  `}
`;

const UserPresenceText = styled.div`
  color: ${colorGrayDark};
  text-align: center;
  font-size: ${fontSizeBase}
  font-weight: ${textFontWeight};
`;

const UserPresenceDivider = styled.div`
  width: 0.0625rem;
  height: 2.5rem;
  background: ${colorGrayLightest};
`;

const Separator = styled.hr`
  width: 100%;
  border: 0;
  border-bottom: 1px solid ${colorGrayLightest};
`;

const DevicesSettingsContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
  padding: 0px ${contentSidebarPadding};
`;

const DeviceContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 3.5rem;
  flex-shrink: 0;
  gap: 1rem;
  align-items: center;
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

const DeviceSelector = styled(Select)`
  height: 3.5rem;
  flex: 1;
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

const VirtualBackgroundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${contentSidebarPadding};
  align-self: stretch;
  padding: 0px ${contentSidebarPadding};
`;

const SwitchTitle = styled(FormControlLabel)`
  height: 1.5rem;
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

const VirtualBgSelectorBorder = styled.div`
  width: 100%;
  border-radius: 0.25rem;
  border: 1px solid ${colorGrayLightest};
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

export default {
  ProfileSettings,
  HeaderContainer,
  VideoPreview,
  VideoPreviewContent,
  VideoCol,
  FetchingAnimation,
  UsernameContainer,
  UsernameTitle,
  Username,
  UserPresenceRoot,
  UserPresenceContainer,
  UserPresenceButton,
  UserPresenceText,
  UserPresenceDivider,
  Separator,
  DevicesSettingsContainer,
  DeviceContainer,
  IconCamera,
  WbSunnyIcon,
  HeadphonesIcon,
  MicIcon,
  DeviceSelector,
  CameraQualityContainer,
  CameraQualityText,
  CameraQualitySelector,
  VirtualBackgroundContainer,
  SwitchTitle,
  MaterialSwitch,
  VirtualBgSelectorBorder,
  CaptionsContainer,
  CaptionsToggleContainer,
  CaptionsSelectorContainer,
  CaptionsLanguageText,
  CaptionsTerms,
  CaptionsTermsLink,
};
