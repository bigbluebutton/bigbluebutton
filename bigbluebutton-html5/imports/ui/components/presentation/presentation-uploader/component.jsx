import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { TAB } from '/imports/utils/keyCodes';
import deviceInfo from '/imports/utils/deviceInfo';
import Button from '/imports/ui/components/common/button/component';
import Icon from '/imports/ui/components/common/icon/component';
import update from 'immutability-helper';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { registerTitleView, unregisterTitleView } from '/imports/utils/dom-utils';
import Styled from './styles';
import Settings from '/imports/ui/services/settings';
import Checkbox from '/imports/ui/components/common/checkbox/component';

const { isMobile } = deviceInfo;

const propTypes = {
  intl: PropTypes.object.isRequired,
  fileUploadConstraintsHint: PropTypes.bool.isRequired,
  fileSizeMax: PropTypes.number.isRequired,
  filePagesMax: PropTypes.number.isRequired,
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
  externalUploadTitle: {
    id: 'app.presentationUploder.externalUploadTitle',
    description: 'title for external upload area',
  },
  externalUploadLabel: {
    id: 'app.presentationUploder.externalUploadLabel',
    description: 'message of external upload button',
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
  extraHint: {
    id: 'app.presentationUploder.extraHint',
    description: 'message used to indicate upload file max sizes',
  },
  rejectedError: {
    id: 'app.presentationUploder.rejectedError',
    description: 'some files rejected, please check the file mime types',
  },
  badConnectionError: {
    id: 'app.presentationUploder.connectionClosedError',
    description: 'message indicating that the connection was closed',
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
  OFFICE_DOC_CONVERSION_INVALID: {
    id: 'app.presentationUploder.conversion.officeDocConversionInvalid',
    description: '',
  },
  OFFICE_DOC_CONVERSION_FAILED: {
    id: 'app.presentationUploder.conversion.officeDocConversionFailed',
    description: 'warns the user that the conversion failed because of wrong office file',
  },
  UNSUPPORTED_DOCUMENT: {
    id: 'app.presentationUploder.conversion.unsupportedDocument',
    description: 'warns the user that the file extension is not supported',
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
  uploadViewTitle: {
    id: 'app.presentationUploder.uploadViewTitle',
    description: 'view name apended to document title',
  },
  exportHint: {
    id: 'app.presentationUploader.exportHint',
    description: 'message to indicate the export presentation option',
  },
  exportToastHeader: {
    id: 'app.presentationUploader.exportToastHeader',
    description: 'exporting toast header',
  },
  exportToastHeaderPlural: {
    id: 'app.presentationUploader.exportToastHeaderPlural',
    description: 'exporting toast header in plural',
  },
  export: {
    id: 'app.presentationUploader.export',
    description: 'send presentation to chat',
  },
  exporting: {
    id: 'app.presentationUploader.exporting',
    description: 'presentation is being sent to chat',
  },
  currentLabel: {
    id: 'app.presentationUploader.currentPresentationLabel',
    description: 'current presentation label',
  },
  downloadLabel: {
    id: 'app.presentation.downloadLabel',
    description: 'download label',
  },
  sending: {
    id: 'app.presentationUploader.sending',
    description: 'sending label',
  },
  sent: {
    id: 'app.presentationUploader.sent',
    description: 'sent label',
  },
  exportingTimeout: {
    id: 'app.presentationUploader.exportingTimeout',
    description: 'exporting timeout label',
  },
});

const EXPORT_STATUSES = {
  RUNNING: 'RUNNING',
  TIMEOUT: 'TIMEOUT',
  EXPORTED: 'EXPORTED',
};

class PresentationUploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      presentations: [],
      disableActions: false,
      toUploadCount: 0,
      presExporting: new Set(),
    };

    this.toastId = null;
    this.hasError = null;
    this.exportToastId = null;

    // handlers
    this.handleFiledrop = this.handleFiledrop.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleCurrentChange = this.handleCurrentChange.bind(this);
    this.handleDismissToast = this.handleDismissToast.bind(this);
    this.handleSendToChat = this.handleSendToChat.bind(this);
    // renders
    this.renderDropzone = this.renderDropzone.bind(this);
    this.renderExternalUpload = this.renderExternalUpload.bind(this);
    this.renderPicDropzone = this.renderPicDropzone.bind(this);
    this.renderPresentationList = this.renderPresentationList.bind(this);
    this.renderPresentationItem = this.renderPresentationItem.bind(this);
    this.renderPresentationItemStatus = this.renderPresentationItemStatus.bind(this);
    this.renderToastList = this.renderToastList.bind(this);
    this.renderToastItem = this.renderToastItem.bind(this);
    this.renderExportToast = this.renderExportToast.bind(this);
    this.renderToastExportItem = this.renderToastExportItem.bind(this);
    this.renderExportationStatus = this.renderExportationStatus.bind(this);
    // utilities
    this.deepMergeUpdateFileKey = this.deepMergeUpdateFileKey.bind(this);
    this.updateFileKey = this.updateFileKey.bind(this);
    this.getPresentationsToShow = this.getPresentationsToShow.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { isOpen, presentations: propPresentations, intl } = this.props;
    const { presentations } = this.state;
    const { presentations: prevPropPresentations } = prevProps;

    let shouldUpdateState = isOpen && !prevProps.isOpen;
    const presState = Object.values({
      ...propPresentations,
      ...presentations,
    });
    const presStateFiltered = presState.filter((presentation) => {
      const currentPropPres = propPresentations.find((pres) => pres.id === presentation.id);
      const prevPropPres = prevPropPresentations.find((pres) => pres.id === presentation.id);
      const hasConversionError = presentation?.conversion?.error;
      const finishedConversion = presentation?.conversion?.done || currentPropPres?.conversion?.done;
      const hasTemporaryId = presentation.id.startsWith(presentation.filename);

      if (hasConversionError || (!finishedConversion && hasTemporaryId)) return true;
      if (!currentPropPres) return false;

      if(presentation?.conversion?.done !== finishedConversion) {
        shouldUpdateState = true;
      }

      if (currentPropPres.isCurrent !== prevPropPres?.isCurrent) {
        presentation.isCurrent = currentPropPres.isCurrent;
      }

      presentation.conversion = currentPropPres.conversion;
      presentation.isRemovable = currentPropPres.isRemovable;

      return true;
    }).filter(presentation => {
      const duplicated = presentations.find(
        (pres) => pres.filename === presentation.filename
          && pres.id !== presentation.id
      );
      if (duplicated
        && duplicated.id.startsWith(presentation.filename)
        && !presentation.id.startsWith(presentation.filename)
        && presentation?.conversion?.done === duplicated?.conversion?.done) {
          return false;
      }
      return true;
    });

    if (shouldUpdateState) {
      this.setState({
        presentations: _.uniqBy(presStateFiltered, 'id')
      });
    }

    if (!isOpen && prevProps.isOpen) {
      unregisterTitleView();
    }

    // Updates presentation list when chat modal opens to avoid missing presentations
    if (isOpen && !prevProps.isOpen) {
      registerTitleView(intl.formatMessage(intlMessages.uploadViewTitle));
      const  focusableElements =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const modal = document.getElementById('upload-modal');
      const firstFocusableElement = modal?.querySelectorAll(focusableElements)[0];
      const focusableContent = modal?.querySelectorAll(focusableElements);
      const lastFocusableElement = focusableContent[focusableContent.length - 1];
      
      firstFocusableElement.focus();
  
      modal.addEventListener('keydown', function(e) {
        let tab = e.key === 'Tab' || e.keyCode === TAB;
        if (!tab) return;
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      });
    }

    if (presentations.length > 0) {
      const selected = propPresentations.filter((p) => p.isCurrent);
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

    if (this.exportToastId) {
      if (!prevProps.isOpen && isOpen) {
        this.handleDismissToast(this.exportToastId);
      }

      toast.update(this.exportToastId, {
        render: this.renderExportToast(),
      });
    }
  }

  componentWillUnmount() {
    Session.set('showUploadPresentationView', false);
  }

  handleDismissToast() {
    return toast.dismiss(this.toastId);
  }

  handleFiledrop(files, files2) {
    const { fileValidMimeTypes, intl } = this.props;
    const { toUploadCount } = this.state;
    const validMimes = fileValidMimeTypes.map((fileValid) => fileValid.mime);
    const validExtentions = fileValidMimeTypes.map((fileValid) => fileValid.extension);
    const [accepted, rejected] = _.partition(files
      .concat(files2), (f) => (
        validMimes.includes(f.type) || validExtentions.includes(`.${f.name.split('.').pop()}`)
      ));

    const presentationsToUpload = accepted.map((file) => {
      const id = _.uniqueId(file.name);

      return {
        file,
        isDownloadable: false, // by default new presentations are set not to be downloadable
        isRemovable: true,
        id,
        filename: file.name,
        isCurrent: false,
        conversion: { done: false, error: false },
        upload: { done: false, error: false, progress: 0 },
        exportation: { isRunning: false, error: false },
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
      const commands = {};

      const currentIndex = updatedPresentations.findIndex((p) => p.isCurrent);
      const actualCurrentIndex = updatedPresentations.findIndex((p) => p.id === oldCurrentId);

      if (currentIndex === -1 && updatedPresentations.length > 0) {
        const newCurrentIndex = actualCurrentIndex === -1 ? 0 : actualCurrentIndex;
        commands[newCurrentIndex] = {
          $apply: (presentation) => {
            const p = presentation;
            p.isCurrent = true;
            return p;
          },
        };
      }

      const updatedCurrent = update(updatedPresentations, commands);
      this.setState({ presentations: updatedCurrent });
    });
  }

  handleCurrentChange(id) {
    const { presentations, disableActions } = this.state;

    if (disableActions) return;

    const currentIndex = presentations.findIndex((p) => p.isCurrent);
    const newCurrentIndex = presentations.findIndex((p) => p.id === id);
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

  deepMergeUpdateFileKey(id, key, value) {
    const applyValue = (toUpdate) => update(toUpdate, { $merge: value });
    this.updateFileKey(id, key, applyValue, '$apply');
  }

  handleConfirm(hasNewUpload) {
    const {
      handleSave,
      selectedToBeNextCurrent,
      presentations: propPresentations,
      dispatchTogglePresentationDownloadable,
    } = this.props;
    const { disableActions, presentations } = this.state;
    const presentationsToSave = presentations;

    this.setState({ disableActions: true });

    presentations.forEach(item => {
      if (item.upload.done) {
        const didDownloadableStateChange = propPresentations.some(
          (p) => p.id === item.id && p.isDownloadable !== item.isDownloadable
        );
        if (didDownloadableStateChange) {
          dispatchTogglePresentationDownloadable(item, item.isDownloadable);
        }
      }
    });

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
          const hasError = presentations.some((p) => p.upload.error || p.conversion.error);
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
            const newCurrent = presentations.find((p) => p.isCurrent);
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

  handleDismiss() {
    const { presentations } = this.state;
    const { presentations: propPresentations } = this.props;
    const ids = new Set(propPresentations.map((d) => d.ID));
    const merged = [
      ...presentations.filter((d) => !ids.has(d.ID)),
      ...propPresentations,
    ];
    this.setState(
      { presentations: merged },
      Session.set('showUploadPresentationView', false),
    );
  }

  getPresentationsToShow() {
    const { presentations, presExporting } = this.state;

    return Array.from(presExporting)
      .map((id) => presentations.find((p) => p.id === id))
      .filter((p) => p);
  }

  handleSendToChat(item) {
    const { exportPresentationToChat } = this.props;

    const observer = (exportation) => {
      this.deepMergeUpdateFileKey(item.id, 'exportation', exportation);

      if (exportation.status === EXPORT_STATUSES.RUNNING) {
        this.setState((prevState) => {
          prevState.presExporting.add(item.id);
          return {
            presExporting: prevState.presExporting,
          };
        }, () => {
          if (this.exportToastId) {
            toast.update(this.exportToastId, {
              render: this.renderExportToast(),
            });
          } else {
            this.exportToastId = toast.info(this.renderExportToast(), {
              hideProgressBar: true,
              autoClose: false,
              newestOnTop: true,
              closeOnClick: true,
              onClose: () => {
                this.exportToastId = null;

                const presToShow = this.getPresentationsToShow();
                const isAnyRunning = presToShow.some(
                  (p) => p.exportation.status === EXPORT_STATUSES.RUNNING
                );

                if (!isAnyRunning) {
                  this.setState({ presExporting: new Set() });
                }
              },
            });
          }
        });
      }
    };

    exportPresentationToChat(item.id, observer);

    Session.set('showUploadPresentationView', false);
  }

  updateFileKey(id, key, value, operation = '$set') {
    this.setState(({ presentations }) => {
      const fileIndex = presentations.findIndex((f) => f.id === id);

      return fileIndex === -1 ? false : {
        presentations: update(presentations, {
          [fileIndex]: {
            $apply: (file) => update(file, {
              [key]: {
                [operation]: value,
              },
            }),
          },
        }),
      };
    });
  }

  renderToastItem(item) {
    const isUploading = !item.upload.done && item.upload.progress > 0;
    const isConverting = !item.conversion.done && item.upload.done;
    const hasError = item.conversion.error || item.upload.error;
    const isProcessing = (isUploading || isConverting) && !hasError;

    let icon = isProcessing ? 'blank' : 'check';
    if (hasError) icon = 'circle_close';

    return (
      <Styled.UploadRow
        key={item.id}
        onClick={() => {
          if (hasError || isProcessing) Session.set('showUploadPresentationView', true);
        }}
      >
        <Styled.FileLine>
          <span>
            <Icon iconName="file" />
          </span>
          <Styled.ToastFileName>
            <span>{item.filename}</span>
          </Styled.ToastFileName>
          <Styled.StatusIcon>
            <Styled.ToastItemIcon
              done={!isProcessing && !hasError}
              error={hasError}
              loading={isProcessing}
              iconName={icon}
            />
          </Styled.StatusIcon>
        </Styled.FileLine>
        <Styled.StatusInfo>
          <Styled.StatusInfoSpan data-test="presentationStatusInfo" styles={hasError ? 'error' : 'info'}>
            {this.renderPresentationItemStatus(item)}
          </Styled.StatusInfoSpan>
        </Styled.StatusInfo>
      </Styled.UploadRow>
    );
  }

  renderExtraHint() {
    const {
      intl,
      fileSizeMax,
      filePagesMax,
    } = this.props;

    const options = {
      0: fileSizeMax/1000000,
      1: filePagesMax,
    };

    return (
      <Styled.ExtraHint>
        {intl.formatMessage(intlMessages.extraHint, options)}
      </Styled.ExtraHint>
    );
  }

  renderPresentationList() {
    const { presentations } = this.state;
    const { intl, allowDownloadable } = this.props;

    let presentationsSorted = presentations;

    try {
      presentationsSorted = presentations
        .sort((a, b) => a.uploadTimestamp - b.uploadTimestamp)
        .sort((a, b) => a.filename.localeCompare(b.filename))
        .sort((a, b) => b.upload.progress - a.upload.progress)
        .sort((a, b) => b.conversion.done - a.conversion.done)
        .sort((a, b) => {
          const aUploadNotTriggeredYet = !a.upload.done && a.upload.progress === 0;
          const bUploadNotTriggeredYet = !b.upload.done && b.upload.progress === 0;
          return bUploadNotTriggeredYet - aUploadNotTriggeredYet;
        });
    } catch (error) {
      logger.error({
        logCode: 'presentationuploader_component_render_error',
        extraInfo: { error },
      }, 'Presentation uploader catch error on render presentation list');
    }

    return (
      <Styled.FileList>
        <Styled.Table>
          <thead>
            <tr>
              <Styled.VisuallyHidden>
                {intl.formatMessage(intlMessages.setAsCurrentPresentation)}
              </Styled.VisuallyHidden>
              <Styled.VisuallyHidden colSpan={2}>
                {intl.formatMessage(intlMessages.filename)}
              </Styled.VisuallyHidden>
              <Styled.VisuallyHidden>
                {intl.formatMessage(intlMessages.status)}
              </Styled.VisuallyHidden>
              <Styled.VisuallyHidden>
                {intl.formatMessage(intlMessages.options)}
              </Styled.VisuallyHidden>
            </tr>
            <Styled.Head>
              <th colSpan={4}>{intl.formatMessage(intlMessages.currentLabel)}</th>
              {
                allowDownloadable ? <th>{intl.formatMessage(intlMessages.downloadLabel)}</th> : null
              }
            </Styled.Head>
          </thead>
          <tbody>
            {_.uniqBy(presentationsSorted, 'id').map((item) => this.renderPresentationItem(item))}
          </tbody>
        </Styled.Table>
      </Styled.FileList>
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
      .filter((p) => (p.upload.progress || p.upload.error || p.conversion.status) && p.file)
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
      <Styled.ToastWrapper>
        <Styled.UploadToastHeader>
          <Styled.UploadIcon iconName="upload" />
          <Styled.UploadToastTitle>{toastHeading}</Styled.UploadToastTitle>
        </Styled.UploadToastHeader>
        <Styled.InnerToast>
          <div>
            <div>
              {presentationsSorted.map((item) => this.renderToastItem(item))}
            </div>
          </div>
        </Styled.InnerToast>
      </Styled.ToastWrapper>
    );
  }

  renderExportToast() {
    const { intl } = this.props;
    const { presExporting } = this.state;

    const presToShow = this.getPresentationsToShow();

    const isAllExported = presToShow.every(
      (p) => p.exportation.status === EXPORT_STATUSES.EXPORTED
    );
    const shouldDismiss = isAllExported && this.exportToastId;

    if (shouldDismiss) {
      this.handleDismissToast(this.exportToastId);

      if (presExporting.size) {
        this.setState({ presExporting: new Set() });
      }

      return;
    }

    const presToShowSorted = [
      ...presToShow.filter((p) => p.exportation.status === EXPORT_STATUSES.RUNNING),
      ...presToShow.filter((p) => p.exportation.status === EXPORT_STATUSES.TIMEOUT),
      ...presToShow.filter((p) => p.exportation.status === EXPORT_STATUSES.EXPORTED),
    ];

    const headerLabelId = presToShowSorted.length === 1
      ? 'exportToastHeader'
      : 'exportToastHeaderPlural';

    return (
      <Styled.ToastWrapper>
        <Styled.UploadToastHeader>
          <Styled.UploadIcon iconName="download" />
          <Styled.UploadToastTitle>
            {intl.formatMessage(intlMessages[headerLabelId], { 0: presToShowSorted.length })}
          </Styled.UploadToastTitle>
        </Styled.UploadToastHeader>
        <Styled.InnerToast>
          <div>
            <div>
              {presToShowSorted.map((item) => this.renderToastExportItem(item))}
            </div>
          </div>
        </Styled.InnerToast>
      </Styled.ToastWrapper>
    );
  }

  renderToastExportItem(item) {
    const { status } = item.exportation;
    const loading = status === EXPORT_STATUSES.RUNNING;
    const done = status === EXPORT_STATUSES.EXPORTED;
    let icon;

    switch (status) {
      case EXPORT_STATUSES.RUNNING:
        icon = 'blank'
        break;
      case EXPORT_STATUSES.EXPORTED:
        icon = 'check'
        break;
      case EXPORT_STATUSES.TIMEOUT:
        icon = 'warning'
        break;
      default:
        break;
    }

    return (
      <Styled.UploadRow>
        <Styled.FileLine>
          <span>
            <Icon iconName="file" />
          </span>
          <Styled.ToastFileName>
            <span>{item.filename}</span>
          </Styled.ToastFileName>
          <Styled.StatusIcon>
            <Styled.ToastItemIcon
              loading={loading}
              done={done}
              iconName={icon}
              color="#0F70D7"
            />
          </Styled.StatusIcon>
        </Styled.FileLine>
        <Styled.StatusInfo>
          <Styled.StatusInfoSpan>
            {this.renderExportationStatus(item)}
          </Styled.StatusInfoSpan>
        </Styled.StatusInfo>
      </Styled.UploadRow>
    );
  }

  renderExportationStatus(item) {
    const { intl } = this.props;

    switch (item.exportation.status) {
      case EXPORT_STATUSES.RUNNING:
        return intl.formatMessage(intlMessages.sending);
      case EXPORT_STATUSES.TIMEOUT:
        return intl.formatMessage(intlMessages.exportingTimeout);
      case EXPORT_STATUSES.EXPORTED:
        return intl.formatMessage(intlMessages.sent);
      default:
        return '';
    }
  }

  renderPresentationItem(item) {
    const { disableActions } = this.state;
    const {
      intl,
      selectedToBeNextCurrent,
      allowDownloadable
    } = this.props;

    const isActualCurrent = selectedToBeNextCurrent ? item.id === selectedToBeNextCurrent : item.isCurrent;
    const isUploading = !item.upload.done && item.upload.progress > 0;
    const isConverting = !item.conversion.done && item.upload.done;
    const hasError = item.conversion.error || item.upload.error;
    const isProcessing = (isUploading || isConverting) && !hasError;

    if (hasError) {
      this.hasError = true;
    }

    const { animations } = Settings.application;

    const { isRemovable, exportation: { status } } = item;

    const isExporting = status === 'RUNNING';

    const shouldDisableExportButton = isExporting
      || !item.conversion.done
      || hasError
      || disableActions;

    const formattedDownloadLabel = isExporting
      ? intl.formatMessage(intlMessages.exporting)
      : intl.formatMessage(intlMessages.export);

    const formattedDownloadAriaLabel = `${formattedDownloadLabel} ${item.filename}`;

    return (
      <Styled.PresentationItem
        key={item.id}
        isNew={item.id.indexOf(item.filename) !== -1}
        uploading={isUploading}
        converting={isConverting}
        error={hasError}
        animated={isProcessing}
        animations={animations}
      >
        <Styled.SetCurrentAction>
          <Checkbox
            animations={animations}
            ariaLabel={`${intl.formatMessage(intlMessages.setAsCurrentPresentation)} ${item.filename}`}
            checked={item.isCurrent}
            keyValue={item.id}
            onChange={() => this.handleCurrentChange(item.id)}
            disabled={disableActions || hasError}
          />
        </Styled.SetCurrentAction>
        <Styled.TableItemName colSpan={!isActualCurrent ? 2 : 0}>
          <span>{item.filename}</span>
        </Styled.TableItemName>
        {
          isActualCurrent
            ? (
              <Styled.TableItemCurrent>
                <Styled.CurrentLabel>
                  {intl.formatMessage(intlMessages.current)}
                </Styled.CurrentLabel>
              </Styled.TableItemCurrent>
            )
            : null
        }
        <Styled.TableItemStatus colSpan={hasError ? 2 : 0}>
          {this.renderPresentationItemStatus(item)}
        </Styled.TableItemStatus>
        {hasError ? null : (
          <Styled.TableItemActions notDownloadable={!allowDownloadable}>
            {allowDownloadable ? (
              <Styled.DownloadButton
                disabled={shouldDisableExportButton}
                label={intl.formatMessage(intlMessages.export)}
                data-test="exportPresentationToPublicChat"
                aria-label={formattedDownloadAriaLabel}
                size="sm"
                color="primary"
                onClick={() => this.handleSendToChat(item)}
                animations={animations}
              />
            ) : null}
            {isRemovable ? (
              <Styled.RemoveButton
                disabled={disableActions}
                label={intl.formatMessage(intlMessages.removePresentation)}
                data-test="removePresentation"
                aria-label={`${intl.formatMessage(intlMessages.removePresentation)} ${item.filename}`}
                size="sm"
                icon="delete"
                hideLabel
                onClick={() => this.handleRemove(item)}
                animations={animations}
              />
              ) : null
            }
          </Styled.TableItemActions>
        )}
      </Styled.PresentationItem>
    );
  }

  renderDropzone() {
    const {
      intl,
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
      <Styled.UploaderDropzone
        multiple
        activeClassName={"dropzoneActive"}
        accept={fileValidMimeTypes.map((fileValid) => fileValid.extension)}
        disablepreview="true"
        onDrop={this.handleFiledrop}
      >
        <Styled.DropzoneIcon iconName="upload" />
        <Styled.DropzoneMessage>
          {intl.formatMessage(intlMessages.dropzoneLabel)}
          &nbsp;
          <Styled.DropzoneLink>
            {intl.formatMessage(intlMessages.browseFilesLabel)}
          </Styled.DropzoneLink>
        </Styled.DropzoneMessage>
      </Styled.UploaderDropzone>
    );
  }

  renderExternalUpload() {
    const { externalUploadData, intl } = this.props;

    const { presentationUploadExternalDescription, presentationUploadExternalUrl } = externalUploadData;

    if (!presentationUploadExternalDescription || !presentationUploadExternalUrl) return null;

    return (
      <Styled.ExternalUpload>
        <div>
          <Styled.ExternalUploadTitle>
            {intl.formatMessage(intlMessages.externalUploadTitle)}
          </Styled.ExternalUploadTitle>

          <p>{presentationUploadExternalDescription}</p>
        </div>
        <Styled.ExternalUploadButton
          color="default"
          onClick={() => window.open(`${presentationUploadExternalUrl}`)}
          label={intl.formatMessage(intlMessages.externalUploadLabel)}
          aria-describedby={intl.formatMessage(intlMessages.externalUploadLabel)}
        />        
      </Styled.ExternalUpload>
    )
  }

  renderPicDropzone() {
    const {
      intl,
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
      <Styled.UploaderDropzone
        multiple
        accept="image/*"
        disablepreview="true"
        data-test="fileUploadDropZone"
        onDrop={this.handleFiledrop}
      >
        <Styled.DropzoneIcon iconName="upload" />
        <Styled.DropzoneMessage>
          {intl.formatMessage(intlMessages.dropzoneImagesLabel)}
          &nbsp;
          <Styled.DropzoneLink>
            {intl.formatMessage(intlMessages.browseImagesLabel)}
          </Styled.DropzoneLink>
        </Styled.DropzoneMessage>
      </Styled.UploaderDropzone>
    );
  }

  renderPresentationItemStatus(item) {
    const { intl, fileSizeMax } = this.props;
    if (!item.upload.done && item.upload.progress === 0) {
      return intl.formatMessage(intlMessages.fileToUpload);
    }

    if (!item.upload.done && !item.upload.error) {
      return intl.formatMessage(intlMessages.uploadProcess, {
        0: Math.floor(item.upload.progress).toString(),
      });
    }

    const constraint = {};

    if (item.upload.done && item.upload.error) {
      if (item.conversion.status === 'FILE_TOO_LARGE' || item.upload.status === 413) {
        constraint['0'] = (fileSizeMax / 1000 / 1000).toFixed(2);
      } else {
        if (item.upload.progress < 100) {
          const errorMessage = intlMessages.badConnectionError;
          return intl.formatMessage(errorMessage);
        }
      }

      const errorMessage = intlMessages[item.upload.status] || intlMessages.genericError;
      return intl.formatMessage(errorMessage, constraint);
    }

    if (!item.conversion.done && item.conversion.error) {
      const errorMessage = intlMessages[item.conversion.status] || intlMessages.genericConversionStatus;

      switch (item.conversion.status) {
        case 'PAGE_COUNT_EXCEEDED':
          constraint['0'] = item.conversion.maxNumberPages;
          break;
        case 'PDF_HAS_BIG_PAGE':
          constraint['0'] = (item.conversion.bigPageSize / 1000 / 1000).toFixed(2);
          break;
        default:
          break;
      }

      return intl.formatMessage(errorMessage, constraint);
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
      isOpen,
      isPresenter,
      intl,
      fileUploadConstraintsHint,
    } = this.props;
    if (!isPresenter) return null;
    const { presentations, disableActions } = this.state;

    let hasNewUpload = false;

    presentations.forEach((item) => {
      if (item.id.indexOf(item.filename) !== -1 && item.upload.progress === 0) hasNewUpload = true;
    });

    return isOpen ? (
      <Styled.UploaderModal id="upload-modal">
        <Styled.ModalInner>
          <Styled.ModalHeader>
            <h1>{intl.formatMessage(intlMessages.title)}</h1>
            <Styled.ActionWrapper>
              <Styled.DismissButton
                color="secondary"
                onClick={this.handleDismiss}
                label={intl.formatMessage(intlMessages.dismissLabel)}
                aria-describedby={intl.formatMessage(intlMessages.dismissDesc)}
              />
              <Styled.ConfirmButton
                data-test="confirmManagePresentation"
                color="primary"
                onClick={() => this.handleConfirm(hasNewUpload)}
                disabled={disableActions}
                label={hasNewUpload
                  ? intl.formatMessage(intlMessages.uploadLabel)
                  : intl.formatMessage(intlMessages.confirmLabel)}
              />
            </Styled.ActionWrapper>
          </Styled.ModalHeader>

          <Styled.ModalHint>
            {`${intl.formatMessage(intlMessages.message)}`}
            {fileUploadConstraintsHint ? this.renderExtraHint() : null}
          </Styled.ModalHint>
          {this.renderPresentationList()}
          <Styled.ExportHint>
            {intl.formatMessage(intlMessages.exportHint)}
          </Styled.ExportHint>
          {isMobile ? this.renderPicDropzone() : null}
          {this.renderDropzone()}
          {this.renderExternalUpload()}
        </Styled.ModalInner>
      </Styled.UploaderModal>
    ) : null;
  }
}

PresentationUploader.propTypes = propTypes;
PresentationUploader.defaultProps = defaultProps;

export default injectIntl(PresentationUploader);
