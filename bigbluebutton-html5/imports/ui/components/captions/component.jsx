import React from 'react';
import PropTypes from 'prop-types';
import CaptionsService from './service';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;

class Captions extends React.Component {
  constructor(props) {
    super(props);
    this.state = { initial: true };
    this.text = "";
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

  componentDidUpdate(prevProps, prevState) {
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
      this.text = "";
    } else {
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

    return (
      <span
        style={captionStyles}
        dangerouslySetInnerHTML={{ __html: this.text }}
      />
    );
  }
}

export default Captions;

Captions.propTypes = {
  padId: PropTypes.string.isRequired,
  revs: PropTypes.number.isRequired,
  data: PropTypes.string.isRequired,
};
