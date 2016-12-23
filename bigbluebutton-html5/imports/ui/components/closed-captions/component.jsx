import React, { PropTypes } from 'react';
import styles from './styles.scss';

export default class ClosedCaptions extends React.Component {
  constructor(props) {
    super(props);
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

  render() {
    return (
      <div disabled className={styles.ccbox}>
        <div className={styles.title}>
          <p> {this.props.locale ? this.props.locale : "Locale is not selected"} </p>
        </div>
        <div
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
