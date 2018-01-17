import React from 'react';

import Icon from '../../../icon/component';
import BaseButton from '../../../button/base/component';

const propTypes = {
  ...BaseButton.propTypes,
};

const defaultProps = {
  ...BaseButton.defaultProps,
};

const MessageFormActions = () => (
  <BaseButton {...this.props}>
    <Icon iconName={'add'} />
  </BaseButton>
);

export default

  MessageFormActions.propTypes = propTypes;
MessageFormActions.defaultProps = defaultProps;
