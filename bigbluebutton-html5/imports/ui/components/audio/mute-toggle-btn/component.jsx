import React, { Component } from 'react';
import Button from '/imports/ui/components/button/component';
import { injectIntl } from 'react-intl';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import styles from '../audio-controls/styles';

class MuteToggleBtn extends Component {
  render() {
    const { handleToggleMuteMicrophone, disable, unmute } = this.props;

    return (
      <Button
        className={styles.button}
        ref={(ref) => { this.ref = ref; }}
        onClick={handleToggleMuteMicrophone}
        disabled={disable}
        label={unmute ? 'Unmute' : 'Mute'}
        color={'primary'}
        icon={unmute ? 'mute' : 'unmute'}
        size={'lg'}
        circle
      />
    );
  }
}

export default injectIntl(withShortcut(MuteToggleBtn, 'Control+Alt+m'));
