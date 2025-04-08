import styled from 'styled-components';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { styled as materialStyled } from '@mui/material/styles';
import {
  colorWhite, colorPrimary,
  colorGrayDark, colorBorder,
  colorLink,
  colorBlueAux,
  appsPanelTextColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPadding,
  contentSidebarGap,
  contentSidebarPadding,
  contentSidebarBottomScrollPadding,
  contentSidebarBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase, fontSizeSmall, textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import BaseIcon from '/imports/ui/components/common/icon/icon-ts/component';
import {
  HeaderContainer as BaseHeaderContainer,
} from '/imports/ui/components/sidebar-content/styles';

const AudioCaptions = styled(ScrollboxVertical)`
  display: flex;
  height: 100%;
  padding: ${contentSidebarPadding} 0 ${contentSidebarBottomScrollPadding} 0;
  margin: 0 ${smPadding} 0;
  flex-direction: column;
  gap: ${contentSidebarGap};
  border-radius: ${contentSidebarBorderRadius};
  background: ${colorWhite};
  overflow-y: auto;
  overflow-x: hidden;
`;

const Separator = styled.hr`
  width: 100%;
  border: 0;
  border-bottom: 1px solid ${colorBorder};
`;

const HeaderContainer = styled(BaseHeaderContainer)``;

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

const CaptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  gap: 1.5rem;
  padding: 0px ${contentSidebarPadding};
`;

const CaptionsTermsLink = styled.a`
  color: ${colorLink};
`;

const DisclaimerCallout = styled.div`
  background-color: ${colorBlueAux};
  padding: 1rem;
  border-radius: 0.8rem;
  display: flex;
  gap: 0.5rem;
  font-color: ${appsPanelTextColor};
  font-size: ${fontSizeSmall};
`;

const Icon = styled(BaseIcon)`
  margin-top: 0.2rem;
  color: ${colorPrimary};
`;

export default {
  AudioCaptions,
  HeaderContainer,
  Separator,
  SwitchTitle,
  MaterialSwitch,
  CaptionsContainer,
  CaptionsTermsLink,
  DisclaimerCallout,
  Icon,
};
