import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../settings/styles.scss';

export default class AudioTest extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <Button className={styles.testAudioBtn}
          label={'Play sound'}
          icon={'audio'}
          size={'md'}
          color={'primary'}
          ghost={true}
          onClick={this.props.handlePlayAudioSample}
        />
    );
  }
};
