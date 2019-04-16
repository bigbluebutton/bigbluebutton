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
        (
          <tr key={_.uniqueId('stats-')}>
            <td className={styles.resultLeft}>{user.name}</td>
            <td className={styles.resultRight}>{user.answer}</td>
          </tr>
        ),
      ], []);

    const pollStats = [];

    answers.map((obj) => {
      const pct = Math.round(obj.numVotes / numRespondents * 100);
      const pctFotmatted = `${Number.isNaN(pct) ? 0 : pct}%`;

      const calculatedWidth = {
        width: pctFotmatted,
      };

      return pollStats.push(
        <div className={styles.main} key={_.uniqueId('stats-')}>
          <div className={styles.left}>
            {obj.key}
          </div>
          <div className={styles.center}>
            <div className={styles.barShade} style={calculatedWidth} />
            <div className={styles.barVal}>{obj.numVotes || 0}</div>
          </div>
          <div className={styles.right}>
            {pctFotmatted}
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
        <table>
          <tbody>
            <tr>
              <th className={styles.theading}>{intl.formatMessage(intlMessages.usersTitle)}</th>
              <th className={styles.theading}>{intl.formatMessage(intlMessages.responsesTitle)}</th>
            </tr>
            {userAnswers}
          </tbody>
        </table>
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
