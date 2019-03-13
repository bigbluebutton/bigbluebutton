import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import cx from 'classnames';
import Icon from '../icon/component';
import { styles } from './styles';

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

const getContentStrings = (msgContent) => {
  const MIN_LENGTH = 2;
  const strings = [];
  if (typeof msgContent === 'string') strings.push(msgContent);
  if (typeof msgContent === 'object') {
    const { children } = msgContent.props;
    if (Object.keys(children).length === MIN_LENGTH) {
      return getContentStrings(children[1]);
    }
    if (Object.keys(children).length > MIN_LENGTH) {
      Object.entries(children).reduce((acc, [key]) => {
        if (typeof children[key] === 'string') {
          strings.push(children[key]);
        }
        return null;
      });
    }
  }
  return strings;
};

const formatMessageStrings = (messages) => {
  const _messages = messages;
  const MAX_MESSAGE_CHARS = 40;
  _messages.forEach((item, index) => {
    if (_messages[index].length > MAX_MESSAGE_CHARS) {
      _messages[index] = `${item.substring(0, MAX_MESSAGE_CHARS)}...`;
    }
    return null;
  });
  return _messages;
};

const setContentStrings = (msgContent, msgStrings) => {
  const _msgContent = msgContent;
  const msgObj = _msgContent.props.children[1];
  let stringIndex = 0;
  Object.entries(msgObj.props.children).reduce((acc, [key]) => {
    if (typeof msgObj.props.children[key] === 'string') {
      msgObj.props.children[key] = msgStrings[stringIndex];
      stringIndex += 1;
    }
    return null;
  });
  _msgContent.props.children[1] = msgObj;
  return _msgContent;
};

const Toast = ({
  icon,
  type,
  message,
  content,
  small,
}) => {
  if (!content) return null;
  const formattedContent = content;
  const { children } = formattedContent.props;

  let strings = getContentStrings(children);
  strings = formatMessageStrings(strings);
  formattedContent.props.children = setContentStrings(children, strings);

  return (
    <div
      className={cx(styles.toastContainer, small ? styles.smallToastContainer : null)}
      role="alert"
    >
      <div className={styles[type]}>
        <div className={cx(styles.icon, small ? styles.smallIcon : null)}>
          <Icon iconName={icon || defaultIcons[type]} />
        </div>
        <div className={cx(styles.message, small ? styles.smallMessage : null)}>
          <span>{message}</span>
        </div>
      </div>
      <div className={styles.backgroundColorInherit}>
        <div className={styles.separator} />
        <div className={styles.backgroundColorInherit}>
          {formattedContent}
        </div>
      </div>
    </div>
  );
};

export default Toast;

Toast.propTypes = propTypes;
Toast.defaultProps = defaultProps;
