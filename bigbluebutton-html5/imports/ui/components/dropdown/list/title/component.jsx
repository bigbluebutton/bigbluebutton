import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles';

const propTypes = {
  description: PropTypes.string,
};

export default class DropdownListTitle extends Component {

  render() {
    const { intl, description } = this.props;

    return (
      <div>
        <li className={styles.title} aria-describedby="labelContext">{this.props.children}</li>
        <div id="labelContext" aria-label={description} />
      </div>
    );
  }
}

DropdownListTitle.propTypes = propTypes;
