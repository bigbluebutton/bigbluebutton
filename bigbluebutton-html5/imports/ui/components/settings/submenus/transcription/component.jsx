import React from 'react';
import Toggle from '/imports/ui/components/common/switch/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import Styled from './styles';

const intlMessages = defineMessages({
  transcriptionLabel: {
    id: 'app.submenu.transcription.sectionTitle',
  },
  transcriptionDesc: {
    id: 'app.submenu.transcription.desc',
  },
  partialUtterancesLabel: {
    id: 'app.settings.transcriptionTab.partialUtterances',
  },
  minUtteranceLengthLabel: {
    id: 'app.settings.transcriptionTab.minUtteranceLength',
  },
});

class Transcription extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'transcription',
      settings: props.settings,
    };
  }

  render() {
    const {
      intl,
      showToggleLabel,
      displaySettingsStatus,
    } = this.props;

    const { partialUtterances, minUtteranceLength } = this.state.settings;

    return (
      <div>
        <div>
          <Styled.Title>{intl.formatMessage(intlMessages.transcriptionLabel)}</Styled.Title>
          <Styled.SubTitle>{intl.formatMessage(intlMessages.transcriptionDesc)}</Styled.SubTitle>
        </div>

        <Styled.Form>
          <Styled.Row>
            <Styled.Col aria-hidden>
              <Styled.FormElement>
                <Styled.Label>
                  {intl.formatMessage(intlMessages.partialUtterancesLabel)}
                </Styled.Label>
              </Styled.FormElement>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementRight>
                <Toggle
                  icons={false}
                  defaultChecked={partialUtterances}
                  onChange={() => this.handleToggle('partialUtterances')}
                  ariaLabelledBy="partialUtterances"
                  ariaLabel={`${intl.formatMessage(intlMessages.partialUtterancesLabel)} - ${displaySettingsStatus(partialUtterances, true)}`}
                  showToggleLabel={showToggleLabel}
                />
              </Styled.FormElementRight>
            </Styled.Col>
          </Styled.Row>
          <Styled.Row>
            <Styled.Col aria-hidden>
              <Styled.FormElement>
                <Styled.Label>
                  {intl.formatMessage(intlMessages.minUtteranceLengthLabel)}
                </Styled.Label>
              </Styled.FormElement>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementRight>
                <input
                  value={minUtteranceLength}
                  onChange={ (e) => this.handleInput('minUtteranceLength', e) }
                  type="number"
                  max="5"
                  min="0"
                >
                </input>
              </Styled.FormElementRight>
            </Styled.Col>
          </Styled.Row>
        </Styled.Form>
      </div>
    );
  }
}

export default injectIntl(Transcription);
