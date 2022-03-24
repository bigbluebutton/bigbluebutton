import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';
import Service from './service';

const intlMessages = defineMessages({
  start: {
    id: 'app.audio.captions.speech.start',
    description: 'Notification on speech recognition start',
  },
  stop: {
    id: 'app.audio.captions.speech.stop',
    description: 'Notification on speech recognition stop',
  },
  error: {
    id: 'app.audio.captions.speech.error',
    description: 'Notification on speech recognition error',
  },
});

class Speech extends PureComponent {
  constructor(props) {
    super(props);

    this.onStop = this.onStop.bind(this);
    this.onError = this.onError.bind(this);
    this.onResult = this.onResult.bind(this);

    this.result = {
      transcript: '',
      isFinal: true,
    };

    this.speechRecognition = Service.initSpeechRecognition();

    if (this.speechRecognition) {
      this.speechRecognition.onstart = () => notify(props.intl.formatMessage(intlMessages.start), 'info', 'closed_caption');
      this.speechRecognition.onend = () => notify(props.intl.formatMessage(intlMessages.stop), 'info', 'closed_caption');
      this.speechRecognition.onerror = (event) => this.onError(event);
      this.speechRecognition.onresult = (event) => this.onResult(event);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      locale,
      dictating,
    } = this.props;

    // Start dictating
    if (!prevProps.dictating && dictating) {
      this.start(locale);
    }

    // Stop dictating
    if (prevProps.dictating && !dictating) {
      this.onStop();
    }

    // Switch locale
    if (prevProps.locale !== locale) {
      if (prevProps.dictating && dictating) {
        this.onStop();
        this.start(locale);
      }
    }
  }

  componentWillUnmount() {
    this.onStop();
  }

  onError(error) {
    this.onStop();

    logger.error({
      logCode: 'captions_speech_recognition',
      extraInfo: { error },
    }, 'Captions speech recognition error');
  }

  onStop() {
    if (this.speechRecognition) {
      const {
        isFinal,
        transcript,
      } = this.result;

      if (!isFinal) {
        Service.pushFinalTranscript(transcript);
        this.speechRecognition.abort();
      } else {
        this.speechRecognition.stop();
      }
    }
  }

  onResult(event) {
    const {
      resultIndex,
      results,
    } = event;

    const { transcript } = results[resultIndex][0];
    const { isFinal } = results[resultIndex];

    this.result.transcript = transcript;
    this.result.isFinal = isFinal;

    if (isFinal) {
      Service.pushFinalTranscript(transcript);
    } else {
      Service.pushInterimTranscript(transcript);
    }
  }

  start(locale) {
    if (this.speechRecognition) {
      this.speechRecognition.lang = locale;
      try {
        this.speechRecognition.start();
      } catch (event) {
        this.onError(event.error);
      }
    }
  }

  render() {
    return null;
  }
}

Speech.propTypes = {
  locale: PropTypes.string.isRequired,
  dictating: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(Speech);
