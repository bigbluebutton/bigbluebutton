import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const LINE_BREAK = '\n';

class Captions extends React.Component {
  constructor(props) {
    super(props);
    this.text = "";

    this.clearExtraTextLines = this.clearExtraTextLines.bind(this);
    this.updateText = this.updateText.bind(this);
    this.deactivated = this.deactivated.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (this.deactivated(nextProps)) return true;

    // TODO: Care about fonts and background changes
    const { captions } = this.props;
    if (_.isEmpty(nextProps.captions) || _.isEmpty(captions)) return false;

    // If is the same locale and at the same revision, don't update
    if (nextProps.captions.padId === captions.padId) {
      if (nextProps.captions.revs === captions.revs) return false;
    }

    return true;
  }

  deactivated(nextProps) {
    const { isActive } = this.props;
    if (isActive && !nextProps.isActive) return true;
    return false;
  }

  clearExtraTextLines() {
    const splitText = this.text.split(LINE_BREAK);
    while (splitText.length > CAPTIONS_CONFIG.lines) {
      splitText.shift();
    }
    this.text = splitText.join(LINE_BREAK);
  }

  updateText(data) {
    this.text = this.text + data;
    this.clearExtraTextLines();
  }

  render() {
    const {
      fontFamily,
      fontSize,
      fontColor,
      backgroundColor,
      captions,
      isActive,
    } = this.props;

    if (!isActive) {
      this.text = "";
      return null;
    }

    if (_.isEmpty(captions)) {
      return null;
    }

    this.updateText(captions.data);

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
  isActive: PropTypes.bool.isRequired,
  captions: PropTypes.object,
  backgroundColor: PropTypes.string.isRequired,
  fontColor: PropTypes.string.isRequired,
  fontSize: PropTypes.string.isRequired,
  fontFamily: PropTypes.string.isRequired,
};
