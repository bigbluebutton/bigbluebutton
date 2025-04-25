import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import SubMenuStyle from '../styles';
import Styled from './styles';

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
      displaySettingsStatus,
      isScreenSharingEnabled,
      isVideoEnabled,
    } = this.props;

    const { viewParticipantsWebcams, viewScreenshare } = this.state.settings;

    return (
      <div>
        <div>
          <Styled.Title>{intl.formatMessage(intlMessages.dataSavingLabel)}</Styled.Title>
          <Styled.SubTitle>{intl.formatMessage(intlMessages.dataSavingDesc)}</Styled.SubTitle>
        </div>
        <Styled.Form>
          {isVideoEnabled
            ? (
              <Styled.Row>
                <Styled.Col>
                  <Styled.FormElementRight>
                    <SubMenuStyle.MaterialSwitch
                      icons="false"
                      checked={viewParticipantsWebcams}
                      onChange={() => this.handleToggle('viewParticipantsWebcams')}
                      aria-labelledby="webcamToggle"
                      aria-label={`${intl.formatMessage(intlMessages.webcamLabel)} - ${displaySettingsStatus(viewParticipantsWebcams, true)}`}
                    />
                    <Styled.Label>
                      {intl.formatMessage(intlMessages.webcamLabel)}
                    </Styled.Label>
                  </Styled.FormElementRight>
                </Styled.Col>
              </Styled.Row>
            )
            : null}
          {isScreenSharingEnabled
            ? (
              <Styled.Row>
                <Styled.Col>
                  <Styled.FormElementRight>
                    <SubMenuStyle.MaterialSwitch
                      icons="false"
                      checked={viewScreenshare}
                      onChange={() => this.handleToggle('viewScreenshare')}
                      aria-labelledby="screenShare"
                      aria-label={`${intl.formatMessage(intlMessages.screenShareLabel)} - ${displaySettingsStatus(viewScreenshare, true)}`}
                    />
                    <Styled.Label>
                      {intl.formatMessage(intlMessages.screenShareLabel)}
                    </Styled.Label>
                  </Styled.FormElementRight>
                </Styled.Col>
              </Styled.Row>
            )
            : null}
        </Styled.Form>
      </div>
    );
  }
}

export default injectIntl(DataSaving);
