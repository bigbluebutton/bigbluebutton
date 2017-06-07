import React, { Component } from 'react';
import { defineMessages, injectIntl, FormattedDate } from 'react-intl';
import Dropzone from 'react-dropzone';
import update from 'immutability-helper';
import cx from 'classnames';

import ModalFullscreen from '/imports/ui/components/modal/fullscreen/component';
import Icon from '/imports/ui/components/icon/component';
import ButtonBase from '/imports/ui/components/button/base/component';
import Checkbox from '/imports/ui/components/checkbox/component';
import styles from './styles.scss';

const DEFAULT_FILENAME = 'default.pdf';

const intlMessages = defineMessages({
  title: {
    id: 'app.presentationUploder.title',
    defaultMessage: 'Presentation',
  },
  message: {
    id: 'app.presentationUploder.message',
    defaultMessage: `As a presenter in BigBlueButton, you have the ability of
     uploading any office document or PDF file. We recommend for the best results,
     to please upload a PDF file.`,
  },
  confirmLabel: {
    id: 'app.presentationUploder.confirmLabel',
    defaultMessage: 'Start',
  },
  confirmDesc: {
    id: 'app.presentationUploder.confirmDesc',
    defaultMessage: 'Save your changes and start the presentation',
  },
  dismissLabel: {
    id: 'app.presentationUploder.dismissLabel',
    defaultMessage: 'Cancel',
  },
  dismissDesc: {
    id: 'app.presentationUploder.dismissDesc',
    defaultMessage: 'Closes and discarts your changes',
  },
  dropzoneLabel: {
    id: 'app.presentationUploder.dropzoneLabel',
    defaultMessage: 'Drag files here to upload',
  },
  browseFilesLabel: {
    id: 'app.presentationUploder.browseFilesLabel',
    defaultMessage: 'or browse for files',
  },
  fileToUpload: {
    id: 'app.presentationUploder.fileToUpload',
    defaultMessage: 'To be uploaded...',
  },
  genericError: {
    id: 'app.presentationUploder.conversion.genericError',
    defaultMessage: 'Ops, something went wrong.',
  },
  conversionProcessingSlides: {
    id: 'app.presentationUploder.conversion.conversionProcessingSlides',
    defaultMessage: 'Processing page {current} of {total}',
  },
  genericConversionStatus: {
    id: 'app.presentationUploder.conversion.genericConversionStatus',
    defaultMessage: 'Converting file...',
  },
  GENERATING_THUMBNAIL: {
    id: 'app.presentationUploder.conversion.generatingThumbnail',
    defaultMessage: 'Generating thumbnails...',
  },
  GENERATED_SLIDE: {
    id: 'app.presentationUploder.conversion.generatedSlides',
    defaultMessage: 'Slides generated...',
  },
});

const isProcessingOrUploading = _ => !_.isProcessed || !_.isUploaded;

class PresentationUploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      presentations: props.presentations,
      preventClosing: false,
      disableActions: false,
    };

    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleFiledrop = this.handleFiledrop.bind(this);
    this.handleCurrentChange = this.handleCurrentChange.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const presentationStateUpdated =
      this.state.presentations.map(p =>
        nextProps.presentations.find(_ => _.filename === p.filename));

    const stillBusy = presentationStateUpdated.some(isProcessingOrUploading);

    this.setState({
      presentations: presentationStateUpdated,
      preventClosing: stillBusy,
      disableActions: stillBusy,
    });
  }

  handleConfirm() {
    const { presentations } = this.state;

    this.setState({
      disableActions: true,
      preventClosing: true,
    });

    return this.props.handleSave(presentations);
  }

  handleDismiss() {
    return new Promise((resolve) => {
      this.setState({
        preventClosing: false,
        disableActions: false,
      }, resolve);
    });
  }

  handleFiledrop(files) {
    const presentationsToUpload = files.map(file => ({
      id: file.name,
      file,
      filename: file.name,
      uploadedAt: new Date(),
      isCurrent: true,
      isUploaded: false,
      isProcessed: false,
      conversion: { done: false, error: false },
    }));

    this.setState(({ presentations }) => ({
      presentations: presentations
        .map((_) => {
          const p = _;
          p.isCurrent = false;
          return p;
        })
        .concat(presentationsToUpload),
    }));
  }

  handleCurrentChange(item) {
    const { presentations } = this.state;
    const currentIndex = presentations.findIndex(p => p.isCurrent);
    const newCurrentIndex = presentations.indexOf(item);

    const commands = {};
    commands[currentIndex] = {
      $apply: (_) => {
        const p = _;
        p.isCurrent = false;
        return p;
      },
    };
    commands[newCurrentIndex] = {
      $apply: (_) => {
        const p = _;
        p.isCurrent = true;
        return p;
      },
    };

    const presentationsUpdated = update(presentations, commands);

    this.setState({
      presentations: presentationsUpdated,
    });
  }

  handleRemove(item) {
    const { presentations } = this.state;
    const toRemoveIndex = presentations.indexOf(item);
    const toRemove = presentations[toRemoveIndex];

    if (toRemove.isCurrent) {
      const defaultPresentation = presentations.find(_ => _.filename === DEFAULT_FILENAME);
      this.handleCurrentChange(defaultPresentation);
    }

    this.setState({
      presentations: update(presentations, {
        $splice: [[toRemoveIndex, 1]],
      }),
    });
  }

  renderPresentationList() {
    const { presentations } = this.state;

    const presentationsSorted = presentations
      .sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime())
      .sort((a, b) => b.filename === DEFAULT_FILENAME);

    return (
      <div className={styles.fileList}>
        <table className={styles.table}>
          <tbody>
            { presentationsSorted.map(item => this.renderPresentationItem(item))}
          </tbody>
        </table>
      </div>
    );
  }

  renderPresentationItemStatus(item) {
    const { intl } = this.props;

    if (!item.isUploaded) { return intl.formatMessage(intlMessages.fileToUpload); }

    if (!item.isProcessed && item.conversion.error) {
      const errorMessage = intlMessages[status] || intlMessages.genericError;
      return intl.formatMessage(errorMessage);
    }

    if (!item.isProcessed && !item.conversion.error) {
      if (item.conversion.pages_completed < item.conversion.num_pages) {
        return intl.formatMessage(intlMessages.conversionProcessingSlides, {
          current: item.conversion.pages_completed,
          total: item.conversion.num_pages,
        });
      }

      const conversionStatusMessage =
        intlMessages[item.conversion.status] || intlMessages.genericConversionStatus;
      return intl.formatMessage(conversionStatusMessage);
    }

    return (
      <time dateTime={item.uploadedAt}>
        <FormattedDate
          value={item.uploadedAt}
          day="2-digit"
          month="2-digit"
          year="numeric"
          hour="2-digit"
          minute="2-digit"
        />
      </time>
    );
  }

  renderPresentationItem(item) {
    const { disableActions, presentations } = this.state;

    const itemClassName = {};

    itemClassName[styles.tableItemNew] = item.id === item.filename;
    itemClassName[styles.tableItemUploading] = false;
    itemClassName[styles.tableItemProcessing] = !item.isProcessed && item.isUploaded;
    itemClassName[styles.tableItemError] = item.conversion.error || false;

    const hideRemove = (item.isCurrent && item.isUploaded) || item.filename === DEFAULT_FILENAME;
    const hasSomeFileNotUploaded = presentations.some(_ => !_.isUploaded);
    const disableCheck = hasSomeFileNotUploaded;

    return (
      <tr
        key={item.id}
        className={cx(itemClassName)}
      >
        <td className={styles.tableItemIcon}>
          <Icon iconName={'file'} />
        </td>
        <th className={styles.tableItemName}>
          <span>{item.filename}</span>
        </th>
        <td className={styles.tableItemStatus}>
          {this.renderPresentationItemStatus(item)}
        </td>
        <td className={styles.tableItemActions}>
          {disableActions ? null : (<span>
            <Checkbox
              disabled={disableCheck}
              ariaLabel={'Set as current presentation'}
              className={styles.itemAction}
              checked={item.isCurrent}
              onChange={() => this.handleCurrentChange(item)}
            />
            { hideRemove ? null : (
              <ButtonBase
                className={cx(styles.itemAction, styles.itemActionRemove)}
                label={'Remove presentation'}
                onClick={() => this.handleRemove(item)}
              >
                <Icon iconName={'delete'} />
              </ButtonBase>
            )}
          </span>)}
        </td>
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

    // TODO: Change the multiple prop when the endpoint supports multiple files
    const hasSomeFileNotUploaded = this.state.presentations.some(_ => !_.isUploaded);

    if (hasSomeFileNotUploaded || disableActions) return null;

    return (
      <Dropzone
        multiple={false}
        className={styles.dropzone}
        activeClassName={styles.dropzoneActive}
        rejectClassName={styles.dropzoneReject}
        accept={fileValidMimeTypes.join()}
        minSize={fileSizeMin}
        maxSize={fileSizeMax}
        disablePreview
        onDrop={this.handleFiledrop}
      >
        <Icon className={styles.dropzoneIcon} iconName={'upload'} />
        <p className={styles.dropzoneMessage}>
          {intl.formatMessage(intlMessages.dropzoneLabel)}&nbsp;
          <span className={styles.dropzoneLink}>
            {intl.formatMessage(intlMessages.browseFilesLabel)}
          </span>
        </p>
      </Dropzone>
    );
  }

  render() {
    const { intl } = this.props;
    const { preventClosing, disableActions } = this.state;

    return (
      <ModalFullscreen
        title={intl.formatMessage(intlMessages.title)}
        preventClosing={preventClosing}
        confirm={{
          callback: this.handleConfirm,
          label: intl.formatMessage(intlMessages.confirmLabel),
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
        <p>{intl.formatMessage(intlMessages.message)}</p>
        {this.renderPresentationList()}
        {this.renderDropzone()}
      </ModalFullscreen>
    );
  }
}

export default injectIntl(PresentationUploader);
