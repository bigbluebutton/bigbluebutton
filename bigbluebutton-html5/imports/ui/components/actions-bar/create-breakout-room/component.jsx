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
});
const MIN_BREAKOUT_ROOMS = 2;
const MAX_BREAKOUT_ROOMS = 8;

class BreakoutRoom extends Component {
  constructor(props) {
    super(props);
    this.changeNumberOfRooms = this.changeNumberOfRooms.bind(this);
    this.changeDurationTime = this.changeDurationTime.bind(this);
    this.increaseDurationTime = this.increaseDurationTime.bind(this);
    this.decreaseDurationTime = this.decreaseDurationTime.bind(this);
    this.onCreateBreakouts = this.onCreateBreakouts.bind(this);

    this.state = {
      numberOfRooms: MIN_BREAKOUT_ROOMS,
      durationTime: 1,
      freeJoin: true,
    };
  }

  onCreateBreakouts() {
    const {
      createBreakoutRoom,
      meetingName,
      intl,
    } = this.props;

    const { numberOfRooms, durationTime } = this.state;
    const rooms = _.range(1, numberOfRooms + 1).map(value => ({
      users: [],
      name: intl.formatMessage(intlMessages.roomName, {
        0: meetingName,
        1: value,
      }),
      freeJoin: this.state.freeJoin,
      sequence: value,
    }));

    createBreakoutRoom(rooms, durationTime, true);
  }

  changeNumberOfRooms(event) {
    this.setState({ numberOfRooms: Number.parseInt(event.target.value, 10) });
  }

  changeDurationTime(event) {
    this.setState({ durationTime: Number.parseInt(event.target.value, 10) || '' });
  }

  increaseDurationTime() {
    this.setState({ durationTime: (1 * this.state.durationTime) + 1 });
  }

  decreaseDurationTime() {
    const number = ((1 * this.state.durationTime) - 1);
    this.setState({ durationTime: number < 1 ? 1 : number });
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
          <div className={styles.breakoutSettings}>
            <label>
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
            <label >
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
        </div>
      </Modal >
    );
  }
}

export default injectIntl(BreakoutRoom);
