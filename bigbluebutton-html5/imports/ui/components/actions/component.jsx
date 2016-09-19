import React, { Component, PropTyes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

const intlMessages = defineMessages({
  label: {
    id: 'app.presenterActions.label',
    defaultMessage: 'Actions',
  },
});

import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';

const presentation = () => {console.log('Should show the uploader component');};

const polling = () => {console.log('Should initiate a polling');};

const shareScreen = () => {console.log('Should start screen sharing');};

class Actions extends Component {
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
            label={intl.formatMessage(intlMessages.label)}
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
              label="Upload a presentation"
              defaultMessage="Upload a presentation"
              onClick={presentation.bind(this)}
            />

            {/* These icons are unaligned because of the font issue
                Check it later */}
            <DropdownListItem
              icon="polling"
              label="Initiate a poll"
              description="Initiate a poll"
              onClick={polling.bind(this)}
            />
            <DropdownListItem
              icon="desktop"
              label="Share your screen"
              description="Share a screen"
              onClick={shareScreen.bind(this)}
            />
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

export default injectIntl(Actions);
