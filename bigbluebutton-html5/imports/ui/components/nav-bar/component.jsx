import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import Button from '../button/component';
import RecordButton from './recordbutton/component';
import SettingsDropdown from './settings-dropdown/component';
import Icon from '/imports/ui/components/icon/component';
import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
import { showModal } from '/imports/ui/components/app/service';
import BreakoutJoinConfirmation from '/imports/ui/components/breakout-join-confirmation/component';

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

const openBreakoutJoinConfirmation = breakoutURL =>
          showModal(<BreakoutJoinConfirmation breakoutURL={breakoutURL}/>);

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isActionsOpen: false,
    };

    this.handleToggleUserList = this.handleToggleUserList.bind(this);
  }

  handleToggleUserList() {
    this.props.toggleUserList();
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
    const { presentationTitle } = this.props;
    let { breakouts } = this.props;
    document.title = presentationTitle;

    const currentUserId = Auth.getCredentials().requesterUserId;
    breakouts = breakouts.filter(breakout => {
      if (!breakout.users) {
        return false;
      }

      return breakout.users.some(user => user.userId === currentUserId);
    });

    if (!breakouts.length) {
      return (
        <h1 className={styles.presentationTitle}>{presentationTitle}</h1>
      );
    }

    return (
      <Dropdown
        isOpen={this.state.isActionsOpen}
        ref="dropdown">
        <DropdownTrigger className={styles.DropdownTrigger}>
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

  renderBreakoutItem(breakout) {
    const breakoutName = breakout.name;

    openBreakoutJoinConfirmation(this.getBreakoutJoinUrl(breakout));
    return (
      <DropdownListItem
        className={styles.actionsHeader}
        key={_.uniqueId('action-header')}
        label={breakoutName}
        onClick={openBreakoutJoinConfirmation.bind(this, this.getBreakoutJoinUrl(breakout))}
        defaultMessage={'batata'}/>
    );
  }

  getBreakoutJoinUrl(breakout) {
    const currentUserId = Auth.getCredentials().requesterUserId;
    const users = breakout.users.find(user => user.userId === currentUserId);
    if (users) {
      const urlParams = users.urlParams;
      return [
        window.origin,
        'html5client/join',
        urlParams.meetingId,
        urlParams.userId,
        urlParams.authToken,
      ].join('/');
    }
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;

export default NavBar;
