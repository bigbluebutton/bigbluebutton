import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import { Session } from 'meteor/session';
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
  constructor(props) {
    super(props);

    this.renderPollStats = this.renderPollStats.bind(this);
    this.renderAnswers = this.renderAnswers.bind(this);
  }

  renderAnswers() {
    const { currentPoll, getUser } = this.props;

    if (!currentPoll) return null;

    const { answers, responses, users } = currentPoll;

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

    return userAnswers;
  }

  renderPollStats() {
    const { currentPoll } = this.props;

    const pollStats = [];

    if (!currentPoll) return;

    const {
      answers,
      numRespondents,
    } = currentPoll;

    if (!answers) return;

    answers.map((obj) => {
      const pct = Math.round(obj.numVotes / numRespondents * 100);

      return pollStats.push(<div className={styles.main} key={_.uniqueId('stats-')}>
        <div className={styles.left}>
          {obj.key}
        </div>
        <div className={styles.center}>
          {obj.numVotes}
        </div>
        <div className={styles.right}>
          {`${isNaN(pct) ? 0 : pct}%`}
        </div>
      </div>);
    });

    return pollStats;
  }

  render() {
    const {
      intl, publishPoll, stopPoll, handleBackClick,
    } = this.props;

    return (
      <div>
        <div className={styles.stats}>
          {this.renderPollStats()}
        </div>
        <Button
          onClick={() => {
            publishPoll();
            stopPoll();
            Session.set('isUserListOpen', true);
            Session.set('isPollOpen', false);
            Session.set('forcePollOpen', false);
          }}
          label={intl.formatMessage(intlMessages.publishLabel)}
          color="primary"
          className={styles.btn}
        />
        <Button
          onClick={() => {
            handleBackClick();
          }}
          label={intl.formatMessage(intlMessages.backLabel)}
          color="default"
          className={styles.btn}
        />
        <div className={styles.container}>
          <div className={styles.usersHeading}>{intl.formatMessage(intlMessages.usersTitle)}</div>
          <div className={styles.responseHeading}>{intl.formatMessage(intlMessages.responsesTitle)}</div>
          {this.renderAnswers()}
        </div>
      </div>
    );
  }
}

export default injectIntl(LiveResult);

LiveResult.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};
