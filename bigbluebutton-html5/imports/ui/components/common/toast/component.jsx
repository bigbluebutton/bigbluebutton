import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/common/icon/component';
import { PluginButtonIcon } from '/imports/ui/components/plugins/plugin-icon/styles';
import Styled from './styles';

const propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  message: PropTypes.node.isRequired,
};

const defaultIcons = {
  info: 'help',
  success: 'checkmark',
  warning: 'warning',
  error: 'close',
  default: 'about',
};

const renderIcon = (icon, type) => {
  if (icon && typeof icon === 'object' && 'svgContent' in icon) {
    return (
      <Styled.ToastCustomIcon>
        <PluginButtonIcon>{icon.svgContent}</PluginButtonIcon>
      </Styled.ToastCustomIcon>
    );
  }

  let iconName = icon;
  if (icon && typeof icon === 'object' && 'iconName' in icon) iconName = icon.iconName;

  return <Icon iconName={iconName || defaultIcons[type]} />;
};

const Toast = ({
  icon = null,
  type,
  message,
  content,
  small,
}) => (
  <Styled.ToastContainer small={small} data-test="toastContainer">
    <Styled.Toast type={type}>
      <Styled.ToastIcon className="toastIcon" small={small}>
        {renderIcon(icon, type)}
      </Styled.ToastIcon>
      <Styled.ToastMessage data-test="toastSmallMsg">
        <span>{message}</span>
      </Styled.ToastMessage>
    </Styled.Toast>
    {content
      ? (
        <Styled.BackgroundColorInherit>
          <Styled.Separator />
          <Styled.BackgroundColorInherit>
            {content}
          </Styled.BackgroundColorInherit>
        </Styled.BackgroundColorInherit>
      ) : null}
  </Styled.ToastContainer>
);

export default Toast;

Toast.propTypes = propTypes;
