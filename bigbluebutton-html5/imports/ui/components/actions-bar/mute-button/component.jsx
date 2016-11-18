import React from 'react';
import Button from '/imports/ui/components/button/component';

export default class MuteAudioComponent extends React.Component {

  render() {
    const { isMuted, muteUser, unmuteUser } = this.props;
    let onClick = muteUser;
    let label = 'Mute';

    if (isMuted) {
      onClick = unmuteUser;
      label = 'Unmute';
    }

    return (
      <Button
        onClick={onClick}
        label={label}
        color={'primary'}
        icon={'audio'}
        size={'lg'}
        circle={true}
      />
    );
  }
}
