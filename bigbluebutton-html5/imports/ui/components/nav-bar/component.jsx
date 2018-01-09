import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cx from 'classnames';
import { styles } from './styles.scss';
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
    id: 'app.navBar.toggleUserList.newMessages',
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

const closeBreakoutJoinConfirmation = (mountModal) =>
   mountModal(null);

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

  componentDidUpdate(oldProps) {
    const {
      breakouts,
      getBreakoutJoinURL,
      isBreakoutRoom,
    } = this.props;

    const hadBreakouts = oldProps.breakouts.length;
    const hasBreakouts = breakouts.length;

    if (!hasBreakouts && hadBreakouts) {
      closeBreakoutJoinConfirmation(this.props.mountModal);
    }

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

  inviteUserToBreakout(breakout, breakoutURL) {
    const {
      mountModal,
    } = this.props;

    this.setState({ didSendBreakoutInvite: true }, () => {
      openBreakoutJoinConfirmation.call(this, breakoutURL, breakout.name, mountModal);
    });
  }

  renderPresentationTitle() {
    const {
      breakouts,
      isBreakoutRoom,
      presentationTitle,
    } = this.props;

    if (isBreakoutRoom || !breakouts.length) {
      return (
        <h1 className={styles.presentationTitle}>{presentationTitle}</h1>
      );
    }

    return (
      <Dropdown isOpen={this.state.isActionsOpen}>
        <DropdownTrigger>
          <h1 className={cx(styles.presentationTitle, styles.dropdownBreakout)}>
            {presentationTitle} <Icon iconName="down-arrow" />
          </h1>
        </DropdownTrigger>
        <DropdownContent
          placement="bottom"
        >
          <DropdownList>
            {breakouts.map(breakout => this.renderBreakoutItem(breakout))}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
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
  render() {
    const { hasUnreadMessages, beingRecorded, isExpanded, intl } = this.props;

    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    return (
      <div className={styles.navbar}>
        <div className={styles.left}>
          <Button
            data-test="userListToggleButton"
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
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withModalMounter(injectIntl(NavBar));
