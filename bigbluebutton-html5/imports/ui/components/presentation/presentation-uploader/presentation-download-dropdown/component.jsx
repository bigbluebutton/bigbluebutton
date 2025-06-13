import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { uniqueId } from '/imports/utils/string-utils';
import Trigger from '/imports/ui/components/common/control-header/right/component';
import PresentationDownloadDropdownWrapper from './presentation-download-dropdown-wrapper/component';
import BBBMenu from '/imports/ui/components/common/menu/component';

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
  optionsUncomplete: {
    id: 'app.presentationUploader.dropdownExportOptionsUncomplete',
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
  allowDownloadOriginal: PropTypes.bool.isRequired,
  allowDownloadConverted: PropTypes.bool.isRequired,
  allowDownloadWithAnnotations: PropTypes.bool.isRequired,
  item: PropTypes.shape({
    id: PropTypes.string,
    filename: PropTypes.string,
    filenameConverted: PropTypes.string,
    isCurrent: PropTypes.bool,
    temporaryPresentationId: PropTypes.string,
    isDownloadable: PropTypes.bool,
    isRemovable: PropTypes.bool,
    conversion: PropTypes.shape({
      done: PropTypes.bool,
      error: PropTypes.bool,
      status: PropTypes.string,
      numPages: PropTypes.number,
      pagesCompleted: PropTypes.number,
    }),
    upload: PropTypes.shape({
      done: PropTypes.bool,
      error: PropTypes.bool,
    }),
    exportation: PropTypes.shape({
      status: PropTypes.string,
    }),
    uploadTimestamp: PropTypes.string,
    downloadableExtension: PropTypes.string,
  }),
  closeModal: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

const defaultProps = {
  item: {},
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
      allowDownloadConverted,
      allowDownloadWithAnnotations,
      item,
      closeModal,
    } = this.props;

    this.menuItems = [];

    const { filenameConverted, name, downloadFileUri } = item;
    const convertedFileExtension = filenameConverted?.split('.').slice(-1)[0];
    const downloadableExtension = downloadFileUri?.split('.').slice(-1)[0];
    const originalFileExtension = name?.split('.').slice(-1)[0];
    const changeDownloadOriginalOrConvertedPresentation = (enableDownload, fileStateType) => {
      handleDownloadableChange(item?.presentationId, fileStateType, enableDownload);
      if (enableDownload) {
        handleDownloadingOfPresentation(fileStateType);
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
            { fileExtension: originalFileExtension }),
          onClick: () => changeDownloadOriginalOrConvertedPresentation(false, 'Original'),
        });
      } else {
        this.menuItems.push({
          key: this.actionsKey[0],
          dataTest: 'enableOriginalPresentationDownload',
          label: intl.formatMessage(intlMessages.enableOriginalPresentationDownload,
            { fileExtension: originalFileExtension }),
          onClick: () => changeDownloadOriginalOrConvertedPresentation(true, 'Original'),
        });
      }
    }
    if (allowDownloadConverted) {
      if ((!!filenameConverted && filenameConverted !== '')
        && convertedFileExtension !== originalFileExtension) {
        if (isDownloadable && !!downloadableExtension
          && downloadableExtension === convertedFileExtension) {
          this.menuItems.push({
            key: this.actionsKey[0],
            dataTest: 'disableOriginalPresentationDownload',
            label: intl.formatMessage(intlMessages.disableOriginalPresentationDownload,
              { fileExtension: convertedFileExtension }),
            onClick: () => changeDownloadOriginalOrConvertedPresentation(false, 'Converted'),
          });
        } else {
          this.menuItems.push({
            key: this.actionsKey[0],
            dataTest: 'enableOriginalPresentationDownload',
            label: intl.formatMessage(intlMessages.enableOriginalPresentationDownload,
              { fileExtension: convertedFileExtension }),
            onClick: () => changeDownloadOriginalOrConvertedPresentation(true, 'Converted'),
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
    const { intl, disabled } = this.props;

    const customStyles = { zIndex: 9999 };
    let tooltipLabelForDropdown = intl.formatMessage(intlMessages.options);
    if (disabled) {
      tooltipLabelForDropdown = intl.formatMessage(intlMessages.optionsUncomplete);
    }

    return (
      <PresentationDownloadDropdownWrapper>
        <BBBMenu
          disabled={disabled}
          customStyles={customStyles}
          trigger={(
            <Trigger
              disabled={disabled}
              data-test="presentationOptionsDownload"
              icon="more"
              label={tooltipLabelForDropdown}
              aria-label={tooltipLabelForDropdown}
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
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
          }}
          actions={this.getAvailableActions()}
        />
      </PresentationDownloadDropdownWrapper>
    );
  }
}

PresentationDownloadDropdown.propTypes = propTypes;
PresentationDownloadDropdown.defaultProps = defaultProps;

export default injectIntl(PresentationDownloadDropdown);
