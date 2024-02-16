import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import UserContainer from './user/container';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;

class LiveCaptions extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { clear: true };
    this.timer = null;
  }

  componentDidUpdate(prevProps) {
    const { clear } = this.state;
    const { index, nCaptions } = this.props;

    if (clear) {
      const { transcript } = this.props;
      if (prevProps.transcript !== transcript) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ clear: false });
      }
    } else {
      this.resetTimer();
      this.timer = setTimeout(() => this.setState({ clear: true }), (CAPTIONS_CONFIG.time / nCaptions) * (index+1));
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
    const {
      transcript,
      transcriptId,
      index,
      nCaptions,
    } = this.props;

    const { clear } = this.state;

    const hasContent = transcript.length > 0 && !clear;

    const wrapperStyles = {
      display: 'flex',
    };

    const captionStyles = {
      whiteSpace: 'pre-line',
      wordWrap: 'break-word',
      fontFamily: 'Verdana, Arial, Helvetica, sans-serif',
      fontSize: '1.5rem',
      background: '#000000a0',
      color: 'white',
      padding: hasContent ? '.5rem' : undefined,
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
        {clear ? null : (
          <UserContainer
            background="#000000a0"
            transcriptId={transcriptId}
          />
        )}
        <div style={captionStyles}>
          {clear ? '' : transcript}
        </div>
        <div
          style={visuallyHidden}
          aria-atomic
          aria-live="polite"
        >
          {clear ? '' : transcript}
        </div>
      </div>
    );
  }
}

LiveCaptions.propTypes = {
  transcript: PropTypes.string.isRequired,
  transcriptId: PropTypes.string.isRequired,
};

export default LiveCaptions;
