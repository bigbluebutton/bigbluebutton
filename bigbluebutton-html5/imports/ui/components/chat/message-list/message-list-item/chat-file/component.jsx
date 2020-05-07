import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styles from './styles';
import Button from '../../../../button/component';
import Icon from '/imports/ui/components/icon/component';
import Auth from '/imports/ui/services/auth';

const propTypes = {
  text: PropTypes.string,
  file: PropTypes.object.isRequired,
};

export default class ChatFileUploaded extends PureComponent {
  constructor(props) {
    super(props);

    this.handleFileDownload = this.handleFileDownload.bind(this);
  }

  handleFileDownload() {
    const {
      file,
    } = this.props;

    const uri = `https://${window.document.location.hostname}/bigbluebutton/file/download/`
      + `${file.fileId}/${file.fileName}/${Auth.meetingID}`;

    window.open(uri);
  }

  render() {
    const {
      text,
      file,
      id,
    } = this.props;

    // const ext = file.fileName.split('.').pop();
    return (
      <div className={(id == Auth.userID) ? styles.senderFileWrapper : styles.fileWrapper}>
        <div className={styles.wrapper}>
          <div className={styles.extensionBox}>
            <img src="https://s3-alpha-sig.figma.com/img/0b43/a68b/f84eb6dd7e520d32d5c236c818153032?Expires=1585526400&Signature=OseYmvn1yyoFzQko1sxJPnOaexa5n0ITL56DScZxD2LN3P0Mhme78aum~v5rezadI0SWRB404ijdi~0JEvNmdysPI0l2igF~p50-CBAyqiqeE8alEQlsACtnhFSSsttfcK-mdivOp78We0mBC5i5A~YtmGWaat58DQmDHVwixkBO1htg4WtPfTN5mUw80Row9UEYndOWs18EuVapD5cXJUxIWznkQelnWyvT0piBUbB3mmca8w5-AUycwwvsF3rSpWAcbqL6hzbk70XJH63g7zlPM9KDLfcO9tEksgH5lB28Nk62ZvhvENNLSoub2-RFiUN6KIAKNdCM-qRgIjBBgg__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA" alt="" />
          </div>
          <span className={styles.fileName}>{file.fileName}</span>
          <Button
            hideLabel
            label="Download"
            className={styles.button}
            color="default"
            icon="template_download"
            size="lg"
            circle
            onClick={() => this.handleFileDownload()}
          />
        </div>
        {(text) ? (
          <p
            ref={(ref) => { this.text = ref; }}
            dangerouslySetInnerHTML={{ __html: text }}
            className={styles.text}
          />
        ) : null}
      </div>
    );
  }
}

ChatFileUploaded.propTypes = propTypes;
