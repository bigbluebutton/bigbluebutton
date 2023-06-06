import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Auth from '/imports/ui/services/auth';
import Button from '/imports/ui/components/common/button/component';
import PropTypes from 'prop-types';
import Styled from './styles';
import Meetings from '/imports/api/meetings';

const BBB_TABLET_APP_CONFIG = Meteor.settings.public.app.bbbTabletApp;

const intlMessages = defineMessages({
  title: {
    id: 'app.mobileAppModal.title',
    description: 'App modal title',
  },
  description: {
    id: 'app.mobileAppModal.description',
    description: 'App modal description',
  },
  openStore: {
    id: 'app.mobileAppModal.openStore',
    defaultMessage: (new Date().getFullYear()),
    description: 'Open Store button label',
  },
  openApp: {
    id: 'app.mobileAppModal.openApp',
    description: 'Open App button label',
  },
  obtainUrlMsg: {
    id: 'app.mobileAppModal.obtainUrlMsg',
    description: 'Obtain URL message',
  },
  obtainUrlErrorMsg: {
    id: 'app.mobileAppModal.obtainUrlErrorMsg',
    description: 'Obtain URL error message',
  },
  dismissLabel: {
    id: 'app.mobileAppModal.dismissLabel',
    description: 'Dismiss button label',
  },
  dismissDesc: {
    id: 'app.mobileAppModal.dismissDesc',
    description: 'adds descriptive context to dissmissLabel',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class MobileAppModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      meetingName: '',
      url: '',
      urlMessage: '',
    };
  }

  componentDidMount() {
    const { intl } = this.props;
    const { sessionToken } = Auth;
    const meetingId = Auth.meetingID;
    const meetingObject = Meetings.findOne({
      meetingId,
    }, { fields: { 'meetingProp.name': 1 } });
    if (meetingObject != null) {
      this.setState({ meetingName: meetingObject.meetingProp.name });
    }

    const url = `/bigbluebutton/api/getJoinUrl?sessionToken=${sessionToken}`;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    this.setState({ urlMessage: intl.formatMessage(intlMessages.obtainUrlMsg) });
    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          return Promise.reject();
        }
        return response.json();
      })
      .then((messages) => {
        this.setState({ url: messages.response.url, urlMessage: '' });
      })
      .catch(() => {
        this.setState({ urlMessage: intl.formatMessage(intlMessages.obtainUrlErrorMsg) });
      });
  }

  render() {
    const { intl, isOpen, onRequestClose, priority, } = this.props;
    const { url, urlMessage, meetingName } = this.state;

    return (
      <ModalSimple
        title={intl.formatMessage(intlMessages.title)}
        dismiss={{
          label: intl.formatMessage(intlMessages.dismissLabel),
          description: intl.formatMessage(intlMessages.dismissDesc),
        }}
        {...{
          isOpen,
          onRequestClose,
          priority,
        }}
      >
        <Styled.Center>
          {`${intl.formatMessage(intlMessages.description)}`}

          <Styled.ButtonContainer>
            <Button
              color="primary"
              disabled={url === ''}
              label={intl.formatMessage(intlMessages.openApp)}
              onClick={() => window.open(`${BBB_TABLET_APP_CONFIG.iosAppUrlScheme}://${meetingName}/${encodeURIComponent(url)}`, '_blank')}
              role="button"
              size="lg"
            />
            { urlMessage !== '' ? <Styled.UrlMessage>{urlMessage}</Styled.UrlMessage> : null }
          </Styled.ButtonContainer>

          {
            BBB_TABLET_APP_CONFIG.iosAppStoreUrl === '' ? null
              : (
                <Styled.ButtonContainer>
                  <Button
                    color="default"
                    label={intl.formatMessage(intlMessages.openStore)}
                    onClick={() => window.open(`${BBB_TABLET_APP_CONFIG.iosAppStoreUrl}`, '_blank')}
                    role="button"
                    size="lg"
                  />
                </Styled.ButtonContainer>
              )
          }
        </Styled.Center>
      </ModalSimple>
    );
  }
}

export default injectIntl(MobileAppModal);

MobileAppModal.propTypes = propTypes;
