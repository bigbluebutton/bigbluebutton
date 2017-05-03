import React, { Component } from 'react';
import { defineMessages, injectIntl, FormattedDate } from 'react-intl';
import update from 'immutability-helper';
import ModalFullscreen from '/imports/ui/components/modal/fullscreen/component';
import Icon from '/imports/ui/components/icon/component';
import ButtonBase from '/imports/ui/components/button/base/component';
import Checkbox from '/imports/ui/components/checkbox/component';
import Dropzone from 'react-dropzone';
import styles from './styles.scss';
import cx from 'classnames';

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
});

class PresentationUploder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      presentations: props.presentations,
      isProcessing: false,
    };

    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleFiledrop = this.handleFiledrop.bind(this);
    this.handleCurrentChange = this.handleCurrentChange.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleConfirm() {
    const { presentations }  = this.state;

    this.setState({ isProcessing: true });

    return this.props.handleSave(presentations)
      .then(() => {
        this.setState({ isProcessing: false });
      });
  }

  handleDismiss() {
    // we dont actually need to do anything, yay :D
  }

  handleFiledrop(files) {
    let presentationsToUpload = files.map(file => ({
      id: file.name,
      file: file,
      filename: file.name,
      uploadedAt: new Date(),
      isCurrent: true,
      isUploaded: false,
      isProcessed: false,
    }));

    this.setState(({ presentations }) => ({
      presentations: presentations
        .map(p => {
          p.isCurrent = false;
          return p;
        })
        .concat(presentationsToUpload),
    }));
  }

  handleCurrentChange(item) {
    const { presentations }  = this.state;
    const currentIndex = presentations.findIndex(p => p.isCurrent);
    const newCurrentIndex = presentations.indexOf(item);

    let commands = {};
    commands[currentIndex] = {
      $apply: p => {
        p.isCurrent = false;
        return p;
      },
    };
    commands[newCurrentIndex] = {
      $apply: p => {
        p.isCurrent = true;
        return p;
      },
    };

    let presentationsUpdated = update(presentations, commands);

    this.setState({
      presentations: presentationsUpdated,
    });
  }

  handleRemove(item) {
    const { presentations }  = this.state;
    const toRemoveIndex = presentations.indexOf(item);

    this.setState({
      presentations: update(presentations, {
        $splice: [[toRemoveIndex, 1]],
      }),
    });
  }

  render() {
    const { intl } = this.props;
    const { isProcessing }  = this.state;

    return (
      <ModalFullscreen
        title={intl.formatMessage(intlMessages.title)}
        confirm={{
          callback: this.handleConfirm,
          label: intl.formatMessage(intlMessages.confirmLabel),
          description: intl.formatMessage(intlMessages.confirmDesc),
          disabled: isProcessing,
        }}
        dismiss={{
          callback: this.handleDismiss,
          label: intl.formatMessage(intlMessages.dismissLabel),
          description: intl.formatMessage(intlMessages.dismissDesc),
          disabled: isProcessing,
        }}>
        <p>{intl.formatMessage(intlMessages.message)}</p>
        {this.renderPresentationList()}
        {this.renderDropzone()}
      </ModalFullscreen>
    );
  }

  renderPresentationList() {
    const { presentations }  = this.state;

    let presentationsSorted = presentations
      .sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime());

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

  renderPresentationItem(item) {
    const { isProcessing, presentations }  = this.state;

    let itemClassName = {};

    itemClassName[styles.tableItemNew] = !item.isUploaded && !item.isProcessed;
    itemClassName[styles.tableItemUploading] = item.isUploading;
    itemClassName[styles.tableItemProcessing] = item.isProcessing;

    const hideActions = isProcessing || presentations.some(_ => !_.isUploaded);

    return (
      <tr
        key={item.id}
        className={cx(itemClassName)}
      >
        <td className={styles.tableItemIcon}>
          <Icon iconName={'file'}/>
        </td>
        <th className={styles.tableItemName}>
          <span>{item.filename}</span>
        </th>
        <td className={styles.tableItemTime}>
          {
            !item.isUploaded ? 'To be uploaded...'
            : (
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
            )
          }
        </td>
        {hideActions ? null : (
          <td className={styles.tableItemActions}>
            <Checkbox
              ariaLabel={'Set as current presentation'}
              className={styles.itemAction}
              checked={item.isCurrent}
              onChange={() => this.handleCurrentChange(item)}
            />
            <ButtonBase
              className={styles.itemAction}
              label={'Remove presentation'}
              disabled={isProcessing || item.isCurrent || item.filename === 'default.pdf'}
              onClick={() => this.handleRemove(item)}>
              <Icon iconName={'close'}/>
            </ButtonBase>
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

    // TODO: Change the multiple prop when the endpoint supports multiple files

    return (
      <Dropzone
        multiple={false}
        className={styles.dropzone}
        activeClassName={styles.dropzoneActive}
        rejectClassName={styles.dropzoneReject}
        accept={fileValidMimeTypes.join()}
        minSize={fileSizeMin}
        maxSize={fileSizeMax}
        disablePreview={true}
        onDrop={this.handleFiledrop}
        onDragStart={this.handleDragStart}
      >
        <Icon className={styles.dropzoneIcon} iconName={'undecided'}/>
        <p className={styles.dropzoneMessage}>
          {intl.formatMessage(intlMessages.dropzoneLabel)}&nbsp;
          <span className={styles.dropzoneLink}>
            {intl.formatMessage(intlMessages.browseFilesLabel)}
          </span>
        </p>
      </Dropzone>
    );
  }
};

export default injectIntl(PresentationUploder);
