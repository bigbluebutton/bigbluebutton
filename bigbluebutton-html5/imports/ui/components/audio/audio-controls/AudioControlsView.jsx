import React, { PureComponent, Fragment } from 'react';
import getFromUserSettings from '/imports/ui/services/users-settings';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import MutedAlert from '/imports/ui/components/muted-alert/component';
import { IconButton } from '/imports/ui/components/common';

class AudioControlsView extends PureComponent {
  componentDidMount() {
    const { processToggleMuteFromOutside } = this.props;
    if (Meteor.settings.public.allowOutsideCommands.toggleSelfVoice
      || getFromUserSettings('bbb_outside_toggle_self_voice', false)) {
      window.addEventListener('message', processToggleMuteFromOutside);
    }
  }

  render() {
    const {
      handleToggleMuteMicrophone,
      handleJoinAudio,
      handleLeaveAudio,
      showMute,
      muted,
      inAudio,
      listenOnly,
      isVoiceUser,
      inputStream,
      isViewer,
      isPresenter,
    } = this.props;
    let joinIcon = 'telephone-off';
    if (inAudio) {
      if (listenOnly) {
        joinIcon = 'headphones';
      } else {
        joinIcon = 'telephone';
      }
    }

    const toggleMuteBtn = (
      <IconButton
        color={!muted ? 'error' : 'secondary'}
        icon={muted ? 'mic-off' : 'mic'}
        onClick={handleToggleMuteMicrophone}
      />
    );

    return (
      <Fragment>
        {muted ? <MutedAlert {...{ inputStream, isViewer, isPresenter }} /> : null}
        {showMute && isVoiceUser ? toggleMuteBtn : null}
        <IconButton
          color={inAudio ? 'error' : 'secondary'}
          icon={joinIcon}
          onClick={inAudio ? handleLeaveAudio : handleJoinAudio}
        />
      </Fragment>
    );
  }
}

export default withShortcutHelper(AudioControlsView, ['joinAudio', 'leaveAudio', 'toggleMute']);
