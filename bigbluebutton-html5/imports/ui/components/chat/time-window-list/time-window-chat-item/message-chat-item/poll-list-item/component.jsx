import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { styles } from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  text: PropTypes.string.isRequired,
  pollResultData: PropTypes.object.isRequired,
  isDefaultPoll: PropTypes.bool.isRequired,
  getPollResultString: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  legendTitle: {
    id: 'app.polling.pollingTitle',
    description: 'heading for chat poll legend',
  },
  pollQuestionTitle: {
    id: 'app.polling.pollQuestionTitle',
    description: 'title displayed before poll question',
  },
});

function PollListItem(props) {
  const {
    intl,
    pollResultData,
    className,
    color,
    isDefaultPoll,
    getPollResultString,
  } = props;

  const formatBoldBlack = s => s.bold().fontcolor('black');

  // Sanitize. See: https://gist.github.com/sagewall/47164de600df05fb0f6f44d48a09c0bd
  const sanitize = (value) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(value));
    return div.innerHTML;
  };

  const { answers, numRespondents } = pollResultData;
  let { resultString, optionsString } = getPollResultString(isDefaultPoll, answers, numRespondents, intl)
  resultString = sanitize(resultString);
  optionsString = sanitize(optionsString);

  let pollText = formatBoldBlack(resultString);
  if (!isDefaultPoll) {
    pollText += formatBoldBlack(`<br/><br/>${intl.formatMessage(intlMessages.legendTitle)}<br/>`);
    pollText += optionsString;
  }

  const pollQuestion = pollResultData.questionText;
  if (pollQuestion.trim() !== '') {
    const sanitizedPollQuestion = sanitize(pollQuestion.split('<br#>').join(' '));

    pollText = `${formatBoldBlack(intl.formatMessage(intlMessages.pollQuestionTitle))}<br/>${sanitizedPollQuestion}<br/><br/>${pollText}`;
  }

  return (
    <p
      className={cx(className, styles.pollText)}
      style={{ borderLeft: `3px ${color} solid`}}
      ref={(ref) => { this.text = ref; }}
      dangerouslySetInnerHTML={{ __html: pollText }}
      data-test="chatPollMessageText"
    />
  );
}

PollListItem.propTypes = propTypes;

export default injectIntl(PollListItem);