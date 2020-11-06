import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl, defineMessages } from 'react-intl';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import Checkbox from '/imports/ui/components/checkbox/component';
import Icon from '/imports/ui/components/icon/component';
import Dropzone from 'react-dropzone';
import update from 'immutability-helper';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import browser from 'browser-detect';
import _ from 'lodash';
import { styles } from './styles';

const BROWSER_RESULTS = browser();
const isMobileBrowser = (BROWSER_RESULTS ? BROWSER_RESULTS.mobile : false)
  || (BROWSER_RESULTS && BROWSER_RESULTS.os
    ? BROWSER_RESULTS.os.includes('Android') // mobile flag doesn't always work
    : false);

const propTypes = {
  intl: intlShape.isRequired,
  defaultFileName: PropTypes.string.isRequired,
  fileSizeMin: PropTypes.number.isRequired,
  fileSizeMax: PropTypes.number.isRequired,
  handleSave: PropTypes.func.isRequired,
  dispatchTogglePresentationDownloadable: PropTypes.func.isRequired,
  fileValidMimeTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  presentations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
    isCurrent: PropTypes.bool.isRequired,
    conversion: PropTypes.object,
    upload: PropTypes.object,
  })).isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const defaultProps = {
};

const intlMessages = defineMessages({
  current: {
    id: 'app.presentationUploder.currentBadge',
  },
  title: {
    id: 'app.presentationUploder.title',
    description: 'title of the modal',
  },
  message: {
    id: 'app.presentationUploder.message',
    description: 'message warning the types of files accepted',
  },
  uploadLabel: {
    id: 'app.presentationUploder.uploadLabel',
    description: 'confirm label when presentations are to be uploaded',
  },
  confirmLabel: {
    id: 'app.presentationUploder.confirmLabel',
    description: 'confirm label when no presentations are to be uploaded',
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
  408: {
    id: 'app.presentationUploder.upload.408',
    description: 'error for token request timeout',
  },
  404: {
    id: 'app.presentationUploder.upload.404',
    description: 'error not found',
  },
  401: {
    id: 'app.presentationUploder.upload.401',
    description: 'error for failed upload token request.',
  },
  conversionProcessingSlides: {
    id: 'app.presentationUploder.conversion.conversionProcessingSlides',
    description: 'indicates how many slides were converted',
  },
  genericError: {
    id: 'app.presentationUploder.genericError',
    description: 'generic error while uploading/converting',
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
  uploading: {
    id: 'app.presentationUploder.uploading',
    description: 'uploading label for toast notification',
  },
  uploadStatus: {
    id: 'app.presentationUploder.uploadStatus',
    description: 'upload status for toast notification',
  },
  completed: {
    id: 'app.presentationUploder.completed',
    description: 'uploads complete label for toast notification',
  },
  item: {
    id: 'app.presentationUploder.item',
    description: 'single item label',
  },
  itemPlural: {
    id: 'app.presentationUploder.itemPlural',
    description: 'plural item label',
  },
  clearErrors: {
    id: 'app.presentationUploder.clearErrors',
    description: 'button label for clearing upload errors',
  },
  clearErrorsDesc: {
    id: 'app.presentationUploder.clearErrorsDesc',
    description: 'aria description for button clearing upload error',
  },
});

class PresentationUploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      presentations: [],
      disableActions: false,
      toUploadCount: 0,
    };

    this.toastId = null;
    this.hasError = null;

    // handlers
    this.handleFiledrop = this.handleFiledrop.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleCurrentChange = this.handleCurrentChange.bind(this);
    this.handleDismissToast = this.handleDismissToast.bind(this);
    this.handleToggleDownloadable = this.handleToggleDownloadable.bind(this);
    // renders
    this.renderDropzone = this.renderDropzone.bind(this);
    this.renderPicDropzone = this.renderPicDropzone.bind(this);
    this.renderPresentationList = this.renderPresentationList.bind(this);
    this.renderPresentationItem = this.renderPresentationItem.bind(this);
    this.renderPresentationItemStatus = this.renderPresentationItemStatus.bind(this);
    this.renderToastList = this.renderToastList.bind(this);
    this.renderToastItem = this.renderToastItem.bind(this);
    // utilities
    this.deepMergeUpdateFileKey = this.deepMergeUpdateFileKey.bind(this);
    this.updateFileKey = this.updateFileKey.bind(this);
    this.isDefault = this.isDefault.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { selectedToBeNextCurrent, isOpen, presentations: propPresentations } = this.props;
    const { presentations } = this.state;

    // cleared local presetation state errors and set to presentations available on the server
    if (presentations.length === 0 && propPresentations.length > 1) {
      return this.setState({ presentations: propPresentations });
    }

    // Only presentation available is the default coming from the server.
    // set as selectedToBeNextCurrentOnConfirm once upload / coversion complete
    if (presentations.length === 0 && propPresentations.length === 1) {
      if (propPresentations[0].upload.done && propPresentations[0].conversion.done) {
        return this.setState({
          presentations: propPresentations,
        }, Session.set('selectedToBeNextCurrent', propPresentations[0].id));
      }
    }

    if (presentations.length > 0) {
      const selected = propPresentations.filter(p => p.isCurrent);
      if (selected.length > 0) Session.set('selectedToBeNextCurrent', selected[0].id);
    }

    if (this.toastId) {
      if (!prevProps.isOpen && isOpen) {
        this.handleDismissToast(this.toastId);
      }

      toast.update(this.toastId, {
        render: this.renderToastList(),
      });
    }
  }

  isDefault(presentation) {
    const { defaultFileName } = this.props;
    return presentation.filename === defaultFileName
      && !presentation.id.includes(defaultFileName);
  }

  handleDismissToast() {
    return toast.dismiss(this.toastId);
  }

  handleFiledrop(files, files2) {
    const { fileValidMimeTypes, intl } = this.props;
    const { toUploadCount } = this.state;
    const validMimes = fileValidMimeTypes.map(fileValid => fileValid.mime);
    const validExtentions = fileValidMimeTypes.map(fileValid => fileValid.extension);
    const [accepted, rejected] = _.partition(files
      .concat(files2), f => (
      validMimes.includes(f.type) || validExtentions.includes(`.${f.name.split('.').pop()}`)
    ));

    const presentationsToUpload = accepted.map((file) => {
      const id = _.uniqueId(file.name);

      return {
        file,
        isDownloadable: false, // by default new presentations are set not to be downloadable
        id,
        filename: file.name,
        isCurrent: false,
        conversion: { done: false, error: false },
        upload: { done: false, error: false, progress: 0 },
        onProgress: (event) => {
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
        onConversion: (conversion) => {
          this.deepMergeUpdateFileKey(id, 'conversion', conversion);
        },
        onUpload: (upload) => {
          this.deepMergeUpdateFileKey(id, 'upload', upload);
        },
        onDone: (newId) => {
          this.updateFileKey(id, 'id', newId);
        },
      };
    });

    this.setState(({ presentations }) => ({
      presentations: presentations.concat(presentationsToUpload),
      toUploadCount: (toUploadCount + presentationsToUpload.length),
    }), () => {
      // after the state is set (files have been dropped),
      // make the first of the new presentations current
      if (presentationsToUpload && presentationsToUpload.length) {
        this.handleCurrentChange(presentationsToUpload[0].id);
      }
    });

    if (rejected.length > 0) {
      notify(intl.formatMessage(intlMessages.rejectedError), 'error');
    }
  }

  renderToastItem(item) {
    const isUploading = !item.upload.done && item.upload.progress > 0;
    const isConverting = !item.conversion.done && item.upload.done;
    const hasError = item.conversion.error || item.upload.error;
    const isProcessing = (isUploading || isConverting) && !hasError;

    const {
      intl, selectedToBeNextCurrent,
    } = this.props;

    const itemClassName = {
      [styles.done]: !isProcessing && !hasError,
      [styles.err]: hasError,
      [styles.loading]: isProcessing,
    };

    const statusInfoStyle = {
      [styles.textErr]: hasError,
      [styles.textInfo]: !hasError,
    };

    let icon = isProcessing ? 'blank' : 'check';
    if (hasError) icon = 'circle_close';

    return (
      <div
        key={item.id}
        className={styles.uploadRow}
        onClick={() => {
          if (hasError || isProcessing) Session.set('showUploadPresentationView', true);
        }}
      >
        <div className={styles.fileLine}>
          <span className={styles.fileIcon}>
            <Icon iconName="file" />
          </span>
          <span className={styles.toastFileName}>
            <span>{item.filename}</span>
          </span>
          <span className={styles.statusIcon}>
            <Icon iconName={icon} className={cx(itemClassName)} />
          </span>
        </div>
        <div className={styles.statusInfo}>
          <span className={cx(statusInfoStyle)}>{this.renderPresentationItemStatus(item)}</span>
        </div>
      </div>
    );
  }

  handleToggleDownloadable(item) {
    const { dispatchTogglePresentationDownloadable } = this.props;
    const { presentations } = this.state;

    const oldDownloadableState = item.isDownloadable;

    const outOfDatePresentationIndex = presentations.findIndex(p => p.id === item.id);
    const commands = {};
    commands[outOfDatePresentationIndex] = {
      $apply: (presentation) => {
        const p = presentation;
        p.isDownloadable = !oldDownloadableState;
        return p;
      },
    };
    const presentationsUpdated = update(presentations, commands);

    this.setState({
      presentations: presentationsUpdated,
    });

    // If the presentation has not be uploaded yet, adjusting the state suffices
    // otherwise set previously uploaded presentation to [not] be downloadable
    if (item.upload.done) {
      dispatchTogglePresentationDownloadable(item, !oldDownloadableState);
    }
  }

  updateFileKey(id, key, value, operation = '$set') {
    this.setState(({ presentations }) => {
      const fileIndex = presentations.findIndex(f => f.id === id);

      return fileIndex === -1 ? false : {
        presentations: update(presentations, {
          [fileIndex]: {
            $apply: file => update(file, {
              [key]: {
                [operation]: value,
              },
            }),
          },
        }),
      };
    });
  }

  handleDismiss() {
    const { presentations } = this.state;
    const { presentations: propPresentations } = this.props;
    const ids = new Set(propPresentations.map(d => d.ID));
    const merged = [
      ...propPresentations,
      ...presentations.filter(d => !ids.has(d.ID)),
    ];
    this.setState(
      { presentations: merged },
      Session.set('showUploadPresentationView', false),
    );
  }

  handleConfirm(hasNewUpload) {
    const {
      handleSave, selectedToBeNextCurrent,
    } = this.props;
    const { disableActions, presentations } = this.state;
    const presentationsToSave = presentations;

    this.setState({ disableActions: true });

    if (hasNewUpload) {
      this.toastId = toast.info(this.renderToastList(), {
        hideProgressBar: true,
        autoClose: false,
        newestOnTop: true,
        closeOnClick: true,
        onClose: () => {
          this.toastId = null;
        },
      });
    }

    if (this.toastId) Session.set('UploadPresentationToastId', this.toastId);

    if (!disableActions) {
      Session.set('showUploadPresentationView', false);
      return handleSave(presentationsToSave)
        .then(() => {
          const hasError = presentations.some(p => p.upload.error || p.conversion.error);
          if (!hasError) {
            this.setState({
              disableActions: false,
              toUploadCount: 0,
            });
            return;
          }
          // if there's error we don't want to close the modal
          this.setState({
            disableActions: true,
            // preventClosing: true,
          }, () => {
            // if the selected current has error we revert back to the old one
            const newCurrent = presentations.find(p => p.isCurrent);
            if (newCurrent.upload.error || newCurrent.conversion.error) {
              this.handleCurrentChange(selectedToBeNextCurrent);
            }
          });
        })
        .catch((error) => {
          logger.error({
            logCode: 'presentationuploader_component_save_error',
            extraInfo: { error },
          }, 'Presentation uploader catch error on confirm');
        });
    }

    Session.set('showUploadPresentationView', false);
    return null;
  }

  deepMergeUpdateFileKey(id, key, value) {
    const applyValue = toUpdate => update(toUpdate, { $merge: value });
    this.updateFileKey(id, key, applyValue, '$apply');
  }

  handleCurrentChange(id) {
    const { presentations, disableActions } = this.state;

    if (disableActions) return;

    const currentIndex = presentations.findIndex(p => p.isCurrent);
    const newCurrentIndex = presentations.findIndex(p => p.id === id);
    const commands = {};

    // we can end up without a current presentation
    if (currentIndex !== -1) {
      commands[currentIndex] = {
        $apply: (presentation) => {
          const p = presentation;
          p.isCurrent = false;
          return p;
        },
      };
    }

    commands[newCurrentIndex] = {
      $apply: (presentation) => {
        const p = presentation;
        p.isCurrent = true;
        return p;
      },
    };

    const presentationsUpdated = update(presentations, commands);
    this.setState({ presentations: presentationsUpdated });
  }

  handleRemove(item, withErr = false) {
    if (withErr) {
      const { presentations } = this.props;
      this.hasError = false;
      return this.setState({
        presentations,
        disableActions: false,
      });
    }

    const { presentations } = this.state;
    const toRemoveIndex = presentations.indexOf(item);
    return this.setState({
      presentations: update(presentations, {
        $splice: [[toRemoveIndex, 1]],
      }),
    }, () => {
      const { presentations: updatedPresentations, oldCurrentId } = this.state;
      const currentIndex = updatedPresentations.findIndex(p => p.isCurrent);
      const actualCurrentIndex = updatedPresentations.findIndex(p => p.id === oldCurrentId);

      if (currentIndex === -1 && updatedPresentations.length > 0) {
        const commands = {};
        const newCurrentIndex = actualCurrentIndex === -1 ? 0 : actualCurrentIndex;
        commands[newCurrentIndex] = {
          $apply: (presentation) => {
            const p = presentation;
            p.isCurrent = true;
            return p;
          },
        };

        const updatedCurrent = update(updatedPresentations, commands);
        this.setState({ presentations: updatedCurrent });
      }
    });
  }

  renderPresentationList() {
    const { presentations } = this.state;
    const { intl } = this.props;

    const presentationsSorted = presentations
      .sort((a, b) => a.uploadTimestamp - b.uploadTimestamp);

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
            {presentationsSorted.map(item => this.renderPresentationItem(item))}
          </tbody>
        </table>
      </div>
    );
  }

  renderToastList() {
    const { presentations, toUploadCount } = this.state;

    if (toUploadCount === 0) {
      return this.handleDismissToast(this.toastId);
    }

    const { intl } = this.props;
    let converted = 0;

    let presentationsSorted = presentations
      .filter(p => (p.upload.progress || p.conversion.status) && p.file)
      .sort((a, b) => a.uploadTimestamp - b.uploadTimestamp)
      .sort((a, b) => a.conversion.done - b.conversion.done);

    presentationsSorted = presentationsSorted
      .splice(0, toUploadCount)
      .map((p) => {
        if (p.conversion.done) converted += 1;
        return p;
      });

    let toastHeading = '';
    const itemLabel = presentationsSorted.length > 1
      ? intl.formatMessage(intlMessages.itemPlural)
      : intl.formatMessage(intlMessages.item);

    if (converted === 0) {
      toastHeading = intl.formatMessage(intlMessages.uploading, {
        0: presentationsSorted.length,
        1: itemLabel,
      });
    }

    if (converted > 0 && converted !== presentationsSorted.length) {
      toastHeading = intl.formatMessage(intlMessages.uploadStatus, {
        0: converted,
        1: presentationsSorted.length,
      });
    }

    if (converted === presentationsSorted.length) {
      toastHeading = intl.formatMessage(intlMessages.completed, {
        0: converted,
      });
    }

    return (
      <div className={styles.toastWrapper}>
        <div className={styles.uploadToastHeader}>
          <Icon className={styles.uploadIcon} iconName="upload" />
          <span className={styles.uploadToastTitle}>{toastHeading}</span>
        </div>
        <div className={styles.innerToast}>
          <div>
            <div>
              {presentationsSorted.map(item => this.renderToastItem(item))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderPresentationItem(item) {
    const { disableActions, hasError: stateError } = this.state;
    const {
      intl, selectedToBeNextCurrent,
    } = this.props;

    const isActualCurrent = selectedToBeNextCurrent ? item.id === selectedToBeNextCurrent : item.isCurrent;
    const isUploading = !item.upload.done && item.upload.progress > 0;
    const isConverting = !item.conversion.done && item.upload.done;
    const hasError = item.conversion.error || item.upload.error;
    const isProcessing = (isUploading || isConverting) && !hasError;

    if (!stateError && hasError) {
      this.hasError = true;
    }

    const itemClassName = {
      [styles.tableItemNew]: item.id.indexOf(item.filename) !== -1,
      [styles.tableItemUploading]: isUploading,
      [styles.tableItemConverting]: isConverting,
      [styles.tableItemError]: hasError,
      [styles.tableItemAnimated]: isProcessing,
    };

    const hideRemove = this.isDefault(item);
    const formattedDownloadableLabel = item.isDownloadable
      ? intl.formatMessage(intlMessages.isDownloadable)
      : intl.formatMessage(intlMessages.isNotDownloadable);

    const formattedDownloadableAriaLabel = `${formattedDownloadableLabel} ${item.filename}`;

    const isDownloadableStyle = item.isDownloadable
      ? cx(styles.itemAction, styles.itemActionRemove, styles.checked)
      : cx(styles.itemAction, styles.itemActionRemove);

    return (
      <tr
        key={item.id}
        className={cx(itemClassName)}
      >
        <td className={styles.tableItemIcon}>
          <Icon iconName="file" />
        </td>
        {
          isActualCurrent
            ? (
              <th className={styles.tableItemCurrent}>
                <span className={styles.currentLabel}>
                  {intl.formatMessage(intlMessages.current)}
                </span>
              </th>
            )
            : null
        }
        <th className={styles.tableItemName} colSpan={!isActualCurrent ? 2 : 0}>
          <span>{item.filename}</span>
        </th>
        <td className={styles.tableItemStatus} colSpan={hasError ? 2 : 0}>
          {this.renderPresentationItemStatus(item)}
        </td>
        {hasError ? null : (
          <td className={styles.tableItemActions}>
            <Button
              disabled={disableActions}
              className={isDownloadableStyle}
              label={formattedDownloadableLabel}
              aria-label={formattedDownloadableAriaLabel}
              hideLabel
              size="sm"
              icon={item.isDownloadable ? 'download' : 'download-off'}
              onClick={() => this.handleToggleDownloadable(item)}
            />
            <Checkbox
              ariaLabel={`${intl.formatMessage(intlMessages.setAsCurrentPresentation)} ${item.filename}`}
              checked={item.isCurrent}
              className={styles.itemAction}
              keyValue={item.id}
              onChange={() => this.handleCurrentChange(item.id)}
              disabled={disableActions}
            />
            {hideRemove ? null : (
              <Button
                disabled={disableActions}
                className={cx(styles.itemAction, styles.itemActionRemove)}
                label={intl.formatMessage(intlMessages.removePresentation)}
                aria-label={`${intl.formatMessage(intlMessages.removePresentation)} ${item.filename}`}
                size="sm"
                icon="delete"
                hideLabel
                onClick={() => this.handleRemove(item)}
              />
            )}
          </td>
        )}
      </tr>
    );
  }

  renderDropzone() {
    const {
      intl,
      fileSizeMin,
      fileSizeMax,
      fileValidMimeTypes,
    } = this.props;

    const { disableActions } = this.state;

    if (disableActions && !this.hasError) return null;

    return this.hasError ? (
      <div>
        <Button
          color="danger"
          onClick={() => this.handleRemove(null, true)}
          label={intl.formatMessage(intlMessages.clearErrors)}
          aria-describedby="clearErrorDesc"
        />
        <div id="clearErrorDesc" style={{ display: 'none' }}>
          {intl.formatMessage(intlMessages.clearErrorsDesc)}
        </div>
      </div>
    ) : (
      // Until the Dropzone package has fixed the mime type hover validation, the rejectClassName
      // prop is being remove to prevent the error styles from being applied to valid file types.
      // Error handling is being done in the onDrop prop.
      <Dropzone
        multiple
        className={styles.dropzone}
        activeClassName={styles.dropzoneActive}
        accept={fileValidMimeTypes.map(fileValid => fileValid.extension)}
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

  renderPicDropzone() {
    const {
      intl,
      fileSizeMin,
      fileSizeMax,
    } = this.props;

    const { disableActions } = this.state;

    if (disableActions && !this.hasError) return null;

    return this.hasError ? (
      <div>
        <Button
          color="danger"
          onClick={() => this.handleRemove(null, true)}
          label={intl.formatMessage(intlMessages.clearErrors)}
          aria-describedby="clearErrorDesc"
        />
        <div id="clearErrorDesc" style={{ display: 'none' }}>
          {intl.formatMessage(intlMessages.clearErrorsDesc)}
        </div>
      </div>
    ) : (
      <Dropzone
        multiple
        className={styles.dropzone}
        activeClassName={styles.dropzoneActive}
        rejectClassName={styles.dropzoneReject}
        accept="image/*"
        minSize={fileSizeMin}
        maxSize={fileSizeMax}
        disablepreview="true"
        data-test="fileUploadDropZone"
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

    if (!item.conversion.done && item.conversion.error) {
      const errorMessage = intlMessages[item.conversion.status] || intlMessages.genericConversionStatus;
      return intl.formatMessage(errorMessage);
    }

    if (!item.conversion.done && !item.conversion.error) {
      if (item.conversion.pagesCompleted < item.conversion.numPages) {
        return intl.formatMessage(intlMessages.conversionProcessingSlides, {
          0: item.conversion.pagesCompleted,
          1: item.conversion.numPages,
        });
      }

      const conversionStatusMessage = intlMessages[item.conversion.status]
        || intlMessages.genericConversionStatus;
      return intl.formatMessage(conversionStatusMessage);
    }

    return null;
  }

  render() {
    const {
      isOpen, isPresenter, intl,
    } = this.props;
    if (!isPresenter) return null;
    const { presentations, disableActions } = this.state;

    let hasNewUpload = false;

    presentations.map((item) => {
      if (item.id.indexOf(item.filename) !== -1 && item.upload.progress === 0) hasNewUpload = true;
    });

    return isOpen ? (
      <div className={styles.modal}>
        <div
          className={styles.modalInner}
        >
          <div className={styles.modalHeader}>
            <h1>Presentation</h1>
            <div className={styles.actionWrapper}>
              <Button
                className={styles.dismiss}
                color="default"
                onClick={this.handleDismiss}
                label={intl.formatMessage(intlMessages.dismissLabel)}
                aria-describedby={intl.formatMessage(intlMessages.dismissDesc)}
              />
              <Button
                className={styles.confirm}
                color="primary"
                onClick={() => this.handleConfirm(hasNewUpload)}
                disabled={disableActions}
                label={hasNewUpload
                  ? intl.formatMessage(intlMessages.uploadLabel)
                  : intl.formatMessage(intlMessages.confirmLabel)
                }
              />
            </div>
          </div>

          <div className={styles.modalHint}>
            {`${intl.formatMessage(intlMessages.message)}`}
          </div>
          {this.renderPresentationList()}
          {isMobileBrowser ? this.renderPicDropzone() : null}
          {this.renderDropzone()}
        </div>
      </div>
    ) : null;
  }
}

PresentationUploader.propTypes = propTypes;
PresentationUploader.defaultProps = defaultProps;

export default injectIntl(PresentationUploader);
