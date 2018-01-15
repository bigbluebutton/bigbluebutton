import React, { Component } from 'react';
import PropTypes from 'prop-types';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { styles } from './styles.scss';

class ClosedCaptions extends Component {
  constructor(props) {
    super(props);

    this.shouldScrollBottom = false;
  }

  componentWillUpdate() {
    const node = this.refCCScrollArea;

    // number 4 is for the border
    // offset height includes the border, but scrollheight doesn't
    this.shouldScrollBottom = (node.scrollTop + node.offsetHeight) - 4 === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      this.refCCScrollArea.scrollTop = this.refCCScrollArea.scrollHeight;
    }
  }

  renderCaptions(caption) {
    const text = caption.captions;
    const captionStyles = {
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      fontFamily: this.props.fontFamily,
      fontSize: this.props.fontSize,
      color: this.props.fontColor,
    };

    return (
      <span
        style={captionStyles}
        dangerouslySetInnerHTML={{ __html: text }}
        key={caption.index}
      />
    );
  }

  render() {
    const {
      locale,
      captions,
      backgroundColor,
    } = this.props;

    return (
      <div disabled className={styles.ccbox}>
        <div className={styles.title}>
          <p> {locale} </p>
        </div>
        <div
          ref={(ref) => { this.refCCScrollArea = ref; }}
          className={styles.frame}
          style={{ background: backgroundColor }}
        >
          {captions[locale] ? captions[locale].captions.map(caption => (
            this.renderCaptions(caption)
          )) : null }
        </div>
      </div>
    );
  }
}

export default injectWbResizeEvent(ClosedCaptions);

ClosedCaptions.propTypes = {
  backgroundColor: PropTypes.string.isRequired,
  captions: PropTypes.arrayOf(
    PropTypes.shape({
      ownerId: PropTypes.string.isRequired,
      captions: PropTypes.arrayOf(
        PropTypes.shape({
          captions: PropTypes.string.isRequired,
        }).isRequired,
      ).isRequired,
    }).isRequired,
  ).isRequired,
  locale: PropTypes.string.isRequired,
  fontColor: PropTypes.string.isRequired,
  fontSize: PropTypes.string.isRequired,
  fontFamily: PropTypes.string.isRequired,
};

ClosedCaptions.defaultProps = {
  locale: 'Locale is not selected',
};
