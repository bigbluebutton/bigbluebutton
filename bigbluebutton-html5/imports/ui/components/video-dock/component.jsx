import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import { FormattedMessage, FormattedDate } from 'react-intl';
import DeskshareContainer from '/imports/ui/components/deskshare/container.jsx';

export default class VideoDock extends Component {

  constructor(props) {
    super(props);

    this.sendUserShareWebcam = props.sendUserShareWebcam.bind(this);
    this.sendUserUnshareWebcam = props.sendUserUnshareWebcam.bind(this);
  }

  render() {
    return (
      <div className={styles.videoDock}>
        <button type="button" onClick={this.sendUserShareWebcam} > Share Webcam </button>
        <button type="button" onClick={this.sendUserUnshareWebcam} > Unshare Webcam </button>
      </div>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {

      const { users } = this.props;
      const nextUsers = nextProps.users;

      if (users && users[0] && nextUsers && nextUsers[0]) {
        if (users[0].user.has_stream != nextUsers[0].user.has_stream) {
          console.log('User ' + (nextUsers[0].user.has_stream ? '':'un') + 'shared webcam ' + users[0].user.userid);

          //Do kurento's stuff

          return true;
        }
      }
      return false;
  }
}
