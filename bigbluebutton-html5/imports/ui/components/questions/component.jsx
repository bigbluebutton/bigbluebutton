import React, { useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Toggle from '/imports/ui/components/common/switch/component';
import BBBMenu from '/imports/ui/components/common/menu/component';
import QuestionModalContainer from '/imports/ui/components/questions/modal/container';
import Auth from '/imports/ui/services/auth';
import Service from './service';
import Styled from './styles';
import { uniqueId } from '/imports/utils/string-utils';

const intlMessages = defineMessages({
  hideQuestionsLabel: {
    id: 'app.questions.hideQuestionsLabel',
    description: 'Label for hiding questions button',
  },
  title: {
    id: 'app.questions.title',
    description: 'Title for questions',
  },
  allQuestions: {
    id: 'app.questions.description.all',
    description: 'All questions asked',
  },
  inUpvote: {
    id: 'app.questions.description.inUpvote',
    description: 'Questions in upvote',
  },
  myQuestions: {
    id: 'app.questions.description.me',
    description: 'Your questions',
  },
  approveLabel: {
    id: 'app.questions.button.approveLabel',
    description: 'Approve question',
  },
  undoApproveLabel: {
    id: 'app.questions.button.undoApproveLabel',
    description: 'Undo approve question',
  },
  answerLabel: {
    id: 'app.questions.button.answerLabel',
    description: 'Mark question as answered',
  },
  answerTextLabel: {
    id: 'app.questions.button.answerTextLabel',
    description: 'Answer question via text',
  },
  placeholder: {
    id: 'app.questions.inputPlaceholder',
    description: 'Placeholder to question input',
  },
  deleteLabel: {
    id: 'app.questions.button.deleteLabel',
    description: 'Delete question',
  },
  autoApproveLabel: {
    id: 'app.questions.button.autoApproveLabel',
    description: 'Auto approve questions',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isRTL: PropTypes.bool,
  publicQuestions: PropTypes.arrayOf(Object).isRequired,
  privateQuestions: PropTypes.arrayOf(Object).isRequired,
  isModeratorOrPresenter: PropTypes.bool.isRequired,
  autoApproveQuestions: PropTypes.bool,
};

const roles = {
  public: 1,
  private: 2,
};

// descending order
const sortQuestionsByTimestamp = (a, b) => {
  if (a.timestamp > b.timestamp) return -1;
  if (a.timestamp < b.timestamp) return 1;
  return 0;
};

// descending order
const sortQuestionsByUpvote = (a, b) => {
  if (a.numUpvotes > b.numUpvotes) return -1;
  if (a.numUpvotes < b.numUpvotes) return 1;
  return sortQuestionsByTimestamp(a, b);
};

// unanswered first
const sortQuestions = (a, b) => {
  if (a.answered === b.answered) return sortQuestionsByUpvote(a, b);
  if (a.answered) return 1;
  return -1;
};

const Questions = (props) => {
  const [modalQuestion, setModalQuestion] = useState(undefined);

  const isModalOpen = () => (modalQuestion !== undefined)

  const closeModal = () => setModalQuestion(undefined)

  const getUserActions = (question) => {
    const {
      intl,
      isModeratorOrPresenter,
    } = props;

    const actions = [];

    if (isModeratorOrPresenter && !question.answered) {
      const approveLabel = question.approved ? intl.formatMessage(intlMessages.undoApproveLabel)
        : intl.formatMessage(intlMessages.approveLabel);

      actions.push(
        {
          key: 'approve',
          dataTest: 'approveQuestion',
          label: approveLabel,
          onClick: () => Service.approveQuestion(question.questionId),
        },
      );

      actions.push(
        {
          key: 'answer',
          dataTest: 'answerQuestion',
          label: intl.formatMessage(intlMessages.answerLabel),
          onClick: () => Service.setQuestionAnswered(question.questionId),
        },
      );

      if (Service.isTextAnswersEnabled()) {
        actions.push(
          {
            key: 'answerText',
            dataTest: 'answerText',
            label: intl.formatMessage(intlMessages.answerTextLabel),
            onClick: () => setModalQuestion(question),
          },
        );
      }

      actions.push(
        {
          key: 'delete',
          dataTest: 'deleteQuestion',
          label: intl.formatMessage(intlMessages.deleteLabel),
          onClick: () => Service.deleteQuestion(question.questionId),
        },
      );
    }

    return actions;
  };

  const renderModalQuestion = () => {
    return (
      isModalOpen() ?
      <QuestionModalContainer
        {...{
          isModalOpen: isModalOpen(),
          closeModal: closeModal,
          question: modalQuestion
        }}
      /> : null
    )
  }

  const renderDescriptionMsg = (role) => {
    const {
      intl,
      isModeratorOrPresenter,
    } = props;
    let message = null;

    if (role === roles.public) {
      message = intl.formatMessage(intlMessages.inUpvote);
    } else if (role === roles.private) {
      if (isModeratorOrPresenter) {
        message = intl.formatMessage(intlMessages.allQuestions);
      } else {
        message = intl.formatMessage(intlMessages.myQuestions);
      }
    }

    return (
      message
        ? (
          <Styled.DescriptionWrapper>
            <Styled.Description>
              {message}
            </Styled.Description>
          </Styled.DescriptionWrapper>
        )
        : null
    );
  };

  const renderUpvoteBtn = (question, role) => {
    if (role !== roles.public) {
      return null;
    }

    const {
      intl,
    } = props;

    const label = intl.formatMessage(intlMessages.answerLabel);
    const noUpVoted = !question.upvoters.includes(Auth.userID) &&
      !question.answered;

    return (
      <Styled.Upvote>
        <Styled.VoteButton
          disabled={question.answered}
          onClick={() => Service.sendUpvote(question.questionId)}
          aria-label={label}
          label=""
          circle
          icon="thumbs_up"
          color={question.answered ? 'offline' : 'primary'}
          size="sm"
          noUpVoted={noUpVoted}
        />
        <Styled.NumUpVotes
          answered={question.answered}
        >
          {question.numUpvotes}
        </Styled.NumUpVotes >
      </Styled.Upvote>
    );
  };

  const renderBBBMenu = (trigger, actions) => (
    <Styled.BBBMenuWrapper>
      <BBBMenu
        trigger={
          trigger
        }
        opts={{
          id: 'default-dropdown-menu',
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getContentAnchorEl: null,
          fullwidth: 'true',
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformorigin: { vertical: 'bottom', horizontal: 'left' },
        }}
        actions={actions}
      />
    </Styled.BBBMenuWrapper>

  );

  const renderQuestionContent = (question, role) => {
    const answered = role === roles.public && question.answered;

    return (
      <Styled.Meta>
        <Styled.Text
          answered={answered}
        >
          {question.text}
        </Styled.Text>
        <Styled.UserName
          answered={answered}
        >
          {question.userName}
        </Styled.UserName>
      </Styled.Meta>
    );
  };

  const renderQuestions = (questions, role) => (
    <Styled.List>
      {
          questions.map((q) => {
            const userActions = getUserActions(q);
            const hasActions = userActions.length > 0;
            return (
              <Styled.QuestionWrapper
                key={uniqueId('questionId-')}
              >
                <Styled.Content
                  hasActions={hasActions}
                >
                  {hasActions
                    ? renderBBBMenu(renderQuestionContent(q, role), userActions)
                    : renderQuestionContent(q, role)}
                  {renderUpvoteBtn(q, role)}
                </Styled.Content>
              </Styled.QuestionWrapper>
            );
          })
        }
    </Styled.List>
  );

  const renderAutoApproveButton = () => {
    const { isModeratorOrPresenter } = props;

    if (!isModeratorOrPresenter) return null;

    const {
      intl,
      autoApproveQuestions,
    } = props;

    return (
      <Styled.AutoApprove>
        <Styled.AutoApproveLabel>
          {intl.formatMessage(intlMessages.autoApproveLabel)}
        </Styled.AutoApproveLabel>
        <Toggle
          icons={false}
          checked={autoApproveQuestions}
          onChange={() => {
            Service.toggleAutoApproveQuestions();
          }}
          showToggleLabel={false}
          invertColors={false}
        />
      </Styled.AutoApprove>
    );
  };

  const renderComponent = () => {
    const {
      intl,
      isRTL,
      publicQuestions,
      privateQuestions,
      isResizing,
      layoutContextDispatch,
      isEnabled,
    } = props;

    if (!isEnabled) Service.closePanel(layoutContextDispatch);

    if (publicQuestions.length > 1) publicQuestions.sort(sortQuestions);
    if (privateQuestions.length > 1) privateQuestions.sort(sortQuestionsByTimestamp);

    return (
      <Styled.Questions
        data-test="questions"
      >
        <Styled.Header>
          <Styled.Title
            data-test="questionsTitle"
          >
            <Styled.HideButton
              onClick={() => Service.closePanel(layoutContextDispatch)}
              aria-label={intl.formatMessage(intlMessages.hideQuestionsLabel)}
              label={intl.formatMessage(intlMessages.title)}
              icon={isRTL ? 'right_arrow' : 'left_arrow'}
            />
          </Styled.Title>
        </Styled.Header>
        <Styled.Wrapper
          style={{
            pointerEvents: isResizing ? 'none' : 'inherit',
          }}
        >
          {renderDescriptionMsg(roles.public)}

          {renderQuestions(publicQuestions, roles.public)}
          <Styled.Separator />
          {renderDescriptionMsg(roles.private)}
          {renderAutoApproveButton()}
          {renderQuestions(privateQuestions, roles.private)}
          <Styled.SendQuestionTextInput
            placeholder={intl.formatMessage(intlMessages.placeholder)}
            maxLength={200}
            send={Service.sendQuestion}
          />
          {renderModalQuestion()}
        </Styled.Wrapper>
      </Styled.Questions>
    );
  };

  return (renderComponent());
};

Questions.propTypes = propTypes;

export default injectWbResizeEvent(injectIntl(Questions));
