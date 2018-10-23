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
    description: 'modal title',
  },
  confirmButton: {
    id: 'app.createBreakoutRoom.confirm',
    description: 'modal title',
  },
  numberOfRooms: {
    id: 'app.createBreakoutRoom.numberOfRooms',
    description: 'modal title',
  },
  duration: {
    id: 'app.createBreakoutRoom.durationInMinutes',
    description: 'modal title',
  },
  randomlyAssign: {
    id: 'app.createBreakoutRoom.randomlyAssign',
    description: 'modal title',
  },
});
const BREAKOUT_CONFIG = Meteor.settings.public.breakout;
const MIN_BREAKOUT_ROOMS = BREAKOUT_CONFIG.rooms.min;
const MAX_BREAKOUT_ROOMS = BREAKOUT_CONFIG.rooms.max;

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
    };
  }

  onCreateBreakouts() {
    const {
      createBreakoutRoom,
    } = this.props;

    const { numberOfRooms, durationTime } = this.state;

    createBreakoutRoom(numberOfRooms, durationTime, true);
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
              <select name="numberOfRooms" className={styles.inputRooms} value={this.state.numberOfRooms} onChange={this.changeNumberOfRooms}>
                {
                  _.range(MIN_BREAKOUT_ROOMS, MAX_BREAKOUT_ROOMS + 1).map(item => (<option key={_.uniqueId('value-')}>{item}</option>))
                }
              </select>
            </label>
            <label >
              <p className={styles.labelText}>{intl.formatMessage(intlMessages.duration)}</p>
              <div className={styles.durationArea}>
                <input type="number" className={styles.duration} min={MIN_BREAKOUT_ROOMS} value={this.state.durationTime} onChange={this.changeDurationTime} />
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
