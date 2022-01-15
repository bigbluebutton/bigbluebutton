import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import _ from 'lodash';
import Dropzone from 'react-dropzone';
import Icon from '/imports/ui/components/icon/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import Service from './service';
import UploadService from '../service';
import { styles } from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.upload.media.title',
    description: 'Media upload modal title',
  },
  note: {
    id: 'app.upload.media.note',
    description: 'Media upload modal note',
  },
  message: {
    id: 'app.upload.media.message',
    description: 'Media upload modal message',
  },
  filename: {
    id: 'app.upload.media.filename',
    description: 'Media upload modal media filename',
  },
  options: {
    id: 'app.upload.media.options',
    description: 'Media upload modal media options',
  },
  remove: {
    id: 'app.upload.media.remove',
    description: 'Media upload modal remove media',
  },
  upload: {
    id: 'app.upload.media.upload',
    description: 'Media upload modal upload button',
  },
  cancel: {
    id: 'app.upload.media.cancel',
    description: 'Media upload modal cancel button',
  },
});

class MediaUpload extends Component {
  constructor(props) {
    super(props);

    this.state = { files: [] };

    this.source = Service.getSource();
    this.maxSize = Service.getMaxSize();
    this.validFiles = Service.getMediaValidFiles();

    this.handleOnDrop = this.handleOnDrop.bind(this);
  }

  handleOnDrop(acceptedFiles, rejectedFiles) {
    const filesToUpload = acceptedFiles.map(file => {
      const id = _.uniqueId(file.name);

      return {
        file,
        id,
        filename: file.name,
      }
    });

    this.setState(({ files }) => ({ files: files.concat(filesToUpload) }));
  }

  handleRemove(item) {
    const { files } = this.state;
    const index = files.indexOf(item);

    files.splice(index, 1);

    this.setState({ files });
  }

  handleUpload(files) {
    const {
      closeModal,
      intl,
    } = this.props;

    UploadService.upload(this.source, files, intl);
    closeModal();
  }

  renderItem(item) {
    const { intl } = this.props;

    return (
      <tr key={item.id}>
        <td className={styles.icon}>
          <Icon iconName="file" />
        </td>
        <th className={styles.name}>
          <span>{item.filename}</span>
        </th>
        <td className={styles.actions}>
          <Button
            className={cx(styles.action, styles.remove)}
            label={intl.formatMessage(intlMessages.remove)}
            aria-label={`${intl.formatMessage(intlMessages.remove)} ${item.filename}`}
            size="sm"
            icon="delete"
            hideLabel
            onClick={() => this.handleRemove(item)}
          />
        </td>
      </tr>
    );
  }

  renderFiles() {
    const { intl } = this.props;
    const { files } = this.state;

    if (files.length === 0) return null;
    
    return (
      <div className={styles.list}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.hidden}>
                {intl.formatMessage(intlMessages.filename)}
              </th>
              <th className={styles.hidden}>
                {intl.formatMessage(intlMessages.options)}
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map(item => this.renderItem(item))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const {
      intl,
      closeModal,
    } = this.props;

    const { files } = this.state;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
        contentLabel={intl.formatMessage(intlMessages.title)}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>
            {intl.formatMessage(intlMessages.title)}
          </h3>
        </header>
        <h4 className={styles.content}>
          {intl.formatMessage(intlMessages.note)}
        </h4>
        <div className={styles.content}>
          {this.renderFiles()}
          <Dropzone
            multiple
            className={styles.dropzone}
            activeClassName={styles.dropzoneActive}
            accept={this.validFiles.map(type => type.extension)}
            maxSize={this.maxSize}
            disablepreview="true"
            onDrop={this.handleOnDrop}
          >
            <Icon className={styles.dropzoneIcon} iconName="upload" />
            <p className={styles.dropzoneMessage}>
              {intl.formatMessage(intlMessages.message)}
            </p>
          </Dropzone>
        </div>
        <div className={styles.footer}>
          <div className={styles.buttons}>
            <Button
              label={intl.formatMessage(intlMessages.cancel)}
              onClick={closeModal}
            />
            <Button
              color="primary"
              label={intl.formatMessage(intlMessages.upload)}
              onClick={() => this.handleUpload(files)}
              disabled={files.length === 0}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

export default injectIntl(withModalMounter(MediaUpload));
