import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import _ from 'lodash';
import cx from 'classnames';
import browser from 'browser-detect';
import Button from '/imports/ui/components/button/component';
import { Session } from 'meteor/session';
import Modal from '/imports/ui/components/modal/fullscreen/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import HoldButton from '/imports/ui/components/presentation/presentation-toolbar/zoom-tool/holdButton/component';
import SortList from './sort-user-list/component';
import styles from './styles';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const intlMessages = defineMessages({
  breakoutRoomTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'modal title',
  },
  breakoutRoomDesc: {
    id: 'app.createBreakoutRoom.modalDesc',
    description: 'modal description',
  },
  confirmButton: {
    id: 'app.createBreakoutRoom.confirm',
    description: 'confirm button label',
  },
  dismissLabel: {
    id: 'app.presentationUploder.dismissLabel',
    description: 'used in the button that close modal',
  },
  numberOfRooms: {
    id: 'app.createBreakoutRoom.numberOfRooms',
    description: 'number of rooms label',
  },
  duration: {
    id: 'app.createBreakoutRoom.durationInMinutes',
    description: 'duration time label',
  },
  randomlyAssign: {
    id: 'app.createBreakoutRoom.randomlyAssign',
    description: 'randomly assign label',
  },
  roomName: {
    id: 'app.createBreakoutRoom.roomName',
    description: 'room intl to name the breakout meetings',
  },
  freeJoinLabel: {
    id: 'app.createBreakoutRoom.freeJoin',
    description: 'free join label',
  },
  roomLabel: {
    id: 'app.createBreakoutRoom.room',
    description: 'Room label',
  },
  leastOneWarnBreakout: {
    id: 'app.createBreakoutRoom.leastOneWarnBreakout',
    description: 'warn message label',
  },
  notAssigned: {
    id: 'app.createBreakoutRoom.notAssigned',
    description: 'Not assigned label',
  },
  breakoutRoomLabel: {
    id: 'app.createBreakoutRoom.breakoutRoomLabel',
    description: 'breakout room label',
  },
  addParticipantLabel: {
    id: 'app.createBreakoutRoom.addParticipantLabel',
    description: 'add Participant label',
  },
  nextLabel: {
    id: 'app.createBreakoutRoom.nextLabel',
    description: 'Next label',
  },
  backLabel: {
    id: 'app.audio.backLabel',
    description: 'Back label',
  },
  invitationTitle: {
    id: 'app.invitation.title',
    description: 'isInvitationto breakout title',
  },
  invitationConfirm: {
    id: 'app.invitation.confirm',
    description: 'Invitation to breakout confirm button label',
  },
  minusRoomTime: {
    id: 'app.createBreakoutRoom.minusRoomTime',
    description: 'aria label for btn to decrease room time',
  },
  addRoomTime: {
    id: 'app.createBreakoutRoom.addRoomTime',
    description: 'aria label for btn to increase room time',
  },
  record: {
    id: 'app.createBreakoutRoom.record',
    description: 'label for checkbox to allow record',
  },
  roomTime: {
    id: 'app.createBreakoutRoom.roomTime',
    description: 'used to provide current room time for aria label',
  },
  numberOfRoomsIsValid: {
    id: 'app.createBreakoutRoom.numberOfRoomsError',
    description: 'Label an error message',
  },
});

const BREAKOUT_LIM = Meteor.settings.public.app.breakoutRoomLimit;
const MIN_BREAKOUT_ROOMS = 2;
const MAX_BREAKOUT_ROOMS = BREAKOUT_LIM > MIN_BREAKOUT_ROOMS ? BREAKOUT_LIM : MIN_BREAKOUT_ROOMS;

const propTypes = {
  intl: intlShape.isRequired,
  isInvitation: PropTypes.bool.isRequired,
  meetingName: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  createBreakoutRoom: PropTypes.func.isRequired,
  getUsersNotAssigned: PropTypes.func.isRequired,
  getBreakouts: PropTypes.func.isRequired,
  sendInvitation: PropTypes.func.isRequired,
  mountModal: PropTypes.func.isRequired,
  isBreakoutRecordable: PropTypes.bool.isRequired,
};

class BreakoutRoom extends PureComponent {
  constructor(props) {
    super(props);
    this.changeNumberOfRooms = this.changeNumberOfRooms.bind(this);
    this.changeDurationTime = this.changeDurationTime.bind(this);
    this.changeUserRoom = this.changeUserRoom.bind(this);
    this.increaseDurationTime = this.increaseDurationTime.bind(this);
    this.decreaseDurationTime = this.decreaseDurationTime.bind(this);
    this.onCreateBreakouts = this.onCreateBreakouts.bind(this);
    this.setRoomUsers = this.setRoomUsers.bind(this);
    this.setFreeJoin = this.setFreeJoin.bind(this);
    this.getUserByRoom = this.getUserByRoom.bind(this);
    this.onAssignRandomly = this.onAssignRandomly.bind(this);
    this.onInviteBreakout = this.onInviteBreakout.bind(this);
    this.renderUserItemByRoom = this.renderUserItemByRoom.bind(this);
    this.renderRoomsGrid = this.renderRoomsGrid.bind(this);
    this.renderBreakoutForm = this.renderBreakoutForm.bind(this);
    this.renderCheckboxes = this.renderCheckboxes.bind(this);
    this.renderRoomSortList = this.renderRoomSortList.bind(this);
    this.renderDesktop = this.renderDesktop.bind(this);
    this.renderMobile = this.renderMobile.bind(this);
    this.renderButtonSetLevel = this.renderButtonSetLevel.bind(this);
    this.renderSelectUserScreen = this.renderSelectUserScreen.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.setInvitationConfig = this.setInvitationConfig.bind(this);
    this.setRecord = this.setRecord.bind(this);
    this.blurDurationTime = this.blurDurationTime.bind(this);
    this.removeRoomUsers = this.removeRoomUsers.bind(this);
    this.renderErrorMessages = this.renderErrorMessages.bind(this);

    this.state = {
      numberOfRooms: MIN_BREAKOUT_ROOMS,
      seletedId: '',
      users: [],
      durationTime: 15,
      freeJoin: false,
      formFillLevel: 1,
      roomSelected: 0,
      preventClosing: true,
      valid: true,
      record: false,
      numberOfRoomsIsValid: true,
    };

    this.btnLevelId = _.uniqueId('btn-set-level-');
  }

  componentDidMount() {
    const { isInvitation } = this.props;
    this.setRoomUsers();
    if (isInvitation) {
      this.setInvitationConfig();
    }
  }

  componentDidUpdate(prevProps, prevstate) {
    const { numberOfRooms } = this.state;
    const { users } = this.props;
    const { users: prevUsers } = prevProps;
    if (numberOfRooms < prevstate.numberOfRooms) {
      this.resetUserWhenRoomsChange(numberOfRooms);
    }
    const usersCount = users.length;
    const prevUsersCount = prevUsers.length;
    if (usersCount > prevUsersCount) {
      this.setRoomUsers();
    }

    if (usersCount < prevUsersCount) {
      this.removeRoomUsers();
    }
  }

  onCreateBreakouts() {
    const {
      createBreakoutRoom,
      meetingName,
      intl,
    } = this.props;
    const {
      users,
      freeJoin,
      record,
      numberOfRoomsIsValid,
    } = this.state;

    if (users.length === this.getUserByRoom(0).length && !freeJoin) {
      this.setState({ valid: false });
      return;
    }

    if (!numberOfRoomsIsValid) {
      return;
    }

    this.setState({ preventClosing: false });
    const { numberOfRooms, durationTime } = this.state;
    const rooms = _.range(1, numberOfRooms + 1).map(value => ({
      users: this.getUserByRoom(value).map(u => u.userId),
      name: intl.formatMessage(intlMessages.roomName, {
        0: meetingName,
        1: value,
      }),
      freeJoin,
      sequence: value,
    }));

    createBreakoutRoom(rooms, durationTime, record);
    Session.set('isUserListOpen', true);
  }

  onInviteBreakout() {
    const { getBreakouts, sendInvitation } = this.props;
    const { users } = this.state;
    const breakouts = getBreakouts();
    if (users.length === this.getUserByRoom(0).length) {
      this.setState({ valid: false });
      return;
    }

    breakouts.forEach((breakout) => {
      const { breakoutId } = breakout;
      const breakoutUsers = this.getUserByRoom(breakout.sequence);
      breakoutUsers.forEach(user => sendInvitation(breakoutId, user.userId));
    });

    this.setState({ preventClosing: false });
  }

  onAssignRandomly() {
    const { numberOfRooms } = this.state;
    const { users } = this.state;
    // We only want to assign viewers so filter out the moderators. We also want to get
    // all users each run so that clicking the button again will reshuffle
    const viewers = users.filter(user => !user.isModerator);
    // We want to keep assigning users until all viewers have been assigned a room
    while (viewers.length > 0) {
      // We cycle through the rooms picking one user for each room so that the rooms
      // will have an equal number of people in each one
      for (let i = 1; i <= numberOfRooms && viewers.length > 0; i += 1) {
        // Select a random user for the room
        const userIdx = Math.floor(Math.random() * (viewers.length));
        this.changeUserRoom(viewers[userIdx].userId, i);
        // Remove the picked user so they aren't selected again
        viewers.splice(userIdx, 1);
      }
    }
  }


  setInvitationConfig() {
    const { getBreakouts } = this.props;
    this.setState({
      numberOfRooms: getBreakouts().length,
      formFillLevel: 2,
    });
  }

  setRoomUsers() {
    const { users, getUsersNotAssigned } = this.props;
    const { users: stateUsers } = this.state;
    const stateUsersId = stateUsers.map(user => user.userId);
    const roomUsers = getUsersNotAssigned(users)
      .filter(user => !stateUsersId.includes(user.userId))
      .map(user => ({
        userId: user.userId,
        userName: user.name,
        isModerator: user.role === ROLE_MODERATOR,
        room: 0,
      }));

    this.setState({
      users: [
        ...stateUsers,
        ...roomUsers,
      ],
    });
  }

  setFreeJoin(e) {
    this.setState({ freeJoin: e.target.checked, valid: true });
  }

  setRecord(e) {
    this.setState({ record: e.target.checked });
  }

  getUserByRoom(room) {
    const { users } = this.state;
    return users.filter(user => user.room === room);
  }

  removeRoomUsers() {
    const { users } = this.props;
    const { users: stateUsers } = this.state;
    const userIds = users.map(user => user.userId);
    const removeUsers = stateUsers.filter(user => userIds.includes(user.userId));

    this.setState({
      users: removeUsers,
    });
  }

  handleDismiss() {
    const { mountModal } = this.props;

    return new Promise((resolve) => {
      mountModal(null);

      this.setState({
        preventClosing: false,
      }, resolve);
    });
  }

  resetUserWhenRoomsChange(rooms) {
    const { users } = this.state;
    const filtredUsers = users.filter(u => u.room > rooms);
    filtredUsers.forEach(u => this.changeUserRoom(u.userId, 0));
  }

  changeUserRoom(userId, room) {
    const { users } = this.state;

    const idxUser = users.findIndex(user => user.userId === userId);

    const usersCopy = [...users];

    usersCopy[idxUser].room = room;

    this.setState({
      users: usersCopy,
      valid: this.getUserByRoom(0).length !== users.length,
    });
  }

  increaseDurationTime() {
    const { durationTime } = this.state;
    this.setState({ durationTime: (1 * durationTime) + 1 });
  }

  decreaseDurationTime() {
    const { durationTime } = this.state;
    const number = ((1 * durationTime) - 1);
    this.setState({ durationTime: number < 1 ? 1 : number });
  }

  changeDurationTime(event) {
    this.setState({ durationTime: Number.parseInt(event.target.value, 10) || '' });
  }

  blurDurationTime(event) {
    const value = Number.parseInt(event.target.value, 10);
    this.setState({ durationTime: !(value <= 0) ? value : 1 });
  }

  changeNumberOfRooms(event) {
    const numberOfRooms = Number.parseInt(event.target.value, 10);
    this.setState({
      numberOfRooms,
      numberOfRoomsIsValid: numberOfRooms <= MAX_BREAKOUT_ROOMS
      && numberOfRooms >= MIN_BREAKOUT_ROOMS,
    });
  }

  renderRoomsGrid() {
    const { intl } = this.props;
    const {
      valid,
      numberOfRooms,
    } = this.state;
    const rooms = (numberOfRooms > MAX_BREAKOUT_ROOMS
      || numberOfRooms < MIN_BREAKOUT_ROOMS)
      ? 0 : numberOfRooms;
    const allowDrop = (ev) => {
      ev.preventDefault();
    };

    const drop = room => (ev) => {
      ev.preventDefault();
      const data = ev.dataTransfer.getData('text');
      this.changeUserRoom(data, room);
      this.setState({ seletedId: '' });
    };

    return (
      <div className={styles.boxContainer} key="rooms-grid-">
        <div className={!valid ? styles.changeToWarn : null}>
          <p className={styles.freeJoinLabel}>
            {intl.formatMessage(intlMessages.notAssigned, { 0: this.getUserByRoom(0).length })}
          </p>
          <div className={styles.breakoutBox} onDrop={drop(0)} onDragOver={allowDrop}>
            {this.renderUserItemByRoom(0)}
          </div>
          <span className={valid ? styles.dontShow : styles.leastOneWarn}>
            {intl.formatMessage(intlMessages.leastOneWarnBreakout)}
          </span>
        </div>
        {
          _.range(1, rooms + 1).map(value => (
            <div key={`room-${value}`}>
              <p className={styles.freeJoinLabel}>
                {intl.formatMessage(intlMessages.roomLabel, { 0: (value) })}
              </p>
              <div className={styles.breakoutBox} onDrop={drop(value)} onDragOver={allowDrop}>
                {this.renderUserItemByRoom(value)}
              </div>
            </div>
          ))
        }
      </div>
    );
  }

  renderBreakoutForm() {
    const {
      intl,
      isInvitation,
    } = this.props;
    const {
      numberOfRooms,
      durationTime,
      numberOfRoomsIsValid,
    } = this.state;
    if (isInvitation) return null;

    return (
      <React.Fragment key="breakout-form">
        <div className={styles.breakoutSettings}>
          <div>
            <p
              className={cx(styles.labelText, !numberOfRoomsIsValid
                && styles.withError)}
              aria-hidden
            >
              {intl.formatMessage(intlMessages.numberOfRooms)}
            </p>
            <select
              id="numberOfRooms"
              name="numberOfRooms"
              className={cx(styles.inputRooms, !numberOfRoomsIsValid
                && styles.errorBorder)}
              value={numberOfRooms}
              onChange={this.changeNumberOfRooms}
              aria-label={intl.formatMessage(intlMessages.numberOfRooms)}
            >
              {
                _.range(MIN_BREAKOUT_ROOMS, MAX_BREAKOUT_ROOMS + 1).map(item => (<option key={_.uniqueId('value-')}>{item}</option>))
              }
            </select>
          </div>
          <label htmlFor="breakoutRoomTime">
            <p className={styles.labelText} aria-hidden>
              {intl.formatMessage(intlMessages.duration)}
            </p>
            <div className={styles.durationArea}>
              <input
                type="number"
                className={styles.duration}
                min="1"
                value={durationTime}
                onChange={this.changeDurationTime}
                onBlur={this.blurDurationTime}
                aria-label={intl.formatMessage(intlMessages.duration)}
              />
              <HoldButton
                key="decrease-breakout-time"
                exec={this.decreaseDurationTime}
                minBound={MIN_BREAKOUT_ROOMS}
                value={durationTime}
                className={styles.btnStyle}
              >
                <Button
                  label={intl.formatMessage(intlMessages.minusRoomTime)}
                  aria-label={
                    `${intl.formatMessage(intlMessages.minusRoomTime)} ${intl.formatMessage(intlMessages.roomTime, { 0: durationTime - 1 })}`
                  }
                  icon="substract"
                  onClick={() => {}}
                  hideLabel
                  circle
                  size="sm"
                />
              </HoldButton>
              <HoldButton
                key="increase-breakout-time"
                exec={this.increaseDurationTime}
                className={styles.btnStyle}
              >
                <Button
                  label={intl.formatMessage(intlMessages.addRoomTime)}
                  aria-label={
                    `${intl.formatMessage(intlMessages.addRoomTime)} ${intl.formatMessage(intlMessages.roomTime, { 0: durationTime + 1 })}`
                  }
                  icon="add"
                  onClick={() => {}}
                  hideLabel
                  circle
                  size="sm"
                />
              </HoldButton>
            </div>
          </label>
          <Button
            label={intl.formatMessage(intlMessages.randomlyAssign)}
            className={styles.randomlyAssignBtn}
            onClick={this.onAssignRandomly}
            size="sm"
            color="default"
            disabled={!numberOfRoomsIsValid}
          />
        </div>
        <span className={!numberOfRoomsIsValid
          ? styles.withError : styles.dontShow}
        >
          {intl.formatMessage(intlMessages.numberOfRoomsIsValid)}
        </span>
      </React.Fragment>
    );
  }

  renderSelectUserScreen() {
    const {
      users,
      roomSelected,
    } = this.state;
    return (
      <SortList
        confirm={() => this.setState({ formFillLevel: 2 })}
        users={users}
        room={roomSelected}
        onCheck={this.changeUserRoom}
        onUncheck={userId => this.changeUserRoom(userId, 0)}
      />
    );
  }

  renderCheckboxes() {
    const { intl, isInvitation, isBreakoutRecordable } = this.props;
    if (isInvitation) return null;
    const {
      freeJoin,
      record,
    } = this.state;
    return (
      <div className={styles.checkBoxesContainer} key="breakout-checkboxes">
        <label htmlFor="freeJoinCheckbox" className={styles.freeJoinLabel} key="free-join-breakouts">
          <input
            type="checkbox"
            id="freeJoinCheckbox"
            className={styles.freeJoinCheckbox}
            onChange={this.setFreeJoin}
            checked={freeJoin}
            aria-label={intl.formatMessage(intlMessages.freeJoinLabel)}
          />
          <span aria-hidden>{intl.formatMessage(intlMessages.freeJoinLabel)}</span>
        </label>
        {
          isBreakoutRecordable ? (
            <label htmlFor="recordBreakoutCheckbox" className={styles.freeJoinLabel} key="record-breakouts">
              <input
                id="recordBreakoutCheckbox"
                type="checkbox"
                className={styles.freeJoinCheckbox}
                onChange={this.setRecord}
                checked={record}
                aria-label={intl.formatMessage(intlMessages.record)}
              />
              <span aria-hidden>
                {intl.formatMessage(intlMessages.record)}
              </span>
            </label>
          ) : null
        }
      </div>
    );
  }

  renderUserItemByRoom(room) {
    const {
      valid,
      seletedId,
    } = this.state;
    const dragStart = (ev) => {
      ev.dataTransfer.setData('text', ev.target.id);
      this.setState({ seletedId: ev.target.id });

      if (!valid) {
        this.setState({ valid: true });
      }
    };


    const dragEnd = () => {
      this.setState({ seletedId: '' });
    };

    return this.getUserByRoom(room)
      .map(user => (
        <p
          id={user.userId}
          key={user.userId}
          className={cx(
            styles.roomUserItem,
            seletedId === user.userId ? styles.selectedItem : null,
          )
          }
          draggable
          onDragStart={dragStart}
          onDragEnd={dragEnd}
        >
          {user.userName}
        </p>));
  }

  renderRoomSortList() {
    const { intl, isInvitation } = this.props;
    const { numberOfRooms } = this.state;
    const onClick = roomNumber => this.setState({ formFillLevel: 3, roomSelected: roomNumber });
    return (
      <div className={styles.listContainer}>
        <span>
          {
            new Array(numberOfRooms).fill(1).map((room, idx) => (
              <div className={styles.roomItem}>
                <h2 className={styles.itemTitle}>
                  {intl.formatMessage(intlMessages.breakoutRoomLabel, { 0: idx + 1 })}
                </h2>
                <Button
                  className={styles.itemButton}
                  label={intl.formatMessage(intlMessages.addParticipantLabel)}
                  size="lg"
                  ghost
                  color="primary"
                  onClick={() => onClick(idx + 1)}
                />
              </div>
            ))
          }
        </span>
        { isInvitation || this.renderButtonSetLevel(1, intl.formatMessage(intlMessages.backLabel))}
      </div>
    );
  }

  renderErrorMessages() {
    const {
      intl,
    } = this.props;
    const {
      valid,
      numberOfRoomsIsValid,
    } = this.state;
    return (
      <React.Fragment>
        {!valid
          && (
          <span className={styles.withError}>
            {intl.formatMessage(intlMessages.leastOneWarnBreakout)}
          </span>)}
        {!numberOfRoomsIsValid
          && (
          <span className={styles.withError}>
            {intl.formatMessage(intlMessages.numberOfRoomsIsValid)}
          </span>)}
      </React.Fragment>
    );
  }

  renderDesktop() {
    return [
      this.renderBreakoutForm(),
      this.renderCheckboxes(),
      this.renderRoomsGrid(),
    ];
  }

  renderMobile() {
    const { intl } = this.props;
    const { formFillLevel } = this.state;
    if (formFillLevel === 2) {
      return [
        this.renderErrorMessages(),
        this.renderRoomSortList(),
      ];
    }

    if (formFillLevel === 3) {
      return [
        this.renderErrorMessages(),
        this.renderSelectUserScreen(),
      ];
    }

    return [
      this.renderErrorMessages(),
      this.renderBreakoutForm(),
      this.renderCheckboxes(),
      this.renderButtonSetLevel(2, intl.formatMessage(intlMessages.nextLabel)),
    ];
  }

  renderButtonSetLevel(level, label) {
    return (
      <Button
        color="primary"
        size="lg"
        label={label}
        onClick={() => this.setState({ formFillLevel: level })}
        key={this.btnLevelId}
      />
    );
  }

  renderTitle() {
    const { intl } = this.props;
    return (
      <p className={styles.subTitle}>
        {intl.formatMessage(intlMessages.breakoutRoomDesc)}
      </p>
    );
  }

  render() {
    const { intl, isInvitation } = this.props;
    const {
      preventClosing,
      valid,
      numberOfRoomsIsValid,
    } = this.state;

    const BROWSER_RESULTS = browser();
    const isMobileBrowser = BROWSER_RESULTS.mobile || BROWSER_RESULTS.os.includes('Android');

    return (
      <Modal
        title={
          isInvitation
            ? intl.formatMessage(intlMessages.invitationTitle)
            : intl.formatMessage(intlMessages.breakoutRoomTitle)
        }
        confirm={
          {
            label: isInvitation
              ? intl.formatMessage(intlMessages.invitationConfirm)
              : intl.formatMessage(intlMessages.confirmButton),
            callback: isInvitation ? this.onInviteBreakout : this.onCreateBreakouts,
            disabled: !valid || !numberOfRoomsIsValid,
          }
        }
        dismiss={{
          callback: this.handleDismiss,
          label: intl.formatMessage(intlMessages.dismissLabel),
        }}
        preventClosing={preventClosing}
      >
        <div className={styles.content}>
          {isInvitation || this.renderTitle()}
          {isMobileBrowser ? this.renderMobile() : this.renderDesktop()}
        </div>
      </Modal>
    );
  }
}

BreakoutRoom.propTypes = propTypes;

export default withModalMounter(injectIntl(BreakoutRoom));
