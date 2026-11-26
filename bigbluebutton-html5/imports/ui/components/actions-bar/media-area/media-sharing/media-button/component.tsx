import React, { FunctionComponent, useId } from 'react';
import { IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Styled from './styles';
import { colorPrimary, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

export interface MediaButtonProps {
  color: string;
  showSettingsIcon?: boolean;
  text: string;
  dataTest: string;
  onClick?: () => void;
  /** The main icon to be rendered in the button */
  icon?: React.ReactElement;
  tooltip?: string;
  disabled?: boolean;
  id?: string;
}

export const MediaButton: FunctionComponent<MediaButtonProps> = ({
  color,
  showSettingsIcon,
  text,
  dataTest,
  onClick,
  icon,
  tooltip,
  disabled = false,
  id,
}) => {
  const labelId = useId();
  let settingsIconColor = 'inherit';
  if (color === 'active') {
    settingsIconColor = colorPrimary;
  } else if (color === 'primary') {
    settingsIconColor = colorWhite;
  }

  const buttonContent = (
    <Styled.MediaButtonContainer
      className={`bbb-media-sharing__option bbb-media-sharing__option--${color}`}
      data-test={dataTest}
      $disabled={disabled}
    >
      <Styled.ButtonFrame
        id={id}
        className="bbb-media-sharing__option-button"
        color={color}
        disabled={disabled}
        aria-labelledby={text ? labelId : undefined}
        aria-label={!text && tooltip ? tooltip : undefined}
        onClick={onClick}
      >
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
      <Styled.ButtonText id={labelId} className="bbb-media-sharing__option-label">
        {text}
      </Styled.ButtonText>
    </Styled.MediaButtonContainer>
  );

  if (tooltip && tooltip !== '') {
    return (
      <TooltipContainer position="top" title={tooltip}>
        {buttonContent}
      </TooltipContainer>
    );
  }

  return buttonContent;
};

export default MediaButton;
