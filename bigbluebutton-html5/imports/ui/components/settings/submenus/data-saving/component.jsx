import React from 'react';
import Toggle from '/imports/ui/components/common/switch/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
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
    const { intl, showToggleLabel, displaySettingsStatus } = this.props;

    const { viewParticipantsWebcams, viewScreenshare } = this.state.settings;

    return (
      <div>
        <div>
          <Styled.Title>{intl.formatMessage(intlMessages.dataSavingLabel)}</Styled.Title>
          <Styled.SubTitle>{intl.formatMessage(intlMessages.dataSavingDesc)}</Styled.SubTitle>
        </div>
        <Styled.Form>
          <Styled.Row>
            <Styled.Col aria-hidden="true">
              <Styled.FormElement>
                <Styled.Label>
                  {intl.formatMessage(intlMessages.webcamLabel)}
                </Styled.Label>
              </Styled.FormElement>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementRight>
                {displaySettingsStatus(viewParticipantsWebcams)}
                <Toggle
                  icons={false}
                  defaultChecked={viewParticipantsWebcams}
                  onChange={() => this.handleToggle('viewParticipantsWebcams')}
                  ariaLabelledBy="webcamToggle"
                  ariaLabel={intl.formatMessage(intlMessages.webcamLabel)}
                  showToggleLabel={showToggleLabel}
                />
              </Styled.FormElementRight>
            </Styled.Col>
          </Styled.Row>
          <Styled.Row>
            <Styled.Col aria-hidden="true">
              <Styled.FormElement>
                <Styled.Label>
                  {intl.formatMessage(intlMessages.screenShareLabel)}
                </Styled.Label>
              </Styled.FormElement>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementRight>
                {displaySettingsStatus(viewScreenshare)}
                <Toggle
                  icons={false}
                  defaultChecked={viewScreenshare}
                  onChange={() => this.handleToggle('viewScreenshare')}
                  ariaLabelledBy="screenShare"
                  ariaLabel={intl.formatMessage(intlMessages.screenShareLabel)}
                  showToggleLabel={showToggleLabel}
                />
              </Styled.FormElementRight>
            </Styled.Col>
          </Styled.Row>
        </Styled.Form>
      </div>
    );
  }
}

export default injectIntl(DataSaving);
