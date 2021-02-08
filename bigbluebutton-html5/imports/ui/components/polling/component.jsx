import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { Meteor } from 'meteor/meteor';
import { styles } from './styles.scss';
import AudioService from '/imports/ui/components/audio/service';
import Checkbox from '/imports/ui/components/checkbox/component';

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
  pollSubmitLabel: {
    id: 'app.polling.pollSubmitLabel',
  },
});

class Polling extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checkedAnswers: [],
    };

    this.play = this.play.bind(this);
    this.renderButtonAnswers = this.renderButtonAnswers.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderCheckboxAnswers = this.renderCheckboxAnswers.bind(this);
  }

  componentDidMount() {
    this.play();
  }

  play() {
    AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
      + Meteor.settings.public.app.basename
      + Meteor.settings.public.app.instanceId}`
      + '/resources/sounds/Poll.mp3');
  }

  renderButtonAnswers(pollAnswerStyles) {
    const {
      isMeteorConnected,
      intl,
      poll,
      handleVote,
      pollAnswerIds,
    } = this.props;

    return (
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
                onClick={() => handleVote(poll.pollId, [pollAnswer.id])}
                aria-labelledby={`pollAnswerLabel${pollAnswer.key}`}
                aria-describedby={`pollAnswerDesc${pollAnswer.key}`}
              />
              <div
                className={styles.hidden}
                id={`pollAnswerLabel${pollAnswer.key}`}
              >
                {intl.formatMessage(intlMessages.pollAnswerLabel, {0: label})}
              </div>
              <div
                className={styles.hidden}
                id={`pollAnswerDesc${pollAnswer.key}`}
              >
                {intl.formatMessage(intlMessages.pollAnswerDesc, {0: label})}
              </div>
            </div>
          );
        })}
      </div>
    )
  }

  handleCheckboxChange(pollId, answerId) {
    const { checkedAnswers } = this.state;
    if (checkedAnswers.includes(answerId)) {
      checkedAnswers.splice(checkedAnswers.indexOf(answerId), 1);
    } else {
      checkedAnswers.push(answerId);
    }
    checkedAnswers.sort();
  }

  handleSubmit(pollId) {
    const { handleVote } = this.props;
    const { checkedAnswers } = this.state;
    handleVote(pollId, checkedAnswers);
  }

  renderCheckboxAnswers(pollAnswerStyles) {
    const {
      isMeteorConnected,
      intl,
      poll,
      pollAnswerIds,
    } = this.props;
    return (
      <div>
        <div className={cx(pollAnswerStyles)}>
          <div>
            {poll.answers.map((pollAnswer) => {
              const formattedMessageIndex = pollAnswer.key.toLowerCase();
              let label = pollAnswer.key;
              if (pollAnswerIds[formattedMessageIndex]) {
                label = intl.formatMessage(pollAnswerIds[formattedMessageIndex]);
              }

              return (
                <div
                  key={pollAnswer.id}
                >
                  <Checkbox
                      disabled={!isMeteorConnected}
                      id={`answerInput${pollAnswer.key}`}
                      onChange={() => this.handleCheckboxChange(poll.pollId, pollAnswer.id)}
                      className={styles.checkbox}
                      aria-labelledby={`pollAnswerLabel${pollAnswer.key}`}
                      aria-describedby={`pollAnswerDesc${pollAnswer.key}`}
                  />
                  <label id={`pollAnswerLabel${pollAnswer.key}`}>
                    {label}
                  </label>
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
        <div>
          <Button
            disabled={!isMeteorConnected}
            className={styles.pollingButton}
            color="primary"
            size="md"
            label={intl.formatMessage(intlMessages.pollSubmitLabel)}
            onClick={() => this.handleSubmit(poll.pollId)}
          />
        </div>
      </div>
    );
  }

  render() {
    const {
      intl,
      poll,
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
          {poll.isMultipleResponse ? this.renderCheckboxAnswers(pollAnswerStyles) : this.renderButtonAnswers(pollAnswerStyles)}
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
