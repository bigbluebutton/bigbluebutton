import React from 'react';
import PropTypes from 'prop-types';
import CaptionsService from './service';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;

class Captions extends React.Component {
  constructor(props) {
    super(props);
    this.state = { initial: true };
    this.text = '';
    this.ariaText = '';
    this.timer = null;
    this.settings = CaptionsService.getCaptionsSettings();

    this.updateText = this.updateText.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
  }

  componentDidMount() {
    this.setState({ initial: false });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      padId,
      revs,
    } = this.props;

    if (padId === nextProps.padId) {
      if (revs === nextProps.revs && !nextState.clear) return false;
    }
    return true;
  }

  componentDidUpdate() {
    /* https://reactjs.org/docs/react-component.html#componentdidupdate
     You may call setState() immediately in componentDidUpdate()
     but note that it must be wrapped in a condition (...),
     or you’ll cause an infinite loop. */
    const { clear } = this.state;
    if (clear) {
      this.setState({ clear: false });
    } else {
      this.resetTimer();
      this.timer = setTimeout(() => { this.setState({ clear: true }); }, CAPTIONS_CONFIG.time);
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

  render() {
    const { data } = this.props;
    const { initial } = this.state;
    const {
      fontFamily,
      fontSize,
      fontColor,
      backgroundColor,
    } = this.settings;

    if (!initial) {
      this.updateText(data);
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
