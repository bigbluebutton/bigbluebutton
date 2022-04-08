import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
// import _ from "lodash";
import { Session } from 'meteor/session';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import Toggle from '/imports/ui/components/switch/component';
import LiveResult from './live-result/component';
import { styles } from './styles.scss';
import { PANELS, ACTIONS } from '../layout/enums';
import DragAndDrop from './dragAndDrop/component';
import Questions from '/imports/api/questions';
import Modal from '/imports/ui/components/modal/simple/component';
import { alertScreenReader } from '/imports/utils/dom-utils';

const intlMessages = defineMessages({
  askQuestionPaneTitle: {
    id: 'app.askQuestion.askQuestionPaneTitle',
    description: 'heading label for the ask question menu',
  },
  addingQuestionInstructionsText: {
    id: 'app.askQuestion.addingQuestionInstructionsText',
    description: 'heading instructions for entering question and options.',
  },
  previewBtnLabel: {
    id: 'app.askQuestion.previewQuestionBtn',
    description: 'Label of button to preview question',
  },
  askQuestionBtnLabel: {
    id: 'app.askQuestion.askQuestionBtn',
    description: 'Label of button to ask question',
  },
  invalidQuestionAndOptions: {
    id: 'app.askQuestion.error.invalidQuestionAndOptions',
    description: 'Error for invalid or null entry',
  },
  maxOptionsLength: {
    id: 'app.askQuestion.error.maxOptionsLength',
    description: 'Error for max number of options',
  },
  minOptionsLength: {
    id: 'app.askQuestion.error.minOptionsLength',
    description: 'Error for min number of options',
  },
  correctOptionErr: {
    id: 'app.askQuestion.error.selectCorrectOpt',
    description: 'Error for selecting correct option',
  },
  questionEmptyError: {
    id: 'app.askQuestion.error.questionEmptySpace',
    description: '',
  },
  optionEmptyError: {
    id: 'app.askQuestion.error.optionEmptySpace',
    description: '',
  },
  closeLabel: {
    id: 'app.poll.closeLabel',
    description: 'label for poll pane close button',
  },
  hideQuestionDesc: {
    id: 'app.poll.hidePollDesc',
    description: 'aria label description for hide poll button',
  },
  quickQuestionInstruction: {
    id: 'app.poll.quickPollInstruction',
    description: 'instructions for using pre configured polls',
  },
  activeQuestionInstruction: {
    id: 'app.askQuestion.activeQuestioningInstruction',
    description: 'instructions displayed when a question polling is active',
  },
  correctOptionLabel: {
    id: 'app.askQuestion.correctOptionLabel',
    description: 'label for the correct option',
  },
  dragDropQuestionInstruction: {
    id: 'app.poll.dragDropPollInstruction',
    description: 'instructions for upload poll options via drag and drop',
  },
  askQuestionBtnDesc: {
    id: 'app.actionsBar.actionsDropdown.askQuestionBtnDesc',
    description: 'ask question menu toggle button description',
  },
  ariaInputCount: {
    id: 'app.poll.ariaInputCount',
    description: 'aria label for custom poll input field',
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
  optionErr: {
    id: 'app.poll.optionErr',
    description: 'poll input error label',
  },
  tf: {
    id: 'app.poll.tf',
    description: 'label for true / false poll',
  },
  a4: {
    id: 'app.poll.a4',
    description: 'label for A / B / C / D poll',
  },
  delete: {
    id: 'app.poll.optionDelete.label',
    description: '',
  },
  questionAndoptionsPlaceholderLabel: {
    id: 'app.askQuestion.questionAndoptions.label',
    description: 'label for placeholder of question and answers textfield.',
  },
  questionLabel: {
    id: 'app.askQuestion.questionHeading',
    description: 'label for question heading',
  },
  optionsLabel: {
    id: 'app.askQuestion.optionsHeading',
    description: 'label for options heading',
  },
  userResponse: {
    id: 'app.poll.userResponse.label',
    description: '',
  },
  responseChoices: {
    id: 'app.poll.responseChoices.label',
    description: '',
  },
  typedResponseDesc: {
    id: 'app.poll.typedResponse.desc',
    description: '',
  },
  responseTypesLabel: {
    id: 'app.poll.responseTypes.label',
    description: '',
  },
  addOptionLabel: {
    id: 'app.poll.addItem.label',
    description: '',
  },
  startQuestionLabel: {
    id: 'app.poll.start.label',
    description: '',
  },
  secretQuestionLabel: {
    id: 'app.askQuestion.secretQuestioning.label',
    description: '',
  },
  isSecretQuestionLabel: {
    id: 'app.askQuestion.secretQuestioning.isSecretLabel',
    description: '',
  },

  true: {
    id: 'app.poll.answer.true',
    description: '',
  },
  false: {
    id: 'app.poll.answer.false',
    description: '',
  },
  a: {
    id: 'app.poll.answer.a',
    description: '',
  },
  b: {
    id: 'app.poll.answer.b',
    description: '',
  },
  c: {
    id: 'app.poll.answer.c',
    description: '',
  },
  d: {
    id: 'app.poll.answer.d',
    description: '',
  },
  yna: {
    id: 'app.poll.yna',
    description: '',
  },
  yes: {
    id: 'app.poll.y',
    description: '',
  },
  modalClose: {
    id: 'app.modal.close',
    description: 'Close',
  },
  no: {
    id: 'app.poll.n',
    description: '',
  },
  abstention: {
    id: 'app.poll.abstention',
    description: '',
  },
  startQuestionDesc: {
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
  removeQuestionOpt: {
    id: 'app.poll.removePollOpt',
    description: 'screen reader alert for removed poll option',
  },
  emptyQuestionOpt: {
    id: 'app.poll.emptyPollOpt',
    description: 'screen reader for blank poll option',
  },
});

const QUESTION_SETTINGS = Meteor.settings.public.poll;

const MAX_CUSTOM_FIELDS = QUESTION_SETTINGS.maxCustom;
const MAX_INPUT_CHARS = QUESTION_SETTINGS.maxTypedAnswerLength;
const QUESTION_MAX_INPUT_CHARS = 1600;
const FILE_DRAG_AND_DROP_ENABLED = QUESTION_SETTINGS.allowDragAndDropFile;

const validateInput = (i) => {
  const _input = i;
  // if (/^\s/.test(_input)) _input = "";
  return _input;
};

class AskQuestion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isQuestioning: false,
      question: '',
      optList: [],
      type: '',
      correctOptions: [],
      error: null,
      secretQuestion: false,
      openPreviewModal: false,
      questionAndOptions: null,
    };

    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleRemoveOption = this.handleRemoveOption.bind(this);
    this.handleTextareaChange = this.handleTextareaChange.bind(this);
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

    if (Session.equals('resetQuestionPanel', true)) {
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
    Session.set('secretQuestion', false);
  }

  handleBackClick() {
    const { stopQuestion } = this.props;
    this.setState(
      {
        isQuestioning: false,
        error: null,
      },
      () => {
        stopQuestion();
        Session.set('resetQuestionPanel', false);
        document.activeElement.blur();
      },
    );
  }

  handleInputTextChange(index, text) {
    const { optList } = this.state;
    // This regex will replace any instance of 2 or more consecutive white spaces
    // with a single white space character.
    const option = text.replace(/\s{2,}/g, ' ').trim();

    if (index < optList.length) optList[index].val = option === '' ? '' : option;

    this.setState({ optList });
  }

  handleTextareaChange(e) {
    const validatedInput = validateInput(e.target.value);
    this.checkIfErrorsCorrectedThenClear(validatedInput);
  }

  handleQuestionValuesText(text) {
    if (text && text.length > 0) {
      this.pushToCustomQuestionValues(text);
    }
  }

  handleRemoveOption(index) {
    const { intl } = this.props;
    const { optList } = this.state;
    const list = [...optList];
    const removed = list[index];
    list.splice(index, 1);
    this.setState({ optList: list }, () => {
      alertScreenReader(
        `${intl.formatMessage(intlMessages.removeQuestionOpt, {
          0: removed.val || intl.formatMessage(intlMessages.emptyQuestionOpt),
        })}`,
      );
    });
  }

  handleAddOption() {
    const { optList } = this.state;
    this.setState({ optList: [...optList, { val: '' }] });
  }

  handleToggle() {
    const { secretQuestion } = this.state;
    const toggledValue = !secretQuestion;
    Session.set('secretQuestion', toggledValue);
    this.setState({ secretQuestion: toggledValue });
  }

  handleOpenPreviewModal() {
    const hasErrorsAndSeperated = this.seperateQuestionsAndOptionsFromString();
    this.clearErrorsIfCorrected();
    if (!hasErrorsAndSeperated && !this.state.error) {
      this.setState({ openPreviewModal: true });
    }
  }

  handleClosePreviewModal() {
    this.setState({ openPreviewModal: false });
  }

  handleAskQuestion() {
    const { startCustomQuestion } = this.props;
    const hasErrorsAndSeperated = this.seperateQuestionsAndOptionsFromString();
    const answers = [];
    const verifiedQuestionType = 'CUSTOM';
    this.clearErrorsIfCorrected();
    if (!hasErrorsAndSeperated && !this.state.error) {
      this.state.optList.forEach((opt, index) => {
        answers.push({
          id: index,
          key: opt,
        });
      });
      this.state.isQuestioning = true;
      startCustomQuestion(
        verifiedQuestionType,
        this.state.secretQuestion,
        this.state.question
          ? this.state.question
          : this.state.questionAndOptions.split('\n')[0],
        answers,
      );
    }
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

  setCorrectOption() {
    const { intl } = this.props;
    const correctOptions = [];
    let trimmedOption = '';
    this.state.optList.forEach((opt) => {
      trimmedOption = opt.trim();
      if (trimmedOption.length > 3) {
        if (
          (trimmedOption.charAt(opt.length - 1) === ')')
          && (trimmedOption.charAt(opt.length - 2) === '*')
          && (trimmedOption.charAt(opt.length - 3) === '(')
        ) {
          correctOptions.push(trimmedOption);
        }
      }
    });
    if (correctOptions.length > 0) {
      this.setState({ correctOptions });
    } else {
      this.setState({
        error: intl.formatMessage(intlMessages.correctOptionErr),
      });
    }
    return (correctOptions.length > 0);
  }

  seperateQuestionsAndOptionsFromString() {
    let hasError = false;
    const { intl } = this.props;
    const questionAndOptionsList = this.state.questionAndOptions
      ? this.state.questionAndOptions.trim().split('\n')
      : [];
    const ques = questionAndOptionsList[0];
    if (questionAndOptionsList.length > 1) {
      // check if question is empty then return error
      if (!ques.trim().length > 0) {
        this.setState({
          error: intl.formatMessage(intlMessages.questionEmptyError),
        });
        hasError = true;
        return hasError;
      }
      this.setState({ question: ques });
      delete questionAndOptionsList[0];
      const options = questionAndOptionsList
        .map((opt) => (opt ? opt.trim() : undefined))
        .filter((val) => val !== undefined);
      this.state.optList = options;
      // check if any option is empty return error
      hasError = this.checkIfAnyOptionIsEmpty(options);

      // setting the correct option
      if (!this.setCorrectOption()) {
        hasError = true;
      }
    } else {
      this.setState({
        error: intl.formatMessage(intlMessages.invalidQuestionAndOptions),
      });
      hasError = true;
    }
    return hasError;
  }

  checkIfAnyOptionIsEmpty(options) {
    const { intl } = this.props;
    let isOptionEmpty = false;
    options.forEach((opt) => {
      if (
        (opt.trim() === '' || null)
        && (opt.trim().replace('(*)', '') === '' || null)
      ) {
        this.setState({
          error: intl.formatMessage(intlMessages.optionEmptyError),
        });
        isOptionEmpty = true;
      }
    });
    return isOptionEmpty;
  }

  pushToCustomQuestionValues(text) {
    const lines = text.split('\n');
    this.setOptListLength(lines.length);
    for (let i = 0; i < MAX_CUSTOM_FIELDS; i += 1) {
      let line = '';
      if (i < lines.length) {
        line = lines[i];
        line = line.length > MAX_INPUT_CHARS
          ? line.substring(0, MAX_INPUT_CHARS)
          : line;
      }
      this.handleInputTextChange(i, line);
    }
  }

  displayToggleStatus(status) {
    const { intl } = this.props;

    return (
      <span className={styles.toggleLabel}>
        {status
          ? intl.formatMessage(intlMessages.on)
          : intl.formatMessage(intlMessages.off)}
      </span>
    );
  }

  checkIfErrorsCorrectedThenClear(validatedInput) {
    const { intl } = this.props;
    const maxOptionsErrorMsg = intl.formatMessage(
      intlMessages.maxOptionsLength,
    );
    const minOptionsErrorMsg = intl.formatMessage(
      intlMessages.minOptionsLength,
    );
    // Is Empty Error
    const clearError = (validatedInput.length > 0);
    this.setState((prevState) => ({
      questionAndOptions: validatedInput,
      error: clearError ? null : prevState.error,
    }));
    // if error is of max options and text input is corrected then clear error
    if (
      this.state.error === maxOptionsErrorMsg
          && validatedInput.split('\n').length <= 5
    ) {
      this.setState({ error: null });
    }
    // if error is of min options and text input is corrected then clear error
    if (
      this.state.error === minOptionsErrorMsg
          && validatedInput.split('\n').length > 2
    ) {
      this.setState({ error: null });
    }
  }

  clearErrorsIfCorrected() {
    const { intl } = this.props;
    const emptyOptionErrorMsg = intl.formatMessage(
      intlMessages.optionEmptyError,
    );
    const emptyQuestionErrorMsg = intl.formatMessage(
      intlMessages.questionEmptyError,
    );
    // if error is of empty question and is corrected remove error
    if (
      (this.state.question.trim())
      && (this.state.error === emptyQuestionErrorMsg)) {
      this.setState({
        error: null,
      });
    } else if (
      (!this.checkIfAnyOptionIsEmpty(this.state.optList))
      && (this.state.error === emptyOptionErrorMsg)) {
      this.setState({ error: null });
    } else {
      return null;
    }
    return null;
  }

  renderDragDrop() {
    const { intl } = this.props;
    return (
      <div>
        <div className={styles.instructions}>
          {intl.formatMessage(intlMessages.dragDropQuestionInstruction)}
        </div>
        <DragAndDrop
          {...{ intl, MAX_INPUT_CHARS }}
          handleQuestionValuesText={(e) => this.handleQuestionValuesText(e)}
        >
          <div className={styles.dragAndDropQuestionContainer} />
        </DragAndDrop>
      </div>
    );
  }

  renderQuestionPanel() {
    const { isQuestioning } = this.state;
    const { currentQuestion, currentSlide } = this.props;

    if (!currentSlide) return this.renderNoSlidePanel();

    if (isQuestioning || currentQuestion) {
      return this.renderActiveQuestionOptions();
    }

    return this.renderQuestionOptions();
  }

  renderNoSlidePanel() {
    const { intl } = this.props;
    return (
      <div className={styles.noSlidePanelContainer}>
        <h4 className={styles.sectionHeading}>
          {intl.formatMessage(intlMessages.noPresentationSelected)}
        </h4>
        <Button
          label={intl.formatMessage(intlMessages.clickHereToSelect)}
          color="primary"
          onClick={() => Session.set('showUploadPresentationView', true)}
          className={styles.questionBtn}
        />
      </div>
    );
  }

  renderQuestionOptions() {
    const { type, secretQuestion } = this.state;
    const { intl, questionTypes, smallSidebar } = this.props;
    const questionAndOptionsPlaceholder = intlMessages.questionAndoptionsPlaceholderLabel;
    const hasQuestionError = this.state.error !== null;
    return (
      <div>
        <div>
          <p
            className={styles.instructions}
            style={{ marginTop: 0, padding: 0, textAlign: 'justify' }}
          >
            {intl.formatMessage(intlMessages.addingQuestionInstructionsText)}
          </p>
          <textarea
            data-test="questionQuestionArea"
            className={cx(styles.questionQuestion, {
              [styles.hasError]: hasQuestionError,
            })}
            value={this.questionAndOptions}
            onChange={(e) => this.handleTextareaChange(e)}
            rows="9"
            cols="35"
            maxLength={QUESTION_MAX_INPUT_CHARS}
            aria-label={intl.formatMessage(questionAndOptionsPlaceholder)}
            placeholder={intl.formatMessage(questionAndOptionsPlaceholder)}
          />
          {this.state.error ? (
            <div className={styles.inputError}>
              {this.state.error ? this.state.error : 'not error'}
            </div>
          ) : (
            <div className={styles.errorSpacer}>&nbsp;</div>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.col} aria-hidden="true">
            <h4 className={styles.sectionHeading}>
              {intl.formatMessage(intlMessages.secretQuestionLabel)}
            </h4>
          </div>
          <div className={styles.col}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className={styles.toggle}>
              {this.displayToggleStatus(secretQuestion)}
              <Toggle
                icons={false}
                defaultChecked={secretQuestion}
                onChange={() => this.handleToggle()}
                ariaLabel={intl.formatMessage(intlMessages.secretQuestionLabel)}
                showToggleLabel={false}
              />
            </label>
          </div>
        </div>
        {secretQuestion && (
          <div className={styles.questionParagraph}>
            {intl.formatMessage(intlMessages.isSecretQuestionLabel)}
          </div>
        )}
        <Button
          label={intl.formatMessage(intlMessages.askQuestionBtnLabel)}
          aria-describedby="ask-question-button"
          color="primary"
          className={cx(styles.pBtn, {
            [styles.selectedTypeBtn]: type === questionTypes.TrueFalse,
            [styles.smallBtn]: !smallSidebar,
          })}
          onClick={this.handleAskQuestion}
        />
        {FILE_DRAG_AND_DROP_ENABLED
          && type !== questionTypes.Response
          && this.renderDragDrop()}
        <Button
          label={intl.formatMessage(intlMessages.previewBtnLabel)}
          aria-describedby="preview-question-button"
          color="default"
          onClick={this.handleOpenPreviewModal}
          className={cx(styles.pBtn, {
            [styles.selectedTypeBtn]: type === questionTypes.TrueFalse,
            [styles.smallBtn]: !smallSidebar,
          })}
        />
      </div>
    );
  }

  renderActiveQuestionOptions() {
    const {
      intl,
      isMeteorConnected,
      stopQuestion,
      currentQuestion,
      questionAnswerIds,
      usernames,
      isDefaultQuestion,
    } = this.props;
    console.log('rendering active props', {
      isMeteorConnected,
      stopQuestion,
      currentQuestion,
      questionAnswerIds,
      usernames,
      isDefaultQuestion,
      DB: Questions.find({}),
    });
    return (
      <div>
        <div className={styles.instructions} style={{ textAlign: 'justify' }}>
          {intl.formatMessage(intlMessages.activeQuestionInstruction)}
        </div>
        <LiveResult
          {...{
            isMeteorConnected,
            stopQuestion,
            currentQuestion,
            questionAnswerIds,
            usernames,
            isDefaultQuestion,
            correctOptions: this.state.correctOptions,
          }}
          handleBackClick={this.handleBackClick}
        />
      </div>
    );
  }

  renderInputs() {
    const { intl, questionTypes } = this.props;
    const { optList, type, error } = this.state;
    let hasVal = false;
    return optList.map((o, i) => {
      if (o.val.length > 0) hasVal = true;
      const questionOptionKey = `question-option-${i}`;
      return (
        <span key={questionOptionKey}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'spaceBetween',
            }}
          >
            <input
              type="text"
              value={o.val}
              placeholder={intl.formatMessage(
                intlMessages.questionAndoptionsPlaceholderLabel,
              )}
              data-test="askQuestionInput"
              className={styles.questionOption}
              // onChange={(e) => this.handleInputChange(e, i)}
              maxLength={MAX_INPUT_CHARS}
            />
            {i > 1 ? (
              <>
                <Button
                  className={styles.deleteBtn}
                  label={intl.formatMessage(intlMessages.delete)}
                  aria-describedby={`option-${i}`}
                  icon="delete"
                  data-test="deleteQuestionOption"
                  hideLabel
                  circle
                  color="default"
                  onClick={() => {
                    this.handleRemoveOption(i);
                  }}
                />
                <span className="sr-only" id={`option-${i}`}>
                  {intl.formatMessage(intlMessages.deleteRespDesc, {
                    0:
                      o.val
                      || intl.formatMessage(intlMessages.emptyQuestionOpt),
                  })}
                </span>
              </>
            ) : (
              <div style={{ width: '40px', flex: 'none' }} />
            )}
          </div>
          {!hasVal && type !== questionTypes.Response && error ? (
            <div className={styles.inputError}>{error}</div>
          ) : (
            <div className={styles.errorSpacer}>&nbsp;</div>
          )}
        </span>
      );
    });
  }

  render() {
    const {
      intl, stopQuestion, currentQuestion, layoutContextDispatch,
    } = this.props;
    const { question } = this.state;
    return (
      <div>
        <header className={styles.header}>
          <Button
            ref={(node) => {
              this.hideBtn = node;
            }}
            data-test="hideQuestionDesc"
            tabIndex={0}
            label={intl.formatMessage(intlMessages.askQuestionPaneTitle)}
            icon="left_arrow"
            aria-label={intl.formatMessage(intlMessages.hideQuestionDesc)}
            className={styles.hideBtn}
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
          <Button
            label={intl.formatMessage(intlMessages.closeLabel)}
            aria-label={`${intl.formatMessage(
              intlMessages.closeLabel,
            )} ${intl.formatMessage(intlMessages.askQuestionPaneTitle)}`}
            onClick={() => {
              if (currentQuestion) stopQuestion();
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: false,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: PANELS.NONE,
              });
              Session.set('forceQuestionOpen', false);
              Session.set('questionInitiated', false);
            }}
            className={styles.closeBtn}
            icon="close"
            size="sm"
            hideLabel
          />
        </header>
        {this.renderQuestionPanel()}
        <span className="sr-only" id="question-config-button">
          {intl.formatMessage(intlMessages.showRespDesc)}
        </span>
        <span className="sr-only" id="add-item-button">
          {intl.formatMessage(intlMessages.addRespDesc)}
        </span>
        <span className="sr-only" id="start-question-button">
          {intl.formatMessage(intlMessages.startQuestionDesc)}
        </span>

        {/* Modal To Preview Question */}
        <Modal
          overlayClassName={styles.overlay}
          className={styles.modal}
          isOpen={this.state.openPreviewModal}
          hideBorder
          shouldShowCloseButton={false}
          contentLabel={intl.formatMessage(intlMessages.previewBtnLabel)}
        >
          <div style={{ padding: '13px', paddingTop: 0, paddingBottom: 0 }}>
            <div
              style={{
                display: 'flex',
              }}
            >
              <header className={styles.title}>
                {intl.formatMessage(intlMessages.previewBtnLabel)}
              </header>
              <Button
                // className={styles.dismiss}
                label={intl.formatMessage(intlMessages.modalClose)}
                aria-label={`${intl.formatMessage(
                  intlMessages.modalClose,
                )} ${intl.formatMessage(intlMessages.previewBtnLabel)}`}
                icon="close"
                circle
                hideLabel
                onClick={this.handleClosePreviewModal}
                aria-describedby="modalDismissDescription"
              />
            </div>
            <div>
              <div style={{ borderBottom: '0.3px solid #e5e5e5' }}>
                <h3>{intl.formatMessage(intlMessages.questionLabel)}</h3>
                <p>{question}</p>
              </div>
              <h3>{intl.formatMessage(intlMessages.optionsLabel)}</h3>
              <ol type="1">
                {this.state.optList
                  ? this.state.optList.map((opt, index) => {
                    const uniqueKey = `opt-list-question-${index}`;
                    return (
                      <li key={uniqueKey}>
                        {!this.state.correctOptions.includes(opt) ? (
                          opt
                        ) : (
                          <span>
                            {' '}
                            {opt.replace('(*)', '')}
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
                      </li>
                    );
                  })
                  : null}
              </ol>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default withModalMounter(injectIntl(AskQuestion));

AskQuestion.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  questionTypes: PropTypes.instanceOf(Object).isRequired,
  startQuestion: PropTypes.func.isRequired,
  startCustomQuestion: PropTypes.func.isRequired,
  stopQuestion: PropTypes.func.isRequired,
};
