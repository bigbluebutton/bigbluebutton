import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
// import _ from 'lodash';
import { Session } from 'meteor/session';
import Toggle from '/imports/ui/components/common/switch/component';
import LiveResult from './live-result/component';
import Checkbox from '/imports/ui/components/common/checkbox/component';
import Styled from './styles';
import { PANELS, ACTIONS } from '../layout/enums';
import Modal from '/imports/ui/components/common/modal/simple/component';
import { alertScreenReader } from '/imports/utils/dom-utils';


const QUIZ_SETTINGS = Meteor.settings.public.questionQuiz;

const MAX_CUSTOM_FIELDS = QUIZ_SETTINGS.maxCustom;
const MAX_INPUT_CHARS = QUIZ_SETTINGS.maxTypedAnswerLength;
const QUESTION_MAX_INPUT_CHARS = 1200;
const MIN_OPTIONS_LENGTH = 2;
const CORRECT_OPTION_SYMBOL = QUIZ_SETTINGS.correct_option_symbol

const validateInput = (i) => {
  let _input = i;
  while (/^\s/.test(_input)) _input = _input.substring(1);
  return _input;
};

const isCorrectOption = (opt) => {
  const trimmedOption = opt.trim();
  const trimmedOptLength = trimmedOption.length
  const correctOptSymLength = CORRECT_OPTION_SYMBOL.length
  return (
    trimmedOptLength > correctOptSymLength &&
    trimmedOption.substring(trimmedOptLength -
      correctOptSymLength) === CORRECT_OPTION_SYMBOL
  )
}

const getCorrectOptions = (options) => {
  const correctOptions = []
  let isCorrect = false;
  options.forEach((opt) => {
    isCorrect = false
    while(isCorrectOption(opt)){
      opt = opt.substring(0,
      opt.length - CORRECT_OPTION_SYMBOL.length)
      isCorrect = true
    }
    isCorrect && correctOptions.push(opt)
  });
  return correctOptions;
}

const verifiedOptionList = (optList) => {
  const newOptList = optList.map((o) => {
    const trimmedOpt = o.trim()
    if (isCorrectOption(o)) {
      return trimmedOpt.substring(0,
      trimmedOpt.length - CORRECT_OPTION_SYMBOL.length)
    }
    return trimmedOpt;
  })
  return newOptList;
}

const getSplittedQuestionAndOptions = (questionAndOptions) => {
  const inputList = questionAndOptions.split('\n');
  const splittedQuestion = inputList.length > 0 ? inputList[0] : questionAndOptions;
  const optionsList = inputList.slice(1);
  return {
    splittedQuestion,
    optionsList,
  };
};

const checkIfAnyOptionIsEmpty = (options) => {
  let isOptionEmpty = false;
  options.forEach((opt) => {
    if ((!opt.trim()) ||
      (opt.trim().replace(CORRECT_OPTION_SYMBOL, '') === '')) {
      isOptionEmpty = true;
      return isOptionEmpty;
    }
  });
  return isOptionEmpty;
}

const checkIfDuplicateOptions = (optionsList) => {
  optionsList = verifiedOptionList(optionsList)
  const isDuplicate = optionsList.some((e, i, arr) => arr.indexOf(e) !== i)
  return isDuplicate;
}


const intlMessages = defineMessages({
  questionQuizPaneTitle: {
    id: 'app.questionQuiz.questionQuizPaneTitle',
    description: 'heading label for the ask question menu',
  },
  addingQuestionInstructionsText: {
    id: 'app.questionQuiz.addingQuestionInstructionsText',
    description: 'heading instructions for entering question and options.',
  },
  addingCorrectOptionInstructionsText: {
    id: 'app.questionQuiz.correctOptionInstructionsText',
    description: 'heading instructions for entering correct options.',
  },
  previewBtnLabel: {
    id: 'app.questionQuiz.previewQuestionBtn',
    description: 'Label of button to preview question',
  },
  questionQuizBtnLabel: {
    id: 'app.questionQuiz.questionQuizBtn',
    description: 'Label of button to ask question',
  },
  correctOptionLabel: {
    id: 'app.questionQuiz.correctOptionLabel',
    description: 'label for the correct option',
  },
  invalidQuestionAndOptions: {
    id: 'app.questionQuiz.error.invalidQuestionAndOptions',
    description: 'Error for invalid or null entry',
  },
  maxOptionsLength: {
    id: 'app.questionQuiz.error.maxOptionsLength',
    description: 'Error for max number of options',
  },
  minOptionsLength: {
    id: 'app.questionQuiz.error.minOptionsLength',
    description: 'Error for min number of options',
  },
  correctOptionErr: {
    id: 'app.questionQuiz.error.selectCorrectOpt',
    description: 'Error for selecting correct option',
  },
  sameOptionErr: {
    id: 'app.questionQuiz.error.optionsRepeated',
    description: 'Error for repeated option',
  },
  optionEmptyError: {
    id: 'app.questionQuiz.error.optionEmptySpace',
    description: '',
  },
  closeLabel: {
    id: 'app.poll.closeLabel',
    description: 'label for poll pane close button',
  },
  hidePollDesc: {
    id: 'app.poll.hidePollDesc',
    description: 'aria label description for hide poll button',
  },
  activePollInstruction: {
    id: 'app.questionQuiz.activeQuestioningInstruction',
    description: 'instructions displayed when a poll is active',
  },
  customPlaceholder: {
    id: 'app.poll.customPlaceholder',
    description: 'custom poll input field placeholder text',
  },
  noPresentationSelected: {
    id: 'app.poll.noPresentationSelected',
    description: 'no presentation label',
  },
  clickHereToSelect: {
    id: 'app.poll.clickHereToSelect',
    description: 'open uploader modal button label',
  },
  questionErr: {
    id: 'app.poll.questionErr',
    description: 'question text area error label',
  },
  questionAndOptionsPlaceholder: {
    id: 'app.questionQuiz.questionAndoptions.label',
    description: 'poll input questions and options label',
  },
  modalClose: {
    id: 'app.modal.close',
    description: 'Close',
  },
  optionsLabel: {
    id: 'playback.player.chat.message.poll.options',
    description: 'label for options heading',
  },
  maxOptionsWarning: {
    id: 'app.poll.maxOptionsWarning.label',
    description: 'poll max options error',
  },
  delete: {
    id: 'app.poll.optionDelete.label',
    description: '',
  },
  questionLabel: {
    id: 'playback.player.chat.message.poll.question',
    description: '',
  },
  addOptionLabel: {
    id: 'app.poll.addItem.label',
    description: '',
  },
  questionQuizLabel: {
    id: 'app.questionQuiz.questionQuizBtn',
    description: '',
  },
  secretPollLabel: {
    id: 'app.questionQuiz.secretQuestioning.label',
    description: '',
  },
  isSecretPollLabel: {
    id: 'app.poll.secretPoll.isSecretLabel',
    description: '',
  },
  enableMultipleResponseLabel: {
    id: 'app.poll.enableMultipleResponseLabel',
    description: 'label for checkbox to enable multiple choice',
  },
  startPollDesc: {
    id: 'app.poll.startPollDesc',
    description: '',
  },
  showRespDesc: {
    id: 'app.poll.showRespDesc',
    description: '',
  },
  addRespDesc: {
    id: 'app.poll.addRespDesc',
    description: '',
  },
  deleteRespDesc: {
    id: 'app.poll.deleteRespDesc',
    description: '',
  },
  on: {
    id: 'app.switch.onLabel',
    description: 'label for toggle switch on state',
  },
  off: {
    id: 'app.switch.offLabel',
    description: 'label for toggle switch off state',
  },
  removePollOpt: {
    id: 'app.poll.removePollOpt',
    description: 'screen reader alert for removed poll option',
  },
  emptyPollOpt: {
    id: 'app.poll.emptyPollOpt',
    description: 'screen reader for blank poll option',
  },
});

class QuestionQuiz extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isQuestioning: false,
      question: '',
      questionAndOptions: '',
      optList: [],
      error: null,
      isMultipleResponse: false,
      secretQuestionQuiz: false,
      openPreviewModal: false
    };
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleRemoveOption = this.handleRemoveOption.bind(this);
    this.toogleCorrectOptionCheckBox = this.toogleCorrectOptionCheckBox.bind(this)
    this.handleTextareaChange = this.handleTextareaChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggleIsMultipleResponse = this.toggleIsMultipleResponse.bind(this);
    this.displayToggleStatus = this.displayToggleStatus.bind(this);
  }

  componentDidMount() {
    const { props } = this.hideBtn;
    const { className } = props;

    const hideBtn = document.getElementsByClassName(`${className}`);
    if (hideBtn[0]) hideBtn[0].focus();
  }

  componentDidUpdate() {
    const { amIPresenter, layoutContextDispatch } = this.props;

    if (Session.equals('resetQuestionQuizPanel', true)) {
      this.handleBackClick();
    }

    if (!amIPresenter) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: false,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.NONE,
      });
    }
  }

  componentWillUnmount() {
    Session.set('secretQuestionQuiz', false);
  }

  handleBackClick() {
    const { stopQuestionQuiz } = this.props;
    this.setState({
      isQuestioning: false,
      error: null,
    }, () => {
      stopQuestionQuiz();
      Session.set('resetQuestionQuizPanel', false);
      document.activeElement.blur();
    });
  }

  handleInputTextChange(index, text) {
    const { optList } = this.state;
    // This regex will replace any instance of 2 or more consecutive white spaces
    // with a single white space character.
    const option = text.replace(/\s{2,}/g, ' ').trim();

    if (index < optList.length) optList[index] = option === '' ? '' : option;

    this.setState({ optList });
  }

  handleInputChange(e, index) {
    const {
      optList, questionAndOptions, error
    } = this.state;

    const list = [...optList];
    const validatedVal = validateInput(e.target.value).replace(/\s{2,}/g, ' ');
    const charsRemovedCount = e.target.value.length - validatedVal.length;
    const input = e.target;
    const caretStart = e.target.selectionStart;
    const caretEnd = e.target.selectionEnd;
    const valWithoutEsterik = validatedVal.substring(0,
      validatedVal.length - CORRECT_OPTION_SYMBOL.length)
    list[index] = isCorrectOption(validatedVal) ? valWithoutEsterik : validatedVal
    let questionAndOptionsList = [];
    if (questionAndOptions.length > 0) {
      questionAndOptionsList = questionAndOptions.split('\n');
      const modifiedOpt = questionAndOptionsList[index + 1]
      if (isCorrectOption(modifiedOpt))
        questionAndOptionsList[index + 1] = validatedVal.concat(CORRECT_OPTION_SYMBOL)
      else
        questionAndOptionsList[index + 1] = validatedVal
    }
    const newQuestionAndOptions = questionAndOptionsList.join('\n')
    let clearError = error && this.isAllErrorsCleared(newQuestionAndOptions)
    this.setState({
      optList: list,
      questionAndOptions: questionAndOptionsList.length > 0
        ? newQuestionAndOptions : '',
      error: clearError ? null : error,
    },
      () => {
        input.focus();
        input.selectionStart = caretStart - charsRemovedCount;
        input.selectionEnd = caretEnd - charsRemovedCount;
      });
  }

  handleTextareaChange(e) {
    let { error } = this.state
    const { intl } = this.props
    const maxOptionsErrorMsg = intl.formatMessage(
      intlMessages.maxOptionsLength,
    );
    const validatedInput = validateInput(e.target.value);
    const { splittedQuestion, optionsList } =
      getSplittedQuestionAndOptions(validatedInput)
    optionsList.forEach((opt, i) => {
      if (isCorrectOption(opt)) {
        const verifiedOpt = opt.substring(0,
          opt.length - CORRECT_OPTION_SYMBOL.length)
        optionsList[i] = verifiedOpt
      }
    })
    let clearError = false
    if (error) clearError = this.isAllErrorsCleared(validatedInput);
    if (optionsList.length > MAX_CUSTOM_FIELDS) error = maxOptionsErrorMsg
    this.setState({
      error: clearError ? null : error, questionAndOptions: validatedInput,
      question: splittedQuestion, optList: optionsList,
    });
  }

  handleRemoveOption(index) {
    const { intl } = this.props;
    const { optList, questionAndOptions, error } = this.state;
    const list = [...optList];
    const removed = list[index];
    list.splice(index, 1);
    let questionAndOptionsList = [];
    questionAndOptionsList = questionAndOptions.split('\n');
    delete questionAndOptionsList[index + 1];
    questionAndOptionsList = questionAndOptionsList
      .filter((val) => val !== undefined);
    const newQuestionAndOptions = questionAndOptionsList.join('\n')
    const clearError = this.isAllErrorsCleared(newQuestionAndOptions)
    this.setState({
      optList: list,
      questionAndOptions: newQuestionAndOptions,
      error: clearError ? null : error,
    }, () => {
      alertScreenReader(`${intl.formatMessage(intlMessages.removePollOpt,
        { 0: removed || intl.formatMessage(intlMessages.emptyPollOpt) })}`);
    });
  }

  toogleCorrectOptionCheckBox(index) {
    const { intl } = this.props;
    const { optList, error, question, questionAndOptions } = this.state
    const optListArray = [...optList]
    const { optionsList: options } = getSplittedQuestionAndOptions(questionAndOptions)
    const correctOptionErrorMsg = intl.formatMessage(
      intlMessages.correctOptionErr,
    );
    const selectedOption = options[index].trim()
    if (!selectedOption) {
      this.setState({
        error: intl.formatMessage(
          intlMessages.optionEmptyError,
        )
      })
      return null;
    }
    const isCorrectOpt = isCorrectOption(selectedOption)
    if (!isCorrectOpt) {
      options[index] = selectedOption.concat(CORRECT_OPTION_SYMBOL)
    }
    else {
      options[index] = selectedOption.slice(0,
        selectedOption.length - CORRECT_OPTION_SYMBOL.length)
      optListArray[index] = options[index]
    }
    const questionAndOptionsString = `${question}\n${options.join('\n')}`
    const correctOptions = getCorrectOptions(options)
    const clearError = (error === correctOptionErrorMsg
      && correctOptions.length > 0)
    this.setState({
      optList: optListArray,
      error: clearError ? null : error,
      questionAndOptions: questionAndOptionsString
    })
  }

  handleAddOption() {
    const { optList, questionAndOptions } = this.state;
    this.setState({
      optList: [...optList, ''],
      questionAndOptions: questionAndOptions.concat("\n")
    });
  }

  handleToggle() {
    const { secretQuestionQuiz } = this.state;
    const toggledValue = !secretQuestionQuiz;
    Session.set('secretQuestionQuiz', toggledValue);
    this.setState({ secretQuestionQuiz: toggledValue });
  }

  setOptListLength(len) {
    const { optList } = this.state;
    let diff = len > MAX_CUSTOM_FIELDS
      ? MAX_CUSTOM_FIELDS - optList.length
      : len - optList.length;
    if (diff > 0) {
      while (diff > 0) {
        this.handleAddOption();
        diff -= 1;
      }
    } else {
      while (diff < 0) {
        this.handleRemoveOption();
        diff += 1;
      }
    }
  }

  seperateQuestionsAndOptionsFromString() {
    const { intl } = this.props;
    const { questionAndOptions } = this.state;
    const { splittedQuestion, optionsList } =
      getSplittedQuestionAndOptions(questionAndOptions)
    //empty field error
    if (!splittedQuestion) {
      this.setState({
        error: intl.formatMessage(intlMessages.invalidQuestionAndOptions),
      });
      return true;
    }

    // empty option error
    if (checkIfAnyOptionIsEmpty(optionsList)) {
      this.setState({
        error: intl.formatMessage(intlMessages.optionEmptyError),
      });
      return true
    }

    // min options error
    if (optionsList.length < MIN_OPTIONS_LENGTH) {
      this.setState({
        error: intl.formatMessage(intlMessages.minOptionsLength),
      })
      return true;
    }

    // max options error
    if (optionsList.length > MAX_CUSTOM_FIELDS) {
      this.setState({
        error: intl.formatMessage(intlMessages.maxOptionsLength),
      })
      return true;
    }

    // not set correct option error
    const correctOptions = getCorrectOptions(optionsList)
    if (!correctOptions.length > 0) {
      this.setState({
        error: intl.formatMessage(intlMessages.correctOptionErr),
      })
      return true;
    }

    //repeated options error
    const hasDuplicates = checkIfDuplicateOptions(optionsList)
    if(hasDuplicates){
      this.setState({
        error: intl.formatMessage(intlMessages.sameOptionErr),
      })
      return true;
    }

    return { question: splittedQuestion, optList: optionsList };
  }

  toggleIsMultipleResponse() {
    const { isMultipleResponse } = this.state;
    return this.setState({ isMultipleResponse: !isMultipleResponse });
  }

  pushToCustomQuestionQuizValues(text) {
    const lines = text.split('\n');
    this.setOptListLength(lines.length);
    for (let i = 0; i < MAX_CUSTOM_FIELDS; i += 1) {
      let line = '';
      if (i < lines.length) {
        line = lines[i];
        line = line.length > MAX_INPUT_CHARS ?
          line.substring(0, MAX_INPUT_CHARS) :
          line;
      }
      this.handleInputTextChange(i, line);
    }
  }

  displayToggleStatus(status) {
    const { intl } = this.props;

    return (
      <Styled.ToggleLabel>
        {status ? intl.formatMessage(intlMessages.on)
          : intl.formatMessage(intlMessages.off)}
      </Styled.ToggleLabel>
    );
  }

  isAllErrorsCleared(validatedInput) {
    const { intl } = this.props;
    const { error } = this.state;
    const { optionsList: optionList } = getSplittedQuestionAndOptions(validatedInput)
    const correctOptions = getCorrectOptions(optionList)
    const maxOptionsErrorMsg = intl.formatMessage(
      intlMessages.maxOptionsLength,
    );
    const minOptionsErrorMsg = intl.formatMessage(
      intlMessages.minOptionsLength,
    );
    const invalidEmptyTextErrorMsg = intl.formatMessage(
      intlMessages.invalidQuestionAndOptions,
    );
    const emptyOptionErrorMsg = intl.formatMessage(
      intlMessages.optionEmptyError,
    );
    const correctOptionErrorMsg = intl.formatMessage(
      intlMessages.correctOptionErr,
    );
    const sameOptionErrorMsg = intl.formatMessage(
      intlMessages.sameOptionErr,
    );
    if (
      (
        error === invalidEmptyTextErrorMsg
        && validatedInput.length > 0
      ) ||
      (
        error !== invalidEmptyTextErrorMsg
        && validatedInput.trim().length === 0
      ) ||
      (
        error === maxOptionsErrorMsg
        && optionList.length <= MAX_CUSTOM_FIELDS
      ) ||
      (
        error === minOptionsErrorMsg
        && optionList.length >= MIN_OPTIONS_LENGTH
      ) ||
      (
        error === emptyOptionErrorMsg
        && !checkIfAnyOptionIsEmpty(optionList)
      ) ||
      (
        error === correctOptionErrorMsg
        && correctOptions.length > 0
      ) ||
      (
        error === sameOptionErrorMsg
        && !checkIfDuplicateOptions(optionList)
      )
    ) {
      return true
    }
    return false
  }

  renderActiveQuestionQuizOptions() {
    const {
      intl,
      isMeteorConnected,
      stopQuestionQuiz,
      currentQuestionQuiz,
      questionQuizAnswerIds,
      usernames,
      isDefaultQuestionQuiz,
    } = this.props;
    return (
      <div>
        <Styled.Instructions style={{ textAlign: 'justify' }}>
          {intl.formatMessage(intlMessages.activePollInstruction)}
        </Styled.Instructions>
        <LiveResult
          {...{
            isMeteorConnected,
            stopQuestionQuiz,
            currentQuestionQuiz,
            questionQuizAnswerIds,
            usernames,
            isDefaultQuestionQuiz,
          }}
          handleBackClick={this.handleBackClick}
        />
      </div>
    );
  }

  renderQuestionQuizOptions() {
    const { secretQuestionQuiz, questionAndOptions, error,
      isMultipleResponse, optList: optionsList } = this.state;
    const { intl, startCustomQuestionQuiz } = this.props;
    const questionAndOptionsPlaceholderLabel = intlMessages.questionAndOptionsPlaceholder;
    const hasQuestionError = (error !== null);
    return (
      <div>

        <Styled.Instructions style={{ marginBottom: '0.9rem', textAlign: 'justify' }}>
          {intl.formatMessage(intlMessages.addingQuestionInstructionsText)}
          <Styled.CorrectOptionInstructions>
            {" "}{intl.formatMessage(intlMessages.addingCorrectOptionInstructionsText)}
          </Styled.CorrectOptionInstructions>
        </Styled.Instructions>

        <div>
          <Styled.QuestionQuizQuestionArea
            hasError={hasQuestionError}
            data-test="QuizQuestionArea"
            value={questionAndOptions}
            onChange={(e) => this.handleTextareaChange(e)}
            rows="8"
            cols="35"
            maxLength={QUESTION_MAX_INPUT_CHARS}
            aria-label={intl.formatMessage(questionAndOptionsPlaceholderLabel)}
            placeholder={intl.formatMessage(questionAndOptionsPlaceholderLabel)}
          />
          {hasQuestionError ? (
            <Styled.InputError>{error}</Styled.InputError>
          ) : (
            <Styled.ErrorSpacer>&nbsp;</Styled.ErrorSpacer>
          )}
          {/* {hasWarning ? (
            <Styled.Warning>{warning}</Styled.Warning>
          ) : null} */}

          {/* I commented this feature beacuse students can select multiple answers in 
          multipleResponseCheckbox feature and it will make easy for them to check
          all answers and one of them will be correct definetly, Maybe we can do some 
          addition in this in future, So i am keeping the code here. Incase you want
          to check it you can uncomment it and run the feature. */}

          {/* <div>
            <Styled.QuestionQuizCheckbox>
              <Checkbox
                onChange={this.toggleIsMultipleResponse}
                checked={isMultipleResponse}
                ariaLabelledBy="multipleResponseCheckboxLabel"
              />
            </Styled.QuestionQuizCheckbox>
            <Styled.InstructionsLabel id="multipleResponseCheckboxLabel">
              {intl.formatMessage(intlMessages.enableMultipleResponseLabel)}
            </Styled.InstructionsLabel>
          </div> */}
          {this.renderInputs()}
          {
            questionAndOptions && (
              <Styled.AddItemButton
                data-test="addQuestionOption"
                label={intl.formatMessage(intlMessages.addOptionLabel)}
                aria-describedby="add-item-button"
                color="default"
                icon="add"
                disabled={optionsList.length >= MAX_CUSTOM_FIELDS}
                onClick={() => this.handleAddOption()}
              />
            )
          }
        </div>

        <Styled.Row>
          <Styled.Col aria-hidden="true">
            <Styled.SectionHeading>
              {intl.formatMessage(intlMessages.secretPollLabel)}
            </Styled.SectionHeading>
          </Styled.Col>
          <Styled.Col>
            <Styled.Toggle>
              {this.displayToggleStatus(secretQuestionQuiz)}
              <Toggle
                icons={false}
                defaultChecked={secretQuestionQuiz}
                onChange={() => this.handleToggle()}
                ariaLabel={intl.formatMessage(intlMessages.secretPollLabel)}
                showToggleLabel={false}
                data-test="anonymousQuestionQuizBtn"
              />
            </Styled.Toggle>
          </Styled.Col>
        </Styled.Row>
        {secretQuestionQuiz
          && (
            <Styled.AnonymousQuestionQuizParagraph>
              {intl.formatMessage(intlMessages.isSecretPollLabel)}
            </Styled.AnonymousQuestionQuizParagraph>
          )}
        <Styled.StartQuestionQuizBtn
          data-test="startQuestionQuiz"
          label={intl.formatMessage(intlMessages.questionQuizLabel)}
          color="primary"
          onClick={() => {
            const { question, optList } = this.seperateQuestionsAndOptionsFromString();
            const answers = optList;
            const verifiedQuestionType = 'CUSTOM';
            if (question && optList && !error) {
              return this.setState({ isQuestioning: true, optList, question }, () => {
                // let verifiedOptions = verifiedOptionList(optList)
                startCustomQuestionQuiz(
                  verifiedQuestionType,
                  secretQuestionQuiz,
                  question ? question
                    : questionAndOptions.split('\n')[0],
                  isMultipleResponse,
                  // _.compact(verifiedOptions),
                  answers
                );
              })
            }
            return null;
          }
          }
        />

        <Styled.PreviewModalButton
          label={intl.formatMessage(intlMessages.previewBtnLabel)}
          aria-describedby="preview-question-button"
          color="default"
          onClick={() => {
            const { question, optList } = this.seperateQuestionsAndOptionsFromString();
            if (question && optList && !error) {
              this.setState({ openPreviewModal: true });
            }
          }
          }
        />
      </div>
    )
  }

  renderNoSlidePanel() {
    const { intl } = this.props;
    return (
      <Styled.NoSlidePanelContainer>
        <Styled.SectionHeading>
          {intl.formatMessage(intlMessages.noPresentationSelected)}
        </Styled.SectionHeading>
        <Styled.QuestionQuizButton
          label={intl.formatMessage(intlMessages.clickHereToSelect)}
          color="primary"
          onClick={() => Session.set('showUploadPresentationView', true)}
        />
      </Styled.NoSlidePanelContainer>
    );
  }

  renderQuestionQuizPanel() {
    const {
      currentQuestionQuiz,
      currentSlide,
    } = this.props;
    if (!currentSlide) return this.renderNoSlidePanel();
    if (currentQuestionQuiz && !currentQuestionQuiz.isPublished) {
      return this.renderActiveQuestionQuizOptions();
    }

    return this.renderQuestionQuizOptions();
  }

  renderInputs() {
    const { intl } = this.props;
    const { optList, error, questionAndOptions } = this.state;
    const { optionsList } = getSplittedQuestionAndOptions(questionAndOptions)
    const correctOptions = getCorrectOptions(optionsList)
    const emptyOptionErrorMsg = intl.formatMessage(
      intlMessages.optionEmptyError,
    );
    return optList.slice(0, MAX_CUSTOM_FIELDS).map((o, i) => {
      const questionQuizOptionKey = `questionQuiz-option-${i}`;
      const option = isCorrectOption(o) ? o.substring(0,
        o.length - CORRECT_OPTION_SYMBOL.length) : o
      return (
        <span key={questionQuizOptionKey}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'spaceBetween',
            }}
          >
            <Styled.QuestionQuizOptionInput
              type="text"
              value={o}
              placeholder={intl.formatMessage(intlMessages.customPlaceholder)}
              data-test="pollOptionItem"
              onChange={(e) => this.handleInputChange(e, i)}
              maxLength={MAX_INPUT_CHARS}
              isCorrect={correctOptions.includes(option)}
            />
            <Styled.QuestionQuizCheckbox>
              <Checkbox
                onChange={() => this.toogleCorrectOptionCheckBox(i)}
                checked={correctOptions.includes(option)}
                ariaLabelledBy="optionsCheckboxLabel"
              />
            </Styled.QuestionQuizCheckbox>
            {
              optList.length > MIN_OPTIONS_LENGTH && (
                <Styled.DeleteQuestionQuizOptionButton
                  label={intl.formatMessage(intlMessages.delete)}
                  aria-describedby={`option-${i}`}
                  icon="delete"
                  data-test="deleteQuestionQuizOption"
                  hideLabel
                  circle
                  color="default"
                  onClick={() => {
                    this.handleRemoveOption(i);
                  }}
                />
              )
            }

            <span className="sr-only" id={`option-${i}`}>
              {intl.formatMessage(intlMessages.deleteRespDesc,
                { 0: (o || intl.formatMessage(intlMessages.emptyPollOpt)) })}
            </span>
          </div>
          {(!o.trim() || (o.trim().replace(CORRECT_OPTION_SYMBOL, '') === ''))
            && error === emptyOptionErrorMsg ? (
            <Styled.InputError>{error}</Styled.InputError>
          ) : (
            <Styled.ErrorSpacer>&nbsp;</Styled.ErrorSpacer>
          )}
        </span>
      );
    });
  }

  render() {
    const {
      intl,
      stopQuestionQuiz,
      currentQuestionQuiz,
      layoutContextDispatch,
    } = this.props;
    const { question, openPreviewModal, optList, questionAndOptions } = this.state;
    const { optionsList } = getSplittedQuestionAndOptions(questionAndOptions)
    const correctOptions = getCorrectOptions(optionsList)
    return (
      <div>
        <Styled.Header>
          <Styled.QuestionQuizHideButton
            ref={(node) => { this.hideBtn = node; }}
            data-test="hideQuestionQuizDesc"
            tabIndex={0}
            label={intl.formatMessage(intlMessages.questionQuizPaneTitle)}
            icon="left_arrow"
            aria-label={intl.formatMessage(intlMessages.hidePollDesc)}
            onClick={() => {
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: false,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: PANELS.NONE,
              });
            }}
          />
          <Styled.QuestionQuizCloseButton
            label={intl.formatMessage(intlMessages.closeLabel)}
            aria-label={`${intl.formatMessage(intlMessages.closeLabel)} ${intl.formatMessage(intlMessages.questionQuizPaneTitle)}`}
            onClick={() => {
              if (currentQuestionQuiz) stopQuestionQuiz();
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: false,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: PANELS.NONE,
              });
              Session.set('forceQuestionQuizOpen', false);
              Session.set('QuestionQuizInitiated', false);
            }}
            icon="close"
            size="sm"
            hideLabel
            data-test="closeQuestioning"
          />
        </Styled.Header>
        {this.renderQuestionQuizPanel()}
        <span className="sr-only" id="QuestionQuiz-config-button">{intl.formatMessage(intlMessages.showRespDesc)}</span>
        <span className="sr-only" id="add-item-button">{intl.formatMessage(intlMessages.addRespDesc)}</span>
        <span className="sr-only" id="start-QuestionQuiz-button">{intl.formatMessage(intlMessages.startPollDesc)}</span>

        {/* Modal To Preview Question */}
        <Modal
          isOpen={openPreviewModal}
          onRequestClose={() => {
            this.setState({ openPreviewModal: false });
          }}
          hideBorder
          data-test="previewQuizModal"
          title={intl.formatMessage(intlMessages.previewBtnLabel)}
        >
          <Styled.PreviewModalContainer>
            <div style={{ borderBottom: '0.3px solid #e5e5e5' }}>
              <Styled.ModalHeading>
                {intl.formatMessage(intlMessages.questionLabel)}
              </Styled.ModalHeading>
              <p>{question}</p>
            </div>
            <Styled.ModalHeading>
              {intl.formatMessage(intlMessages.optionsLabel)}
            </Styled.ModalHeading>
            <ul style={{ listStyle: 'none' }}>
              {optList
                ? optList.map((opt, index) => {
                  const uniqueKey = `opt-list-question-${index}`;
                  const option = isCorrectOption(opt) ? opt.substring(0,
                    opt.length - CORRECT_OPTION_SYMBOL.length) : opt
                  return (
                    <Styled.OptionListItem key={uniqueKey}
                      isCorrect={correctOptions.includes(option)}>
                      {`${index + 1}.  `}
                      {!correctOptions.includes(option) ? (
                        opt
                      ) : (
                        <span>
                          {' '}
                          {option}
                          {' '}
                          <strong>
                            {' '}
                            (
                            {intl.formatMessage(
                              intlMessages.correctOptionLabel,
                            )}
                            )
                            {' '}
                          </strong>
                        </span>
                      )}
                    </Styled.OptionListItem>
                  );
                })
                : null}
            </ul>
          </Styled.PreviewModalContainer>
        </Modal>
      </div>
    );
  }
}

export default withModalMounter(injectIntl(QuestionQuiz));

QuestionQuiz.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  questionQuizTypes: PropTypes.instanceOf(Object).isRequired,
  startQuestionQuiz: PropTypes.func.isRequired,
  startCustomQuestionQuiz: PropTypes.func.isRequired,
  stopQuestionQuiz: PropTypes.func.isRequired,
};
