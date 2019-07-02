/* eslint react/jsx-filename-extension: 0 */
import React from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';

import Toast from '/imports/ui/components/toast/component';

let lastToast = {
  id: null,
  message: null,
  type: null,
  icon: null,
};

export function notify(message, type = 'default', icon, options, content, small) {
  const settings = {
    type,
    ...options,
  };

  const { id: lastToastId, ...lastToastProps } = lastToast;
  const toastProps = {
    message,
    type,
    icon,
    content,
    small,
  };

  if (!toast.isActive(lastToast.id) || !_.isEqual(lastToastProps, toastProps)) {
    const id = toast(<Toast {...toastProps} />, settings);

    lastToast = { id, ...toastProps };

    return id;
  }
  return null;
}

export default { notify };
