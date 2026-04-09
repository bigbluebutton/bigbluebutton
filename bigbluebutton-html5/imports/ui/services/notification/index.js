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

  if (typeof message === 'string' || typeof message === 'number') {
    messageKey = String(message);
  } else if (React.isValidElement(message)) {
    // Extract id from FormattedMessage or similar components
    const child = message.props?.children;
    messageKey = message.props?.id
      ?? (typeof child === 'string' || typeof child === 'number' ? String(child) : undefined)
      ?? message.key
      ?? message.type?.displayName
      ?? message.type?.name
      ?? 'react-element';
  } else {
    messageKey = String(message);
  }

  const iconKey = React.isValidElement(icon)
    ? icon.type?.displayName ?? icon.type?.name ?? 'icon'
    : String(icon);

  return `${type}-${iconKey}-${messageKey}`;
}

export function notify(message, type = 'default', icon, options, content, small, showSeparator) {
  const toastId = options?.toastId ?? generateToastId(message, type, icon);

  const toastProps = {
    message,
    type,
    icon,
    content,
    small,
    showSeparator,
    $disablePointer: options?.disablePointer ?? true,
  };

  // If toast with same ID is already active, update it and reset the timer
  if (toast.isActive(toastId)) {
    toast.update(toastId, {
      render: <Styled.ToastWrapper role="alert"><Toast {...toastProps} /></Styled.ToastWrapper>,
      autoClose: options?.autoClose,
      progress: 0,
    });
    return toastId;
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
          onClick={() => { window.open(options.helpLink, '_blank', 'noopener,noreferrer'); }}
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
