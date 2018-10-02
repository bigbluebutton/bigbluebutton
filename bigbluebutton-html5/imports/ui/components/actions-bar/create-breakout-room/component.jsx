import React, { Component } from 'react';
import Modal from '/imports/ui/components/modal/fullscreen/component';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import HoldButton from '/imports/ui/components/presentation/presentation-toolbar/zoom-tool/holdButton/component';
import { styles } from './styles';
import Icon from '../../icon/component';

const intlMessages = defineMessages({
  BreakoutRoomTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'modal title',
  },
  BreakoutRoomDesc: {
    id: 'app.createBreakoutRoom.modalDesc',
    description: 'modal title',
  },
});

const MIN_BREAKOUT_ROOMS = 1;
const MAX_BREAKOUT_ROOMS = 8;

class BreakoutRoom extends Component {
  constructor(props) {
    super(props);
    this.changeNumberOfBreakouts = this.changeNumberOfBreakouts.bind(this);
    this.changeDurationTime = this.changeDurationTime.bind(this);
    this.increaseDurationTime = this.increaseDurationTime.bind(this);
    this.decreaseDurationTime = this.decreaseDurationTime.bind(this);

    this.state = {
      numberOfBreakouts: 1,
      durationTime: 1,
    };
  }

  changeNumberOfBreakouts(event) {
    this.setState({ numberOfBreakouts: event.target.value });
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
        title={intl.formatMessage(intlMessages.BreakoutRoomTitle)}
      >
        <div className={styles.content}>
          <p className={styles.subTitle}>
            {intl.formatMessage(intlMessages.BreakoutRoomDesc)}
          </p>
          <div className={styles.breakoutSettings}>
            <label>
              <p className={styles.labelText}>Number of Rooms</p>
              <select name="numberOfBreakouts" className={styles.inputRooms} value={this.state.numberOfBreakouts} onChange={this.changeNumberOfBreakouts}>
                {
                  _.range(MIN_BREAKOUT_ROOMS, MAX_BREAKOUT_ROOMS + 1).map(item => (<option key={_.uniqueId('value-')}>{item}</option>))
                }
              </select>
            </label>
            <label >
              <p className={styles.labelText}>Duration (minutes)</p>
              <div className={styles.durationArea}>
                <input type="number" className={styles.duration} min={MIN_BREAKOUT_ROOMS} value={this.state.durationTime} onChange={this.changeDurationTime} />
                <span>
                  <HoldButton
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
            <p className={styles.randomText}>Randomly Assign</p>
          </div>
        </div>
      </Modal >
    );
  }
}

export default injectIntl(BreakoutRoom);
