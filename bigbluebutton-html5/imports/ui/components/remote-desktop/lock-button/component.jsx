import React, { memo, Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles';

const START_VIEWONLY = Meteor.settings.public.remoteDesktop.startLocked;

const intlMessages = defineMessages({
  lockDesktop: {
    id: 'app.remoteDesktop.lockDesktop',
    description: 'Lock remote desktop button label',
  },
  unlockDesktop: {
    id: 'app.remoteDesktop.unlockDesktop',
    description: 'Unlock remote desktop button label',
  },
  lockDesktopButtonDesc: {
    id: 'app.remoteDesktop.lockDesktopButtonDesc',
    description: 'Lock remote desktop button description',
  },
});

/* There's some serious violation of component isolation in the design
 * here, but "it works for now".  The remote desktop component (well
 * removed from this button component in the inheritance hierarchy)
 * saves a reference to itself in window.VncDisplay, and it's by
 * accessing that reference that we determine the lock state of the
 * desktop and toggle it back and forth.  Also, VncDisplay does not
 * expose any methods to manipulate its lock state, so we dig down
 * into its internals to access the viewOnly variable on its rfb
 * object.
 *
 * We keep a local version of viewOnly in this.state.desktopLocked
 * because changing this.state triggers a re-render of the component,
 * and that's how we make the button change its visible state.
 */

const propTypes = {
  intl: PropTypes.object.isRequired,
};

class LockRemoteDesktopButton extends Component {
  constructor(props) {
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.state = {
      desktopLocked: (((window.VncDisplay === undefined) || (window.VncDisplay === null))
        ? START_VIEWONLY
        : window.VncDisplay.rfb.viewOnly),
    };
  }

  handleOnClick() {
    if ((window.VncDisplay !== undefined) && (window.VncDisplay !== null)) {
      window.VncDisplay.rfb.viewOnly = !window.VncDisplay.rfb.viewOnly;
      this.setState({ desktopLocked: window.VncDisplay.rfb.viewOnly });
    }
  }

  render() {
    const { intl } = this.props;
    const { desktopLocked } = this.state;

    const label = desktopLocked
      ? intl.formatMessage(intlMessages.unlockDesktop)
      : intl.formatMessage(intlMessages.lockDesktop);

    return (
      <Button
        label={label}
        className={cx(styles.button, !desktopLocked || styles.btn)}
        onClick={this.handleOnClick}
        hideLabel
        aria-label={intl.formatMessage(intlMessages.lockDesktopButtonDesc)}
        color={!desktopLocked ? 'primary' : 'default'}
        icon={!desktopLocked ? 'desktop' : 'desktop_off'}
        ghost={desktopLocked}
        size="lg"
        circle
      />
    );
  }
}

LockRemoteDesktopButton.propTypes = propTypes;

export default injectIntl(memo(LockRemoteDesktopButton));
