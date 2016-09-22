import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';

const intlMessages = defineMessages({
  actionsLabel: {
    id: 'app.actions.actionsLabel',
    defaultMessage: 'Actions button',
  },
  presentationLabel: {
    id: 'app.actions.options.presentationLabel',
    defaultMessage: 'Upload a presentation',
  },
  initPollLabel: {
    id: 'app.actions.options.initPollLabel',
    defaultMessage: 'Initiate a poll',
  },
  desktopShareLabel: {
    id: 'app.actions.options.desktopShareLabel',
    defaultMessage: 'Share your screen',
  },
  presentationDesc: {
    id: 'app.actions.options.presentationDesc',
    defaultMessage: 'Upload your presentation',
  },
  initPollDesc: {
    id: 'app.actions.options.initPollDesc',
    defaultMessage: 'Initiate a poll',
  },
  desktopShareDesc: {
    id: 'app.actions.options.desktopShareDesc',
    defaultMessage: 'Share your screen with others',
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
            label={intl.formatMessage(intlMessages.actionsLabel)}
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
              description={intl.formatMessage(intlMessages.presentationDesc)}
              onClick={presentation.bind(this)}
            />

            {/* These icons are unaligned because of the font issue
                Check it later */}
            <DropdownListItem
              icon="polling"
              label={intl.formatMessage(intlMessages.initPollLabel)}
              description={intl.formatMessage(intlMessages.initPollDesc)}
              onClick={polling.bind(this)}
            />
            <DropdownListItem
              icon="desktop"
              label={intl.formatMessage(intlMessages.desktopShareLabel)}
              description={intl.formatMessage(intlMessages.desktopShareDesc)}
              onClick={shareScreen.bind(this)}
            />
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

export default injectIntl(Actions);
