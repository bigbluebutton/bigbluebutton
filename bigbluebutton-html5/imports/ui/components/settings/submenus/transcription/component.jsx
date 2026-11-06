import React from 'react';
import { BBBToggle } from '@bigbluebutton/bbb-ui-components-react/Toggle';
import { BBBTypography } from '@bigbluebutton/bbb-ui-components-react/Typography';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import Styled from '../styles';
import { SETTINGS } from '/imports/ui/services/settings/enums';

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
      settingsName: SETTINGS.TRANSCRIPTION,
      settings: props.settings,
    };
  }

  render() {
    const { intl } = this.props;

    const { partialUtterances, minUtteranceLength } = this.state.settings;

    return (
      <Styled.Section>
        <Styled.Group>
          <BBBTypography variant="selected" as="h3">
            {intl.formatMessage(intlMessages.transcriptionLabel)}
          </BBBTypography>
          <BBBTypography as="h4">
            {intl.formatMessage(intlMessages.transcriptionDesc)}
          </BBBTypography>
        </Styled.Group>
        <Styled.Group>
          <BBBToggle
            checked={!!partialUtterances}
            onChange={() => this.handleToggle('partialUtterances')}
            helperText={intl.formatMessage(intlMessages.partialUtterancesLabel)}
          />
          <Styled.Row>
            <Styled.Label aria-hidden>
              {intl.formatMessage(intlMessages.minUtteranceLengthLabel)}
            </Styled.Label>
            <input
              value={minUtteranceLength}
              onChange={(e) => this.handleInput('minUtteranceLength', e)}
              aria-label={intl.formatMessage(intlMessages.minUtteranceLengthLabel)}
              type="number"
              max="5"
              min="0"
            />
          </Styled.Row>
        </Styled.Group>
      </Styled.Section>
    );
  }
}

export default injectIntl(Transcription);
