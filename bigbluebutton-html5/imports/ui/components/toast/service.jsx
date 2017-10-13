import React from 'react';
import { toast } from 'react-toastify';

import Toast from './component';

let lastToastId = null;
const notify = (message, type = 'default', icon, options) => {
  const settings = {
    type,
    ...options,
  };

  if (!toast.isActive(lastToastId)) {
    lastToastId = toast(<Toast {...{ type, icon, message }} />, settings);
  }
};

export default notify;

export const withToast = ComponentToWrap =>
  props => (<ComponentToWrap {...props} toastNotify={notify} />);
