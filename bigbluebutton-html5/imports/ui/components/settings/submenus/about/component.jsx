import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.about.title',
    description: 'About title label',
  },
  version: {
    id: 'app.about.version',
    description: 'Client version label',
  },
  copyright: {
    id: 'app.about.copyright',
    description: 'Client copyright label',
  },
  dismissLabel: {
    id: 'app.about.dismissLabel',
    description: 'Dismiss button label',
  },
  dismissDesc: {
    id: 'app.about.dismissDesc',
    description: 'Adds descriptive context to dismissLabel',
  },
  version_label: {
    id: 'app.about.version_label',
    description: 'Label for version',
  },
});

class About extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: window.meetingClientSettings.public.app,
    };
  }

  render() {
    const { intl, isOpen, onRequestClose, priority } = this.props;
    const { settings } = this.state;

    const {
      html5ClientBuild,
      copyright,
      bbbServerVersion,
      displayBbbServerVersion,
    } = settings;

    return (
      <div>
        <div>
          <Styled.Title>{intl.formatMessage(intlMessages.title)}</Styled.Title>
        </div>
        <Styled.Form>
          <Styled.Content>
            <Styled.Text>
              {`${intl.formatMessage(intlMessages.copyright)} ${copyright}`}
            </Styled.Text>
            <Styled.Text>
              {`${intl.formatMessage(intlMessages.version)} ${html5ClientBuild}`}
            </Styled.Text>
            {displayBbbServerVersion && (
              <Styled.Text>
                {`${intl.formatMessage(intlMessages.version_label)} ${bbbServerVersion}`}
              </Styled.Text>
            )}
          </Styled.Content>
        </Styled.Form>
      </div>
    );
  }
}

export default injectIntl(About);
