import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { uniqueId } from '/imports/utils/string-utils';
import Trigger from '/imports/ui/components/common/control-header/right/component';
import PresentationDownloadDropdownWrapper from './presentation-download-dropdown-wrapper/component';

const intlMessages = defineMessages({
  enableOriginalPresentationDownload: {
    id: 'app.presentationUploader.enableOriginalPresentationDownload',
    description: 'Send original presentation to chat',
  },
  disableOriginalPresentationDownload: {
    id: 'app.presentationUploader.disableOriginalPresentationDownload',
    description: 'Send original presentation to chat',
  },
  sendCurrentStateDocument: {
    id: 'app.presentationUploader.exportCurrentStatePresentation',
    description: 'Send presentation to chat in the current state label',
  },
  copySuccess: {
    id: 'app.chat.copySuccess',
    description: 'aria success alert',
  },
  copyErr: {
    id: 'app.chat.copyErr',
    description: 'aria error alert',
  },
  options: {
    id: 'app.presentationUploader.dropdownExportOptions',
    description: 'Chat Options',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleDownloadingOfPresentation: PropTypes.func.isRequired,
  handleDownloadableChange: PropTypes.func.isRequired,
  isDownloadable: PropTypes.bool.isRequired,
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
    filenameConverted: PropTypes.string.isRequired,
    isCurrent: PropTypes.bool.isRequired,
    temporaryPresentationId: PropTypes.string.isRequired,
    isDownloadable: PropTypes.bool.isRequired,
    isRemovable: PropTypes.bool.isRequired,
    conversion: PropTypes.shape,
    upload: PropTypes.shape,
    exportation: PropTypes.shape,
    uploadTimestamp: PropTypes.number.isRequired,
    downloadableExtension: PropTypes.string.isRequired,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  isRTL: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
};

class PresentationDownloadDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.actionsKey = [
      uniqueId('action-item-'),
      uniqueId('action-item-'),
      uniqueId('action-item-'),
    ];
  }

  getAvailableActions() {
    const {
      intl,
      handleDownloadingOfPresentation,
      handleDownloadableChange,
      isDownloadable,
      allowDownloadOriginal,
      allowDownloadWithAnnotations,
      item,
      closeModal,
    } = this.props;

    this.menuItems = [];

    const { filenameConverted, filename, downloadableExtension } = item;
    const convertedFileExtension = filenameConverted?.split('.').slice(-1)[0];
    const originalFileExtension = filename?.split('.').slice(-1)[0];
    const changeDownloadOriginalOrConvertedPresentation = (enableDownload, isConverted) => {
      let typeOfExport;
      if (isConverted) {
        typeOfExport = 'Converted';
      } else {
        typeOfExport = 'Original';
      }
      handleDownloadableChange(item, typeOfExport, enableDownload);
      if (enableDownload) {
        handleDownloadingOfPresentation(typeOfExport);
      }
      closeModal();
    };

    if (allowDownloadOriginal) {
      if (isDownloadable && !!downloadableExtension
        && downloadableExtension === originalFileExtension) {
        this.menuItems.push({
          key: this.actionsKey[0],
          dataTest: 'disableOriginalPresentationDownload',
          label: intl.formatMessage(intlMessages.disableOriginalPresentationDownload,
            { 0: originalFileExtension }),
          onClick: () => changeDownloadOriginalOrConvertedPresentation(false, false),
        });
      } else {
        this.menuItems.push({
          key: this.actionsKey[0],
          dataTest: 'enableOriginalPresentationDownload',
          label: intl.formatMessage(intlMessages.enableOriginalPresentationDownload,
            { 0: originalFileExtension }),
          onClick: () => changeDownloadOriginalOrConvertedPresentation(true, false),
        });
      }
      if ((!!filenameConverted && filenameConverted !== '')
        && convertedFileExtension !== originalFileExtension) {
        if (isDownloadable && !!downloadableExtension
          && downloadableExtension === convertedFileExtension) {
          this.menuItems.push({
            key: this.actionsKey[0],
            dataTest: 'disableOriginalPresentationDownload',
            label: intl.formatMessage(intlMessages.disableOriginalPresentationDownload,
              { 0: convertedFileExtension }),
            onClick: () => changeDownloadOriginalOrConvertedPresentation(false, true),
          });
        } else {
          this.menuItems.push({
            key: this.actionsKey[0],
            dataTest: 'enableOriginalPresentationDownload',
            label: intl.formatMessage(intlMessages.enableOriginalPresentationDownload,
              { 0: convertedFileExtension }),
            onClick: () => changeDownloadOriginalOrConvertedPresentation(true, true),
          });
        }
      }
    }
    if (allowDownloadWithAnnotations) {
      this.menuItems.push({
        key: this.actionsKey[1],
        id: 'sendCurrentStateDocument',
        dataTest: 'sendCurrentStateDocument',
        label: intl.formatMessage(intlMessages.sendCurrentStateDocument),
        onClick: () => {
          closeModal();
          handleDownloadingOfPresentation('Annotated');
        },
      });
    }
    return this.menuItems;
  }

  render() {
    const { intl, isRTL, disabled } = this.props;

    const customStyles = { zIndex: 9999 };

    return (
      <PresentationDownloadDropdownWrapper disabled={disabled}>
        <BBBMenu
          customStyles={customStyles}
          trigger={(
            <Trigger
              data-test="presentationOptionsDownload"
              icon="more"
              label={intl.formatMessage(intlMessages.options)}
              aria-label={intl.formatMessage(intlMessages.options)}
              onClick={() => null}
            />
          )}
          opts={{
            id: 'presentation-download-dropdown',
            keepMounted: true,
            transitionDuration: 0,
            elevation: 2,
            getcontentanchorel: null,
            fullwidth: 'true',
            anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
            transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
          }}
          actions={this.getAvailableActions()}
        />
      </PresentationDownloadDropdownWrapper>
    );
  }
}

PresentationDownloadDropdown.propTypes = propTypes;

export default injectIntl(PresentationDownloadDropdown);
