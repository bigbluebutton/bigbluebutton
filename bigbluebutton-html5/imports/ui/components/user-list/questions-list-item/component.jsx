import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import QuestionsIcon from './questions-icon/component';
import Service from '/imports/ui/components/questions/service';
import { isQuestionsEnabled } from '/imports/ui/services/features';

const intlMessages = defineMessages({
  title: {
    id: 'app.questions.title',
    description: 'Title for questions',
  },
  unread: {
    id: 'app.questions.unread',
    description: 'Aria label for unread questions',
  },
});

const propTypes = {
  compact: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  tabIndex: PropTypes.number.isRequired,
};

const QuestionsListItem = (props) => {
  const {
    compact,
    intl,
    tabIndex,
    questions,
    isEnabled,
    sidebarContentPanel,
    layoutContextDispatch,
  } = props;

  if (!isEnabled) return null;

  const isOpened = Service.isPanelOpened(sidebarContentPanel);

  if (isOpened && questions !== 0) Service.updateQuestionsLastSeen();

  let notification = null;
  if (questions !== 0 && !isOpened) {
    notification = (
      <Styled.Unread
        aria-label={intl.formatMessage(intlMessages.unread)}
      >
        <Styled.UnreadNotification aria-hidden="true">
          {questions}
        </Styled.UnreadNotification>
      </Styled.Unread>
    );
  }

  if (!isQuestionsEnabled()) return null;

  return (
    <Styled.QuestionsListItem
      data-test="questionsButton"
      role="button"
      aria-expanded={isOpened}
      tabIndex={tabIndex}
      onClick={() => Service.toggleQuestionsPanel(sidebarContentPanel, layoutContextDispatch)}
      id="questions-toggle-button"
      aria-label={intl.formatMessage(intlMessages.title)}
    >

      <Styled.QuestionsListItemLink>
        <Styled.QuestionsIcon>
          <QuestionsIcon />
        </Styled.QuestionsIcon>
        <Styled.QuestionsName>
          {!compact
            ? (
              <Styled.QuestionsNameMain>
                {intl.formatMessage(intlMessages.title)}
              </Styled.QuestionsNameMain>
            ) : null
          }
        </Styled.QuestionsName>
        {notification}
      </Styled.QuestionsListItemLink>
    </Styled.QuestionsListItem>
  );
};

QuestionsListItem.propTypes = propTypes;

export default injectIntl(QuestionsListItem);
