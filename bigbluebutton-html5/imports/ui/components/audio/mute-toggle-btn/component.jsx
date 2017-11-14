import React, { Component } from 'react';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import styles from '../audio-controls/styles';

const propTypes = {
  intl: intlShape.isRequired,
  disable: PropTypes.bool.isRequired,
  unmute: PropTypes.bool.isRequired,
  handleToggleMuteMicrophone: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  muteLabel: {
    id: 'app.actionsBar.muteLabel',
    description: 'mute label',
  },
  unmuteLabel: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'ummute label',
  },
});

class MuteToggleBtn extends Component {
  render() {
    const { handleToggleMuteMicrophone, disable, unmute, intl } = this.props;

    return (
      <Button
        className={styles.button}
        ref={(ref) => { this.ref = ref; }}
        onClick={handleToggleMuteMicrophone}
        disabled={disable}
        label={unmute
          ? intl.formatMessage(intlMessages.unmuteLabel)
          : intl.formatMessage(intlMessages.muteLabel)
        }
        color={'primary'}
        icon={unmute ? 'mute' : 'unmute'}
        size={'lg'}
        circle
      />
    );
  }
}

export default injectIntl(withShortcut(MuteToggleBtn, 'Control+Alt+m'));

MuteToggleBtn.propTypes = propTypes;
