import React from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { defineMessages, injectIntl } from 'react-intl';
import Tooltip from '/imports/ui/components/tooltip/component';
import { styles } from './styles.scss';

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

const Polling = ({ intl, poll, handleVote }) => (
  <div className={styles.pollingContainer} role="alert">
    <div className={styles.pollingTitle}>
      {intl.formatMessage(intlMessages.pollingTitleLabel)}
    </div>
    <div className={styles.pollingAnswers}>
      {poll.answers.map(pollAnswer => (
        <div
          key={pollAnswer.id}
          className={styles.pollButtonWrapper}
        >
          <Tooltip
            key={pollAnswer.id}
            title={pollAnswer.key}
          >
            <Button
              className={styles.pollingButton}
              color="default"
              size="lg"
              label={pollAnswer.key}
              onClick={() => handleVote(poll.pollId, pollAnswer)}
              aria-labelledby={`pollAnswerLabel${pollAnswer.key}`}
              aria-describedby={`pollAnswerDesc${pollAnswer.key}`}
            />
          </Tooltip>
          <div
            className={styles.hidden}
            id={`pollAnswerLabel${pollAnswer.key}`}
          >
            {intl.formatMessage(intlMessages.pollAnswerLabel, { 0: pollAnswer.key })}
          </div>
          <div
            className={styles.hidden}
            id={`pollAnswerDesc${pollAnswer.key}`}
          >
            {intl.formatMessage(intlMessages.pollAnswerDesc, { 0: pollAnswer.key })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
