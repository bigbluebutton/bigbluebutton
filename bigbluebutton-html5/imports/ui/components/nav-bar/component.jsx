import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import cx from 'classnames';
import { withModalMounter } from '/imports/ui/components/modal/service';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles.scss';
import Button from '../button/component';
import RecordingIndicator from './recording-indicator/container';
import TalkingIndicatorContainer from '/imports/ui/components/nav-bar/talking-indicator/container';
import SettingsDropdownContainer from './settings-dropdown/container';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const intlMessages = defineMessages({
  toggleUserListLabel: {
    id: 'app.navBar.userListToggleBtnLabel',
    description: 'Toggle button label',
  },
  toggleUserListAria: {
    id: 'app.navBar.toggleUserList.ariaLabel',
    description: 'description of the lists inside the userlist',
  },
  newMessages: {
    id: 'app.navBar.toggleUserList.newMessages',
    description: 'label for toggleUserList btn when showing red notification',
  },
});

const propTypes = {
  presentationTitle: PropTypes.string,
  hasUnreadMessages: PropTypes.bool,
  shortcuts: PropTypes.string,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  shortcuts: '',
};

const handleClickToggleChat = (id) => {
  Session.set(
    'openPanel',
    Session.get('openPanel') === 'chat' && Session.get('idChatOpen') === id
      ? '' : 'chat',
  );
  if (Session.equals('openPanel', 'chat')) {
    Session.set('idChatOpen', id);
  } else {
    Session.set('idChatOpen', '');
  }
};

class NavBar extends PureComponent {
  componentDidMount() {
    const {
      processOutsideToggleRecording,
      connectRecordingObserver,
    } = this.props;

    if (Meteor.settings.public.allowOutsideCommands.toggleRecording
      || getFromUserSettings('bbb_outside_toggle_recording', false)) {
      connectRecordingObserver();
      window.addEventListener('message', processOutsideToggleRecording);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const {
      hasUnreadMessages,
      isExpanded,
      intl,
      shortcuts: TOGGLE_CHAT_PUB_AK,
      mountModal,
      presentationTitle,
      amIModerator,
      breakoutRoomName,
      currentUser,
    } = this.props;

    const isBreakOutMeeting = meetingIsBreakout();
    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    let ariaLabel = intl.formatMessage(intlMessages.toggleUserListAria);
    ariaLabel += hasUnreadMessages ? (` ${intl.formatMessage(intlMessages.newMessages)}`) : '';

    return (
      <div className={styles.navbar}>
        <div className={styles.top}>
          <div className={styles.left}>
            <Button
              data-test="chatButton"
              onClick={() => handleClickToggleChat('public')}
              circle
              hideLabel
              label={intl.formatMessage(intlMessages.toggleUserListLabel)}
              icon="user"
              className={cx(toggleBtnClasses)}
              aria-expanded={isExpanded}
              accessKey={TOGGLE_CHAT_PUB_AK}
            />
            <span className={styles.presentationTitle}>{presentationTitle}</span>
            <RecordingIndicator
              mountModal={mountModal}
              amIModerator={amIModerator}
            />
          </div>
          <div className={styles.center}>
          </div>
          <div className={styles.right}>
 <div className={styles.both}>
   <b ><span >{currentUser.name}</span></b>
   {(breakoutRoomName && !amIModerator) ?
    <p >
      <span >
        (
          {breakoutRoomName}
        )
      </span>
    </p> :
    ( amIModerator && !isBreakOutMeeting ? <span>(moderator)</span> : null)}
   
    </div> 
            <SettingsDropdownContainer amIModerator={amIModerator} />
          </div>
        </div>
      </div>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(NavBar)), 'toggleUserList');
