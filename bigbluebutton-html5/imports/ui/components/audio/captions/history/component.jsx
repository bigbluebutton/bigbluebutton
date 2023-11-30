import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import LiveCaptions from '../live/container';

class CaptionsHistory extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount() {
  }

  render() {
    const { captions } = this.props;

    let i = 0;
    return captions.map((c) => {
      i += 1;
      return <LiveCaptions
                key={captions.length - i}
                index={captions.length - i}
                nCaptions={captions.length}
                transcriptId={c.transcriptId}
                transcript={c.transcript}
             />
    });
  }
}

export default CaptionsHistory;
