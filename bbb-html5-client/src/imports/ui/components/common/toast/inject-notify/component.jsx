import React from 'react';
import { notify } from '/imports/ui/services/notification';

const injectNotify = ComponentToWrap =>
  props => (<ComponentToWrap {...props} notify={notify} />);

export default injectNotify;
