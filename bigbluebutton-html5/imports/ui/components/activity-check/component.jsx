import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape } from 'react-intl';

import Button from '/imports/ui/components/button/component';
import Modal from '/imports/ui/components/modal/simple/component';
import { makeCall } from '/imports/ui/services/api';

import { styles } from './styles';

const propTypes = {
  intl: intlShape.isRequired,
  responseDelay: PropTypes.number.isRequired,
};

const intlMessages = defineMessages({
  activityCheckTitle: {
    id: 'app.user.activityCheck',
    description: 'Title for activity check modal',
  },
  activityCheckLabel: {
    id: 'app.user.activityCheck.label',
    description: 'Label for activity check modal',
  },
  activityCheckButton: {
    id: 'app.user.activityCheck.check',
    description: 'Check button for activity modal',
  },
});

const handleInactivityDismiss = () => makeCall('userActivitySign');

class ActivityCheck extends Component {
  constructor(props) {
    super(props);

    const { responseDelay } = this.props;

    this.state = ({
      responseDelay,
    });

    this.stopRemainingTime = this.stopRemainingTime.bind(this);
    this.updateRemainingTime = this.updateRemainingTime.bind(this);
    this.playAudioAlert = this.playAudioAlert.bind(this);
  }

  componentDidMount() {
    this.playAudioAlert();
    this.interval = this.updateRemainingTime();
  }

  componentDidUpdate() {
    this.stopRemainingTime();
    this.interval = this.updateRemainingTime();
  }

  componentWillUnmount() {
    this.stopRemainingTime();
  }

  updateRemainingTime() {
    const { responseDelay } = this.state;

    return setInterval(() => {
      const remainingTime = responseDelay - 1;
      this.setState({
        responseDelay: remainingTime,
      });
    }, 1000);
  }

  stopRemainingTime() {
    clearInterval(this.interval);
  }

  playAudioAlert() {
    this.alert = new Audio(`${Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename}/resources/sounds/notify.mp3`);
    this.alert.play();
  }

  render() {
    const { intl } = this.props;

    const { responseDelay } = this.state;

    return (
      <Modal
        hideBorder
        onRequestClose={handleInactivityDismiss}
        shouldCloseOnOverlayClick={false}
        shouldShowCloseButton={false}
      >
        <div className={styles.activityModalContent}>
          <h1>{intl.formatMessage(intlMessages.activityCheckTitle)}</h1>
          <p>{intl.formatMessage(intlMessages.activityCheckLabel, { 0: responseDelay })}</p>
          <Button
            color="primary"
            label={intl.formatMessage(intlMessages.activityCheckButton)}
            onClick={handleInactivityDismiss}
            role="button"
            size="lg"
          />
        </div>
      </Modal>
    );
  }
}

ActivityCheck.propTypes = propTypes;

export default ActivityCheck;
