import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';

const propTypes = {
  icon: PropTypes.string,
  message: PropTypes.node.isRequired,
  type: PropTypes.oneOf(Object.values(toast.TYPE)).isRequired,
};

const defaultProps = {
  icon: null,
};

const defaultIcons = {
  [toast.TYPE.INFO]: 'help',
  [toast.TYPE.SUCCESS]: 'checkmark',
  [toast.TYPE.WARNING]: 'warning',
  [toast.TYPE.ERROR]: 'close',
  [toast.TYPE.DEFAULT]: 'about',
};

const Toast = ({
  icon,
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
Toast.defaultProps = defaultProps;
