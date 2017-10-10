import React, { Component } from 'react';
import ScreenshareContainer from '/imports/ui/components/screenshare/container';
import styles from './styles.scss';

const VideoDock = () => (
  <div className={styles.videoDock}>
    <ScreenshareContainer />
  </div>
);

export default VideoDock;
