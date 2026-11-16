import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import SubMenusStyle from '../styles';
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
  helpTitle: {
    id: 'app.settings.help.title',
    description: 'Help options title',
  },
  helpLabel: {
    id: 'app.settings.help.label',
    description: 'Help options label',
  },
  beforeLink: {
    id: 'app.settings.help.beforeLink',
    description: 'Text before the help link',
  },
  link: {
    id: 'app.settings.help.link',
    description: 'Clickable help link text',
  },
  hotkeys: {
    id: 'app.settings.hotkeysLabel',
    description: 'Keyboard shorcut label',
  },
  hotkeysTable: {
    id: 'app.settings.hotkeysTable',
    description: 'Keyboard shorcut table text',
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
    const { intl } = this.props;
    const { settings } = this.state;

    const {
      html5ClientBuild,
      copyright,
      bbbServerVersion,
      displayBbbServerVersion,
      helpLink,
    } = settings;

    return (
      <SubMenusStyle.Section tabIndex="-1">
        <SubMenusStyle.Section>
          <SubMenusStyle.Title>{intl.formatMessage(intlMessages.title)}</SubMenusStyle.Title>
          <SubMenusStyle.Group>
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
          </SubMenusStyle.Group>
        </SubMenusStyle.Section>

        <SubMenusStyle.Section>
          <SubMenusStyle.Title>{intl.formatMessage(intlMessages.helpTitle)}</SubMenusStyle.Title>
          <SubMenusStyle.Group>
            <Styled.Text>
              {intl.formatMessage(intlMessages.beforeLink)}
              {' '}
              <Styled.Link
                href={helpLink}
                target="_blank"
                rel="noopener noreferrer"
                data-test="helpLinkButton"
              >
                {intl.formatMessage(intlMessages.link)}
              </Styled.Link>
            </Styled.Text>
          </SubMenusStyle.Group>
        </SubMenusStyle.Section>
      </SubMenusStyle.Section>
    );
  }
}

export default injectIntl(About);
