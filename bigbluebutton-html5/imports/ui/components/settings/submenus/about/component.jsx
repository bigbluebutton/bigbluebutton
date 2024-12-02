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
    const { intl, isOpen, onRequestClose, priority, setIsOpen, setIsShortcutModalOpen } = this.props;
    const { settings } = this.state;

    const {
      html5ClientBuild,
      copyright,
      bbbServerVersion,
      displayBbbServerVersion,
      helpLink,
    } = settings;

    return (
      <div>
        <Styled.Form>
          <Styled.Content>
            <Styled.Title>{intl.formatMessage(intlMessages.title)}</Styled.Title>
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

          <Styled.Content>
            <Styled.Title as="h3">{intl.formatMessage(intlMessages.hotkeys)}</Styled.Title>
            <Styled.Text>
              <Styled.TableButton
                as="button"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsShortcutModalOpen(true);
                }}
              >
                [{intl.formatMessage(intlMessages.hotkeysTable)}]
              </Styled.TableButton>
            </Styled.Text>
          </Styled.Content>

          <Styled.Content>
            <Styled.Title as="h3">{intl.formatMessage(intlMessages.helpTitle)}</Styled.Title>
            <Styled.Text>
              {intl.formatMessage(intlMessages.beforeLink)}{' '}
              <Styled.Link
                href={helpLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.formatMessage(intlMessages.link)}
              </Styled.Link>
            </Styled.Text>
          </Styled.Content>

        </Styled.Form>
      </div>
    );
  }
}

export default injectIntl(About);
