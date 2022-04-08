import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;

class LiveCaptions extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { clear: true };
    this.timer = null;
  }

  componentDidUpdate(prevProps) {
    const { clear } = this.state;

    if (clear) {
      const { data } = this.props;
      if (prevProps.data !== data) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ clear: false });
      }
    } else {
      this.resetTimer();
      this.timer = setTimeout(() => this.setState({ clear: true }), CAPTIONS_CONFIG.time);
    }
  }

  componentWillUnmount() {
    this.resetTimer();
  }

  resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  render() {
    const { data } = this.props;
    const { clear } = this.state;

    const hasContent = data.length > 0 && !clear;

    const wrapperStyles = {
      background: 'black',
      padding: hasContent ? '.5rem 1rem' : undefined,
    };

    const captionStyles = {
      whiteSpace: 'pre-line',
      wordWrap: 'break-word',
      fontFamily: 'Verdana',
      fontSize: '1.5rem',
      background: 'black',
      color: 'white',
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
      <div style={wrapperStyles}>
        <div style={captionStyles}>
          {clear ? '' : data}
        </div>
        <div
          style={visuallyHidden}
          aria-atomic
          aria-live="polite"
        >
          {clear ? '' : data}
        </div>
      </div>
    );
  }
}

LiveCaptions.propTypes = {
  data: PropTypes.string.isRequired,
};

export default LiveCaptions;
