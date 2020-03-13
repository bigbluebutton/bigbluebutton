import React, { Component } from 'react';
import PropTypes, { object } from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Dropzone from 'react-dropzone';
import update from 'immutability-helper';
import cx from 'classnames';
import _ from 'lodash';
import logger from '/imports/startup/client/logger';
import browser from 'browser-detect';

import { notify } from '/imports/ui/services/notification';
import ModalFileDrop from '/imports/ui/components/modal/filedrop/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import TextareaAutosize from 'react-autosize-textarea';
import { styles } from './styles.scss';

const propTypes = {
  intl: intlShape.isRequired,
  mountModal: PropTypes.func.isRequired,
  fileSizeMin: PropTypes.number.isRequired,
  fileSizeMax: PropTypes.number.isRequired,
  fileValidMimeTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
};

const intlMessages = defineMessages({
  current: {
    id: 'app.presentationUploder.currentBadge',
  },
  title: {
    id: 'app.chatUploder.title',
    description: 'title of the modal',
  },
  message: {
    id: 'app.chatUploder.message',
    description: 'message warning the types of files accepted',
  },
  inputPlaceholder: {
    id: 'app.chat.inputPlaceholder',
    description: 'Chat message input placeholder',
  },
  uploadLabel: {
    id: 'app.presentationUploder.uploadLabel',
    description: 'confirm label when files are to be uploaded',
  },
  confirmLabel: {
    id: 'app.presentationUploder.confirmLabel',
    description: 'confirm label when no files are to be uploaded',
  },
  confirmDesc: {
    id: 'app.presentationUploder.confirmDesc',
    description: 'description of the confirm',
  },
  dismissLabel: {
    id: 'app.presentationUploder.dismissLabel',
    description: 'used in the button that close modal',
  },
  dismissDesc: {
    id: 'app.presentationUploder.dismissDesc',
    description: 'description of the dismiss',
  },
  dropzoneLabel: {
    id: 'app.presentationUploder.dropzoneLabel',
    description: 'message warning where drop files for upload',
  },
  dropzoneImagesLabel: {
    id: 'app.presentationUploder.dropzoneImagesLabel',
    description: 'message warning where drop images for upload',
  },
  browseFilesLabel: {
    id: 'app.presentationUploder.browseFilesLabel',
    description: 'message use on the file browser',
  },
  browseImagesLabel: {
    id: 'app.presentationUploder.browseImagesLabel',
    description: 'message use on the image browser',
  },
  fileToUpload: {
    id: 'app.presentationUploder.fileToUpload',
    description: 'message used in the file selected for upload',
  },
  genericError: {
    id: 'app.presentationUploder.genericError',
    description: 'generic error while uploading/converting',
  },
  rejectedError: {
    id: 'app.presentationUploder.rejectedError',
    description: 'some files rejected, please check the file mime types',
  },
  uploadProcess: {
    id: 'app.presentationUploder.upload.progress',
    description: 'message that indicates the percentage of the upload',
  },
  413: {
    id: 'app.presentationUploder.upload.413',
    description: 'error that file exceed the size limit',
  },
  conversionProcessingSlides: {
    id: 'app.presentationUploder.conversion.conversionProcessingSlides',
    description: 'indicates how many slides were converted',
  },
  genericConversionStatus: {
    id: 'app.presentationUploder.conversion.genericConversionStatus',
    description: 'indicates that file is being converted',
  },
  TIMEOUT: {
    id: 'app.presentationUploder.conversion.timeout',
  },
  GENERATING_THUMBNAIL: {
    id: 'app.presentationUploder.conversion.generatingThumbnail',
    description: 'indicatess that it is generating thumbnails',
  },
  GENERATING_SVGIMAGES: {
    id: 'app.presentationUploder.conversion.generatingSvg',
    description: 'warns that it is generating svg images',
  },
  GENERATED_SLIDE: {
    id: 'app.presentationUploder.conversion.generatedSlides',
    description: 'warns that were slides generated',
  },
  PAGE_COUNT_EXCEEDED: {
    id: 'app.presentationUploder.conversion.pageCountExceeded',
    description: 'warns the user that the conversion failed because of the page count',
  },
  PDF_HAS_BIG_PAGE: {
    id: 'app.presentationUploder.conversion.pdfHasBigPage',
    description: 'warns the user that the conversion failed because of the pdf page siz that exceeds the allowed limit',
  },
  isDownloadable: {
    id: 'app.presentationUploder.isDownloadableLabel',
    description: 'presentation is available for downloading by all viewers',
  },
  isNotDownloadable: {
    id: 'app.presentationUploder.isNotDownloadableLabel',
    description: 'presentation is not available for downloading the viewers',
  },
  removePresentation: {
    id: 'app.presentationUploder.removePresentationLabel',
    description: 'select to delete this presentation',
  },
  setAsCurrentPresentation: {
    id: 'app.presentationUploder.setAsCurrentPresentation',
    description: 'set this presentation to be the current one',
  },
  status: {
    id: 'app.presentationUploder.tableHeading.status',
    description: 'aria label status table heading',
  },
  options: {
    id: 'app.presentationUploder.tableHeading.options',
    description: 'aria label for options table heading',
  },
  filename: {
    id: 'app.presentationUploder.tableHeading.filename',
    description: 'aria label for file name table heading',
  },
});

const BROWSER_RESULTS = browser();
const isMobileBrowser = (BROWSER_RESULTS ? BROWSER_RESULTS.mobile : false)
  || (BROWSER_RESULTS && BROWSER_RESULTS.os
    ? BROWSER_RESULTS.os.includes('Android') // mobile flag doesn't always work
    : false);

class ChatFileUploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file: undefined,
      fileData: undefined,
      message: '',
      preventClosing: false,
      disableActions: false,
    };

    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleFiledrop = this.handleFiledrop.bind(this);
    this.handleRemove = this.handleRemove.bind(this);

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.updateFileKey = this.updateFileKey.bind(this);
    this.deepMergeUpdateFileKey = this.deepMergeUpdateFileKey.bind(this);
  }


  updateFileKey(id, key, value, operation = '$set') {
    this.setState(({ file }) => {
      const fileIndex = (file.id === id);

      return fileIndex === -1 ? false : {
        file: update(file, {
          $apply: file => update(file, {
            [key]: {
              [operation]: value,
            },
          }),
        }),
      };
    });
  }

  deepMergeUpdateFileKey(id, key, value) {
    const applyValue = toUpdate => update(toUpdate, { $merge: value });
    this.updateFileKey(id, key, applyValue, '$apply');
  }

  handleConfirm() {
    const {
      mountModal, intl, handleSave, handleSendMessage,
    } = this.props;
    const {
      disableActions, file, message, fileData,
    } = this.state;

    this.setState({
      disableActions: true,
      preventClosing: true,
    });

    if (!disableActions && file != undefined && fileData == undefined) {
      const fileToSave = (!file.upload.error) ? file : undefined;
      return handleSave(fileToSave)
        .then((fileData) => {
          if (fileData.success == 'true') {
            fileData.message = message;
            this.setState({
              disableActions: false,
              preventClosing: true,
              awaitingUpload: true,
              fileData,
            });
            return null;
          }
        })
        .catch((error) => {
          notify(intl.formatMessage(intlMessages.genericError), 'error');
          logger.error({
            logCode: 'presentationuploader_component_save_error',
            extraInfo: { error },
          }, 'Presentation uploader catch error on confirm');

          this.setState({
            disableActions: true,
            preventClosing: true,
          });
        });
    }

    if (fileData != undefined) {
      this.setState({
        disableActions: false,
        preventClosing: false,
        file: undefined,
      });
      return (
        handleSendMessage(fileData)
      );
    }

    this.setState({
      disableActions: false,
      preventClosing: false,
      file: undefined,
      fileData: undefined,
    });
    // return null;
  }

  handleDismiss() {
    const { mountModal } = this.props;

    return new Promise((resolve) => {
      mountModal(null);

      this.setState({
        preventClosing: false,
        disableActions: false,
      }, resolve);
    });
  }

  handleFiledrop(files, files2) {
    const { fileValidMimeTypes, intl } = this.props;
    const validMimes = fileValidMimeTypes.map(fileValid => fileValid.mime);
    const validExtentions = fileValidMimeTypes.map(fileValid => fileValid.extension);
    const [accepted, rejected] = _.partition(files
      .concat(files2), f => (
      validMimes.includes(f.type) || validExtentions.includes(`.${f.name.split('.').pop()}`)
    ));

    const fileToUpload = accepted.map((file) => {
      const id = _.uniqueId(file.name);

      return {
        file,
        id,
        filename: file.name,
        upload: { done: false, error: false, progress: 0 },
        onProgress: (event) => {
          // TODO: remove this
          if (!event.lengthComputable) {
            this.deepMergeUpdateFileKey(id, 'upload', {
              progress: 100,
              done: true,
            });

            return;
          }

          this.deepMergeUpdateFileKey(id, 'upload', {
            progress: (event.loaded / event.total) * 100,
            done: event.loaded === event.total,
          });
        },
        onUpload: (upload) => {
          this.deepMergeUpdateFileKey(id, 'upload', upload);
        },
        onDone: (newId) => {
          this.updateFileKey(id, 'id', newId);
        },
      };
    });

    this.setState({
      file: (fileToUpload[0]),
      fileData: undefined,
      disableActions: false,
    });


    if (rejected.length > 0) {
      notify(intl.formatMessage(intlMessages.rejectedError), 'error');
    }
  }

  handleRemove(item) {
    const { disableActions } = this.state;
    if (disableActions) return;

    this.setState({
      file: undefined,
      fileData: undefined,
    });
  }

  renderPresentationList() {
    const { file } = this.state;
    const { intl } = this.props;

    if (file === undefined) return null;

    return (
      <div className={styles.fileList}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.visuallyHidden} colSpan={3}>
                {intl.formatMessage(intlMessages.filename)}
              </th>
              <th className={styles.visuallyHidden}>{intl.formatMessage(intlMessages.status)}</th>
              <th className={styles.visuallyHidden}>{intl.formatMessage(intlMessages.options)}</th>
            </tr>
          </thead>
          <tbody>
            {this.renderPresentationItem(file)}
          </tbody>
        </table>
      </div>
    );
  }

  renderPresentationItemStatus(item) {
    const { intl } = this.props;

    if (!item.upload.done && item.upload.progress === 0) {
      return intl.formatMessage(intlMessages.fileToUpload);
    }

    if (!item.upload.done && !item.upload.error) {
      return intl.formatMessage(intlMessages.uploadProcess, {
        0: Math.floor(item.upload.progress).toString(),
      });
    }

    if (item.upload.done && item.upload.error) {
      const errorMessage = intlMessages[item.upload.status] || intlMessages.genericError;
      return intl.formatMessage(errorMessage);
    }

    return null;
  }

  renderPresentationItem(item) {
    const { disableActions, oldCurrentId } = this.state;
    const { intl } = this.props;

    const isUploading = (!item.upload.done && item.upload.progress > 0) || item.upload.error;
    const hasError = false;
    const isProcessing = isUploading && !hasError;

    const itemClassName = {
      [styles.tableItemNew]: item.id.indexOf(item.filename) !== -1,
      [styles.tableItemUploading]: isUploading,
      [styles.tableItemError]: hasError,
      [styles.tableItemAnimated]: isProcessing,
    };
    if (!item.id) return null;
    return (
      <tr
        key={item.id}
        className={cx(itemClassName)}
      >
        <td className={styles.tableItemIcon}>
          <Icon iconName="file" />
        </td>
        <th className={styles.tableItemName}>
          <span>{item.filename}</span>
        </th>
        <td className={styles.tableItemStatus} colSpan={hasError ? 2 : 0}>
          {this.renderPresentationItemStatus(item)}
        </td>
        {hasError ? null : (
          <td className={styles.tableItemActions}>
            <Button
              disabled={disableActions}
              className={cx(styles.itemAction, styles.itemActionRemove)}
              label="Remove presentation"
              aria-label={`Remove presentation ${item.filename}`}
              size="sm"
              icon="delete"
              hideLabel
              onClick={() => this.handleRemove(item)}
            />
          </td>
        )}
      </tr>
    );
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  handleMessageChange(event) {
    this.setState({
      message: event.target.value,
    });
  }

  renderPicDropzone() {
    const {
      intl,
      fileSizeMin,
      fileSizeMax,
    } = this.props;

    const { disableActions } = this.state;

    if (disableActions) return null;

    return (
      <Dropzone
        className={styles.dropzone}
        activeClassName={styles.dropzoneActive}
        rejectClassName={styles.dropzoneReject}
        accept="image/*"
        minSize={fileSizeMin}
        maxSize={fileSizeMax}
        disablePreview
        onDrop={this.handleFiledrop}
      >
        <Icon className={styles.dropzoneIcon} iconName="upload" />
        <p className={styles.dropzoneMessage}>
          {intl.formatMessage(intlMessages.dropzoneImagesLabel)}
          &nbsp;
          <span className={styles.dropzoneLink}>
            {intl.formatMessage(intlMessages.browseImagesLabel)}
          </span>
        </p>
      </Dropzone>
    );
  }

  renderDropzone() {
    const {
      intl,
      fileSizeMin,
      fileSizeMax,
      fileValidMimeTypes,
    } = this.props;

    return (
      // Until the Dropzone package has fixed the mime type hover validation, the rejectClassName
      // prop is being remove to prevent the error styles from being applied to valid file types.
      // Error handling is being done in the onDrop prop.
      <Dropzone
        className={styles.dropzone}
        activeClassName={styles.dropzoneActive}
        accept={isMobileBrowser ? '' : fileValidMimeTypes.map(fileValid => fileValid.extension)}
        minSize={fileSizeMin}
        maxSize={fileSizeMax}
        disablepreview="true"
        onDrop={this.handleFiledrop}
      >
        <Icon className={styles.dropzoneIcon} iconName="upload" />
        <p className={styles.dropzoneMessage}>
          {intl.formatMessage(intlMessages.dropzoneLabel)}
          &nbsp;
          <span className={styles.dropzoneLink}>
            {intl.formatMessage(intlMessages.browseFilesLabel)}
          </span>
        </p>
      </Dropzone>
    );
  }

  render() {
    const { intl, chatName } = this.props;
    const {
      preventClosing, disableActions, file, message,
    } = this.state;

    let awaitingUpload = false;

    if (file != undefined && file.upload.done) {
      awaitingUpload = true;
    }
    const confirmLabel = awaitingUpload
      ? intl.formatMessage(intlMessages.confirmLabel)
      : intl.formatMessage(intlMessages.uploadLabel);

    return (
      <ModalFileDrop
        title={intl.formatMessage(intlMessages.title, { 0: chatName })}
        preventClosing={preventClosing}
        confirm={{
          callback: this.handleConfirm,
          label: confirmLabel,
          description: intl.formatMessage(intlMessages.confirmDesc),
          disabled: disableActions,
        }}
        dismiss={{
          callback: this.handleDismiss,
          label: intl.formatMessage(intlMessages.dismissLabel),
          description: intl.formatMessage(intlMessages.dismissDesc),
          disabled: disableActions,
        }}
      >
        <input
          className={styles.input}
          id="message-input"
          placeholder={intl.formatMessage(intlMessages.inputPlaceholder, { 0: chatName })}
          autoCorrect="off"
          autoComplete="off"
          spellCheck="true"
          value={this.state.message}
          onChange={this.handleMessageChange}
        />
        <p>{intl.formatMessage(intlMessages.message)}</p>
        {this.renderPresentationList()}
        <div className={styles.dropzoneWrapper}>
          {isMobileBrowser ? this.renderPicDropzone() : null}
          {this.renderDropzone()}
        </div>
      </ModalFileDrop>
    );
  }
}

ChatFileUploader.propTypes = propTypes;
ChatFileUploader.defaultProps = defaultProps;

export default withModalMounter(injectIntl(ChatFileUploader));
