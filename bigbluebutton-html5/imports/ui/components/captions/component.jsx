import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const LINE_BREAK = '\n';

class Captions extends React.Component {
  constructor(props) {
    super(props);
    this.state = { initial: true };
    this.text = "";

    this.updateText = this.updateText.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { captions } = this.props;
    const nextCaptions = nextProps.captions;

    if (!_.isEmpty(captions) && !_.isEmpty(nextCaptions)) {
      // If is the same locale and at the same revision, don't update
      if (nextCaptions.padId === captions.padId) {
        if (nextCaptions.revs === captions.revs) return false;
      }
    }
    return true;
  }

  componentDidMount() {
    this.setState({ initial: false });
  }

  updateText(data) {
    const update = this.text + data;
    const splitUpdate = update.split(LINE_BREAK);
    while (splitUpdate.length > CAPTIONS_CONFIG.lines) splitUpdate.shift();
    this.text = splitUpdate.join(LINE_BREAK);
  }

  render() {
    const {
      fontFamily,
      fontSize,
      fontColor,
      backgroundColor,
      captions,
    } = this.props;

    if (!this.state.initial) {
      if (!_.isEmpty(captions)) this.updateText(captions.data);
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
  captions: PropTypes.object,
  backgroundColor: PropTypes.string.isRequired,
  fontColor: PropTypes.string.isRequired,
  fontSize: PropTypes.string.isRequired,
  fontFamily: PropTypes.string.isRequired,
};
