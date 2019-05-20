import React from 'react';
import PropTypes from 'prop-types';
import CaptionsService from './service';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const LINE_BREAK = '\n';

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

  componentDidMount() {
    this.setState({ initial: false });
  }

  componentWillUnmount() {
    this.resetTimer();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.clear) {
      this.setState({ clear: false });
    } else {
      this.resetTimer();
      this.timer = setTimeout(() => { this.setState({ clear: true }); }, CAPTIONS_CONFIG.time);
    }
  }

  updateText(data) {
    if (this.state.clear) {
      this.text = "";
    } else {
      const update = this.text + data;
      const splitUpdate = update.split(LINE_BREAK);
      while (splitUpdate.length > CAPTIONS_CONFIG.lines) splitUpdate.shift();
      this.text = splitUpdate.join(LINE_BREAK);
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
    const {
      fontFamily,
      fontSize,
      fontColor,
      backgroundColor,
    } = this.settings;

    if (!this.state.initial) {
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
