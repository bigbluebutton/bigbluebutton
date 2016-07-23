import React, { PropTypes } from 'react';
import styles from './styles.scss';

export default class ClosedCaptions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <textarea disabled className={styles.ccbox} value={this.props.captions.English.captions}/>
    );
  }
}
