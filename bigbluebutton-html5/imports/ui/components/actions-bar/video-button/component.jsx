import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../styles.scss';

export default class JoinVideo extends React.Component {

  handleClick() {
  }

  render() {
    let hideButton = styles.invisible;
    return (
      <Button
        onClick={this.handleClick}
        label={'Cam Off'}
        color={'primary'}
        icon={'video-off'}
        size={'lg'}
        circle={true}
        className={hideButton}
      />
    );
  }
}
