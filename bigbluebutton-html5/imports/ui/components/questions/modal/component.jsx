import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QuestionService from '/imports/ui/components/questions/service';
import TextInput from '/imports/ui/components/text-input/component';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  answerLabel: {
    id: 'app.questions.modal.answerLabel',
    description: 'Answer label',
  },
});

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};


class QuestionModalComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(answerText) {
    const { question, closeModal } = this.props;
    QuestionService.setQuestionAnswered(question.questionId, answerText);
    closeModal();
  }

  render() {
    const {
      closeModal,
      isModalOpen,
      question,
      intl,
    } = this.props;

    return (
      <Styled.QuestionsModal
        priority="low"
        onRequestClose={() => closeModal()}
        setIsOpen={isModalOpen}
        hideBorder
        isOpen={isModalOpen}
        contentLabel="title"
      >
        <Styled.Container>
          <Styled.Question>
            {question.text}
          </Styled.Question>
          <TextInput
            placeholder={intl.formatMessage(intlMessages.answerLabel)}
            maxLength={256}
            send={this.handleSubmit}
            enableEmoji={false}
          />
        </Styled.Container>
      </Styled.QuestionsModal>
    );
  }
}

QuestionModalComponent.propTypes = propTypes;

export default injectIntl(QuestionModalComponent);
