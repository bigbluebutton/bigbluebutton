import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { styles } from '../styles';

export default class DropdownListTitle extends Component {
  constructor(props) {
    super(props);
    this.labelID = _.uniqueId('labelContext-');
  }

  render() {
    const {
      className,
      children,
    } = this.props;

    return (
      <li className={cx(styles.title, className)} aria-hidden>
        {children}
      </li>
    );
  }
}
