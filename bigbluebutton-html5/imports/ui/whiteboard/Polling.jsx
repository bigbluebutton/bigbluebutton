import React from 'react';
import { Button } from '../shared/Button.jsx';

export let Polling = React.createClass({
  //#TODO Move this to parent later?
  mixins: [ReactMeteorData],
  getMeteorData() {
    let poll;
    poll = BBB.getCurrentPoll(getInSession('userId'));
    return {
      poll: poll
    };
  },
  
  componentDidMount: function() {
    return scaleWhiteboard();
  },

  componentWillUnmount: function() {
    setTimeout(scaleWhiteboard, 0);
  },

  getStyledAnswers(poll) {
   let number, buttonStyle, answers;
    if(poll != null) {
      number = poll.poll_info.poll.answers.length;
      buttonStyle = {
        width: 'calc(75%/' + number + ')',
        marginLeft: 'calc(25%/' + number * 2 + ')',
        marginRight: 'calc(25%/ ' + number * 2 + ')'
      };
      answers = poll.poll_info.poll.answers;
      for(j = 0; j < number; j++) {
        answers[j].style = buttonStyle;
      }
    return answers;
    }
  },

  handleClick: function(label, answer) {
    return BBB.sendPollResponseMessage(label, answer);
  },

  render(){
    return (
      <div className="polling">
        {this.data.poll ? this.getStyledAnswers(this.data.poll).map((question) =>
          <Button onClick={this.handleClick.bind(null, question.key, question.id)} btn_class=" pollButtons" rel="tooltip" data_placement="top"
          label={question.key} style={question.style} key={question.id}/>
        ) : null }
      </div>
    )
  }
});
