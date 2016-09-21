import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';

const intlMessages = defineMessages({
  buttonLabel: {
    id: 'app.actions.options',
    defaultMessage: 'Actions button',
  },
  presentationLabel: {
    id: 'app.actions.options.presentation',
    defaultMessage: 'Upload a presentation',
  },
  initPollLabel: {
    id: 'app.actions.options.initPoll',
    defaultMessage: 'Initiate a poll',
  },
  desktopShareLabel: {
    id: 'app.actions.options.desktopShare',
    defaultMessage: 'Share your screen',
  },
});

const presentation = () => {console.log('Should show the uploader component');};

const polling = () => {console.log('Should initiate a polling');};

const shareScreen = () => {console.log('Should start screen sharing');};

export default class Actions extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { intl } = this.props;
    return (
      <Dropdown ref="dropdown">
        <DropdownTrigger>
          <Button
            role="button"
            label={intl.formatMessage(intlMessages.buttonLabel)}
            icon="circle-add"
            color="primary"
            size="lg"
            circle={true}
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="top left">
          <DropdownList>
            <DropdownListItem
              icon="presentation"
              label={intl.formatMessage(intlMessages.presentationLabel)}
              description="Upload a presentation"
              onClick={presentation.bind(this)}
            />

            {/* These icons are unaligned because of the font issue
                Check it later */}
            <DropdownListItem
              icon="polling"
              label={intl.formatMessage(intlMessages.initPollLabel)}
              description="Initiate a poll"
              onClick={polling.bind(this)}
            />
            <DropdownListItem
              icon="desktop"
              label={intl.formatMessage(intlMessages.desktopShareLabel)}
              description="Share your screen"
              onClick={shareScreen.bind(this)}
            />
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

export default injectIntl(Actions);
