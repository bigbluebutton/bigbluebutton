import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';

export default class PollingComponent extends React.Component {
  constructor(props) {
    super(props);
  }

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

    return (
      <div className={styles.pollingContainer}>
        <div className={styles.pollingTitle}>
          <p>
          Polling Options
          </p>
        </div>
        {poll.answers.map((pollAnswer, index) =>
            <Button
              style={calculatedStyles}
              size="lg"
              color="primary"
              className={styles.pollingButton}
              key={index}
              onClick={() => this.props.handleVote(poll.pollId, pollAnswer)}
              componentClass="span"
            >
              {pollAnswer.key}
            </Button>
        )}
      </div>
    );
  }
};
