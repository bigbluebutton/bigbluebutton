import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';

const propTypes = {
  icon: PropTypes.string,
  message: PropTypes.node.isRequired,
};

const defaultIcons = {
  info: 'help',
  success: 'checkmark',
  warning: 'warning',
  error: 'close',
  default: 'about',
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
        <Icon iconName={icon || defaultIcons[type]} />
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
