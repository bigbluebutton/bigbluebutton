import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { uniqueId } from '/imports/utils/string-utils';
import Trigger from '/imports/ui/components/common/control-header/right/component';
import Styled from './styles'


const intlMessages = defineMessages({
  sendOriginalDocument: {
    id: 'app.presentationUploader.exportOriginalPresentation',
    description: 'Send original presentation to chat',
  },
  sendAnnotatedDocument: {
    id: 'app.presentationUploader.exportAnnotatedPresentation',
    description: 'Send presentation to chat with annotations label',
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
      handleSendToChat
    } = this.props;

    this.menuItems = [];

    this.menuItems.push(
      {
        key: this.actionsKey[0],
        dataTest: 'sendOriginalDocument',
        label: intl.formatMessage(intlMessages.sendOriginalDocument),
        onClick: () => handleSendToChat("Original"),
      },
    );

    this.menuItems.push(
      {
        key: this.actionsKey[1],
        id: 'sendAnnotatedDocument',
        dataTest: 'sendAnnotatedDocument',
        label: intl.formatMessage(intlMessages.sendAnnotatedDocument),
        onClick: () => handleSendToChat("Annotated"),
      },
    );

    return this.menuItems;
  }

  render() {
    const {
      intl,
      isRTL,
    } = this.props;

    return (
      <Styled.DropdownMenuWrapper>
        <BBBMenu
          trigger={
            <Trigger
              data-test="presentationOptionsDownload"
              icon="more"
              label={intl.formatMessage(intlMessages.options)}
              aria-label={intl.formatMessage(intlMessages.options)}
              onClick={() => null}
            />                    
          }
          opts={{
            id: 'presentation-download-dropdown',
            keepMounted: true,
            transitionDuration: 0,
            elevation: 2,
            getContentAnchorEl: null,
            fullwidth: 'true',
            anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
            transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
          }}
          actions={this.getAvailableActions()}
        />
      </Styled.DropdownMenuWrapper>
    );
  }
}

export default injectIntl(PresentationDownloadDropdown);
