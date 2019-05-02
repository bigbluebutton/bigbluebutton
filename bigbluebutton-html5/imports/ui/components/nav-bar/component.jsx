import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import _ from 'lodash';
import cx from 'classnames';
import Auth from '/imports/ui/services/auth';
import Icon from '/imports/ui/components/icon/component';
import BreakoutJoinConfirmation from '/imports/ui/components/breakout-join-confirmation/container';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles.scss';
import Button from '../button/component';
import RecordingIndicator from './recording-indicator/component';
import SettingsDropdownContainer from './settings-dropdown/container';

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
  recordingSession: {
    id: 'app.navBar.recording',
    description: 'label for when the session is being recorded',
  },
  recordingIndicatorOn: {
    id: 'app.navBar.recording.on',
    description: 'label for indicator when the session is being recorded',
  },
  recordingIndicatorOff: {
    id: 'app.navBar.recording.off',
    description: 'label for indicator when the session is not being recorded',
  },
  startTitle: {
    id: 'app.recording.startTitle',
    description: 'start recording title',
  },
  stopTitle: {
    id: 'app.recording.stopTitle',
    description: 'stop recording title',
  },
  resumeTitle: {
    id: 'app.recording.resumeTitle',
    description: 'resume recording title',
  },
});

const propTypes = {
  presentationTitle: PropTypes.string,
  hasUnreadMessages: PropTypes.bool,
  recordProps: PropTypes.shape({
    time: PropTypes.number,
    recording: PropTypes.bool,
  }),
  shortcuts: PropTypes.string,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  recordProps: {
    allowStartStopRecording: false,
    autoStartRecording: false,
    record: false,
    recording: false,
  },
  shortcuts: '',
};

const openBreakoutJoinConfirmation = (breakout, breakoutName, mountModal) => mountModal(
  <BreakoutJoinConfirmation
    breakout={breakout}
    breakoutName={breakoutName}
  />,
);

const closeBreakoutJoinConfirmation = mountModal => mountModal(null);

class NavBar extends PureComponent {
  static handleToggleUserList() {
    Session.set(
      'openPanel',
      Session.get('openPanel') !== ''
        ? ''
        : 'userlist',
    );
    Session.set('idChatOpen', '');
  }

  constructor(props) {
    super(props);

    this.state = {
      isActionsOpen: false,
      didSendBreakoutInvite: false,
      time: (props.recordProps.time ? props.recordProps.time : 0),
      amIModerator: props.amIModerator,
    };

    this.incrementTime = this.incrementTime.bind(this);
  }

  componentDidMount() {
    const {
      processOutsideToggleRecording,
      connectRecordingObserver,
    } = this.props;

    if (Meteor.settings.public.allowOutsideCommands.toggleRecording
      || getFromUserSettings('outsideToggleRecording', false)) {
      connectRecordingObserver();
      window.addEventListener('message', processOutsideToggleRecording);
    }
  }

  static getDerivedStateFromProps(nextProps) {
    return { amIModerator: nextProps.amIModerator };
  }

  componentDidUpdate(oldProps) {
    const {
      breakouts,
      isBreakoutRoom,
      mountModal,
      recordProps,
      currentBreakoutUser,
      getBreakoutByUser,
    } = this.props;

    if (!recordProps.recording) {
      clearInterval(this.interval);
      this.interval = null;
    } else if (this.interval === null) {
      this.interval = setInterval(this.incrementTime, 1000);
    }

    const {
      didSendBreakoutInvite,
    } = this.state;

    const hadBreakouts = oldProps.breakouts.length;
    const hasBreakouts = breakouts.length;
    if (!hasBreakouts && hadBreakouts) {
      closeBreakoutJoinConfirmation(mountModal);
    }

    if (hasBreakouts && currentBreakoutUser) {
      const currentIsertedTime = currentBreakoutUser.insertedTime;
      const oldCurrentUser = oldProps.currentBreakoutUser || {};
      const oldInsertedTime = oldCurrentUser.insertedTime;

      if (currentIsertedTime !== oldInsertedTime) {
        const breakoutRoom = getBreakoutByUser(currentBreakoutUser);
        this.inviteUserToBreakout(breakoutRoom);
      }
    }

    breakouts.forEach((breakout) => {
      const userOnMeeting = breakout.users.filter(u => u.userId === Auth.userID).length;
      if (breakout.freeJoin
        && !didSendBreakoutInvite
        && !userOnMeeting
        && !isBreakoutRoom) {
        this.inviteUserToBreakout(breakout);
        this.setState({ didSendBreakoutInvite: true });
      }

      if (!breakout.users) {
        return;
      }

      if (!userOnMeeting) return;

      if ((!didSendBreakoutInvite && !isBreakoutRoom)) {
        this.inviteUserToBreakout(breakout);
      }
    });

    if (!breakouts.length && didSendBreakoutInvite) {
      this.setState({ didSendBreakoutInvite: false });
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  inviteUserToBreakout(breakout) {
    const {
      mountModal,
    } = this.props;

    this.setState({ didSendBreakoutInvite: true }, () => {
      openBreakoutJoinConfirmation.call(this, breakout, breakout.name, mountModal);
    });
  }

  incrementTime() {
    const { recordProps } = this.props;
    const { time } = this.state;

    if (recordProps.time > time) {
      this.setState({ time: recordProps.time + 1 });
    } else {
      this.setState({ time: time + 1 });
    }
  }

  renderPresentationTitle() {
    const {
      breakouts,
      isBreakoutRoom,
      presentationTitle,
    } = this.props;

    const {
      isActionsOpen,
    } = this.state;

    if (isBreakoutRoom || !breakouts.length) {
      return (
        <h1 className={styles.presentationTitle}>{presentationTitle}</h1>
      );
    }
    const breakoutItems = breakouts.map(breakout => this.renderBreakoutItem(breakout));

    return (
      <Dropdown isOpen={isActionsOpen}>
        <DropdownTrigger>
          <h1 className={cx(styles.presentationTitle, styles.dropdownBreakout)}>
            {presentationTitle}
            {' '}
            <Icon iconName="down-arrow" />
          </h1>
        </DropdownTrigger>
        <DropdownContent
          placement="bottom"
        >
          <DropdownList>
            {breakoutItems}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }

  renderBreakoutItem(breakout) {
    const {
      mountModal,
    } = this.props;

    const breakoutName = breakout.name;

    return (
      <DropdownListItem
        key={_.uniqueId('action-header')}
        label={breakoutName}
        onClick={
          openBreakoutJoinConfirmation.bind(this, breakout, breakoutName, mountModal)
        }
      />
    );
  }

  render() {
    const {
      hasUnreadMessages,
      recordProps,
      isExpanded,
      intl,
      shortcuts: TOGGLE_USERLIST_AK,
      mountModal,
    } = this.props;

    const recordingMessage = recordProps.recording ? 'recordingIndicatorOn' : 'recordingIndicatorOff';

    const { time, amIModerator } = this.state;

    let recordTitle;

    if (!this.interval) {
      this.interval = setInterval(this.incrementTime, 1000);
    }

    if (!recordProps.recording) {
      recordTitle = recordProps.time >= 0 ? intl.formatMessage(intlMessages.resumeTitle)
        : intl.formatMessage(intlMessages.startTitle);
    } else {
      recordTitle = intl.formatMessage(intlMessages.stopTitle);
    }

    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    let ariaLabel = intl.formatMessage(intlMessages.toggleUserListAria);
    ariaLabel += hasUnreadMessages ? (` ${intl.formatMessage(intlMessages.newMessages)}`) : '';

    return (
      <div className={styles.navbar}>
        <div className={styles.left}>
          <Button
            data-test="userListToggleButton"
            onClick={NavBar.handleToggleUserList}
            ghost
            circle
            hideLabel
            label={intl.formatMessage(intlMessages.toggleUserListLabel)}
            aria-label={ariaLabel}
            icon="user"
            className={cx(toggleBtnClasses)}
            aria-expanded={isExpanded}
            accessKey={TOGGLE_USERLIST_AK}
          />
        </div>
        <div className={styles.center}>
          {this.renderPresentationTitle()}
          {recordProps.record
            ? <span className={styles.presentationTitleSeparator} aria-hidden>|</span>
            : null}
          <RecordingIndicator
            {...recordProps}
            title={intl.formatMessage(intlMessages[recordingMessage])}
            buttonTitle={recordTitle}
            mountModal={mountModal}
            time={time}
            amIModerator={amIModerator}
          />
        </div>
        <div className={styles.right}>
          <SettingsDropdownContainer amIModerator={amIModerator} />
        </div>
      </div>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(NavBar)), 'toggleUserList');
