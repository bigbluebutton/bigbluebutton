import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { range } from '/imports/utils/array-utils';
import deviceInfo from '/imports/utils/deviceInfo';
import Button from '/imports/ui/components/common/button/component';
import { Session } from 'meteor/session';
import ModalFullscreen from '/imports/ui/components/common/modal/fullscreen/component';
import SortList from './sort-user-list/component';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import { isImportSharedNotesFromBreakoutRoomsEnabled, isImportPresentationWithAnnotationsFromBreakoutRoomsEnabled } from '/imports/ui/services/features';
import { addNewAlert } from '/imports/ui/components/screenreader-alert/service';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import { uniqueId } from '/imports/utils/string-utils';

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
  breakoutRoomUpdateDesc: {
    id: 'app.updateBreakoutRoom.modalDesc',
    description: 'update modal description',
  },
  cancelLabel: {
    id: 'app.updateBreakoutRoom.cancelLabel',
    description: 'used in the button that close update modal',
  },
  updateTitle: {
    id: 'app.updateBreakoutRoom.title',
    description: 'update breakout title',
  },
  updateConfirm: {
    id: 'app.updateBreakoutRoom.confirm',
    description: 'Update to breakout confirm button label',
  },
  resetUserRoom: {
    id: 'app.update.resetRoom',
    description: 'Reset user room button label',
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
  resetAssignments: {
    id: 'app.createBreakoutRoom.resetAssignments',
    description: 'reset assignments label',
  },
  resetAssignmentsDesc: {
    id: 'app.createBreakoutRoom.resetAssignmentsDesc',
    description: 'reset assignments label description',
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
  captureNotesLabel: {
    id: 'app.createBreakoutRoom.captureNotes',
    description: 'capture shared notes label',
  },
  captureSlidesLabel: {
    id: 'app.createBreakoutRoom.captureSlides',
    description: 'capture slides label',
  },
  captureNotesType: {
    id: 'app.notes.label',
    description: 'indicates notes have been captured',
  },
  captureSlidesType: {
    id: 'app.shortcut-help.whiteboard',
    description: 'indicates the whiteboard has been captured',
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
  },
  movedUserLabel: {
    id: 'app.createBreakoutRoom.movedUserLabel',
    description: 'screen reader alert when users are moved to rooms',
  },
  manageRooms: {
    id: 'app.createBreakoutRoom.manageRoomsLabel',
    description: 'Label for manage rooms',
  },
  sendInvitationToMods: {
    id: 'app.createBreakoutRoom.sendInvitationToMods',
    description: 'label for checkbox send invitation to moderators',
  },
  currentSlide: {
    id: 'app.createBreakoutRoom.currentSlideLabel',
    description: 'label for current slide',
  },
});

const BREAKOUT_LIM = Meteor.settings.public.app.breakouts.breakoutRoomLimit;
const MIN_BREAKOUT_ROOMS = 2;
const MAX_BREAKOUT_ROOMS = BREAKOUT_LIM > MIN_BREAKOUT_ROOMS ? BREAKOUT_LIM : MIN_BREAKOUT_ROOMS;
const MIN_BREAKOUT_TIME = 5;
const CURRENT_SLIDE_PREFIX = 'current-';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isMe: PropTypes.func.isRequired,
  meetingName: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  createBreakoutRoom: PropTypes.func.isRequired,
  getUsersNotJoined: PropTypes.func.isRequired,
  getBreakouts: PropTypes.func.isRequired,
  sendInvitation: PropTypes.func.isRequired,
  isBreakoutRecordable: PropTypes.bool,
};

const setPresentationVisibility = (state) => {
  const presentationInnerWrapper = document.getElementById('presentationInnerWrapper');
  if (presentationInnerWrapper) {
    presentationInnerWrapper.style.display = state;
  }
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
    this.onAssignReset = this.onAssignReset.bind(this);
    this.onInviteBreakout = this.onInviteBreakout.bind(this);
    this.renderUserItemByRoom = this.renderUserItemByRoom.bind(this);
    this.renderRoomsGrid = this.renderRoomsGrid.bind(this);
    this.renderBreakoutForm = this.renderBreakoutForm.bind(this);
    this.renderCheckboxes = this.renderUnassingUsers.bind(this);
    this.renderRoomSortList = this.renderRoomSortList.bind(this);
    this.renderDesktop = this.renderDesktop.bind(this);
    this.renderMobile = this.renderMobile.bind(this);
    this.renderButtonSetLevel = this.renderButtonSetLevel.bind(this);
    this.renderSelectUserScreen = this.renderSelectUserScreen.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.setInvitationConfig = this.setInvitationConfig.bind(this);
    this.setRecord = this.setRecord.bind(this);
    this.setCaptureNotes = this.setCaptureNotes.bind(this);
    this.setInviteMods = this.setInviteMods.bind(this);
    this.setCaptureSlides = this.setCaptureSlides.bind(this);
    this.blurDurationTime = this.blurDurationTime.bind(this);
    this.removeRoomUsers = this.removeRoomUsers.bind(this);
    this.renderErrorMessages = this.renderErrorMessages.bind(this);
    this.onUpdateBreakouts = this.onUpdateBreakouts.bind(this);
    this.getRoomPresentation = this.getRoomPresentation.bind(this);

    this.state = {
      numberOfRooms: MIN_BREAKOUT_ROOMS,
      selectedId: '',
      users: [],
      durationTime: 15,
      freeJoin: false,
      formFillLevel: 1,
      roomNamesChanged: [],
      roomSelected: 0,
      preventClosing: true,
      leastOneUserIsValid: null,
      numberOfRoomsIsValid: true,
      roomNameDuplicatedIsValid: true,
      roomNameEmptyIsValid: true,
      record: false,
      captureNotes: false,
      inviteMods: false,
      captureSlides: false,
      durationIsValid: true,
      breakoutJoinedUsers: null,
      enableUnassingUsers: null,
      roomPresentations: [],
    };

    this.btnLevelId = uniqueId('btn-set-level-');

    this.handleMoveEvent = this.handleMoveEvent.bind(this);
    this.handleShiftUser = this.handleShiftUser.bind(this);
  }

  componentDidMount() {
    const {
      breakoutJoinedUsers, getLastBreakouts, groups, isUpdate,
      allowUserChooseRoomByDefault, captureSharedNotesByDefault,
      captureWhiteboardByDefault, inviteModsByDefault,
    } = this.props;
    setPresentationVisibility('none');
    this.setRoomUsers();
    if (isUpdate) {
      const usersToMerge = []
      breakoutJoinedUsers.forEach((breakout) => {
        breakout.joinedUsers.forEach((user) => {
          usersToMerge.push({
            userId: user.userId,
            userName: user.name,
            from: breakout.sequence,
            room: breakout.sequence,
            isModerator: user.role === ROLE_MODERATOR,
            joined: true,
          });
        });
      });
      this.setState((prevState) => {
        return {
          users: [
            ...prevState.users,
            ...usersToMerge,
          ],
        };
      });
    }
    this.setState({
      freeJoin: allowUserChooseRoomByDefault,
      captureSlides: captureWhiteboardByDefault,
      captureNotes: captureSharedNotesByDefault,
      inviteMods: inviteModsByDefault,
    });

    const lastBreakouts = getLastBreakouts();
    if (lastBreakouts.length > 0) {
      this.populateWithLastBreakouts(lastBreakouts);
    } else if (groups && groups.length > 0) {
      this.populateWithGroups(groups);
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

    const unassignedUsers = document.getElementById('breakoutBox-0');
    if (unassignedUsers) {
      unassignedUsers.addEventListener('keydown', this.handleMoveEvent, true);
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
    const unassignedUsers = document.getElementById('breakoutBox-0');
    if (unassignedUsers) {
      unassignedUsers.removeEventListener('keydown', this.handleMoveEvent, true);
    }
  }

  handleShiftUser(activeListSibling) {
    const { users } = this.state;
    if (activeListSibling) {
      const text = activeListSibling.getElementsByTagName('input')[0].value;
      const roomNumber = text.match(/\d/g).join('');
      users.forEach((u, index) => {
        if (`roomUserItem-${u.userId}` === document.activeElement.id) {
          users[index].room = text.substr(text.length - 1).includes(')') ? 0 : parseInt(roomNumber, 10);
          this.changeUserRoom(u.userId, users[index].room);
        }
      });
    } else {
      users.forEach((u, index) => {
        if (`roomUserItem-${u.userId}` === document.activeElement.id) {
          this.changeUserRoom(u.userId, 0);
        }
      });
    }
  }

  handleMoveEvent(event) {
    if (this.listOfUsers) {
      const { activeElement } = document;

      if (event.key.includes('ArrowDown')) {
        const {
          nextElementSibling, id, childNodes, parentElement,
        } = activeElement;
        if (id.includes('breakoutBox')) return childNodes[0].focus();

        if (id.includes('roomUserItem')) {
          if (!nextElementSibling) {
            return parentElement.firstElementChild.focus();
          }
          return nextElementSibling.focus();
        }
      }

      if (event.key.includes('ArrowUp')) {
        const {
          previousElementSibling, id, childNodes, parentElement,
        } = activeElement;
        if (id.includes('breakoutBox')) return childNodes[childNodes.length - 1].focus();

        if (id.includes('roomUserItem')) {
          if (!previousElementSibling) {
            return parentElement.lastElementChild.focus();
          }
          return previousElementSibling.focus();
        }
      }

      if (event.key.includes('ArrowRight')) {
        const { parentElement: listContainer } = activeElement;
        if (listContainer.id.includes('breakoutBox')) {
          this.handleShiftUser(listContainer.parentElement.nextSibling);
        }
      }

      if (event.key.includes('ArrowLeft')) {
        const { parentElement: listContainer } = activeElement;
        if (listContainer.id.includes('breakoutBox')) {
          this.handleShiftUser(listContainer.parentElement.previousSibling);
        }
      }

      this.setRoomUsers();
    }
    return true;
  }

  handleDismiss() {
    const { setIsOpen } = this.props;
    setPresentationVisibility('block');
    return new Promise((resolve) => {
      setIsOpen(false);

      this.setState({
        preventClosing: false,
      }, resolve);
    });
  }

  onCreateBreakouts() {
    setPresentationVisibility('block');
    const {
      createBreakoutRoom,
    } = this.props;
    const {
      users,
      freeJoin,
      record,
      captureNotes,
      captureSlides,
      numberOfRoomsIsValid,
      numberOfRooms,
      durationTime,
      durationIsValid,
      inviteMods,
    } = this.state;

    if ((durationTime || 0) < MIN_BREAKOUT_TIME) {
      this.setState({ durationIsValid: false });
      return;
    }

    if (users.length === this.getUserByRoom(0).length && !freeJoin) {
      this.setState({ leastOneUserIsValid: false, enableUnassingUsers: false });
      return;
    }

    if (!numberOfRoomsIsValid || !durationIsValid) {
      return;
    }

    const duplicatedNames = range(1, numberOfRooms + 1).filter((n) => this.hasNameDuplicated(n));
    if (duplicatedNames.length > 0) {
      this.setState({ roomNameDuplicatedIsValid: false });
      return;
    }

    const emptyNames = range(1, numberOfRooms + 1)
      .filter((n) => this.getRoomName(n).length === 0);
    if (emptyNames.length > 0) {
      this.setState({ roomNameEmptyIsValid: false });
      return;
    }

    this.handleDismiss();

    const rooms = range(1, numberOfRooms + 1).map((seq) => ({
      users: this.getUserByRoom(seq).map((u) => u.userId),
      name: this.getFullName(seq),
      captureNotesFilename: this.getCaptureFilename(seq, false),
      captureSlidesFilename: this.getCaptureFilename(seq),
      shortName: this.getRoomName(seq),
      isDefaultName: !this.hasNameChanged(seq),
      freeJoin,
      sequence: seq,
      allPages: !this.getRoomPresentation(seq).startsWith(CURRENT_SLIDE_PREFIX),
      presId: this.getRoomPresentation(seq).replace(CURRENT_SLIDE_PREFIX, ''),
      sourcePresentationFilename: PresentationUploaderService.getPresentations()
        .filter((pres) => pres.id == this.getRoomPresentation(seq).replace(CURRENT_SLIDE_PREFIX, ''))[0]
        .filename || this.getRoomName(seq),
    }));

    createBreakoutRoom(rooms, durationTime, record, captureNotes, captureSlides, inviteMods);
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
    if (users.length === this.getUserByRoom(0).length) {
      this.setState({ enableUnassingUsers: false });
      return;
    }

    breakouts.forEach((breakout) => {
      const { breakoutId } = breakout;
      const breakoutUsers = this.getUserByRoom(breakout.sequence);
      breakoutUsers.forEach((user) => sendInvitation(breakoutId, user.userId));
    });

    this.handleDismiss();
  }

  getBreakoutBySequence(sequence) {
    const { getBreakouts } = this.props;
    const breakouts = getBreakouts();

    return breakouts.find((breakout) => breakout.sequence === sequence);
  }

  changeUserBreakout(fromBreakoutId, toBreakoutId, userId) {
    const { moveUser } = this.props;

    moveUser(fromBreakoutId, toBreakoutId, userId);
  }

  onUpdateBreakouts() {
    setPresentationVisibility('block');
    const { users } = this.state;
    const leastOneUserIsValid = users.some((user) => user.from !== user.room);

    if (!leastOneUserIsValid) {
      this.setState({ leastOneUserIsValid });
    }

    users.forEach((user) => {
      const { from, room } = user;
      let { userId } = user;

      if (from === room) return;

      let toBreakoutId = '';
      if (room !== 0) {
        const toBreakout = this.getBreakoutBySequence(room);
        toBreakoutId = toBreakout.breakoutId;
      }

      let fromBreakoutId = '';
      if (from !== 0) {
        [userId] = userId.split('-');
        const fromBreakout = this.getBreakoutBySequence(from);
        fromBreakoutId = fromBreakout.breakoutId;
      }

      this.changeUserBreakout(fromBreakoutId, toBreakoutId, userId);
    });

    this.handleDismiss();
  }

  onAssignRandomly() {
    const { numberOfRooms } = this.state;
    this.setState({ hasUsersAssign: false });
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

  onAssignReset() {
    const { users } = this.state;
    this.setState({ hasUsersAssign: true });

    users.forEach((u) => {
      if (u.room !== null && u.room > 0) {
        this.changeUserRoom(u.userId, 0);
      }
    });
  }

  setInvitationConfig() {
    const { getBreakouts } = this.props;
    this.setState({
      numberOfRooms: getBreakouts().length,
      formFillLevel: 2,
    });
  }

  setRoomUsers() {
    const { users, getUsersNotJoined } = this.props;
    const { users: stateUsers } = this.state;
    const stateUsersId = stateUsers.map((user) => user.userId);
    const roomUsers = getUsersNotJoined(users)
      .filter((user) => !stateUsersId.includes(user.userId))
      .map((user) => ({
        userId: user.userId,
        extId: user.extId,
        userName: user.name,
        isModerator: user.role === ROLE_MODERATOR,
        from: 0,
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
    this.setState({
      freeJoin: e.target.checked,
      leastOneUserIsValid: true,
    });
  }

  setRecord(e) {
    this.setState({ record: e.target.checked });
  }

  setCaptureNotes(e) {
    this.setState({ captureNotes: e.target.checked });
  }

  setInviteMods(e) {
    this.setState({ inviteMods: e.target.checked });
  }

  setCaptureSlides(e) {
    this.setState({ captureSlides: e.target.checked });
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

  getRoomName(position, padWithZeroes = false) {
    const { intl } = this.props;
    const { roomNamesChanged } = this.state;

    if (this.hasNameChanged(position)) {
      return roomNamesChanged[position];
    }

    return intl.formatMessage(intlMessages.breakoutRoom, {
      0: padWithZeroes ? `${position}`.padStart(2, '0') : position
    });
  }

  getRoomPresentation(position) {
    const { roomPresentations } = this.state;
    const { presentations } = this.props;

    const currentPresentation = presentations.find((presentation) => presentation.current);

    return roomPresentations[position] || `${CURRENT_SLIDE_PREFIX}${currentPresentation?.id}`;
  }

  getFullName(position) {
    const { meetingName } = this.props;

    return `${meetingName} (${this.getRoomName(position)})`;
  }

  getCaptureFilename(position, slides = true) {
    const { intl } = this.props;
    const presentations = PresentationUploaderService.getPresentations();

    const captureType = slides
      ? intl.formatMessage(intlMessages.captureSlidesType)
      : intl.formatMessage(intlMessages.captureNotesType);

    const fileName = `${this.getRoomName(position, true)}_${captureType}`.replace(/ /g, '_');

    const fileNameDuplicatedCount = presentations.filter((pres) => pres.filename?.startsWith(fileName)
      || pres.name?.startsWith(fileName)).length;

    return fileNameDuplicatedCount === 0 ? fileName : `${fileName}(${fileNameDuplicatedCount + 1})`;
  }

  resetUserWhenRoomsChange(rooms) {
    const { users } = this.state;
    const filtredUsers = users.filter((u) => u.room > rooms);
    filtredUsers.forEach((u) => this.changeUserRoom(u.userId, 0));
  }

  changeUserRoom(userId, room) {
    const { intl } = this.props;
    const { users, freeJoin } = this.state;

    const idxUser = users.findIndex((user) => user.userId === userId.replace('roomUserItem-', ''));

    const usersCopy = [...users];
    let userName = null;

    if (idxUser >= 0) {
      usersCopy[idxUser].room = room;
      userName = usersCopy[idxUser].userName;
    };

    this.setState({
      users: usersCopy,
      leastOneUserIsValid: (this.getUserByRoom(0).length !== users.length || freeJoin),
      enableUnassingUsers: (this.getUserByRoom(0).length !== users.length),
    }, () => {
      addNewAlert(intl.formatMessage(intlMessages.movedUserLabel, { 0: userName, 1: room }))
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
    const equals = range(1, numberOfRooms + 1)
      .filter((n) => this.getRoomName(n).trim() === currName);
    if (equals.length > 1) return true;

    return false;
  }

  populateWithLastBreakouts(lastBreakouts) {
    const { getBreakoutUserWasIn, users, intl } = this.props;

    const changedNames = [];
    lastBreakouts.forEach((breakout) => {
      if (breakout.isDefaultName === false) {
        changedNames[breakout.sequence] = breakout.shortName;
      }
    });

    this.setState({
      roomNamesChanged: changedNames,
      numberOfRooms: lastBreakouts.length,
      roomNameDuplicatedIsValid: true,
      roomNameEmptyIsValid: true,
    }, () => {
      const rooms = range(1, lastBreakouts.length + 1).map((seq) => this.getRoomName(seq));

      users.forEach((u) => {
        const lastUserBreakout = getBreakoutUserWasIn(u.userId, u.extId);
        if (lastUserBreakout !== null) {
          const lastUserBreakoutName = lastUserBreakout.isDefaultName === false
            ? lastUserBreakout.shortName
            : intl.formatMessage(intlMessages.breakoutRoom, { 0: lastUserBreakout.sequence });

          if (rooms.indexOf(lastUserBreakoutName) !== false) {
            this.changeUserRoom(u.userId, rooms.indexOf(lastUserBreakoutName) + 1);
          }
        }
      });
    });
  }

  populateWithGroups(groups) {
    const { users } = this.props;

    const changedNames = [];
    groups.forEach((group, idx) => {
      if (group.name.length > 0) {
        changedNames[idx + 1] = group.name;
      }
    });

    this.setState({
      roomNamesChanged: changedNames,
      numberOfRooms: groups.length > 1 ? groups.length : 2,
      roomNameDuplicatedIsValid: true,
      roomNameEmptyIsValid: true,
    }, () => {
      groups.forEach((group, groupIdx) => {
        const usersInGroup = group.usersExtId;
        if (usersInGroup.length > 0) {
          usersInGroup.forEach((groupUserExtId) => {
            users.filter((u) => u.extId === groupUserExtId).forEach((foundUser) => {
              this.changeUserRoom(foundUser.userId, groupIdx + 1);
            });
          });
        }
      });
    });
  }

  renderContent() {
    const { intl } = this.props;
    const {
      leastOneUserIsValid,
      allowDrop,
    } = this.state;
    const drop = (room) => (ev) => {
      ev.preventDefault();
      const data = ev.dataTransfer.getData('text');
      this.changeUserRoom(data, room);
      this.setState({ selectedId: '' });
    };

    return (
      <Styled.ContentContainer>
        <Styled.Alert valid={leastOneUserIsValid} role="alert">
          <Styled.FreeJoinLabel>
            <Styled.BreakoutNameInput
              type="text"
              readOnly
              value={
                intl.formatMessage(intlMessages.notAssigned, { 0: this.getUserByRoom(0).length })
              }
            />
          </Styled.FreeJoinLabel>
          <Styled.BreakoutBox hundred id="breakoutBox-0" onDrop={drop(0)} onDragOver={allowDrop} tabIndex={0}>
            {this.renderUserItemByRoom(0)}
          </Styled.BreakoutBox>
          <Styled.SpanWarn data-test="warningNoUserAssigned" valid={leastOneUserIsValid}>
            {intl.formatMessage(intlMessages.leastOneWarnBreakout)}
          </Styled.SpanWarn>
        </Styled.Alert>
        {this.renderRoomsGrid()}
      </Styled.ContentContainer>
    );
  }

  renderRoomsGrid() {
    const { intl, isUpdate, presentations } = this.props;
    const {
      leastOneUserIsValid,
      numberOfRooms,
      roomNamesChanged,
      roomPresentations,
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
      this.setState({ selectedId: '' });
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

    const changeRoomPresentation = (position) => (ev) => {
      const newRoomsPresentations = [...roomPresentations];
      newRoomsPresentations[position] = ev.target.value;

      this.setState({
        roomPresentations: newRoomsPresentations,
      });
    };

    const currentPresentation = presentations.find((presentation) => presentation.current);

    return (
      <Styled.BoxContainer key="rooms-grid-" ref={(r) => { this.listOfUsers = r; }} data-test="roomGrid">
        {
          range(1, rooms + 1).map((value) => (
            <div key={`room-${value}`}>
              <Styled.FreeJoinLabel>
                <Styled.RoomName
                  type="text"
                  maxLength="255"
                  duplicated={this.hasNameDuplicated(value)}
                  value={this.getRoomName(value)}
                  onChange={changeRoomName(value)}
                  onBlur={changeRoomName(value)}
                  aria-label={`${this.getRoomName(value)}`}
                  aria-describedby={this.getRoomName(value).length === 0 ? `room-error-${value}` : `room-input-${value}`}
                  data-test={this.getRoomName(value).length === 0 ? `room-error-${value}` : `roomName-${value}`}
                  readOnly={isUpdate}
                />
                <div aria-hidden id={`room-input-${value}`} className="sr-only">
                  {intl.formatMessage(intlMessages.roomNameInputDesc)}
                </div>
              </Styled.FreeJoinLabel>
              { presentations.length > 0 && !isUpdate ? (
                <Styled.BreakoutSlideLabel>
                  <Styled.InputRooms
                    data-test="changeSlideBreakoutRoom"
                    value={this.getRoomPresentation(value)}
                    onChange={changeRoomPresentation(value)}
                    valid
                  >
                    { currentPresentation?.id ? (
                      <option key="current-slide" value={`${CURRENT_SLIDE_PREFIX}${currentPresentation.id}`} data-test="slideBreakoutRoomOption">
                        {intl.formatMessage(intlMessages.currentSlide)}
                      </option>
                    ) : null }
                    {
                      presentations.map((presentation) => (
                        <option
                          key={presentation.id}
                          value={presentation.id}
                        >
                          {presentation.name}
                        </option>
                      ))
                    }
                  </Styled.InputRooms>
                </Styled.BreakoutSlideLabel>
              ) : null }
              <Styled.BreakoutBox id={`breakoutBox-${value}`} onDrop={drop(value)} onDragOver={allowDrop} tabIndex={0}>
                {this.renderUserItemByRoom(value)}
              </Styled.BreakoutBox>
              {this.hasNameDuplicated(value) ? (
                <Styled.SpanWarn valid={false}>
                  {intl.formatMessage(intlMessages.roomNameDuplicatedIsValid)}
                </Styled.SpanWarn>
              ) : null}
              {this.getRoomName(value).length === 0 ? (
                <Styled.SpanWarn valid={false} aria-hidden id={`room-error-${value}`}>
                  {intl.formatMessage(intlMessages.roomNameEmptyIsValid)}
                </Styled.SpanWarn>
              ) : null}
            </div>
          ))
        }
      </Styled.BoxContainer>
    );
  }

  renderBreakoutForm() {
    const {
      intl,
      isUpdate,
      isBreakoutRecordable,
    } = this.props;
    const {
      numberOfRooms,
      durationTime,
      numberOfRoomsIsValid,
      durationIsValid,
      freeJoin,
      record,
      captureNotes,
      captureSlides,
      inviteMods,
    } = this.state;
    if (isUpdate) return null;

    return (
      <React.Fragment key="breakout-form">
        <Styled.BreakoutSettings>
          <div>
            <Styled.FormLabel valid={numberOfRoomsIsValid} aria-hidden>
              {intl.formatMessage(intlMessages.numberOfRooms)}
            </Styled.FormLabel>
            <Styled.InputRooms
              id="numberOfRooms"
              name="numberOfRooms"
              valid={numberOfRoomsIsValid}
              value={numberOfRooms}
              onChange={this.changeNumberOfRooms}
              aria-label={intl.formatMessage(intlMessages.numberOfRooms)}
            >
              {
                range(MIN_BREAKOUT_ROOMS, MAX_BREAKOUT_ROOMS + 1).map((item) => (<option key={uniqueId('value-')}>{item}</option>))
              }
            </Styled.InputRooms>
          </div>
          <Styled.DurationLabel valid={durationIsValid} htmlFor="breakoutRoomTime">
            <Styled.LabelText aria-hidden>
              {intl.formatMessage(intlMessages.duration)}
            </Styled.LabelText>
            <Styled.DurationArea>
              <Styled.DurationInput
                type="number"
                min="1"
                value={durationTime}
                onChange={this.changeDurationTime}
                onBlur={this.blurDurationTime}
                aria-label={intl.formatMessage(intlMessages.duration)}
                data-test="durationTime"
              />
            </Styled.DurationArea>
            <Styled.SpanWarn data-test="minimumDurationWarnBreakout" valid={durationIsValid}>
              {
                intl.formatMessage(
                  intlMessages.minimumDurationWarnBreakout,
                  { 0: MIN_BREAKOUT_TIME },
                )
              }
            </Styled.SpanWarn>
          </Styled.DurationLabel>
          <Styled.CheckBoxesContainer key="breakout-checkboxes">
            <Styled.FreeJoinLabel htmlFor="freeJoinCheckbox" key="free-join-breakouts">
              <Styled.FreeJoinCheckbox
                type="checkbox"
                id="freeJoinCheckbox"
                onChange={this.setFreeJoin}
                checked={freeJoin}
                aria-label={intl.formatMessage(intlMessages.freeJoinLabel)}
              />
              <span aria-hidden>{intl.formatMessage(intlMessages.freeJoinLabel)}</span>
            </Styled.FreeJoinLabel>
            {
              isBreakoutRecordable ? (
                <Styled.FreeJoinLabel htmlFor="recordBreakoutCheckbox" key="record-breakouts">
                  <Styled.FreeJoinCheckbox
                    id="recordBreakoutCheckbox"
                    type="checkbox"
                    onChange={this.setRecord}
                    checked={record}
                    aria-label={intl.formatMessage(intlMessages.record)}
                  />
                  <span aria-hidden>
                    {intl.formatMessage(intlMessages.record)}
                  </span>
                </Styled.FreeJoinLabel>
              ) : null
            }
            {
              isImportPresentationWithAnnotationsFromBreakoutRoomsEnabled() ? (
                <Styled.FreeJoinLabel htmlFor="captureSlidesBreakoutCheckbox" key="capture-slides-breakouts">
                  <Styled.FreeJoinCheckbox
                    id="captureSlidesBreakoutCheckbox"
                    type="checkbox"
                    onChange={this.setCaptureSlides}
                    checked={captureSlides}
                    aria-label={intl.formatMessage(intlMessages.captureSlidesLabel)}
                  />
                  <span aria-hidden>
                    {intl.formatMessage(intlMessages.captureSlidesLabel)}
                  </span>
                </Styled.FreeJoinLabel>
              ) : null
            }
            {
              isImportSharedNotesFromBreakoutRoomsEnabled() ? (
                <Styled.FreeJoinLabel htmlFor="captureNotesBreakoutCheckbox" key="capture-notes-breakouts">
                  <Styled.FreeJoinCheckbox
                    id="captureNotesBreakoutCheckbox"
                    type="checkbox"
                    onChange={this.setCaptureNotes}
                    checked={captureNotes}
                    aria-label={intl.formatMessage(intlMessages.captureNotesLabel)}
                  />
                  <span aria-hidden>
                    {intl.formatMessage(intlMessages.captureNotesLabel)}
                  </span>
                </Styled.FreeJoinLabel>
              ) : null
            }
            <Styled.FreeJoinLabel htmlFor="sendInvitationToAssignedModeratorsCheckbox" key="send-invitation-to-assigned-moderators-breakouts">
              <Styled.FreeJoinCheckbox
                id="sendInvitationToAssignedModeratorsCheckbox"
                type="checkbox"
                onChange={this.setInviteMods}
                checked={inviteMods}
                aria-label={intl.formatMessage(intlMessages.sendInvitationToMods)}
              />
              <span aria-hidden>
                {intl.formatMessage(intlMessages.sendInvitationToMods)}
              </span>
            </Styled.FreeJoinLabel>
          </Styled.CheckBoxesContainer>
        </Styled.BreakoutSettings>
        <Styled.SpanWarn valid={numberOfRoomsIsValid}>
          {intl.formatMessage(intlMessages.numberOfRoomsIsValid)}
        </Styled.SpanWarn>
        <span aria-hidden id="randomlyAssignDesc" className="sr-only">
          {intl.formatMessage(intlMessages.randomlyAssignDesc)}
        </span>
        <Styled.Separator />
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
        onUncheck={(userId) => this.changeUserRoom(userId, 0)}
      />
    );
  }

  renderUnassingUsers() {
    const {
      intl,
      isUpdate,
    } = this.props;
    if (isUpdate) return null;
    const {
      numberOfRoomsIsValid,
      enableUnassingUsers,
    } = this.state;

    return (
      <Styled.AssignBtnsContainer>
        <Styled.LabelText bold aria-hidden>
          {intl.formatMessage(intlMessages.manageRooms)}
        </Styled.LabelText>
        {enableUnassingUsers ? (
          <Styled.AssignBtns
            data-test="resetAssignments"
            label={intl.formatMessage(intlMessages.resetAssignments)}
            aria-describedby="resetAssignmentsDesc"
            onClick={this.onAssignReset}
            size="sm"
            color="default"
            disabled={!numberOfRoomsIsValid}
          />
        ) : (
          <Styled.AssignBtns
            random
            data-test="randomlyAssign"
            label={intl.formatMessage(intlMessages.randomlyAssign)}
            aria-describedby="randomlyAssignDesc"
            onClick={this.onAssignRandomly}
            size="sm"
            color="default"
          />
        )}
      </Styled.AssignBtnsContainer>
    );
  }

  renderUserItemByRoom(room) {
    const {
      leastOneUserIsValid,
      selectedId,
    } = this.state;

    const { intl, isMe } = this.props;

    const dragStart = (ev) => {
      ev.dataTransfer.setData('text', ev.target.id);
      this.setState({ selectedId: ev.target.id });

      if (!leastOneUserIsValid) {
        this.setState({ leastOneUserIsValid: true });
      }
    };

    const dragEnd = () => {
      this.setState({ selectedId: '' });
    };

    return this.getUserByRoom(room)
      .map((user) => (
        <Styled.RoomUserItem
          tabIndex={-1}
          id={`roomUserItem-${user.userId}`}
          key={user.userId}
          selected={selectedId.replace('roomUserItem-', '') === user.userId.replace('roomUserItem-', '')}
          disabled={false}
          highlight={room !== user.from}
          draggable
          onDragStart={dragStart}
          onDragEnd={dragEnd}
        >
          <span>
            <span>{user.userName}</span>
            <i>{(isMe(user.userId)) ? ` (${intl.formatMessage(intlMessages.you)})` : ''}</i>
          </span>
          {room !== user.from ? (
            <span
              className="close"
              role="button"
              aria-label={intl.formatMessage(intlMessages.resetUserRoom)}
              onClick={() => this.changeUserRoom(user.userId, user.from)}
            >
              <Icon iconName="close" />
            </span>
          ) : null}
        </Styled.RoomUserItem>
      ));
  }

  renderRoomSortList() {
    const { intl } = this.props;
    const { numberOfRooms } = this.state;
    const onClick = (roomNumber) => this.setState({ formFillLevel: 3, roomSelected: roomNumber });
    return (
      <Styled.ListContainer>
        <span>
          {
            new Array(numberOfRooms).fill(1).map((room, idx) => (
              <Styled.RoomItem>
                <Styled.ItemTitle>
                  {intl.formatMessage(intlMessages.breakoutRoomLabel, { 0: idx + 1 })}
                </Styled.ItemTitle>
                <Styled.ItemButton
                  label={intl.formatMessage(intlMessages.addParticipantLabel)}
                  size="lg"
                  ghost
                  color="primary"
                  onClick={() => onClick(idx + 1)}
                />
              </Styled.RoomItem>
            ))
          }
        </span>
        {this.renderButtonSetLevel(1, intl.formatMessage(intlMessages.backLabel))}
      </Styled.ListContainer>
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
            <Styled.WithError>
              {intl.formatMessage(intlMessages.leastOneWarnBreakout)}
            </Styled.WithError>
          )}
        {!numberOfRoomsIsValid
          && (
            <Styled.WithError>
              {intl.formatMessage(intlMessages.numberOfRoomsIsValid)}
            </Styled.WithError>
          )}
        {!roomNameDuplicatedIsValid
          && (
            <Styled.WithError>
              {intl.formatMessage(intlMessages.roomNameDuplicatedIsValid)}
            </Styled.WithError>
          )}
        {!roomNameEmptyIsValid
          && (
            <Styled.WithError>
              {intl.formatMessage(intlMessages.roomNameEmptyIsValid)}
            </Styled.WithError>
          )}
      </>
    );
  }

  renderDesktop() {
    return [
      this.renderBreakoutForm(),
      this.renderUnassingUsers(),
      this.renderContent(),
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
      this.renderUnassingUsers(),
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
    const { intl, isUpdate } = this.props;
    return (
      <Styled.SubTitle>
        {isUpdate
          ? intl.formatMessage(intlMessages.breakoutRoomUpdateDesc)
          : intl.formatMessage(intlMessages.breakoutRoomDesc)}
      </Styled.SubTitle>
    );
  }

  render() {
    const { intl, isUpdate, isOpen, priority, setIsOpen, } = this.props;
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
      <ModalFullscreen
        title={
          isUpdate
            ? intl.formatMessage(intlMessages.updateTitle)
            : intl.formatMessage(intlMessages.breakoutRoomTitle)
        }
        confirm={
          {
            label: isUpdate
              ? intl.formatMessage(intlMessages.updateConfirm)
              : intl.formatMessage(intlMessages.confirmButton),
            callback: isUpdate ? this.onUpdateBreakouts : this.onCreateBreakouts,
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
          label: isUpdate
            ? intl.formatMessage(intlMessages.cancelLabel)
            : intl.formatMessage(intlMessages.dismissLabel),
        }}
        preventClosing={preventClosing}
        {...{
          isOpen,
          priority,
          setIsOpen,
        }}
      >
        <Styled.Content>
          {this.renderTitle()}
          {isMobile ? this.renderMobile() : this.renderDesktop()}
        </Styled.Content>
      </ModalFullscreen>
    );
  }
}

BreakoutRoom.propTypes = propTypes;

export default injectIntl(BreakoutRoom);
