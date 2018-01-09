import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
    const { intl, description } = this.props;

    return (
      <li className={styles.title} aria-describedby={this.labelID}>
        {this.props.children}
        <div id={this.labelID} aria-label={description} />
      </li>
    );
  }
}

DropdownListTitle.propTypes = propTypes;
