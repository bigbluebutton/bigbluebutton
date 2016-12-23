import React, { PropTypes } from 'react';
import styles from './styles.scss';
import { findDOMNode } from 'react-dom';

export default class ClosedCaptions extends React.Component {
  constructor(props) {
    super(props);

    this.shouldScrollBottom = false;
  }

  renderCaptions(caption) {
    let text = caption.captions;
    return (
      <span
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: this.props.fontFamily, fontSize: this.props.fontSize, color: this.props.fontColor }}
        dangerouslySetInnerHTML={{ __html: text }}
        key={caption.index}
      />
    );
  }

  componentDidUpdate() {
    const { ccScrollArea } = this.refs;

    var node = findDOMNode(ccScrollArea);
    node.scrollTop = node.scrollHeight;
  }

  componentWillUpdate() {
    const { ccScrollArea } = this.refs;

    var node = findDOMNode(ccScrollArea);
    // number 4 is for the border
    // offset height includes the border, but scrollheight doesn't
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight - 4 === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      const { ccScrollArea } = this.refs;
      var node = findDOMNode(ccScrollArea);
      node.scrollTop = node.scrollHeight
    }
  }

  render() {
    return (
      <div disabled className={styles.ccbox}>
        <div className={styles.title}>
          <p> {this.props.locale ? this.props.locale : "Locale is not selected"} </p>
        </div>
        <div
          ref="ccScrollArea"
          className={styles.frame}
          style={{background: this.props.backgroundColor}}>
          {this.props.captions[this.props.locale] ? this.props.captions[this.props.locale].captions.map((caption) => (
            this.renderCaptions(caption)
          )) : null }
        </div>
      </div>
    );
  }
}
