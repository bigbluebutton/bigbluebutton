import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import cx from 'classnames';
import deviceInfo from '/imports/utils/deviceInfo';
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
  randomlyAssignDesc: {
    id: 'app.createBreakoutRoom.randomlyAssignDesc',
    description: 'randomly assign label description',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
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
  roomNameEmptyIsValid: {
    id: 'app.createBreakoutRoom.emptyRoomNameError',
    description: 'Label an error message',
  },
  roomNameDuplicatedIsValid: {
    id: 'app.createBreakoutRoom.duplicatedRoomNameError',
    description: 'Label an error message',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
  minimumDurationWarnBreakout: {
    id: 'app.createBreakoutRoom.minimumDurationWarnBreakout',
    description: 'minimum duration warning message label',
  },
  roomNameInputDesc: {
    id: 'app.createBreakoutRoom.roomNameInputDesc',
    description: 'aria description for room name change',
  }
});

const BREAKOUT_LIM = Meteor.settings.public.app.breakouts.breakoutRoomLimit;
const MIN_BREAKOUT_ROOMS = 2;
const MAX_BREAKOUT_ROOMS = BREAKOUT_LIM > MIN_BREAKOUT_ROOMS ? BREAKOUT_LIM : MIN_BREAKOUT_ROOMS;
const MIN_BREAKOUT_TIME = 5;

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isInvitation: PropTypes.bool.isRequired,
  isMe: PropTypes.func.isRequired,
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
    this.renderJoinedUsers = this.renderJoinedUsers.bind(this);

    this.state = {
      numberOfRooms: MIN_BREAKOUT_ROOMS,
      seletedId: '',
      users: [],
      durationTime: 15,
      freeJoin: false,
      formFillLevel: 1,
      roomNamesChanged: [],
      roomSelected: 0,
      preventClosing: true,
      leastOneUserIsValid: true,
      numberOfRoomsIsValid: true,
      roomNameDuplicatedIsValid: true,
      roomNameEmptyIsValid: true,
      record: false,
      durationIsValid: true,
      breakoutJoinedUsers: null,
    };

    this.btnLevelId = _.uniqueId('btn-set-level-');

    this.handleMoveEvent = this.handleMoveEvent.bind(this);
    this.handleShiftUser = this.handleShiftUser.bind(this);
  }

  componentDidMount() {
    const { isInvitation, breakoutJoinedUsers } = this.props;
    this.setRoomUsers();
    if (isInvitation) {
      this.setInvitationConfig();
    }
    if (isInvitation) {
      this.setState({
        breakoutJoinedUsers,
      });
    }
  }

  componentDidUpdate(prevProps, prevstate) {
    if (this.listOfUsers) {
      for (let i = 0; i < this.listOfUsers.children.length; i += 1) {
        const roomWrapperChildren = this.listOfUsers.children[i].getElementsByTagName('div');
        const roomList = roomWrapperChildren[roomWrapperChildren.length > 1 ? 1 : 0];
        roomList.addEventListener('keydown', this.handleMoveEvent, true);
      }
    }

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

  componentWillUnmount() {
    if (this.listOfUsers) {
      for (let i = 0; i < this.listOfUsers.children.length; i += 1) {
        const roomList = this.listOfUsers.children[i].getElementsByTagName('div')[0];
        roomList.removeEventListener('keydown', this.handleMoveEvent, true);
      }
    }
  }

  handleShiftUser(activeListSibling) {
    const { users } = this.state;
    if (activeListSibling) {
      const text = activeListSibling.getElementsByTagName('input')[0].value;
      const roomNumber = text.match(/\d/g).join('');
      users.forEach((u, index) => {
        if (u.userId === document.activeElement.id) {
          users[index].room = text.substr(text.length - 1).includes(')') ? 0 : parseInt(roomNumber, 10);
        }
      });
    }
  }

  handleMoveEvent(event) {
    if (this.listOfUsers) {
      const { activeElement } = document;

      if (event.key.includes('ArrowDown')) {
        const {
          nextElementSibling, className, childNodes, parentElement,
        } = activeElement;
        if (className.includes('breakoutBox')) return childNodes[0].focus();

        if (className.includes('roomUserItem')) {
          if (!nextElementSibling) {
            return parentElement.firstElementChild.focus();
          }
          return nextElementSibling.focus();
        }
      }

      if (event.key.includes('ArrowUp')) {
        const {
          previousElementSibling, className, childNodes, parentElement,
        } = activeElement;
        if (className.includes('breakoutBox')) return childNodes[childNodes.length - 1].focus();

        if (className.includes('roomUserItem')) {
          if (!previousElementSibling) {
            return parentElement.lastElementChild.focus();
          }
          return previousElementSibling.focus();
        }
      }

      if (event.key.includes('ArrowRight')) {
        const { parentElement: listContainer } = activeElement;
        if (listContainer.className.includes('breakoutBox')) {
          this.handleShiftUser(listContainer.parentElement.nextSibling);
        }
      }

      if (event.key.includes('ArrowLeft')) {
        const { parentElement: listContainer } = activeElement;
        if (listContainer.className.includes('breakoutBox')) {
          this.handleShiftUser(listContainer.parentElement.previousSibling);
        }
      }

      this.setRoomUsers();
    }
    return true;
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

  onCreateBreakouts() {
    const {
      createBreakoutRoom,
    } = this.props;
    const {
      users,
      freeJoin,
      record,
      numberOfRoomsIsValid,
      numberOfRooms,
      durationTime,
      durationIsValid,
    } = this.state;

    if ((durationTime || 0) < MIN_BREAKOUT_TIME) {
      this.setState({ durationIsValid: false });
      return;
    }

    if (users.length === this.getUserByRoom(0).length && !freeJoin) {
      this.setState({ leastOneUserIsValid: false });
      return;
    }

    if (!numberOfRoomsIsValid || !durationIsValid) {
      return;
    }

    const duplicatedNames = _.range(1, numberOfRooms + 1).filter((n) => this.hasNameDuplicated(n));
    if (duplicatedNames.length > 0) {
      this.setState({ roomNameDuplicatedIsValid: false });
      return;
    }

    const emptyNames = _.range(1, numberOfRooms + 1)
      .filter((n) => this.getRoomName(n).length === 0);
    if (emptyNames.length > 0) {
      this.setState({ roomNameEmptyIsValid: false });
      return;
    }

    this.handleDismiss();

    const rooms = _.range(1, numberOfRooms + 1).map((seq) => ({
      users: this.getUserByRoom(seq).map((u) => u.userId),
      name: this.getFullName(seq),
      shortName: this.getRoomName(seq),
      isDefaultName: !this.hasNameChanged(seq),
      freeJoin,
      sequence: seq,
    }));

    createBreakoutRoom(rooms, durationTime, record);
    Session.set('isUserListOpen', true);
  }

  onInviteBreakout() {
    const { getBreakouts, sendInvitation } = this.props;
    const { users, freeJoin } = this.state;
    const breakouts = getBreakouts();
    if (users.length === this.getUserByRoom(0).length && !freeJoin) {
      this.setState({ leastOneUserIsValid: false });
      return;
    }

    breakouts.forEach((breakout) => {
      const { breakoutId } = breakout;
      const breakoutUsers = this.getUserByRoom(breakout.sequence);
      breakoutUsers.forEach((user) => sendInvitation(breakoutId, user.userId));
    });

    this.handleDismiss();
  }

  onAssignRandomly() {
    const { numberOfRooms } = this.state;
    const { users } = this.state;
    // We only want to assign viewers so filter out the moderators. We also want to get
    // all users each run so that clicking the button again will reshuffle
    const viewers = users.filter((user) => !user.isModerator);
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
    const stateUsersId = stateUsers.map((user) => user.userId);
    const roomUsers = getUsersNotAssigned(users)
      .filter((user) => !stateUsersId.includes(user.userId))
      .map((user) => ({
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
    this.setState({ freeJoin: e.target.checked, leastOneUserIsValid: true });
  }

  setRecord(e) {
    this.setState({ record: e.target.checked });
  }

  getUserByRoom(room) {
    const { users } = this.state;
    return users.filter((user) => user.room === room);
  }

  getUsersByRoomSequence(sequence) {
    const { breakoutJoinedUsers } = this.state;
    if (!breakoutJoinedUsers) return [];
    return breakoutJoinedUsers.filter((room) => room.sequence === sequence)[0].joinedUsers || [];
  }

  getRoomName(position) {
    const { intl } = this.props;
    const { roomNamesChanged } = this.state;

    if (this.hasNameChanged(position)) {
      return roomNamesChanged[position];
    }

    return intl.formatMessage(intlMessages.breakoutRoom, { 0: position });
  }

  getFullName(position) {
    const { meetingName } = this.props;

    return `${meetingName} (${this.getRoomName(position)})`;
  }

  resetUserWhenRoomsChange(rooms) {
    const { users } = this.state;
    const filtredUsers = users.filter((u) => u.room > rooms);
    filtredUsers.forEach((u) => this.changeUserRoom(u.userId, 0));
  }

  changeUserRoom(userId, room) {
    const { users, freeJoin } = this.state;

    const idxUser = users.findIndex((user) => user.userId === userId);

    const usersCopy = [...users];

    usersCopy[idxUser].room = room;

    this.setState({
      users: usersCopy,
      leastOneUserIsValid: (this.getUserByRoom(0).length !== users.length || freeJoin),
    });
  }

  increaseDurationTime() {
    const { durationTime } = this.state;
    const number = ((1 * durationTime) + 1);
    const newDurationTime = number > MIN_BREAKOUT_TIME ? number : MIN_BREAKOUT_TIME;

    this.setState({ durationTime: newDurationTime, durationIsValid: true });
  }

  decreaseDurationTime() {
    const { durationTime } = this.state;
    const number = ((1 * durationTime) - 1);
    const newDurationTime = number > MIN_BREAKOUT_TIME ? number : MIN_BREAKOUT_TIME;

    this.setState({ durationTime: newDurationTime, durationIsValid: true });
  }

  changeDurationTime(event) {
    const durationTime = Number.parseInt(event.target.value, 10) || '';
    const durationIsValid = durationTime >= MIN_BREAKOUT_TIME;

    this.setState({ durationTime, durationIsValid });
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

  removeRoomUsers() {
    const { users } = this.props;
    const { users: stateUsers } = this.state;
    const userIds = users.map((user) => user.userId);
    const removeUsers = stateUsers.filter((user) => userIds.includes(user.userId));

    this.setState({
      users: removeUsers,
    });
  }

  hasNameChanged(position) {
    const { intl } = this.props;
    const { roomNamesChanged } = this.state;

    if (typeof roomNamesChanged[position] !== 'undefined'
      && roomNamesChanged[position] !== intl
        .formatMessage(intlMessages.breakoutRoom, { 0: position })) {
      return true;
    }
    return false;
  }

  hasNameDuplicated(position) {
    const { numberOfRooms } = this.state;
    const currName = this.getRoomName(position).trim();
    const equals = _.range(1, numberOfRooms + 1)
      .filter((n) => this.getRoomName(n).trim() === currName);
    if (equals.length > 1) return true;

    return false;
  }

  renderRoomsGrid() {
    const { intl, isInvitation } = this.props;
    const {
      leastOneUserIsValid,
      numberOfRooms,
      roomNamesChanged,
    } = this.state;

    const rooms = (numberOfRooms > MAX_BREAKOUT_ROOMS
      || numberOfRooms < MIN_BREAKOUT_ROOMS)
      ? 0 : numberOfRooms;
    const allowDrop = (ev) => {
      ev.preventDefault();
    };

    const drop = (room) => (ev) => {
      ev.preventDefault();
      const data = ev.dataTransfer.getData('text');
      this.changeUserRoom(data, room);
      this.setState({ seletedId: '' });
    };

    const changeRoomName = (position) => (ev) => {
      const newRoomsNames = [...roomNamesChanged];
      newRoomsNames[position] = ev.target.value;

      this.setState({
        roomNamesChanged: newRoomsNames,
        roomNameDuplicatedIsValid: true,
        roomNameEmptyIsValid: true,
      });
    };

    return (
      <div className={styles.boxContainer} key="rooms-grid-" ref={(r) => { this.listOfUsers = r; }}>
        <div role="alert" className={!leastOneUserIsValid ? styles.changeToWarn : null}>
          <span className={styles.freeJoinLabel}>
            <input
              type="text"
              readOnly
              className={styles.breakoutNameInput}
              value={
                intl.formatMessage(intlMessages.notAssigned, { 0: this.getUserByRoom(0).length })
              }
            />
          </span>
          <div className={styles.breakoutBox} onDrop={drop(0)} onDragOver={allowDrop} tabIndex={0}>
            {this.renderUserItemByRoom(0)}
          </div>
          <span className={leastOneUserIsValid ? styles.dontShow : styles.spanWarn}>
            {intl.formatMessage(intlMessages.leastOneWarnBreakout)}
          </span>
        </div>
        {
          _.range(1, rooms + 1).map((value) => (
            <div key={`room-${value}`}>
              <span className={styles.freeJoinLabel}>
                <input
                  type="text"
                  maxLength="255"
                  className={cx(styles.breakoutNameInput,
                    this.getRoomName(value).length === 0 ? styles.errorBorder : null,
                    this.hasNameDuplicated(value) ? styles.errorBorder : null)}
                  value={this.getRoomName(value)}
                  onChange={changeRoomName(value)}
                  onBlur={changeRoomName(value)}
                  aria-label={`${this.getRoomName(value)}`}
                  aria-describedby={this.getRoomName(value).length === 0 ? `room-error-${value}` : `room-input-${value}`}
                />
                <div aria-hidden id={`room-input-${value}`} className={"sr-only"}>
                  {intl.formatMessage(intlMessages.roomNameInputDesc)}
                </div>
              </span>
              <div className={styles.breakoutBox} onDrop={drop(value)} onDragOver={allowDrop} tabIndex={0}>
                {this.renderUserItemByRoom(value)}
                {isInvitation && this.renderJoinedUsers(value)}
              </div>
              {this.hasNameDuplicated(value) ? (
                <span className={styles.spanWarn}>
                  {intl.formatMessage(intlMessages.roomNameDuplicatedIsValid)}
                </span>
              ) : null}
              {this.getRoomName(value).length === 0 ? (
                <span aria-hidden id={`room-error-${value}`} className={styles.spanWarn}>
                  {intl.formatMessage(intlMessages.roomNameEmptyIsValid)}
                </span>
              ) : null}
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
      durationIsValid,
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
                _.range(MIN_BREAKOUT_ROOMS, MAX_BREAKOUT_ROOMS + 1).map((item) => (<option key={_.uniqueId('value-')}>{item}</option>))
              }
            </select>
          </div>
          <label htmlFor="breakoutRoomTime" className={!durationIsValid ? styles.changeToWarn : null}>
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
                  onClick={() => { }}
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
                  onClick={() => { }}
                  hideLabel
                  circle
                  size="sm"
                />
              </HoldButton>
            </div>
            <span className={durationIsValid ? styles.dontShow : styles.leastOneWarn}>
              {
                intl.formatMessage(
                  intlMessages.minimumDurationWarnBreakout,
                  { 0: MIN_BREAKOUT_TIME },
                )
              }
            </span>

          </label>
          <Button
            data-test="randomlyAssign"
            label={intl.formatMessage(intlMessages.randomlyAssign)}
            aria-describedby="randomlyAssignDesc"
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
        <span aria-hidden id="randomlyAssignDesc" className="sr-only">
          {intl.formatMessage(intlMessages.randomlyAssignDesc)}
        </span>
      </React.Fragment>
    );
  }

  renderSelectUserScreen() {
    const {
      users,
      roomSelected,
      breakoutJoinedUsers,
    } = this.state;
    const { isInvitation } = this.props;

    return (
      <SortList
        confirm={() => this.setState({ formFillLevel: 2 })}
        users={users}
        room={roomSelected}
        breakoutJoinedUsers={isInvitation && breakoutJoinedUsers}
        onCheck={this.changeUserRoom}
        onUncheck={(userId) => this.changeUserRoom(userId, 0)}
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
      leastOneUserIsValid,
      seletedId,
    } = this.state;

    const { intl, isMe } = this.props;

    const dragStart = (ev) => {
      ev.dataTransfer.setData('text', ev.target.id);
      this.setState({ seletedId: ev.target.id });

      if (!leastOneUserIsValid) {
        this.setState({ leastOneUserIsValid: true });
      }
    };

    const dragEnd = () => {
      this.setState({ seletedId: '' });
    };

    return this.getUserByRoom(room)
      .map((user) => (
        <p
          tabIndex={-1}
          id={user.userId}
          key={user.userId}
          className={cx(
            styles.roomUserItem,
            seletedId === user.userId ? styles.selectedItem : null,
          )}
          draggable
          onDragStart={dragStart}
          onDragEnd={dragEnd}
        >
          {user.userName}
          <i>{(isMe(user.userId)) ? ` (${intl.formatMessage(intlMessages.you)})` : ''}</i>
        </p>
      ));
  }

  renderJoinedUsers(room) {
    return this.getUsersByRoomSequence(room)
      .map((user) => (
        <p
          id={user.userId}
          key={user.userId}
          disabled
          className={cx(
            styles.roomUserItem,
            styles.disableItem,
          )}
        >
          {user.name}
          <span className={styles.lockIcon} />
        </p>
      ));
  }

  renderRoomSortList() {
    const { intl, isInvitation } = this.props;
    const { numberOfRooms } = this.state;
    const onClick = (roomNumber) => this.setState({ formFillLevel: 3, roomSelected: roomNumber });
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
        {isInvitation || this.renderButtonSetLevel(1, intl.formatMessage(intlMessages.backLabel))}
      </div>
    );
  }

  renderErrorMessages() {
    const {
      intl,
    } = this.props;
    const {
      leastOneUserIsValid,
      numberOfRoomsIsValid,
      roomNameDuplicatedIsValid,
      roomNameEmptyIsValid,
    } = this.state;
    return (
      <>
        {!leastOneUserIsValid
          && (
            <span className={styles.withError}>
              {intl.formatMessage(intlMessages.leastOneWarnBreakout)}
            </span>
          )}
        {!numberOfRoomsIsValid
          && (
            <span className={styles.withError}>
              {intl.formatMessage(intlMessages.numberOfRoomsIsValid)}
            </span>
          )}
        {!roomNameDuplicatedIsValid
          && (
            <span className={styles.withError}>
              {intl.formatMessage(intlMessages.roomNameDuplicatedIsValid)}
            </span>
          )}
        {!roomNameEmptyIsValid
          && (
            <span className={styles.withError}>
              {intl.formatMessage(intlMessages.roomNameEmptyIsValid)}
            </span>
          )}
      </>
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
      leastOneUserIsValid,
      numberOfRoomsIsValid,
      roomNameDuplicatedIsValid,
      roomNameEmptyIsValid,
      durationIsValid,
    } = this.state;

    const { isMobile } = deviceInfo;

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
            disabled: !leastOneUserIsValid
              || !numberOfRoomsIsValid
              || !roomNameDuplicatedIsValid
              || !roomNameEmptyIsValid
              || !durationIsValid
            ,
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
          {isMobile ? this.renderMobile() : this.renderDesktop()}
        </div>
      </Modal>
    );
  }
}

BreakoutRoom.propTypes = propTypes;

export default withModalMounter(injectIntl(BreakoutRoom));
