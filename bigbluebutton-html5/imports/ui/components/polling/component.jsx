import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { styles } from './styles.scss';

const MAX_INPUT_CHARS = 45;

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
  pollQestionTitle: {
    id: 'app.polling.pollQestionTitle',
  },
  submitLabel: {
    id: 'app.polling.submitLabel',
  },
  submitAriaLabel: {
    id: 'app.polling.submitAriaLabel',
  },
  responsePlaceholder: {
    id: 'app.polling.responsePlaceholder',
  },
});

const validateInput = (i) => {
  let _input = i;
  if (/^\s/.test(_input)) _input = '';
  return _input;
};

class Polling extends Component {
  constructor(props) {
    super(props);

    this.state = {
      typedAns: '',
    };

    this.play = this.play.bind(this);
    this.handleUpdateResponseInput = this.handleUpdateResponseInput.bind(this);
  }

  componentDidMount() {
    this.play();
  }

  play() {
    this.alert = new Audio(`${Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename}/resources/sounds/Poll.mp3`);
    this.alert.play();
  }

  handleUpdateResponseInput(e) {
    this.responseInput.value = validateInput(e.target.value);
    this.setState({ typedAns: this.responseInput.value });
  }

  render() {
    const {
      isMeteorConnected,
      intl,
      poll,
      handleVote,
      handleTypedVote,
      pollAnswerIds,
    } = this.props;

    const {
      typedAns,
    } = this.state;

    const { stackOptions, answers, question } = poll;
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
          {question.length > 0 && (
            <span className={styles.qHeader}>
              <div className={styles.qTitle}>{intl.formatMessage(intlMessages.pollQestionTitle)}</div>
              <div className={styles.qText}>{question}</div>
            </span>)
          }
          { poll.pollType !== 'RP' && (
            <span>
              {question.length === 0
                && (
                <div className={styles.pollingTitle}>
                  {intl.formatMessage(intlMessages.pollingTitleLabel)}
                </div>
                )
              }

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
            </span>
          )
          }
          { poll.pollType === 'RP'
            && (
            <div className={styles.typedResponseWrapper}>
              <input
                onChange={(e) => {
                  this.handleUpdateResponseInput(e);
                }}
                type="text"
                className={styles.typedResponseInput}
                placeholder={intl.formatMessage(intlMessages.responsePlaceholder)}
                maxLength={MAX_INPUT_CHARS}
                ref={(r) => { this.responseInput = r; }}
              />
              <Button
                disabled={typedAns.length === 0}
                color="primary"
                size="sm"
                label={intl.formatMessage(intlMessages.submitLabel)}
                aria-label={intl.formatMessage(intlMessages.submitAriaLabel)}
                onClick={() => {
                  handleTypedVote(poll.pollId, typedAns);
                }}
              />
            </div>
            )
          }
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
