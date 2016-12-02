import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import Button from '../button/component';
import RecordButton from './recordbutton/component';
import SettingsDropdown from './settings-dropdown/component';
import Icon from '/imports/ui/components/icon/component';
import { showModal } from '/imports/ui/components/app/service';
import BreakoutJoinConfirmation from '/imports/ui/components/breakout-join-confirmation/component';
import _ from 'underscore';

import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';

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

const openBreakoutJoinConfirmation = (breakoutURL, breakoutName) =>
          showModal(<BreakoutJoinConfirmation
                        breakoutURL={breakoutURL}
                        breakoutName={breakoutName}/>);

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
    this.setState({ didSendBreakoutInvite: true }, () => {
      openBreakoutJoinConfirmation.call(this, breakoutURL, breakout.name);
    });
  }

  render() {
    const { hasUnreadMessages, beingRecorded } = this.props;

    return (
      <div className={styles.navbar}>
        <div className={styles.left}>
        <Button
          onClick={this.handleToggleUserList}
          ghost={true}
          circle={true}
          hideLabel={true}
          label={'Toggle User-List'}
          icon={'user'}
          className={styles.btn}
        />
        </div>
        {hasUnreadMessages ? <span className={styles.withdot}></span> : null}
        <div className={styles.center}>
          {this.renderPresentationTitle()}
          <span className={styles.divideBar}> | </span>
          <div className={styles.record}>
            <RecordButton beingRecorded={beingRecorded}/>
          </div>
        </div>
        <div className={styles.right}>
          <SettingsDropdown />
        </div>
      </div>
    );
  }

  renderPresentationTitle() {
    const {
      meetingId,
      currentUserId,
    } = this.props;

    const presentationTitle = this.props.presentationTitle;
    const breakouts = this.props.breakouts;
    const isMeetingBreakout = breakouts.find(b => b.breakoutMeetingId === meetingId);

    if (!breakouts.length || isMeetingBreakout) {
      return (
        <h1 className={styles.presentationTitle}>{presentationTitle}</h1>
      );
    }

    return (
      <Dropdown
        isOpen={this.state.isActionsOpen}
        ref="dropdown">
        <DropdownTrigger className={styles.dropdownTrigger}>
          <h1 className={styles.presentationTitle}>
            {presentationTitle} <Icon iconName='down-arrow'/>
          </h1>
        </DropdownTrigger>
        <DropdownContent
          placement="bottom">
          <DropdownList>
            {breakouts.map(breakout => this.renderBreakoutItem(breakout))}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }

  componentDidUpdate() {
    const {
      breakouts,
      currentUserId,
      meetingId,
      getBreakoutJoinURL,
    } = this.props;

    breakouts.forEach(breakout => {
      if (!breakout.users) {
        return;
      }

      const breakoutURL = getBreakoutJoinURL(breakout);

      const meetingIsBreakout = meetingId === breakout.breakoutMeetingId;
      if (!this.state.didSendBreakoutInvite && !meetingIsBreakout) {
        this.inviteUserToBreakout(breakout, breakoutURL);
      }
    });

    if (!breakouts.length && this.state.didSendBreakoutInvite) {
      this.setState({ didSendBreakoutInvite: false });
    }
  }

  renderBreakoutItem(breakout) {
    const {
      getBreakoutJoinURL,
    } = this.props;

    const breakoutName = breakout.name;
    const breakoutURL = getBreakoutJoinURL(breakout);

    return (
      <DropdownListItem
        className={styles.actionsHeader}
        key={_.uniqueId('action-header')}
        label={breakoutName}
        onClick={openBreakoutJoinConfirmation.bind(this, breakoutURL, breakout.name)}
        defaultMessage={'batata'}/>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;

export default NavBar;
