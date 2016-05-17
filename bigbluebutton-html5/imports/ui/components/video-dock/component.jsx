import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import { FormattedMessage, FormattedDate } from 'react-intl';
import DeskshareContainer from '/imports/ui/components/deskshare/container.jsx';

export default class VideoDock extends Component {
  render() {
    return (
      <div className={styles.videoDock}>
        <DeskshareContainer />
      </div>
    );
  }
}
