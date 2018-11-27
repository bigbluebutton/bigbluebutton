import React, { Component } from 'react';
import Modal from '/imports/ui/components/modal/fullscreen/component';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import HoldButton from '/imports/ui/components/presentation/presentation-toolbar/zoom-tool/holdButton/component';
import { styles } from './styles';
import Icon from '../../icon/component';

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
  notAssigned: {
    id: 'app.createBreakoutRoom.notAssigned',
    description: 'Not assigned label',
  },
});
const MIN_BREAKOUT_ROOMS = 2;
const MAX_BREAKOUT_ROOMS = 8;

class BreakoutRoom extends Component {
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
    this.renderUserItemByRoom = this.renderUserItemByRoom.bind(this);
    this.renderRoomsGrid = this.renderRoomsGrid.bind(this);
    this.renderBreakoutForm = this.renderBreakoutForm.bind(this);
    this.renderFreeJoinCheck = this.renderFreeJoinCheck.bind(this);
    this.state = {
      numberOfRooms: MIN_BREAKOUT_ROOMS,
      users: [],
      durationTime: 1,
      freeJoin: false,
    };
  }

  componentDidMount() {
    this.setRoomUsers();
  }

  componentDidUpdate(prevProps, prevstate) {
    const { numberOfRooms } = this.state;
    if (numberOfRooms < prevstate.numberOfRooms) {
      this.resetUserWhenRoomsChange(numberOfRooms);
    }
  }

  onCreateBreakouts() {
    const {
      createBreakoutRoom,
      meetingName,
      intl,
    } = this.props;

    const { numberOfRooms, durationTime } = this.state;
    const rooms = _.range(1, numberOfRooms + 1).map(value => ({
      users: this.getUserByRoom(value).map(u => u.userId),
      name: intl.formatMessage(intlMessages.roomName, {
        0: meetingName,
        1: value,
      }),
      freeJoin: this.state.freeJoin,
      sequence: value,
    }));

    createBreakoutRoom(rooms, durationTime, this.state.freeJoin);
  }

  setRoomUsers() {
    const { users } = this.props;
    const roomUsers = users.map(user => ({
      userId: user.userId,
      userName: user.name,
      room: 0,
    }));

    this.setState({
      users: roomUsers,
    });
  }

  setFreeJoin(e) {
    this.setState({ freeJoin: e.target.checked });
  }

  getUserByRoom(room) {
    return this.state.users.filter(user => user.room === room);
  }

  resetUserWhenRoomsChange(rooms) {
    const { users } = this.state;
    const filtredUsers = users.filter(u => u.room > rooms);
    filtredUsers.forEach(u => this.changeUserRoom(u.userId, 0));
  }

  changeUserRoom(userId, room) {
    const { users } = this.state;
    const idxUser = users.findIndex(user => user.userId === userId);
    users[idxUser].room = room;
    this.setState({ users });
  }

  increaseDurationTime() {
    this.setState({ durationTime: (1 * this.state.durationTime) + 1 });
  }

  decreaseDurationTime() {
    const number = ((1 * this.state.durationTime) - 1);
    this.setState({ durationTime: number < 1 ? 1 : number });
  }

  changeDurationTime(event) {
    this.setState({ durationTime: Number.parseInt(event.target.value, 10) || '' });
  }

  changeNumberOfRooms(event) {
    this.setState({ numberOfRooms: Number.parseInt(event.target.value, 10) });
  }

  renderRoomsGrid() {
    const { intl } = this.props;

    const allowDrop = (ev) => {
      ev.preventDefault();
    };

    const drop = room => (ev) => {
      ev.preventDefault();
      const data = ev.dataTransfer.getData('text');
      this.changeUserRoom(data, room);
    };

    return (
      <div className={styles.boxContainer}>
        <label htmlFor="BreakoutRoom">
          <p className={styles.freeJoinLabel}>{intl.formatMessage(intlMessages.notAssigned, { 0: this.getUserByRoom(0).length })}</p>
          <div className={styles.breakoutBox} onDrop={drop(0)} onDragOver={allowDrop} >
            {this.renderUserItemByRoom(0)}
          </div>
        </label>
        {
          _.range(1, this.state.numberOfRooms + 1).map(value =>
            (
              <label htmlFor="BreakoutRoom">
                <p
                  className={styles.freeJoinLabel}
                >
                  {intl.formatMessage(intlMessages.roomLabel, { 0: (value) })}
                </p>
                <div className={styles.breakoutBox} onDrop={drop(value)} onDragOver={allowDrop}>
                  {this.renderUserItemByRoom(value)}
                </div>
              </label>))
        }
      </div>
    );
  }

  renderBreakoutForm() {
    const { intl } = this.props;

    return (
      <div className={styles.breakoutSettings}>
        <label htmlFor="numberOfRooms">
          <p className={styles.labelText}>{intl.formatMessage(intlMessages.numberOfRooms)}</p>
          <select
            name="numberOfRooms"
            className={styles.inputRooms}
            value={this.state.numberOfRooms}
            onChange={this.changeNumberOfRooms}
          >
            {
              _.range(MIN_BREAKOUT_ROOMS, MAX_BREAKOUT_ROOMS + 1).map(item => (<option key={_.uniqueId('value-')}>{item}</option>))
            }
          </select>
        </label>
        <label htmlFor="breakoutRoomTime" >
          <p className={styles.labelText}>{intl.formatMessage(intlMessages.duration)}</p>
          <div className={styles.durationArea}>
            <input
              type="number"
              className={styles.duration}
              min={MIN_BREAKOUT_ROOMS}
              value={this.state.durationTime}
              onChange={this.changeDurationTime}
            />
            <span>
              <HoldButton
                key="decrease-breakout-time"
                exec={this.decreaseDurationTime}
                minBound={MIN_BREAKOUT_ROOMS}
                value={this.state.durationTime}
              >
                <Icon
                  className={styles.iconsColor}
                  iconName="substract"
                />
              </HoldButton>
              <HoldButton
                key="increase-breakout-time"
                exec={this.increaseDurationTime}
              >
                <Icon
                  className={styles.iconsColor}
                  iconName="add"
                />
              </HoldButton>

            </span>
          </div>
        </label>
        <p className={styles.randomText}>{intl.formatMessage(intlMessages.randomlyAssign)}</p>
      </div>
    );
  }

  renderFreeJoinCheck() {
    const { intl } = this.props;
    return (
      <label htmlFor="freeJoinCheckbox" className={styles.freeJoinLabel}>
        <input
          type="checkbox"
          className={styles.freeJoinCheckbox}
          onChange={this.setFreeJoin}
          checked={this.state.freeJoin}
        />
        {intl.formatMessage(intlMessages.freeJoinLabel)}
      </label>
    );
  }

  renderUserItemByRoom(room) {
    const drag = (ev) => {
      ev.dataTransfer.setData('text', ev.target.id);
    };

    return this.getUserByRoom(room)
      .map(user => (
        <p
          id={user.userId}
          className={styles.roomUserItem}
          draggable
          onDragStart={drag}
        >
          {user.userName}
        </p>));
  }

  render() {
    const { intl } = this.props;

    return (
      <Modal
        title={intl.formatMessage(intlMessages.breakoutRoomTitle)}
        confirm={
          {
            label: intl.formatMessage(intlMessages.confirmButton),
            callback: this.onCreateBreakouts,
          }
        }
      >
        <div className={styles.content}>
          <p className={styles.subTitle}>
            {intl.formatMessage(intlMessages.breakoutRoomDesc)}
          </p>
          {this.renderBreakoutForm()}
          {this.renderFreeJoinCheck()}
          {this.renderRoomsGrid()}
        </div>
      </Modal >
    );
  }
}

export default injectIntl(BreakoutRoom);
