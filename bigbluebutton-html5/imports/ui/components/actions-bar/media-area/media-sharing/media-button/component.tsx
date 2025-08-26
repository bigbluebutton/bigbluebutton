import React, { FunctionComponent } from 'react';
import { IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Styled from './styles';
import { colorPrimary, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

export interface MediaButtonProps {
  color: string;
  showSettingsIcon?: boolean;
  text: string;
  dataTest: string;
  onClick?: () => void;
  /** The main icon to be rendered in the button */
  icon?: React.ReactElement;
}

export const MediaButton: FunctionComponent<MediaButtonProps> = ({
  color,
  showSettingsIcon,
  text,
  dataTest,
  onClick,
  icon,
}) => {
  let settingsIconColor = 'inherit';
  if (color === 'active') {
    settingsIconColor = colorPrimary;
  } else if (color === 'primary') {
    settingsIconColor = colorWhite;
  }

  return (
    <Styled.MediaButtonContainer data-test={dataTest}>
      <Styled.ButtonFrame color={color} onClick={onClick}>
        {showSettingsIcon && (
          <Styled.SettingsContainer>
            <IconButton
              component="div"
              size="small"
              sx={{ color: settingsIconColor }}
            >
              <SettingsIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Styled.SettingsContainer>
        )}
        {icon && (
          <Styled.IconWrapper>
            {icon}
          </Styled.IconWrapper>
        )}
      </Styled.ButtonFrame>
      <Styled.ButtonText>{text}</Styled.ButtonText>
    </Styled.MediaButtonContainer>
  );
};

export default MediaButton;
