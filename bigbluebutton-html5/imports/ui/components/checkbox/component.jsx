import React, { Component, PropTypes } from 'react';

import Icon from '../icon/component';
import styles from './styles';
import cx from 'classnames';

export default class Checkbox extends Component {
  constructor(props) {
    super(props);

    // this.handleChange = props.handleChange.bind(this);
  }

  render() {
    return (
      <div className={styles.container}>
        <input
          type='checkbox'
          onChange={this.handleChange}
          className={styles.input}/>
        <div className={styles.checkbox}>
        </div>
      </div>
    );
  }
}
