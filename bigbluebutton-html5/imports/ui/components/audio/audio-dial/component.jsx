import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { styles } from './styles';

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
  intl: intlShape.isRequired,
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

    return (
      <span className={styles.help}>
        <div className={styles.text}>
          {intl.formatMessage(intlMessages.audioDialDescription)}
        </div>
        <div className={styles.dialText}>{formattedDialNum}</div>
        <div className={styles.conferenceText}>
          {intl.formatMessage(intlMessages.audioDialConfrenceText)}
        </div>
        <div className={styles.telvoice}>{telVoice}</div>
        <div className={styles.tipBox}>
          <span className={styles.tipIndicator}>
            {`${intl.formatMessage(intlMessages.tipIndicator)}: `}
          </span>
          {intl.formatMessage(intlMessages.tipMessage)}
        </div>
      </span>
    );
  }
}

AudioDial.propTypes = propTypes;
export default injectIntl(AudioDial);
