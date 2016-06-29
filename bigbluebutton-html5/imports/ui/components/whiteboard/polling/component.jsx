import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';

export default class PollingComponent extends React.Component {
  render() {
    const poll = this.props.poll;
    return (
      <div className={styles.pollingContainer}>
        {poll.answers.map((pollAnswer, index) =>
            <Button className="button mediumFont" key={index}
              onClick={() => this.props.handleVote(poll.pollId, pollAnswer)} componentClass="span">
              {pollAnswer.key}
            </Button>
        )}
      </div>
    );
  }
};
