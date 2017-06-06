import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import { findDOMNode } from 'react-dom';

export default class ClosedCaptions extends React.Component {
  constructor(props) {
    super(props);

    this.shouldScrollBottom = false;
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

  componentWillUpdate() {

    const node = findDOMNode(this.ccScrollArea);

    // number 4 is for the border
    // offset height includes the border, but scrollheight doesn't
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight - 4 === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      const node = findDOMNode(this.ccScrollArea);
      node.scrollTop = node.scrollHeight;
    }
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
          <p> {locale || 'Locale is not selected'} </p>
        </div>
        <div
          ref={(ref) => { this.ccScrollArea = ref; }}
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
