import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { styles } from './styles';

const intlMessages = defineMessages({
  audioDialDescription: {
    id: 'app.audioDial.audioDialDescription',
    description: 'Text decription for the audio help',
  },
  audioDialConfrenceText: {
    id: 'app.audioDial.audioDialConfrenceText',
    description: 'audio settings back button label',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  dialNumber: PropTypes.string.isRequired,
  telVoice: PropTypes.string.isRequired,
};

class AudioDial extends React.PureComponent {
  render() {
    const {
      intl,
      dialNumber,
      telVoice,
    } = this.props;

    let phoneNumber = dialNumber;
    phoneNumber = phoneNumber.replace(/-/g, '');
    phoneNumber = `(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3, 6)}-${phoneNumber.substring(6, 11)}`;

    return (
      <span className={styles.help}>
        <div className={styles.text}>
          {intl.formatMessage(intlMessages.audioDialDescription)}
        </div>
        <div className={styles.dialText}>{phoneNumber}</div>
        <div className={styles.conferenceText}>
          {intl.formatMessage(intlMessages.audioDialConfrenceText)}
        </div>
        <div className={styles.telvoice}>{telVoice}</div>
      </span>
    );
  }
}

AudioDial.propTypes = propTypes;
export default injectIntl(AudioDial);
