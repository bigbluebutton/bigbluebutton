import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cx from 'classnames';
import styles from './styles.scss';
import Button from '../button/component';
import RecordingIndicator from './recording-indicator/component';
import SettingsDropdownContainer from './settings-dropdown/container';
import Icon from '/imports/ui/components/icon/component';
import BreakoutJoinConfirmation from '/imports/ui/components/breakout-join-confirmation/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { defineMessages, injectIntl } from 'react-intl';

const intlMessages = defineMessages({
  toggleUserListLabel: {
    id: 'app.navBar.userListToggleBtnLabel',
    description: 'Toggle button label',
  },
  newMessages: {
    id: 'app.navbar.toggleUserList.newMessages',
    description: 'label for toggleUserList btn when showing red notification',
  },
});

const propTypes = {
  presentationTitle: PropTypes.string.isRequired,
  hasUnreadMessages: PropTypes.bool.isRequired,
  beingRecorded: PropTypes.bool.isRequired,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  beingRecorded: false,
};

const openBreakoutJoinConfirmation = (breakoutURL, breakoutName, mountModal) =>
  mountModal(<BreakoutJoinConfirmation
    breakoutURL={breakoutURL}
    breakoutName={breakoutName}
  />);

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isActionsOpen: false,
      didSendBreakoutInvite: false,
    };

    this.handleToggleUserList = this.handleToggleUserList.bind(this);
  }

  componendDidMount() {
    document.title = this.props.presentationTitle;
  }

  handleToggleUserList() {
    this.props.toggleUserList();
  }

  inviteUserToBreakout(breakout, breakoutURL) {
    const {
      mountModal,
    } = this.props;

    this.setState({ didSendBreakoutInvite: true }, () => {
      openBreakoutJoinConfirmation.call(this, breakoutURL, breakout.name, mountModal);
    });
  }

  render() {
    const {
      hasUnreadMessages,
      beingRecorded,
      isExpanded,
      intl,
      breakouts,
    } = this.props;

    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    const isIosApp = window.navigator.userAgent === 'BigBlueButton';

    return (
      <div className={styles.navbar}>
        <div className={styles.left}>
          <Button
            onClick={this.handleToggleUserList}
            ghost
            circle
            hideLabel
            label={intl.formatMessage(intlMessages.toggleUserListLabel)}
            icon={'user'}
            className={cx(toggleBtnClasses)}
            aria-expanded={isExpanded}
            aria-describedby="newMessage"
          />
          <div
            id="newMessage"
            aria-label={hasUnreadMessages ? intl.formatMessage(intlMessages.newMessages) : null}
          />
        </div>
        <div className={styles.center} role="banner">
          {this.renderPresentationTitle()}
          <RecordingIndicator beingRecorded={beingRecorded} />
        </div>
        <div className={styles.right}>
          <SettingsDropdownContainer />
        </div>
      </div>
    );
  }

  renderPresentationTitle() {
    const {
      breakouts,
      isBreakoutRoom,
      presentationTitle,
    } = this.props;

    if (!breakouts.length || (window.navigator.userAgent != "BigBlueButton" && isBreakoutRoom)) {
      return (
        <h1 className={styles.presentationTitle}>{presentationTitle}</h1>
      );
    }

    return (
      <Dropdown
        isOpen={this.state.isActionsOpen}
        ref="dropdown"
      >
        <DropdownTrigger>
          <h1 className={cx(styles.presentationTitle, styles.dropdownBreakout)}>
            {presentationTitle} <Icon iconName="up_arrow upside-down" />
          </h1>
        </DropdownTrigger>
        <DropdownContent
          placement="bottom"
        >
          <DropdownList>
            {breakouts.map(breakout => this.renderItem(breakout))}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }

  componentDidUpdate() {
    const {
      breakouts,
      getBreakoutJoinURL,
      isBreakoutRoom,
    } = this.props;

    breakouts.forEach((breakout) => {
      if (!breakout.users) {
        return;
      }

      const breakoutURL = getBreakoutJoinURL(breakout);

      if (!this.state.didSendBreakoutInvite && !isBreakoutRoom) {
        this.inviteUserToBreakout(breakout, breakoutURL);
      }
    });

    if (!breakouts.length && this.state.didSendBreakoutInvite) {
      this.setState({ didSendBreakoutInvite: false });
    }
  }

  renderItem(breakout) {
    const {
      isBreakoutRoom,
    } = this.props;
    if (isBreakoutRoom) {
      return this.renderMainRoomItem('');
    }else {
      return this.renderBreakoutItem(breakout);
    }
  }

  renderMainRoomItem(mainURL) {
    const {
      getBreakoutJoinURL,
      mountModal,
    } = this.props;

    const roomName = 'Main Room';

    return (
      <DropdownListItem
        className={styles.actionsHeader}
        key={_.uniqueId('action-header')}
        label={roomName}
        onClick={openBreakoutJoinConfirmation.bind(this, mainURL, roomName, mountModal)}
      />
    );
  }

  renderBreakoutItem(breakout) {
    const {
      getBreakoutJoinURL,
      mountModal,
    } = this.props;

    const breakoutName = breakout.name;
    const breakoutURL = getBreakoutJoinURL(breakout);

    return (
      <DropdownListItem
        className={styles.actionsHeader}
        key={_.uniqueId('action-header')}
        label={breakoutName}
        onClick={openBreakoutJoinConfirmation.bind(this, breakoutURL, breakoutName, mountModal)}
      />
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withModalMounter(injectIntl(NavBar));
