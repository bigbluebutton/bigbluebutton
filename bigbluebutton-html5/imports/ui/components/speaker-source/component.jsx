import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../settings/styles.scss';

export default class SpeakerSource extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick() {
  }

  render() {
    return(
      <div>
      <div className={styles.containerLeftHalf}>
      <label htmlFor='speaker'>Speaker source</label><br />
        <select id='speaker' defaultValue='0'>
          <option value='0' disabled>Default</option>
          <option value='1' disabled>1</option>
          <option value='2' disabled>2</option>
          <option value='3' disabled>3</option>
        </select>
      </div>
      <div className={styles.containerRightHalf}>
      <Button className={styles.playSound}
        label={'Play sound'}
        icon={'audio'}
        size={'md'}
        color={'primary'}
        ghost={true}
        onClick={this.handleClick}
      />
      </div>
      </div>
    );
  }
};
