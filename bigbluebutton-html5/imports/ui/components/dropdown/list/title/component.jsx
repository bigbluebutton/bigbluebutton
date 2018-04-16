import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
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
    const { className, description } = this.props;

    return (
      <li className={cx(styles.title, className)} aria-describedby={this.labelID}>
        {this.props.children}
        <div id={this.labelID} aria-label={description} />
      </li>
    );
  }
}

DropdownListTitle.propTypes = propTypes;
