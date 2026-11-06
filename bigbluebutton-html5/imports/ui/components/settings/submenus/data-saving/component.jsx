import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { BBBToggle } from '@bigbluebutton/bbb-ui-components-react/Toggle';
import { BBBTypography } from '@bigbluebutton/bbb-ui-components-react/Typography';
import BaseMenu from '../base/component';
import Styled from '../styles';

const intlMessages = defineMessages({
  dataSavingLabel: {
    id: 'app.settings.dataSavingTab.label',
    description: 'label for data savings tab',
  },
  webcamLabel: {
    id: 'app.settings.dataSavingTab.webcam',
    description: 'webcam toggle',
  },
  screenShareLabel: {
    id: 'app.settings.dataSavingTab.screenShare',
    description: 'screenshare toggle',
  },
  dataSavingDesc: {
    id: 'app.settings.dataSavingTab.description',
    description: 'description of data savings tab',
  },
});

class DataSaving extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'dataSaving',
      settings: props.settings,
    };
  }

  render() {
    const {
      intl,
      isScreenSharingEnabled,
      isVideoEnabled,
    } = this.props;

    const { viewParticipantsWebcams, viewScreenshare } = this.state.settings;

    return (
      <Styled.Section>
        <Styled.Group>
          <BBBTypography variant="selected" as="h3">{intl.formatMessage(intlMessages.dataSavingLabel)}</BBBTypography>
          <BBBTypography as="h4">{intl.formatMessage(intlMessages.dataSavingDesc)}</BBBTypography>
        </Styled.Group>
        <Styled.Group>
          {isVideoEnabled && (
            <BBBToggle
              checked={viewParticipantsWebcams}
              onChange={() => this.handleToggle('viewParticipantsWebcams')}
              helperText={intl.formatMessage(intlMessages.webcamLabel)}
              slotProps={{ input: { 'data-test': 'webcamToggleBtn' } }}
            />
          )}
          {isScreenSharingEnabled && (
            <BBBToggle
              checked={viewScreenshare}
              onChange={() => this.handleToggle('viewScreenshare')}
              helperText={intl.formatMessage(intlMessages.screenShareLabel)}
              slotProps={{ input: { 'data-test': 'desktopSharingToggleBtn' } }}
            />
          )}
        </Styled.Group>
      </Styled.Section>
    );
  }
}

export default injectIntl(DataSaving);
