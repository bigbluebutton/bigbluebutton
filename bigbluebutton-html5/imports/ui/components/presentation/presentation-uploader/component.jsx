import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { TAB } from '/imports/utils/keyCodes';
import deviceInfo from '/imports/utils/deviceInfo';
import Button from '/imports/ui/components/common/button/component';
import update from 'immutability-helper';
import logger from '/imports/startup/client/logger';
import { toast } from 'react-toastify';
import { registerTitleView, unregisterTitleView } from '/imports/utils/dom-utils';
import Styled from './styles';
import PresentationDownloadDropdown from './presentation-download-dropdown/component';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Radio from '/imports/ui/components/common/radio/component';
import { unique } from 'radash';
import Session from '/imports/ui/services/storage/in-memory';

const { isMobile } = deviceInfo;
const propTypes = {
  allowDownloadOriginal: PropTypes.bool.isRequired,
  allowDownloadConverted: PropTypes.bool.isRequired,
  allowDownloadWithAnnotations: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  fileUploadConstraintsHint: PropTypes.bool.isRequired,
  fileSizeMax: PropTypes.number.isRequired,
  filePagesMax: PropTypes.number.isRequired,
  handleSave: PropTypes.func.isRequired,
  dispatchChangePresentationDownloadable: PropTypes.func.isRequired,
  fileValidMimeTypes: PropTypes.arrayOf(PropTypes.shape).isRequired,
  presentations: PropTypes.arrayOf(PropTypes.shape({
    presentationId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    current: PropTypes.bool.isRequired,
  })).isRequired,
  currentPresentation: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  handleFiledrop: PropTypes.func.isRequired,
  selectedToBeNextCurrent: PropTypes.string,
  renderPresentationItemStatus: PropTypes.func.isRequired,
  isPresenter: PropTypes.bool.isRequired,
  exportPresentation: PropTypes.func.isRequired,
};

const defaultProps = {
  selectedToBeNextCurrent: '',
};

const intlMessages = defineMessages({
  currentBadge: {
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
  FILE_VIRUS: {
    id: 'app.presentationUploder.upload.fileVirus',
    description: 'error that the file could not be uploaded due to security concerns',
  },
  SCAN_FAILED: {
    id: 'app.presentationUploder.upload.scanFailed',
    description: 'error that the file could not be uploaded because scanning failed'
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
  CONVERSION_TIMEOUT: {
    id: 'app.presentationUploder.conversion.conversionTimeout',
    description: 'warns the user that the presentation timed out in the back-end in specific page of the document',
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
  uploadStatus: {
    id: 'app.presentationUploder.uploadStatus',
    description: 'upload status for toast notification',
  },
  completed: {
    id: 'app.presentationUploder.completed',
    description: 'uploads complete label for toast notification',
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
  actionsLabel: {
    id: 'app.presentation.actionsLabel',
    description: 'actions label',
  },
});

const handleDismissToast = (id) => toast.dismiss(id);

class PresentationUploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      presentations: props.presentations,
      disableActions: false,
      presExporting: new Set(),
      shouldDisableExportButtonForAllDocuments: false,
    };

    this.hasError = null;
    this.exportToastId = 'exportPresentationToastId';

    const { handleFiledrop } = this.props;
    // handlers
    this.handleFiledrop = handleFiledrop;
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleCurrentChange = this.handleCurrentChange.bind(this);
    this.handleDownloadingOfPresentation = this.handleDownloadingOfPresentation.bind(this);
    // renders
    this.renderDropzone = this.renderDropzone.bind(this);
    this.renderExternalUpload = this.renderExternalUpload.bind(this);
    this.renderPicDropzone = this.renderPicDropzone.bind(this);
    this.renderPresentationList = this.renderPresentationList.bind(this);
    this.renderPresentationItem = this.renderPresentationItem.bind(this);
    // utilities
    this.deepMergeUpdateFileKey = this.deepMergeUpdateFileKey.bind(this);
    this.updateFileKey = this.updateFileKey.bind(this);
    this.getPresentationsToShow = this.getPresentationsToShow.bind(this);
    this.handleDownloadableChange = this.handleDownloadableChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { isOpen, presentations: propPresentations, currentPresentation, intl } = this.props;
    const { presentations } = this.state;
    const { presentations: prevPropPresentations } = prevProps;

    let shouldUpdateState = false;

    let presState = Object.values({
      ...JSON.parse(JSON.stringify(presentations)),
    });

    // New entries comming from graphql
    const propsDiffs = propPresentations.filter(
      (p) => !prevPropPresentations.some(
        (presentation) => p.presentationId === presentation.presentationId
          || (p.uploadTemporaryId
            && presentation.uploadTemporaryId
            && p.uploadTemporaryId === presentation.uploadTemporaryId),
      ),
    );

    if (propsDiffs.length > 0) {
      // Always update when there is a new presentation entry from graphql
      shouldUpdateState = true;

      // When the entry comes, remove previous presentation with the same temporaryId
      presState = presState.filter(
        (pres) => !propsDiffs.some((p) => pres.presentationId === p.uploadTemporaryId
          || pres.presentationId === p.presentationId),
      );

      // Then add the new entries to state
      presState = [
        ...JSON.parse(JSON.stringify(presState)),
        ...JSON.parse(JSON.stringify(propsDiffs)),
      ];
    }

    const presStateFiltered = presState.filter((presentation) => {
      const currentPropPres = propPresentations.find((pres) => pres.presentationId === presentation.presentationId);
      const prevPropPres = prevPropPresentations.find((pres) => pres.presentationId === presentation.presentationId);
      const hasConversionError = !!presentation?.uploadErrorMsgKey;
      const finishedConversion = !presentation?.uploadInProgress
        || !currentPropPres?.uploadInProgress;
      const hasTemporaryId = presentation.presentationId.startsWith(presentation.name);

      if (hasConversionError || (!finishedConversion && hasTemporaryId)) return true;

      const modPresentation = presentation;
      if (currentPropPres?.current !== prevPropPres?.current) {
        modPresentation.current = currentPropPres?.current;
        shouldUpdateState = true;
      }

      if (currentPropPres?.totalPagesUploaded !== prevPropPres?.totalPagesUploaded
        || presentation.totalPagesUploaded !== currentPropPres?.totalPagesUploaded) {
        modPresentation.totalPagesUploaded = currentPropPres?.totalPagesUploaded;
        shouldUpdateState = true;
      }

      if (currentPropPres?.uploadCompleted !== prevPropPres?.uploadCompleted
        || presentation.uploadCompleted !== currentPropPres?.uploadCompleted) {
        modPresentation.uploadCompleted = currentPropPres?.uploadCompleted;
        shouldUpdateState = true;
      }

      if (
        currentPropPres?.uploadErrorMsgKey !== prevPropPres?.uploadErrorMsgKey
        && currentPropPres?.uploadErrorDetailsJson !== prevPropPres?.uploadErrorDetailsJson
      ) {
        modPresentation.uploadErrorMsgKey = currentPropPres?.uploadErrorMsgKey;
        modPresentation.uploadErrorDetailsJson = currentPropPres?.uploadErrorDetailsJson;
        shouldUpdateState = true;
      }

      if (currentPropPres?.totalPages !== prevPropPres?.totalPages
        || presentation.totalPages !== currentPropPres?.totalPages) {
        modPresentation.totalPages = currentPropPres?.totalPages;
        shouldUpdateState = true;
      }

      if (currentPropPres?.downloadable !== prevPropPres?.downloadable) {
        modPresentation.downloadable = currentPropPres?.downloadable;
        shouldUpdateState = true;
      }

      if (currentPropPres?.downloadFileUri !== prevPropPres?.downloadFileUri) {
        modPresentation.downloadFileUri = currentPropPres?.downloadFileUri;
        shouldUpdateState = true;
      }

      if (currentPropPres?.filenameConverted !== prevPropPres?.filenameConverted) {
        modPresentation.filenameConverted = currentPropPres?.filenameConverted;
        shouldUpdateState = true;
      }

      if (currentPropPres) {
        modPresentation.uploadInProgress = currentPropPres?.uploadInProgress;
        modPresentation.removable = currentPropPres?.removable;
      }

      return true;
    }).filter((presentation) => {
      const duplicated = presentations.find(
        (pres) => pres.name === presentation.name
          && pres.presentationId !== presentation.presentationId,
      );
      if (duplicated
        && duplicated.presentationId.startsWith(presentation.name)
        && !presentation.presentationId.startsWith(presentation.name)
        && presentation?.uploadInProgress === duplicated?.uploadInProgress) {
        return false; // Prioritizing propPresentations (the one with id from back-end)
      }
      return true;
    });

    if (shouldUpdateState) {
      let shouldDisableActions = false;
      let shouldDisableExportButtonForAllDocuments = false;
      presStateFiltered.forEach(
        (p) => {
          shouldDisableActions = shouldDisableExportButtonForAllDocuments
            || !!p.uploadErrorMsgKey || !!p.uploadErrorDetailsJson;
          shouldDisableExportButtonForAllDocuments = (
            !p.uploadCompleted && !p.uploadErrorDetailsJson
          );
        },
      );
      this.setState({
        presentations: unique(presStateFiltered, (p) => p.presentationId),
        shouldDisableExportButtonForAllDocuments,
        disableActions: shouldDisableActions,
      });
    }

    if (!isOpen && prevProps.isOpen) {
      unregisterTitleView();
    }

    // Updates presentation list when modal opens to avoid missing presentations
    if (isOpen && !prevProps.isOpen) {
      registerTitleView(intl.formatMessage(intlMessages.uploadViewTitle));
      const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const modal = document.getElementById('upload-modal');
      const firstFocusableElement = modal?.querySelectorAll(focusableElements)[0];
      const focusableContent = modal?.querySelectorAll(focusableElements);
      const lastFocusableElement = focusableContent[focusableContent.length - 1];

      firstFocusableElement.focus();

      modal.addEventListener('keydown', (e) => {
        const tab = e.key === 'Tab' || e.keyCode === TAB;
        if (!tab) return;
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      });
    }

    if (currentPresentation && currentPresentation !== prevProps.currentPresentation) {
       this.handleCurrentChange(currentPresentation);
    }

    if (presentations.length > 0) {
      const selected = propPresentations.filter((p) => p.current);
      if (selected.length > 0) Session.setItem('selectedToBeNextCurrent', selected[0].presentationId);
    }

    if (toast.isActive(this.exportToastId)) {
      if (!prevProps.isOpen && isOpen) {
        handleDismissToast(this.exportToastId);
      }

      toast.update(this.exportToastId, {
        render: this.renderExportToast(),
      });
    }
  }

  componentWillUnmount() {
    if (toast.isActive(this.exportToastId)) {
      toast.dismiss(this.exportToastId);
    }
    Session.setItem('showUploadPresentationView', false);
  }

  handleRemove(item, withErr = false) {
    const {
      handleSave,
      setPresentation,
      removePresentation,
      presentationEnabled,
    } = this.props;
    if (withErr) {
      const { presentations } = this.state;
      const { presentations: propPresentations } = this.props;
      const filteredPropPresentations = propPresentations.filter(
        (d) => d.uploadCompleted && !d.uploadInProgress,
      );
      const ids = new Set(filteredPropPresentations.map((d) => d.presentationId));
      const filteredPresentations = presentations.filter(
        (d) => !ids.has(d.presentationId)
          && !d.uploadErrorMsgKey && !(d.uploadCompleted && !d.uploadInProgress),
      );
      const merged = [
        ...filteredPresentations,
        ...filteredPropPresentations,
      ];
      let hasUploading;
      merged.forEach((d) => {
        if (!d.uploadCompleted || d.uploadInProgress) {
          hasUploading = true;
        }
      });
      const hasCurrent = merged.some((pres) => pres.current);
      if (!hasCurrent && merged.length > 0) merged[0].current = true;
      this.hasError = false;

      // Save the state without errors in graphql
      handleSave(merged,
        true,
        {},
        propPresentations,
        setPresentation,
        removePresentation,
        presentationEnabled);
      if (hasUploading) {
        this.setState({
          presentations: merged,
        });
        return;
      }
      this.setState({
        presentations: merged,
        disableActions: false,
      });
      return;
    }

    const { presentations } = this.state;
    const toRemoveIndex = presentations.indexOf(item);
    this.setState({
      presentations: update(presentations, {
        $splice: [[toRemoveIndex, 1]],
      }),
    }, () => {
      const { presentations: updatedPresentations, oldCurrentId } = this.state;
      const commands = {};

      const currentIndex = updatedPresentations.findIndex((p) => p.current);
      const actualCurrentIndex = updatedPresentations.findIndex((p) => p.presentationId === oldCurrentId);

      if (currentIndex === -1 && updatedPresentations.length > 0) {
        const newCurrentIndex = actualCurrentIndex === -1 ? 0 : actualCurrentIndex;
        commands[newCurrentIndex] = {
          $apply: (presentation) => {
            const p = presentation;
            p.current = true;
            return p;
          },
        };
      }

      const updatedCurrent = update(updatedPresentations, commands);
      this.setState({ presentations: updatedCurrent });
    });
  }

  handleCurrentChange(id) {
    this.setState(({ presentations, disableActions }) => {
      if (disableActions || presentations?.length === 0) return false;

      const currentIndex = presentations.findIndex((p) => p.current);
      const newCurrentIndex = presentations.findIndex((p) => p.presentationId === id);
      const commands = {};

      // we can end up without a current presentation
      if (currentIndex !== -1) {
        commands[currentIndex] = {
          $apply: (presentation) => {
            const p = presentation;
            p.current = false;
            return p;
          },
        };
      }

      commands[newCurrentIndex] = {
        $apply: (presentation) => {
          if (!presentation) return;
          const p = presentation;
          if (p) {
            p.current = true;
          }
          return p;
        },
      };

      const presentationsUpdated = update(presentations, commands);
      return {
        presentations: presentationsUpdated,
      };
    });
  }

  handleConfirm() {
    const {
      handleSave,
      selectedToBeNextCurrent,
      presentations: propPresentations,
      dispatchChangePresentationDownloadable,
      setPresentation,
      removePresentation,
      presentationEnabled,
    } = this.props;
    const { disableActions, presentations } = this.state;
    const presentationsToSave = presentations;

    if (!presentationEnabled) {
      this.setState(
        { presentations: [] },
        Session.setItem('showUploadPresentationView', false),
      );
      return null;
    }

    this.setState({ disableActions: true });

    presentations.forEach((item) => {
      if (item.uploadCompleted) {
        const didDownloadableStateChange = propPresentations.some(
          (p) => p.presentationId === item.presentationId && p.downloadable !== item.downloadable,
        );
        if (didDownloadableStateChange) {
          dispatchChangePresentationDownloadable(item, item.downloadable);
        }
      }
    });

    if (!disableActions) {
      Session.setItem('showUploadPresentationView', false);
      return handleSave(
        presentationsToSave,
        true,
        {},
        propPresentations,
        setPresentation,
        removePresentation,
        presentationEnabled,
      )
        .then(() => {
          const hasError = presentations.some((p) => !!p.uploadErrorMsgKey);
          if (!hasError) {
            this.setState({
              disableActions: false,
            });
            return;
          }
          // if there's error we don't want to close the modal
          this.setState({
            disableActions: true,
            // preventClosing: true,
          }, () => {
            // if the selected current has error we revert back to the old one
            const newCurrent = presentations.find((p) => p.current);
            if (newCurrent.uploadErrorMsgKey) {
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

    Session.setItem('showUploadPresentationView', false);
    return null;
  }

  handleDownloadableChange(item, fileStateType, downloadable) {
    const { dispatchChangePresentationDownloadable } = this.props;

    dispatchChangePresentationDownloadable(item, downloadable, fileStateType);
  }

  handleDismiss() {
    const { presentations: propPresentations } = this.props;

    const shouldDisableExportButtonForAllDocuments = propPresentations.some(
      (p) => !p.uploadCompleted,
    );
    this.setState(
      {
        presentations: JSON.parse(JSON.stringify(propPresentations)),
        shouldDisableExportButtonForAllDocuments,
      },
      Session.setItem('showUploadPresentationView', false),
    );
  }

  handleDownloadingOfPresentation(item, fileStateType) {
    const { exportPresentation } = this.props;

    exportPresentation(item.presentationId, fileStateType);
  }

  getPresentationsToShow() {
    const { presentations, presExporting } = this.state;

    return Array.from(presExporting)
      .map((id) => presentations.find((p) => p.presentationId === id))
      .filter((p) => p);
  }

  deepMergeUpdateFileKey(id, key, value) {
    const applyValue = (toUpdate) => update(toUpdate, { $merge: value });
    this.updateFileKey(id, key, applyValue, '$apply');
  }

  updateFileKey(id, key, value, operation = '$set') {
    this.setState(({ presentations }) => {
      const fileIndex = presentations.findIndex((f) => f.presentationId === id);

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

  renderExtraHint() {
    const {
      intl,
      fileSizeMax,
      filePagesMax,
    } = this.props;

    const options = {
      maxFileSize: fileSizeMax / 1000000,
      maxFilePages: filePagesMax,
    };

    return (
      <Styled.ExtraHint>
        {intl.formatMessage(intlMessages.extraHint, options)}
      </Styled.ExtraHint>
    );
  }

  renderPresentationList() {
    const { presentations } = this.state;
    const { intl } = this.props;

    let presentationsSorted = presentations;

    try {
      presentationsSorted = presentations
        .sort((a, b) => a.uploadTimestamp - b.uploadTimestamp)
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => b.totalPagesUploaded - a.totalPagesUploaded)
        .sort((a, b) => b.uploadInProgress - a.uploadInProgress)
        .sort((a, b) => {
          const aUploadNotTriggeredYet = !a.uploadCompleted && a.totalPagesUploaded === 0;
          const bUploadNotTriggeredYet = !b.uploadCompleted && b.totalPagesUploaded === 0;
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
              <th>{intl.formatMessage(intlMessages.actionsLabel)}</th>
            </Styled.Head>
          </thead>
          <tbody>
            {unique(presentationsSorted, p => p.presentationId) .map((item) => this.renderPresentationItem(item))}
          </tbody>
        </Styled.Table>
      </Styled.FileList>
    );
  }





  renderDownloadableWithAnnotationsHint() {
    const {
      intl,
      allowDownloadWithAnnotations,
    } = this.props;

    return allowDownloadWithAnnotations ? (
      <Styled.ExportHint>
        {intl.formatMessage(intlMessages.exportHint)}
      </Styled.ExportHint>
    )
      : null;
  }

  renderPresentationItem(item) {
    const { disableActions, shouldDisableExportButtonForAllDocuments } = this.state;
    const {
      intl,
      selectedToBeNextCurrent,
      allowDownloadOriginal,
      allowDownloadConverted,
      allowDownloadWithAnnotations,
      renderPresentationItemStatus,
    } = this.props;

    const isActualCurrent = selectedToBeNextCurrent
      ? item.presentationId === selectedToBeNextCurrent
      : item.current;
    const isUploading = !item.uploadCompleted;
    const uploadInProgress = item.uploadInProgress;
    const hasError = !!item.uploadErrorMsgKey || !!item.uploadErrorDetailsJson;
    const isProcessing = (isUploading || uploadInProgress) && !hasError;

    if (hasError) {
      this.hasError = true;
    }

    const Settings = getSettingsSingletonInstance();
    const { animations } = Settings.application;

    const { removable, downloadable } = item;

    const isExporting = item?.exportToChatStatus === 'RUNNING';

    const shouldDisableExportButton = (isExporting
      || !item.uploadCompleted
      || hasError
      || disableActions);

    const formattedDownloadLabel = isExporting
      ? intl.formatMessage(intlMessages.exporting)
      : intl.formatMessage(intlMessages.export);

    const formattedDownloadAriaLabel = `${formattedDownloadLabel} ${item.name}`;

    const disableExportDropdown = shouldDisableExportButtonForAllDocuments
    || shouldDisableExportButton;

    return (
      <Styled.PresentationItem
        key={item.presentationId}
        isNew={item.presentationId.indexOf(item.name) !== -1}
        uploading={isUploading}
        uploadInProgress={uploadInProgress}
        error={hasError}
        animated={isProcessing}
        animations={animations}
        data-test="presentationItem"
      >
        <Styled.SetCurrentAction>
          <Radio
            animations={animations}
            ariaLabel={`${intl.formatMessage(intlMessages.setAsCurrentPresentation)} ${item.name}`}
            checked={item.current}
            keyValue={item.presentationId}
            onChange={() => this.handleCurrentChange(item.presentationId)}
            disabled={disableActions || hasError}
          />
        </Styled.SetCurrentAction>
        <Styled.TableItemName colSpan={!isActualCurrent ? 2 : 0}>
          <span>{item.name}</span>
        </Styled.TableItemName>
        {
          isActualCurrent
            ? (
              <Styled.TableItemCurrent>
                <Styled.CurrentLabel>
                  {intl.formatMessage(intlMessages.currentBadge)}
                </Styled.CurrentLabel>
              </Styled.TableItemCurrent>
            )
            : null
        }
        <Styled.TableItemStatus colSpan={hasError ? 2 : 0}>
          {renderPresentationItemStatus(item, intl)}
        </Styled.TableItemStatus>
        {
        hasError ? null : (
          <Styled.TableItemActions notDownloadable={!allowDownloadOriginal}>
            {allowDownloadOriginal || allowDownloadWithAnnotations || allowDownloadConverted ? (
              <PresentationDownloadDropdown
                disabled={disableExportDropdown}
                data-test="exportPresentation"
                aria-label={formattedDownloadAriaLabel}
                color="primary"
                isDownloadable={downloadable}
                allowDownloadOriginal={allowDownloadOriginal}
                allowDownloadConverted={allowDownloadConverted}
                allowDownloadWithAnnotations={allowDownloadWithAnnotations}
                handleDownloadableChange={this.handleDownloadableChange}
                item={item}
                closeModal={() => Session.setItem('showUploadPresentationView', false)}
                handleDownloadingOfPresentation={(fileStateType) => this
                  .handleDownloadingOfPresentation(item, fileStateType)}
              />
            ) : null}
            {removable ? (
              <Styled.RemoveButton
                disabled={disableActions}
                label={intl.formatMessage(intlMessages.removePresentation)}
                data-test="removePresentation"
                aria-label={`${intl.formatMessage(intlMessages.removePresentation)} ${item.name}`}
                size="sm"
                icon="delete"
                hideLabel
                onClick={() => this.handleRemove(item)}
                animations={animations}
              />
            ) : null}
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
        activeClassName="dropzoneActive"
        accept={fileValidMimeTypes.map((fileValid) => fileValid.extension)}
        disablepreview="true"
        onDrop={(files, files2) => this.handleFiledrop(files, files2, this, intl, intlMessages)}
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

    const {
      presentationUploadExternalDescription, presentationUploadExternalUrl,
    } = externalUploadData;

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
    );
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
        onDrop={(files, files2) => this.handleFiledrop(files, files2, this, intl, intlMessages)}
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
      if (item?.presentationId.indexOf(item.name) !== -1 && item.totalPagesUploaded === 0) hasNewUpload = true;
    });

    return (
      <>
        {isOpen
          ? (
            <Styled.UploaderModal id="upload-modal">
              <Styled.ModalInner>
                <Styled.ModalHeader>
                  <Styled.Title>{intl.formatMessage(intlMessages.title)}</Styled.Title>
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
                      onClick={() => this.handleConfirm()}
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
                {this.renderDownloadableWithAnnotationsHint()}
                {isMobile ? this.renderPicDropzone() : null}
                {this.renderDropzone()}
                {this.renderExternalUpload()}
              </Styled.ModalInner>
            </Styled.UploaderModal>
          )
          : null}
      </>
    );
  }
}

PresentationUploader.propTypes = propTypes;
PresentationUploader.defaultProps = defaultProps;

export default injectIntl(PresentationUploader);
