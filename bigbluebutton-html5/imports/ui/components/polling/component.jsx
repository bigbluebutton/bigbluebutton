import React from 'react';
import {Button} from '../shared/Button.jsx';

export default class PollingComponent extends React.Component {
  render() {
    const poll = this.props.poll;
    return (
      <div>
        {poll.answers.map((pollAnswer, index) => {
          return (
            <Button className="button mediumFont" key={index}
              onClick={() => this.props.handleVote(poll.pollId, pollAnswer)} componentClass="span">
              {pollAnswer.key}
            </Button>
          );
        })}
      </div>
    );
  }
};
