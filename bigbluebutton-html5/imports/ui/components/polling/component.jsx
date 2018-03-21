import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { styles } from './styles.scss';

const intlMessages = defineMessages({
  pollingTitleLabel: {
    id: 'app.polling.pollingTitle',
    description: 'Title label for polling options',
  },
});

class PollingComponent extends Component {
  getStyles() {
    const number = this.props.poll.answers.length + 1;
    const buttonStyle =
      {
        width: `calc(75%/ ${number} )`,
        marginLeft: `calc(25%/${number * 2})`,
        marginRight: `calc(25%/${number * 2})`,
      };

    return buttonStyle;
  }

  render() {
    const poll = this.props.poll;
    const calculatedStyles = this.getStyles();
    const { intl } = this.props;

    return (
      <div className={styles.pollingContainer} role="alert">
        <div className={styles.pollingTitle}>
          <p>
            {intl.formatMessage(intlMessages.pollingTitleLabel)}
          </p>
        </div>
        {poll.answers.map(pollAnswer =>
          (<div
            key={pollAnswer.id}
            style={calculatedStyles}
            className={styles.pollButtonWrapper}
          >
            <Button
              className={styles.pollingButton}
              size="lg"
              color="primary"
              label={pollAnswer.key}
              onClick={() => this.props.handleVote(poll.pollId, pollAnswer)}
              aria-labelledby={`pollAnswerLabel${pollAnswer.key}`}
              aria-describedby={`pollAnswerDesc${pollAnswer.key}`}
              showTip
            />
            <div
              className={styles.hidden}
              id={`pollAnswerLabel${pollAnswer.key}`}
            >
              {`Poll answer ${pollAnswer.key}`}
            </div>
            <div
              className={styles.hidden}
              id={`pollAnswerDesc${pollAnswer.key}`}
            >
              {`Select this option to vote for ${pollAnswer.key}`}
            </div>
          </div>))}
      </div>
    );
  }
}

export default injectWbResizeEvent(injectIntl(PollingComponent));

PollingComponent.propTypes = {
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
