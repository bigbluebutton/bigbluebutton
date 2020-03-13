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
    } = this.props;

    // const ext = file.fileName.split('.').pop();
    return (
      <div className={(text) ? styles.fileWrapper : null}>
        <div className={styles.wrapper}>
          <div className={styles.extensionBox}>
            <Icon iconName="file" />
          </div>
          <span className={styles.fileName}>{file.fileName}</span>
          <Button
            hideLabel
            label="Download"
            className={styles.button}
            color="default"
            icon="template_download"
            size="sm"
            circle
            onClick={() => this.handleFileDownload()}
          />
        </div>
        {(text) ? (
          <div>
            {/* <hr/> */}
            <span className={styles.text}>{text}</span>
          </div>
        ) : null}
      </div>
    );
  }
}

ChatFileUploaded.propTypes = propTypes;
