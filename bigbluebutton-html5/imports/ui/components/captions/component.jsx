import React from 'react';
import PropTypes from 'prop-types';
import CaptionsService from './service';
import { Session } from 'meteor/session';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const LINE_BREAK = '\n';

class Captions extends React.Component {
  constructor(props) {
    super(props);
    this.state = { initial: true, newTranslation: 0 };
    this.text = '';
    this.ariaText = '';
    this.timer = null;
    this.settings = CaptionsService.getCaptionsSettings();
    this.translatedText = '';

    this.srcLocale = Session.get('captionsLocale');
    this.dstLocale = Session.get('captionsDstLocale');
    this.translating = !this.dstLocale || this.srcLocale === this.dstLocale ? false : true;
    
    this.updateText = this.updateText.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.translateText = this.translateText.bind(this);
  }

  componentDidMount() {
    this.setState({ initial: false });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      padId,
      revs,
    } = this.props;

    const { newTranslation } = this.state;
    
    if (padId === nextProps.padId) {
      if (revs === nextProps.revs && newTranslation === nextState.newTranslation && !nextState.clear) return false;
    }
    return true;
  }

  componentDidUpdate() {
    /* https://reactjs.org/docs/react-component.html#componentdidupdate
     You may call setState() immediately in componentDidUpdate()
     but note that it must be wrapped in a condition (...),
     or you’ll cause an infinite loop. */
    const { clear } = this.state;
    if (this.translating && this.translatedText.length == 0) {
      if (clear) {
        this.setState({ clear: false });
      }
    } else {
      if (this.translatedText.length > 0) {
        this.translatedText = '';
      }
      if (clear) {
        this.setState({ clear: false });
      } else {
        this.resetTimer();
        this.timer = setTimeout(() => { this.setState({ clear: true }); }, CAPTIONS_CONFIG.time);
      }
    }
  }

  componentWillUnmount() {
    this.resetTimer();
  }

  updateText(data) {
    const { clear } = this.state;
    if (clear) {
      this.text = '';
      this.ariaText = '';
      if (this.translatedText.length != 0) {
        this.ariaText = CaptionsService.formatCaptionsText(data);
        const text = this.text + data ;
        this.text = CaptionsService.formatCaptionsText(text);
      }
    } else {
      this.ariaText = CaptionsService.formatCaptionsText(data);
      const text = this.text + data;
      this.text = CaptionsService.formatCaptionsText(text);
    }
  }

  resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  async translateText (text, src, tgt) {
    const url = CAPTIONS_CONFIG.googleTranslateUrl + '/exec?' + 'text=' + text + '&source=' + src + '&target=' + tgt;
    const jsObj = await fetch(url).then(resp => resp.json());
    const translatedText = jsObj.code === 200 ? jsObj.text : '';
    this.translatedText = translatedText + LINE_BREAK ;
    const { newTranslation } = this.state;
    this.setState({ newTranslation: newTranslation + 1 });
  }
  
  render() {
    const { data } = this.props;
    const { initial } = this.state;
    const {
      fontFamily,
      fontSize,
      fontColor,
      backgroundColor,
    } = this.settings;

    const { clear } = this.state;
    
    if (!initial) {
      if (this.translating) {
        if (this.translatedText.length == 0 && !clear) {
          const translation = this.translateText(data, this.srcLocale, this.dstLocale);
          return null;
        } else {
          this.updateText(this.translatedText);
        }
      } else {
        this.updateText(data);
      }
    }
    if (typeof this.ariaText !== 'string' || typeof this.text !== 'string') {
      return null;
    }

    const captionStyles = {
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      fontFamily,
      fontSize,
      background: backgroundColor,
      color: fontColor,
    };

    const visuallyHidden = {
      position: 'absolute',
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      height: '1px',
      width: '1px',
      margin: '-1px',
      padding: '0',
      border: '0',
    };

    return (
      <div>
        <div style={captionStyles}>
          {this.text}
        </div>
        <div
          style={visuallyHidden}
          aria-atomic
          aria-live="polite"
        >
          {this.ariaText}
        </div>
      </div>
    );
  }
}

export default Captions;

Captions.propTypes = {
  padId: PropTypes.string.isRequired,
  revs: PropTypes.number.isRequired,
  data: PropTypes.string.isRequired,
};
