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
        style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: text }}
        key={caption.index}
      />
    );
  }

  render() {
    return (
      <div disabled className={styles.ccbox}>
      {this.props.captions.English ? this.props.captions.English.captions.map((caption) => (
        this.renderCaptions(caption)
      )) : null }
      </div>
    );
  }
}
