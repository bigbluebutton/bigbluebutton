import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import cx from 'classnames';

export default class RecordingIndicator extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { beingRecorded } = this.props;
    let classNames = {};
    classNames[styles.indicator] = beingRecorded;

    return (
      <span className={cx(classNames)}></span>
    );
  }
};
