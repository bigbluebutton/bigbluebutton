import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import update from 'immutability-helper';
import logger from '/imports/startup/client/logger';
import { toast } from 'react-toastify';
import { unique } from 'radash';
import Styled from './styles';
import PresentationDownloadDropdown from './presentation-download-dropdown/component';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Session from '/imports/ui/services/storage/in-memory';
import Auth from '/imports/ui/services/auth';
import ModalStyled from '../styles';

const { isMobile } = deviceInfo;
const propTypes = {
  allowDownloadOriginal: PropTypes.bool.isRequired,
  allowDownloadConverted: PropTypes.bool.isRequired,
  allowDownloadWithAnnotations: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleSave: PropTypes.func.isRequired,
  dispatchChangePresentationDownloadable: PropTypes.func.isRequired,
  fileValidMimeTypes: PropTypes.arrayOf(PropTypes.shape).isRequired,
  presentations: PropTypes.arrayOf(PropTypes.shape({
    presentationId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    current: PropTypes.bool.isRequired,
  })).isRequired,
  currentPresentation: PropTypes.string.isRequired,
  handleFiledrop: PropTypes.func.isRequired,
  isPresenter: PropTypes.bool.isRequired,
  exportPresentation: PropTypes.func.isRequired,
  onActionCompleted: PropTypes.func.isRequired,
  setPresentation: PropTypes.func.isRequired,
  removePresentation: PropTypes.func.isRequired,
  presentationEnabled: PropTypes.bool.isRequired,
  externalUploadData: PropTypes.shape({
    presentationUploadExternalDescription: PropTypes.string,
    presentationUploadExternalUrl: PropTypes.string,
  }),
};

const defaultProps = {
  externalUploadData: {},
};

const intlMessages = defineMessages({
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
  browseFilesLabel: {
    id: 'app.presentationUploder.browseFilesLabel',
    description: 'message use on the file browser',
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
    description: 'error that the file could not be uploaded because scanning failed',
  },
  genericError: {
    id: 'app.presentationUploder.genericError',
    description: 'generic error while uploading/converting',
  },
  removePresentation: {
    id: 'app.presentationUploder.removePresentationLabel',
    description: 'select to delete this presentation',
  },
  uploadViewTitle: {
    id: 'app.presentationUploder.uploadViewTitle',
    description: 'view name apended to document title',
  },
  export: {
    id: 'app.presentationUploader.export',
    description: 'send presentation to chat',
  },
  exporting: {
    id: 'app.presentationUploader.exporting',
    description: 'presentation is being sent to chat',
  },
  shareLabel: {
    id: 'app.mediaSharing.modal.share',
    description: 'Label for the share button in the sharing media modal',
  },
});

class PresentationUploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      presentations: props.presentations,
      activeThumbnailId: null, // Initialize activeThumbnailId
    };

    this.hasError = null;
    this.exportToastId = 'exportPresentationToastId';

    // handlers
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleCurrentChange = this.handleCurrentChange.bind(this);
    this.handleDownloadingOfPresentation = this.handleDownloadingOfPresentation.bind(this);
    // renders
    this.renderDropzone = this.renderDropzone.bind(this);
    this.renderPicDropzone = this.renderPicDropzone.bind(this);
    this.renderExternalUpload = this.renderExternalUpload.bind(this);
    this.renderPresentationList = this.renderPresentationList.bind(this);
    this.renderPresentationItem = this.renderPresentationItem.bind(this);
    // utilities
    this.deepMergeUpdateFileKey = this.deepMergeUpdateFileKey.bind(this);
    this.updateFileKey = this.updateFileKey.bind(this);
    this.handleDownloadableChange = this.handleDownloadableChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { presentations: propPresentations, currentPresentation } = this.props;
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
      const currentPropPres = propPresentations.find(
        (pres) => pres.presentationId === presentation.presentationId,
      );
      const prevPropPres = prevPropPresentations.find(
        (pres) => pres.presentationId === presentation.presentationId,
      );
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

      if (currentPropPres?.firstPageThumbnailUrl !== prevPropPres?.firstPageThumbnailUrl) {
        modPresentation.firstPageThumbnailUrl = currentPropPres?.firstPageThumbnailUrl;
        shouldUpdateState = true;
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
      this.setState({
        presentations: unique(presStateFiltered, (p) => p.presentationId),
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
      toast.update(this.exportToastId, {
        render: this.renderExportToast(),
      });
    }
  }

  componentWillUnmount() {
    if (toast.isActive(this.exportToastId)) {
      toast.dismiss(this.exportToastId);
    }
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
      const actualCurrentIndex = updatedPresentations.findIndex(
        (p) => p.presentationId === oldCurrentId,
      );

      removePresentation(item.presentationId);
      if (currentIndex === -1 && updatedPresentations.length > 0) {
        const newCurrentIndex = actualCurrentIndex === -1 ? 0 : actualCurrentIndex;
        commands[newCurrentIndex] = {
          $apply: (presentation) => {
            const p = presentation;
            p.current = true;
            return p;
          },
        };
        setPresentation(updatedPresentations[newCurrentIndex].presentationId);
      }

      const updatedCurrent = update(updatedPresentations, commands);
      this.setState({ presentations: updatedCurrent });
    });
  }

  handleCurrentChange(id) {
    this.setState(({ presentations }) => {
      if (presentations?.length === 0) return false;

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
          if (!presentation) return null;
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
      setPresentation,
      onActionCompleted, // Get the callback from props
    } = this.props;
    const { activeThumbnailId } = this.state;

    if (activeThumbnailId) {
      setPresentation(activeThumbnailId);
      if (onActionCompleted) onActionCompleted();
    }
    return null;
  }

  handleDownloadableChange(item, fileStateType, downloadable) {
    const { dispatchChangePresentationDownloadable } = this.props;

    dispatchChangePresentationDownloadable(item, downloadable, fileStateType);
  }

  handleDownloadingOfPresentation(item, fileStateType) {
    const { exportPresentation } = this.props;

    exportPresentation(item.presentationId, fileStateType);
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

  renderPresentationList() {
    const { presentations } = this.state;
    const {
      currentPresentation: currentPresentationId,
    } = this.props; // Added currentPresentationId

    let presentationsSorted = [];

    try {
      const currentPres = presentations.find((p) => p.presentationId === currentPresentationId);
      const otherPresentations = presentations.filter(
        (p) => p.presentationId !== currentPresentationId,
      );

      // Sort other presentations by createdAt descending (newest first)
      otherPresentations.sort((a, b) => {
        // Ensure createdAt exists and is a string before parsing
        const dateA = a.createdAt && typeof a.createdAt === 'string' ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt && typeof b.createdAt === 'string' ? new Date(b.createdAt) : new Date(0);

        if (dateB.getTime() !== dateA.getTime()) {
          return dateB.getTime() - dateA.getTime();
        }
        return a.name.localeCompare(b.name);
      });

      if (currentPres) {
        presentationsSorted = [currentPres, ...otherPresentations];
      } else {
        presentationsSorted = otherPresentations;
      }
    } catch (error) {
      logger.error({
        logCode: 'presentationuploader_component_render_error',
        extraInfo: { error },
      }, 'Presentation uploader catch error on render presentation list');
      // Fallback to unsorted or previously sorted if error occurs
      presentationsSorted = presentations;
    }

    return (
      <Styled.PresentationsContainer>
        {unique(presentationsSorted, (p) => p.presentationId)
          .map((item) => this.renderPresentationItem(item))}
      </Styled.PresentationsContainer>
    );
  }

  renderPresentationItem(item) {
    const {
      activeThumbnailId,
    } = this.state;
    const {
      intl,
      allowDownloadOriginal,
      allowDownloadConverted,
      allowDownloadWithAnnotations,
      onActionCompleted,
    } = this.props;

    const isVisuallySelected = activeThumbnailId
      ? activeThumbnailId === item.presentationId
      : item.current;
    const isUploading = !item.uploadCompleted;
    const { uploadInProgress } = item;
    const hasError = !!item.uploadErrorMsgKey || !!item.uploadErrorDetailsJson;
    const isProcessing = (isUploading || uploadInProgress) && !hasError;

    if (hasError) {
      this.hasError = true;
    }

    const Settings = getSettingsSingletonInstance();
    const { animations } = Settings.application;

    const { removable, downloadable, firstPageThumbnailUrl } = item;

    const isExporting = item?.exportToChatStatus === 'RUNNING';

    const shouldDisableExportButton = (isExporting
      || !item.uploadCompleted
      || hasError);

    const formattedDownloadLabel = isExporting
      ? intl.formatMessage(intlMessages.exporting)
      : intl.formatMessage(intlMessages.export);

    const formattedDownloadAriaLabel = `${formattedDownloadLabel} ${item.name}`;

    const disableExportDropdown = shouldDisableExportButton;

    // only render the item if it has finished processing and has a thumbnail URL
    if (isProcessing || !firstPageThumbnailUrl) return null;

    return (
      <Styled.PresentationItemContainer data-test="presentationItem" key={item.presentationId}>
        <Styled.PresentationThumbnail
          data-test="presentationThumbnail"
          selected={isVisuallySelected}
          onClick={() => {
            this.setState({ activeThumbnailId: item.presentationId });
          }}
          aria-label={`${item.name}`}
        >
          <img src={Auth.authenticateURL(firstPageThumbnailUrl)} alt={item.name} />
        </Styled.PresentationThumbnail>
        <Styled.PresentationItemBottomContainer>
          <Styled.PresentationItemName data-test="presentationName">
            {item.name}
          </Styled.PresentationItemName>
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
              closeModal={() => onActionCompleted()}
              handleDownloadingOfPresentation={(fileStateType) => this
                .handleDownloadingOfPresentation(item, fileStateType)}
            />
          ) : null}
          {removable ? (
            <Styled.RemoveButton
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
        </Styled.PresentationItemBottomContainer>
      </Styled.PresentationItemContainer>
    );
  }

  renderDropzone() {
    const {
      intl,
      fileValidMimeTypes,
      handleFiledrop,
    } = this.props;

    return (
      // Until the Dropzone package has fixed the mime type hover validation, the rejectClassName
      // prop is being remove to prevent the error styles from being applied to valid file types.
      // Error handling is being done in the onDrop prop.
      <Styled.UploaderDropzone
        multiple
        activeClassName="dropzoneActive"
        accept={fileValidMimeTypes.map((fileValid) => fileValid.extension)}
        disablepreview="true"
        onDrop={(files, files2) => handleFiledrop(files, files2, this, intl, intlMessages)}
      >
        <Styled.UploadIcon />
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
      handleFiledrop,
    } = this.props;

    return (
      <Styled.UploaderDropzone
        multiple
        activeClassName="dropzoneActive"
        accept="image/*"
        disablepreview="true"
        data-test="fileUploadDropZone"
        onDrop={(files, files2) => handleFiledrop(files, files2, this, intl, intlMessages)}
      >
        <Styled.UploadIcon />
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

  render() {
    const {
      isPresenter,
      currentPresentation,
      intl,
    } = this.props;
    if (!isPresenter) return null;
    const {
      activeThumbnailId,
    } = this.state;

    return (
      <div id="upload-modal">
        {isMobile ? this.renderPicDropzone() : null}
        {this.renderDropzone()}
        {this.renderExternalUpload()}
        {this.renderPresentationList()}
        <ModalStyled.FooterContainer>
          <ModalStyled.ConfirmationButton
            data-test="sharePresentationButton"
            label={intl.formatMessage(intlMessages.shareLabel)}
            color="primary"
            onClick={this.handleConfirm}
            disabled={currentPresentation === activeThumbnailId || !activeThumbnailId}
          />
        </ModalStyled.FooterContainer>
      </div>
    );
  }
}

PresentationUploader.propTypes = propTypes;
PresentationUploader.defaultProps = defaultProps;

export default injectIntl(PresentationUploader);
