import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { styles } from './styles.scss';
import AudioService from '/imports/ui/components/audio/service';

const intlMessages = defineMessages({
  pollingTitleLabel: {
    id: 'app.polling.pollingTitle',
  },
  pollAnswerLabel: {
    id: 'app.polling.pollAnswerLabel',
  },
  pollAnswerDesc: {
    id: 'app.polling.pollAnswerDesc',
  },
});

class Polling extends Component {
  constructor(props) {
    super(props);

    this.play = this.play.bind(this);
  }

  componentDidMount() {
    this.play();
  }

  play() {
    AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
      + Meteor.settings.public.app.basename}`
      + '/resources/sounds/Poll.mp3');
  }

  render() {
    const {
      isMeteorConnected,
      intl,
      poll,
      handleVote,
      pollAnswerIds,
    } = this.props;

    if (!poll) return null;

    const { stackOptions, answers } = poll;
    const pollAnswerStyles = {
      [styles.pollingAnswers]: true,
      [styles.removeColumns]: answers.length === 1,
      [styles.stacked]: stackOptions,
    };

    return (
      <div className={styles.overlay}>
        <div
          className={cx({
            [styles.pollingContainer]: true,
            [styles.autoWidth]: stackOptions,
          })}
          role="alert"
        >
          <div className={styles.pollingTitle}>
            {intl.formatMessage(intlMessages.pollingTitleLabel)}
          </div>
          <div className={cx(pollAnswerStyles)}>
            {poll.answers.map((pollAnswer) => {
              const formattedMessageIndex = pollAnswer.key.toLowerCase();
              let label = pollAnswer.key;
              if (pollAnswerIds[formattedMessageIndex]) {
                label = intl.formatMessage(pollAnswerIds[formattedMessageIndex]);
              }

              return (
                <div
                  key={pollAnswer.id}
                  className={styles.pollButtonWrapper}
                >
                  <Button
                    disabled={!isMeteorConnected}
                    className={styles.pollingButton}
                    color="primary"
                    size="md"
                    label={label}
                    key={pollAnswer.key}
                    onClick={() => handleVote(poll.pollId, pollAnswer)}
                    aria-labelledby={`pollAnswerLabel${pollAnswer.key}`}
                    aria-describedby={`pollAnswerDesc${pollAnswer.key}`}
                  />
                  <div
                    className={styles.hidden}
                    id={`pollAnswerLabel${pollAnswer.key}`}
                  >
                    {intl.formatMessage(intlMessages.pollAnswerLabel, { 0: label })}
                  </div>
                  <div
                    className={styles.hidden}
                    id={`pollAnswerDesc${pollAnswer.key}`}
                  >
                    {intl.formatMessage(intlMessages.pollAnswerDesc, { 0: label })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>);
  }
}

export default injectIntl(injectWbResizeEvent(Polling));

Polling.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleVote: PropTypes.func.isRequired,
  poll: PropTypes.shape({
    pollId: PropTypes.string.isRequired,
    answers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      key: PropTypes.string.isRequired,
    }).isRequired).isRequired,
  }).isRequired,
};
