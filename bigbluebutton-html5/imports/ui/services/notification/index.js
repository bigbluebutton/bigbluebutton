/* eslint react/jsx-filename-extension: 0 */
import React from 'react';
import { toast } from 'react-toastify';
import Styled from './styles';
import Toast from '/imports/ui/components/common/toast/component';

/**
 * Generates a deterministic toast ID based on props to prevent duplicates.
 * React-toastify will automatically prevent showing a toast if one with the same ID is active.
 */
function generateToastId(message, type, icon) {
  let messageKey;

  if (typeof message === 'string') {
    messageKey = message;
  } else if (React.isValidElement(message)) {
    // Extract id from FormattedMessage or similar components
    messageKey = message.props?.id || message.props?.children || 'react-element';
  } else {
    messageKey = String(message);
  }

  return `${type}-${icon}-${messageKey}`;
}

export function notify(message, type = 'default', icon, options, content, small) {
  const toastId = options?.toastId ?? generateToastId(message, type, icon);

  const toastProps = {
    message,
    type,
    icon,
    content,
    small,
  };

  // If toast with same ID is already active, don't show duplicate
  if (toast.isActive(toastId)) {
    // Optionally update the existing toast if autoClose is specified
    if (options?.autoClose > 0) {
      toast.update(toastId, {
        render: <Styled.ToastWrapper role="alert"><Toast {...toastProps} /></Styled.ToastWrapper>,
        autoClose: options.autoClose,
      });
    }
    return null;
  }

  const settings = {
    ...options,
    toastId,
  };

  if (options?.helpLink != null && options?.helpLabel != null) {
    return toast(
      <div role="alert">
        <Toast {...toastProps} />
        <Styled.HelpLinkButton
          label={options.helpLabel}
          color="default"
          size="sm"
          onClick={() => { window.open(options.helpLink); }}
          data-test="helpLinkToastButton"
        />
      </div>,
      settings,
    );
  }

  return toast(
    <Styled.ToastWrapper role="alert"><Toast {...toastProps} /></Styled.ToastWrapper>,
    settings,
  );
}

export default { notify };
