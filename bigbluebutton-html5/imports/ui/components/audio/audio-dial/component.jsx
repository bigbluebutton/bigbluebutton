import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  audioDialDescription: {
    id: 'app.audioDial.audioDialDescription',
    description: 'Text description for the audio help',
  },
  audioDialConfrenceText: {
    id: 'app.audioDial.audioDialConfrenceText',
    description: 'audio settings back button label',
  },
  tipIndicator: {
    id: 'app.audioDial.tipIndicator',
    description: 'Indicator for the tip message',
  },
  tipMessage: {
    id: 'app.audioDial.tipMessage',
    description: 'Tip message explaining how to mute/unmute yourself',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  formattedDialNum: PropTypes.string.isRequired,
  telVoice: PropTypes.string.isRequired,
};

class AudioDial extends React.PureComponent {
  render() {
    const {
      intl,
      formattedDialNum,
      telVoice,
    } = this.props;

    const formattedTelVoice = telVoice.replace(/(?=(\d{3})+(?!\d))/g, ' ');

    return (
      <Styled.Help>
        <Styled.Text>
          {intl.formatMessage(intlMessages.audioDialDescription)}
        </Styled.Text>
        <Styled.DialText>{formattedDialNum}</Styled.DialText>
        <Styled.ConferenceText>
          {intl.formatMessage(intlMessages.audioDialConfrenceText)}
        </Styled.ConferenceText>
        <Styled.Telvoice>{formattedTelVoice}</Styled.Telvoice>
        <Styled.TipBox>
          <Styled.TipIndicator>
            {`${intl.formatMessage(intlMessages.tipIndicator)}: `}
          </Styled.TipIndicator>
          {intl.formatMessage(intlMessages.tipMessage)}
        </Styled.TipBox>
      </Styled.Help>
    );
  }
}

AudioDial.propTypes = propTypes;
export default injectIntl(AudioDial);
