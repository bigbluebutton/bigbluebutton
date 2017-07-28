import React, { Component } from 'react';
import ScreenshareContainer from '/imports/ui/components/screenshare/container';
import styles from './styles.scss';

export default class VideoDock extends Component {
  render() {
    return (
      <div className={styles.videoDock}>
        <ScreenshareContainer />
      </div>
    );
  }
}
