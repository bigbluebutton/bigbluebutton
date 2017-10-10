import React from 'react';
import styles from './styles.scss';

/* export default class RecordingIndicator extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { beingRecorded } = this.props;

    if (!beingRecorded) {
      return null;
    }

    return (<div className={styles.indicator} />);
  }
} */

const RecordingIndicator = ({ beingRecorded }) => {
  if (!beingRecorded) return null;
  return <div className={styles.indicator} />;
};

export default RecordingIndicator;
