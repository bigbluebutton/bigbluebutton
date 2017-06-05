import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles';

import Icon from '../../../icon/component';
import BaseButton from '../../../button/base/component';

const propTypes = {
  ...BaseButton.propTypes,
};

const defaultProps = {
  ...BaseButton.defaultProps,
};

export default class MessageFormActions extends BaseButton {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <BaseButton {...this.props}>
        <Icon iconName={'add'} />
      </BaseButton>
    );
  }
}

MessageFormActions.propTypes = propTypes;
MessageFormActions.defaultProps = defaultProps;
