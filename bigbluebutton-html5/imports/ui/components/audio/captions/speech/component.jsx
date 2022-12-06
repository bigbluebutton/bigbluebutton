import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import logger from '/imports/startup/client/logger';
import Service from './service';

class Speech extends PureComponent {
  constructor(props) {
    super(props);

    this.onEnd = this.onEnd.bind(this);
    this.onError = this.onError.bind(this);
    this.onResult = this.onResult.bind(this);

    this.result = {
      id: Service.generateId(),
      transcript: '',
      isFinal: true,
    };

    this.idle = true;

    this.speechRecognition = Service.initSpeechRecognition();

    if (this.speechRecognition) {
      this.speechRecognition.onend = () => this.onEnd();
      this.speechRecognition.onerror = (event) => this.onError(event);
      this.speechRecognition.onresult = (event) => this.onResult(event);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      locale,
      connected,
      talking,
    } = this.props;

    // Connected
    if (!prevProps.connected && connected) {
      this.start(locale);
    }

    // Disconnected
    if (prevProps.connected && !connected) {
      this.stop();
    }

    // Switch locale
    if (prevProps.locale !== locale) {
      if (prevProps.connected && connected) {
        this.stop();
        this.start(locale);
      }
    }

    // Recovery from idle
    if (!prevProps.talking && talking) {
      if (prevProps.connected && connected) {
        if (this.idle) {
          this.start(locale);
        }
      }
    }
  }

  componentWillUnmount() {
    this.stop();
  }

  onEnd() {
    this.stop();
  }

  onError(event) {
    this.stop();

    logger.error({
      logCode: 'captions_speech_recognition',
      extraInfo: {
        error: event.error,
        message: event.message,
      },
    }, 'Captions speech recognition error');
  }

  onResult(event) {
    const {
      resultIndex,
      results,
    } = event;

    const { id } = this.result;
    const { transcript } = results[resultIndex][0];
    const { isFinal } = results[resultIndex];

    this.result.transcript = transcript;
    this.result.isFinal = isFinal;

    const { locale } = this.props;
    if (isFinal) {
      Service.updateFinalTranscript(id, transcript, locale);
      this.result.id = Service.generateId();
    } else {
      Service.updateInterimTranscript(id, transcript, locale);
    }
  }

  start(locale) {
    if (this.speechRecognition && Service.isLocaleValid(locale)) {
      this.speechRecognition.lang = locale;
      try {
        this.result.id = Service.generateId();
        this.speechRecognition.start();
        this.idle = false;
      } catch (event) {
        this.onError(event);
      }
    }
  }

  stop() {
    this.idle = true;
    if (this.speechRecognition) {
      const {
        isFinal,
        transcript,
      } = this.result;

      if (!isFinal) {
        const { locale } = this.props;
        const { id } = this.result;
        Service.updateFinalTranscript(id, transcript, locale);
        this.speechRecognition.abort();
      } else {
        this.speechRecognition.stop();
      }
    }
  }

  render() {
    return null;
  }
}

Speech.propTypes = {
  locale: PropTypes.string.isRequired,
  connected: PropTypes.bool.isRequired,
  talking: PropTypes.bool.isRequired,
};

export default Speech;
