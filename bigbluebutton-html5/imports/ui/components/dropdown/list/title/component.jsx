import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import _ from 'lodash';
import { styles } from '../styles';

const propTypes = {
  description: PropTypes.string,
};

export default class DropdownListTitle extends Component {
  constructor(props) {
    super(props);
    this.labelID = _.uniqueId('labelContext-');
  }

  render() {
    const { className } = this.props;

    return (
      <li className={cx(styles.title, className)} aria-hidden>
        {this.props.children}
      </li>
    );
  }
}

DropdownListTitle.propTypes = propTypes;
