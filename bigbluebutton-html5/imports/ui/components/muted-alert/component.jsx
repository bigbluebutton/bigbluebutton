import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import hark from 'hark';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles';

const MUTE_WARNING_TIMEOUT = 4000;

const propTypes = {
  inputStream: PropTypes.object.isRequired,
};

class MutedAlert extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };

    this.speechEvents = null;
    this.timer = null;

    this.resetTimer = this.resetTimer.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    const { inputStream } = this.props;
    this.speechEvents = hark(inputStream, { interval: 200 });
    this.speechEvents.on('speaking', () => {
      this.resetTimer();
      if (this._isMounted) this.setState({ visible: true });
    });
    this.speechEvents.on('stopped_speaking', () => {
      if (this._isMounted) {
        this.timer = setTimeout(() => this.setState(
          { visible: false },
        ), MUTE_WARNING_TIMEOUT);
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.speechEvents) this.speechEvents.stop();
  }

  resetTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  render() {
    const { visible } = this.state;
    return visible ? (
      <div className={styles.muteWarning}>
        <span>
          <FormattedMessage
            id="app.muteWarning.label"
            description="Warning when someone speaks while muted"
            values={{
              0: <Icon iconName="mute" />,
            }}
          />
        </span>
      </div>
    ) : null;
  }
}

MutedAlert.propTypes = propTypes;

export default MutedAlert;
