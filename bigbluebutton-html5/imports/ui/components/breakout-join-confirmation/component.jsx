import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/fullscreen/component';
import AudioService from '../audio/service';
import { styles } from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.breakoutJoinConfirmation.title',
    description: 'Join breakout room title',
  },
  message: {
    id: 'app.breakoutJoinConfirmation.message',
    description: 'Join breakout confim message',
  },
  freeJoinMessage: {
    id: 'app.breakoutJoinConfirmation.freeJoinMessage',
    description: 'Join breakout confim message',
  },
  confirmLabel: {
    id: 'app.breakoutJoinConfirmation.confirmLabel',
    description: 'Join confirmation button label',
  },
  confirmDesc: {
    id: 'app.breakoutJoinConfirmation.confirmDesc',
    description: 'adds context to confirm option',
  },
  dismissLabel: {
    id: 'app.breakoutJoinConfirmation.dismissLabel',
    description: 'Cancel button label',
  },
  dismissDesc: {
    id: 'app.breakoutJoinConfirmation.dismissDesc',
    description: 'adds context to dismiss option',
  },
});

class BreakoutJoinConfirmation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectValue: props.breakout.breakoutId,
    };

    this.handleJoinBreakoutConfirmation = this.handleJoinBreakoutConfirmation.bind(this);
    this.renderSelectMeeting = this.renderSelectMeeting.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  handleJoinBreakoutConfirmation() {
    const {
      getURL,
      mountModal,
      breakoutURL,
      isFreeJoin,
    } = this.props;
    const url = isFreeJoin ? getURL(this.state.selectValue) : breakoutURL;
    // leave main room's audio when joining a breakout room
    AudioService.exitAudio();

    window.open(url);
    mountModal(null);
  }
  handleSelectChange(e) {
    const { value } = e.target;
    this.setState({ selectValue: value });
    this.props.requestJoinURL(value);
  }

  renderSelectMeeting() {
    const { breakouts, intl } = this.props;
    return (
      <div className={styles.selectParent}>
        {`${intl.formatMessage(intlMessages.freeJoinMessage)}`}
        <select
          className={styles.select}
          value={this.state.selectValue}
          onChange={this.handleSelectChange}
        >
          {breakouts.map(({ name, breakoutId }) => (<option key={breakoutId} value={breakoutId} >{name}</option>))}
        </select>
      </div>
    );
  }

  render() {
    const { intl, breakoutName, isFreeJoin } = this.props;
    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        confirm={{
          callback: this.handleJoinBreakoutConfirmation,
          label: intl.formatMessage(intlMessages.confirmLabel),
          description: intl.formatMessage(intlMessages.confirmDesc),
        }}
        dismiss={{
          label: intl.formatMessage(intlMessages.dismissLabel),
          description: intl.formatMessage(intlMessages.dismissDesc),
        }}
      >
        { isFreeJoin ? this.renderSelectMeeting() : `${intl.formatMessage(intlMessages.message)} ${breakoutName}?`}
      </Modal>
    );
  }
}

export default withModalMounter(injectIntl(BreakoutJoinConfirmation));
