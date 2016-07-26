import React, { PropTypes } from 'react';
import styles from './styles.scss';

export default class ClosedCaptions extends React.Component {
  constructor(props) {
    super(props);
  }

  renderCaptions(caption) {
    const BREAK_TAG = '<br/>';
    let text = caption.captions.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + BREAK_TAG + '$2');

    return (
      <span dangerouslySetInnerHTML={{ __html: text }} key={caption.index}/>
    );
  }

  render() {
    return (
      <div disabled className={styles.ccbox}>
      {this.props.captions.English.captions.map((caption) => (
        this.renderCaptions(caption)
      ))}
      </div>
    );
  }
}
