import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../settings/styles.scss';

export default class EnterAudio extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.half}>
        <Button className={styles.enterBtn}
          label={'Enter Session'}
          size={'md'}
          color={'primary'}
          onClick={this.props.handleJoin}
        />
      </div>
    );
  }
};
