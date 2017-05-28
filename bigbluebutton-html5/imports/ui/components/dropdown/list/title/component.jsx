import React, { Component, PropTypes } from 'react';
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
        <div id="labelContext" aria-label={description}></div>
      </div>
    );
  }
}

DropdownListTitle.propTypes = propTypes;
