import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';
import Service from './service';

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.poll.liveResult.usersTitle',
    description: 'heading label for poll users',
  },
  responsesTitle: {
    id: 'app.poll.liveResult.responsesTitle',
    description: 'heading label for poll responses',
  },
  publishLabel: {
    id: 'app.poll.publishLabel',
    description: 'label for the publish button',
  },
  backLabel: {
    id: 'app.poll.backLabel',
    description: 'label for the return to poll options button',
  },
});

class LiveResult extends Component {
  static getDerivedStateFromProps(nextProps) {
    const { currentPoll, getUser } = nextProps;

    if (!currentPoll) return null;

    const {
      answers, responses, users, numRespondents,
    } = currentPoll;

    let userAnswers = responses
      ? [...users, ...responses.map(u => u.userId)]
      : [...users];

    userAnswers = userAnswers.map(id => getUser(id))
      .filter(user => user.connectionStatus === 'online')
      .map((user) => {
        let answer = '-';

        if (responses) {
          const response = responses.find(r => r.userId === user.userId);
          if (response) answer = answers[response.answerId].key;
        }

        return {
          name: user.name,
          answer,
        };
      })
      .sort(Service.sortUsers)
      .reduce((acc, user) => [
        ...acc,
        <div className={styles.item} key={_.uniqueId('stats-')}>{user.name}</div>,
        <div className={styles.itemR} key={_.uniqueId('stats-')}>{user.answer}</div>,
      ], []);

    const pollStats = [];

    answers.map((obj) => {
      const pct = Math.round(obj.numVotes / numRespondents * 100);

      return pollStats.push(
        <div className={styles.main} key={_.uniqueId('stats-')}>
          <div className={styles.left}>
            {obj.key}
          </div>
          <div className={styles.center}>
            {obj.numVotes}
          </div>
          <div className={styles.right}>
            {`${Number.isNaN(pct) ? 0 : pct}%`}
          </div>
        </div>,
      );
    });

    return {
      userAnswers,
      pollStats,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      userAnswers: null,
      pollStats: null,
    };
  }

  render() {
    const {
      intl, publishPoll, stopPoll, handleBackClick, currentPoll,
    } = this.props;

    const { userAnswers, pollStats } = this.state;

    return (
      <div>
        <div className={styles.stats}>
          {pollStats}
        </div>
        {currentPoll
          ? (
            <Button
              onClick={() => {
                publishPoll();
                stopPoll();
              }}
              label={intl.formatMessage(intlMessages.publishLabel)}
              color="primary"
              className={styles.btn}
            />
          ) : (
            <Button
              onClick={() => {
                handleBackClick();
              }}
              label={intl.formatMessage(intlMessages.backLabel)}
              color="default"
              className={styles.btn}
            />
          )
        }
        <div className={styles.container}>
          <h3 className={styles.usersHeading}>
            {intl.formatMessage(intlMessages.usersTitle)}
          </h3>
          <h3 className={styles.responseHeading}>
            {intl.formatMessage(intlMessages.responsesTitle)}
          </h3>
          {userAnswers}
        </div>
      </div>
    );
  }
}

export default injectIntl(LiveResult);

LiveResult.defaultProps = { currentPoll: null };

LiveResult.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentPoll: PropTypes.oneOfType([
    PropTypes.arrayOf(Object),
    PropTypes.shape({
      answers: PropTypes.arrayOf(PropTypes.object),
      users: PropTypes.arrayOf(PropTypes.string),
    }),
  ]),
  publishPoll: PropTypes.func.isRequired,
  stopPoll: PropTypes.func.isRequired,
  handleBackClick: PropTypes.func.isRequired,
};
