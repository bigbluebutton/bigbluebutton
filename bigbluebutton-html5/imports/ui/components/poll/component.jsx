import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { Session } from 'meteor/session';
import Checkbox from '/imports/ui/components/common/checkbox/component';
import DraggableTextArea from '/imports/ui/components/poll/dragAndDrop/component';
import LiveResult from '/imports/ui/components/poll/live-result/component';
import Styled from './styles';
import Toggle from '/imports/ui/components/common/switch/component';
import { PANELS, ACTIONS } from '../layout/enums';
import { addNewAlert } from '../screenreader-alert/service';
import Header from '/imports/ui/components/common/control-header/component';

const intlMessages = defineMessages({
  pollPaneTitle: {
    id: 'app.poll.pollPaneTitle',
    description: 'heading label for the poll menu',
  },
  closeLabel: {
    id: 'app.poll.closeLabel',
    description: 'label for poll pane close button',
  },
  hidePollDesc: {
    id: 'app.poll.hidePollDesc',
    description: 'aria label description for hide poll button',
  },
  quickPollInstruction: {
    id: 'app.poll.quickPollInstruction',
    description: 'instructions for using pre configured polls',
  },
  activePollInstruction: {
    id: 'app.poll.activePollInstruction',
    description: 'instructions displayed when a poll is active',
  },
  dragDropPollInstruction: {
    id: 'app.poll.dragDropPollInstruction',
    description: 'instructions for upload poll options via drag and drop',
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
  questionAndOptionsPlaceholder: {
    id: 'app.poll.questionAndoptions.label',
    description: 'poll input questions and options label',
  },
  customInputToggleLabel: {
    id: 'app.poll.customInput.label',
    description: 'poll custom input toogle button label',
  },
  customInputInstructionsLabel: {
    id: 'app.poll.customInputInstructions.label',
    description: 'poll custom input instructions label',
  },
  maxOptionsWarning: {
    id: 'app.poll.maxOptionsWarning.label',
    description: 'poll max options error',
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
  questionLabel: {
    id: 'app.poll.question.label',
    description: '',
  },
  optionalQuestionLabel: {
    id: 'app.poll.optionalQuestion.label',
    description: '',
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
  startPollLabel: {
    id: 'app.poll.start.label',
    description: '',
  },
  secretPollLabel: {
    id: 'app.poll.secretPoll.label',
    description: '',
  },
  isSecretPollLabel: {
    id: 'app.poll.secretPoll.isSecretLabel',
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
  e: {
    id: 'app.poll.answer.e',
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
  no: {
    id: 'app.poll.n',
    description: '',
  },
  abstention: {
    id: 'app.poll.abstention',
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
  pollingQuestion: {
    id: 'app.polling.pollQuestionTitle',
    description: 'polling question header',
  }
});

const POLL_SETTINGS = Meteor.settings.public.poll;

const ALLOW_CUSTOM_INPUT = POLL_SETTINGS.allowCustomResponseInput;
const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
const MAX_INPUT_CHARS = POLL_SETTINGS.maxTypedAnswerLength;
const MIN_OPTIONS_LENGTH = 2;
const QUESTION_MAX_INPUT_CHARS = 1200;

class Poll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPolling: false,
      question: '',
      questionAndOptions: '',
      optList: [],
      error: null,
      isMultipleResponse: false,
      secretPoll: false,
      customInput: false,
      warning: null,
      isPasting: false,
      type: null,
    };

    this.textarea = createRef();

    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleRemoveOption = this.handleRemoveOption.bind(this);
    this.handleTextareaChange = this.handleTextareaChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggleIsMultipleResponse = this.toggleIsMultipleResponse.bind(this);
    this.displayToggleStatus = this.displayToggleStatus.bind(this);
    this.displayAutoOptionToggleStatus = this.displayAutoOptionToggleStatus.bind(this);
    this.setQuestionAndOptions = this.setQuestionAndOptions.bind(this);
  }

  componentDidMount() {
    if (this.textarea.current) {
      this.textarea.current.focus();
    }
  }

  componentDidUpdate() {
    const { amIPresenter, layoutContextDispatch, sidebarContentPanel } = this.props;

    if (Session.equals('resetPollPanel', true)) {
      this.handleBackClick();
    }

    if (!amIPresenter && sidebarContentPanel === PANELS.POLL) {
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
    Session.set('secretPoll', false);
  }

  handleBackClick() {
    const { stopPoll } = this.props;

    this.setState({
      isPolling: false,
      error: null,
    }, () => {
      stopPoll();
      Session.set('resetPollPanel', false);
      document.activeElement.blur();
    });
  }

  /**
   * 
   * @param {Event} e
   * @param {Number} index
   */
  handleInputChange(e, index) {
    const { optList, type, error, questionAndOptions } = this.state;
    const { pollTypes, validateInput } = this.props;
    const list = [...optList];
    const validatedVal = validateInput(e.target.value).replace(/\s{2,}/g, ' ');
    const charsRemovedCount = e.target.value.length - validatedVal.length;
    const clearError = validatedVal.length > 0 && type !== pollTypes.Response;
    const input = e.target;
    const caretStart = e.target.selectionStart;
    const caretEnd = e.target.selectionEnd;
    let questionAndOptionsList = [];
    list[index] = { val: validatedVal };

    if (questionAndOptions.length > 0) {
      questionAndOptionsList = questionAndOptions.split('\n');
      questionAndOptionsList[index + 1] = validatedVal;
    }

    this.setState({
      optList: list,
      questionAndOptions: questionAndOptionsList.length > 0
        ? questionAndOptionsList.join('\n') : '',
      error: clearError ? null : error,
    }, () => {
      input.focus();
      input.selectionStart = caretStart - charsRemovedCount;
      input.selectionEnd = caretEnd - charsRemovedCount;
    });
  }

  /**
   * 
   * @param {Event} e
   * @returns {void}
   */
  handleTextareaChange(e) {
    const { type, error, customInput } = this.state;
    const { pollTypes, validateInput } = this.props;
    const validatedInput = validateInput(e.target.value);
    const clearError = validatedInput.length > 0 && type === pollTypes.Response;

    if (!customInput) {
      this.setState({
        question: validatedInput,
        error: clearError ? null : error,
      });
    } else {
      this.setQuestionAndOptions(validatedInput);
    }
  }

  /**
   * 
   * @param {String} input Validated string containing question and options.
   * @returns {void}
   */
  setQuestionAndOptions(input) {
    const { intl, pollTypes, getSplittedQuestionAndOptions } = this.props;
    const { warning, optList, isPasting, type, error } = this.state;
    const { splittedQuestion, optionsList } = getSplittedQuestionAndOptions(input);
    const optionsListLength = optionsList.length;
    let maxOptionsWarning = warning;
    const clearWarning = maxOptionsWarning && optionsListLength <= MAX_CUSTOM_FIELDS;
    const clearError = input.length > 0 && type === pollTypes.Response;

    if (optionsListLength > MAX_CUSTOM_FIELDS  && optList[MAX_CUSTOM_FIELDS] === undefined) {
      this.setState({ warning: intl.formatMessage(intlMessages.maxOptionsWarning) });
      if (!isPasting) return null;
      maxOptionsWarning = intl.formatMessage(intlMessages.maxOptionsWarning);
      this.setState({ isPasting: false });
    }

    this.setState({
      questionAndOptions: input,
      optList: optionsList,
      question: splittedQuestion,
      error: clearError ? null : error,
      warning: clearWarning ? null : maxOptionsWarning,
    });
  }

  handlePollValuesText(text) {
    const { validateInput } = this.props;
    if (text && text.length > 0) {
      const validatedInput = validateInput(text);
      this.setQuestionAndOptions(validatedInput);
    }
  }

  /**
   * 
   * @param {Number} index 
   */
  handleRemoveOption(index) {
    const { intl } = this.props;
    const { optList, questionAndOptions, customInput, warning } = this.state;
    const list = [...optList];
    const removed = list[index];
    let questionAndOptionsList = [];
    let clearWarning = false;

    list.splice(index, 1);

    // If customInput then removing text from input field.
    if (customInput) {
      questionAndOptionsList = questionAndOptions.split('\n');
      delete questionAndOptionsList[index + 1];
      questionAndOptionsList = questionAndOptionsList.filter((val) => val !== undefined);
      clearWarning = warning && list.length <= MAX_CUSTOM_FIELDS;
    }

    this.setState({
      optList: list,
      questionAndOptions: questionAndOptionsList.length > 0
        ? questionAndOptionsList.join('\n')
        : [],
      warning: clearWarning ? null : warning,
    }, () => {
      addNewAlert(`${intl.formatMessage(intlMessages.removePollOpt,
        { 0: removed.val || intl.formatMessage(intlMessages.emptyPollOpt) })}`);
    });
  }

  handleAddOption() {
    const { optList } = this.state;
    this.setState({ optList: [...optList, { val: '' }] });
  }

  handleToggle() {
    const { secretPoll } = this.state;
    const toggledValue = !secretPoll;
    Session.set('secretPoll', toggledValue);
    this.setState({ secretPoll: toggledValue });
  }

  handleAutoOptionToogle() {
    const { customInput, questionAndOptions, question } = this.state;
    const { intl, removeEmptyLineSpaces, getSplittedQuestionAndOptions } = this.props;
    const toggledValue = !customInput;

    if (customInput === true && toggledValue === false) {
      const questionAndOptionsList = removeEmptyLineSpaces(questionAndOptions);
      this.setState({
        question: questionAndOptionsList.join('\n'),
        customInput: toggledValue,
        optList: [],
        type: null,
      });
    } else {
      const inputList = removeEmptyLineSpaces(question);
      const { splittedQuestion, optionsList } = getSplittedQuestionAndOptions(inputList);
      const clearWarning = optionsList.length > MAX_CUSTOM_FIELDS
        ? intl.formatMessage(intlMessages.maxOptionsWarning) : null;
      this.handlePollLetterOptions();
      this.setState({
        questionAndOptions: inputList.join('\n'),
        optList: optionsList,
        customInput: toggledValue,
        question: splittedQuestion,
        warning: clearWarning,
      });
    }
  }

  handlePollLetterOptions() {
    const { pollTypes } = this.props;
    const { optList } = this.state;

    if (optList.length === 0) {
      this.setState({
        type: pollTypes.Letter,
        optList: [
          { val: '' },
          { val: '' },
          { val: '' },
          { val: '' },
        ],
      });
    }
  }

  toggleIsMultipleResponse() {
    const { isMultipleResponse } = this.state;
    return this.setState({ isMultipleResponse: !isMultipleResponse });
  }

  /**
   * 
   * @param {Boolean} status 
   * @returns 
   */
  displayToggleStatus(status) {
    const { intl } = this.props;

    return (
      <Styled.ToggleLabel>
        {status
          ? intl.formatMessage(intlMessages.on)
          : intl.formatMessage(intlMessages.off)}
      </Styled.ToggleLabel>
    );
  }

  displayAutoOptionToggleStatus(status) {
    const { intl } = this.props;

    return (
      <Styled.ToggleLabel>
        {status
          ? intl.formatMessage(intlMessages.on)
          : intl.formatMessage(intlMessages.off)}
      </Styled.ToggleLabel>
    );
  }

  renderInputs() {
    const { intl, pollTypes } = this.props;
    const { optList, type, error } = this.state;
    let hasVal = false;
    return optList.slice(0, MAX_CUSTOM_FIELDS).map((o, i) => {
      const pollOptionKey = `poll-option-${i}`;
      if (o.val && o.val.length > 0) hasVal = true;
      return (
        <span key={pollOptionKey}>
          <Styled.OptionWrapper>
            <Styled.PollOptionInput
              type="text"
              value={o.val}
              placeholder={intl.formatMessage(intlMessages.customPlaceholder)}
              data-test="pollOptionItem"
              onChange={(e) => this.handleInputChange(e, i)}
              maxLength={MAX_INPUT_CHARS}
              onPaste={(e) => { e.stopPropagation(); }}
              onCut={(e) => { e.stopPropagation(); }}
              onCopy={(e) => { e.stopPropagation(); }}
            />
            {optList.length > MIN_OPTIONS_LENGTH && (
              <Styled.DeletePollOptionButton
                label={intl.formatMessage(intlMessages.delete)}
                aria-describedby={`option-${i}`}
                icon="delete"
                data-test="deletePollOption"
                hideLabel
                circle
                color="default"
                onClick={() => {
                  this.handleRemoveOption(i);
                }}
              />
            )}
            <span className="sr-only" id={`option-${i}`}>
              {intl.formatMessage(
                intlMessages.deleteRespDesc,
                { 0: o.val || intl.formatMessage(intlMessages.emptyPollOpt) },
              )}
            </span>
          </Styled.OptionWrapper>
          {!hasVal && type !== pollTypes.Response && error ? (
            <Styled.InputError data-test="errorNoValueInput">{error}</Styled.InputError>
          ) : (
            <Styled.ErrorSpacer>&nbsp;</Styled.ErrorSpacer>
          )}
        </span>
      );
    });
  }

  renderActivePollOptions() {
    const {
      intl,
      isMeteorConnected,
      stopPoll,
      currentPoll,
      pollAnswerIds,
      usernames,
      isDefaultPoll,
    } = this.props;

    return (
      <div>
        <Styled.Instructions>
          {intl.formatMessage(intlMessages.activePollInstruction)}
        </Styled.Instructions>
        <LiveResult
          {...{
            isMeteorConnected,
            stopPoll,
            currentPoll,
            pollAnswerIds,
            usernames,
            isDefaultPoll,
          }}
          handleBackClick={this.handleBackClick}
        />
      </div>
    );
  }

  renderStartPollButton() {
    const {
      startPoll, startCustomPoll, intl, pollTypes, checkPollType,
    } = this.props;
    const {
      type, secretPoll, optList, isMultipleResponse, question,
    } = this.state;
    return (
      <Styled.StartPollBtn
        data-test="startPoll"
        label={intl.formatMessage(intlMessages.startPollLabel)}
        color="primary"
        onClick={() => {
          const optionsList = optList.slice(0, MAX_CUSTOM_FIELDS);
          let hasVal = false;
          optionsList.forEach((o) => {
            if (o.val.trim().length > 0) hasVal = true;
          });

          let err = null;
          if (type === pollTypes.Response && question.length === 0) {
            err = intl.formatMessage(intlMessages.questionErr);
          }
          if (!hasVal && type !== pollTypes.Response) {
            err = intl.formatMessage(intlMessages.optionErr);
          }
          if (err) return this.setState({ error: err });

          return this.setState({ isPolling: true }, () => {
            const verifiedPollType = checkPollType(
              type,
              optionsList,
              intl.formatMessage(intlMessages.yes),
              intl.formatMessage(intlMessages.no),
              intl.formatMessage(intlMessages.abstention),
              intl.formatMessage(intlMessages.true),
              intl.formatMessage(intlMessages.false),
            );
            const verifiedOptions = optionsList.map((o) => {
              if (o.val.trim().length > 0) return o.val;
              return null;
            });
            if (verifiedPollType === pollTypes.Custom) {
              startCustomPoll(
                verifiedPollType,
                secretPoll,
                question,
                isMultipleResponse,
                verifiedOptions.filter(Boolean),
              );
            } else {
              startPoll(verifiedPollType, secretPoll, question, isMultipleResponse);
            }
          });
        }}
      />
    );
  }

  renderResponseArea() {
    const { intl, pollTypes, isDefaultPoll } = this.props;
    const { type, secretPoll, optList, isMultipleResponse } = this.state;
    const defaultPoll = isDefaultPoll(type);
    if (defaultPoll || type === pollTypes.Response) return (
      <Styled.ResponseArea>
        {defaultPoll && (
          <div>
            <Styled.PollCheckbox data-test="allowMultiple">
              <Checkbox
                onChange={this.toggleIsMultipleResponse}
                checked={isMultipleResponse}
                ariaLabelledBy="multipleResponseCheckboxLabel"
                label={intl.formatMessage(intlMessages.enableMultipleResponseLabel)}
              />
            </Styled.PollCheckbox>
            <div id="multipleResponseCheckboxLabel" hidden>
              {intl.formatMessage(intlMessages.enableMultipleResponseLabel)}
            </div>
          </div>
        )}
        {defaultPoll && this.renderInputs()}
        {defaultPoll && (
          <Styled.AddItemButton
            data-test="addPollItem"
            label={intl.formatMessage(intlMessages.addOptionLabel)}
            aria-describedby="add-item-button"
            color="default"
            icon="add"
            disabled={optList.length >= MAX_CUSTOM_FIELDS}
            onClick={() => this.handleAddOption()}
          />
        )}
        <Styled.AnonymousRow>
          <Styled.AnonymousHeadingCol aria-hidden="true">
            <Styled.AnonymousHeading>
              {intl.formatMessage(intlMessages.secretPollLabel)}
            </Styled.AnonymousHeading>
          </Styled.AnonymousHeadingCol>
          <Styled.AnonymousToggleCol>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <Styled.Toggle>
              {this.displayToggleStatus(secretPoll)}
              <Toggle
                icons={false}
                defaultChecked={secretPoll}
                onChange={() => this.handleToggle()}
                ariaLabel={intl.formatMessage(intlMessages.secretPollLabel)}
                showToggleLabel={false}
                data-test="anonymousPollBtn"
              />
            </Styled.Toggle>
          </Styled.AnonymousToggleCol>
        </Styled.AnonymousRow>
        {secretPoll && (
          <Styled.PollParagraph>
            {intl.formatMessage(intlMessages.isSecretPollLabel)}
          </Styled.PollParagraph>
        )}
        {this.renderStartPollButton()}
      </Styled.ResponseArea>
    );
    return null;
  }

  renderCustomInputRow() {
    const { intl } = this.props;
    const { customInput } = this.state;
    return (
      <>
        <Styled.CustomInputRow>
          <Styled.CustomInputHeadingCol aria-hidden="true">
            <Styled.CustomInputHeading>
              {intl.formatMessage(intlMessages.customInputToggleLabel)}
            </Styled.CustomInputHeading>
          </Styled.CustomInputHeadingCol>
          <Styled.CustomInputToggleCol>
            <Styled.Toggle>
              {this.displayAutoOptionToggleStatus(customInput)}
              <Toggle
                icons={false}
                defaultChecked={customInput}
                onChange={() => this.handleAutoOptionToogle()}
                ariaLabel={intl.formatMessage(intlMessages.customInputToggleLabel)}
                showToggleLabel={false}
                data-test="autoOptioningPollBtn"
              />
            </Styled.Toggle>
          </Styled.CustomInputToggleCol>
        </Styled.CustomInputRow>
        {customInput && (
          <Styled.PollParagraph>
            {intl.formatMessage(intlMessages.customInputInstructionsLabel)}
          </Styled.PollParagraph>
        )}
      </>
    );
  }

  renderPollQuestionArea() {
    const { intl, pollTypes } = this.props;
    const {
      type, optList, questionAndOptions, error,
      question, customInput, warning,
    } = this.state;
    const hasOptionError = (customInput && optList.length === 0 && error);
    const hasWarning = (customInput && warning);
    const hasQuestionError = (type === pollTypes.Response
      && questionAndOptions.length === 0 && error);
    const questionsAndOptionsPlaceholder = intlMessages.questionAndOptionsPlaceholder;
    const questionPlaceholder = (type === pollTypes.Response)
      ? intlMessages.questionLabel
      : intlMessages.optionalQuestionLabel;
    return (
      <div>
        <Styled.PollQuestionArea
          hasError={hasQuestionError || hasOptionError}
          data-test="pollQuestionArea"
          value={customInput ? questionAndOptions : question}
          onChange={(e) => this.handleTextareaChange(e)}
          onPaste={(e) => { e.stopPropagation(); this.setState({ isPasting: true }); }}
          onCut={(e) => { e.stopPropagation(); }}
          onCopy={(e) => { e.stopPropagation(); }}
          onKeyPress={(event) => {
            if (event.key === 'Enter' && customInput) {
              this.handlePollLetterOptions();
            }
          }}
          rows="5"
          cols="35"
          maxLength={QUESTION_MAX_INPUT_CHARS}
          aria-label={intl.formatMessage(customInput ? questionsAndOptionsPlaceholder
            : questionPlaceholder)}
          placeholder={intl.formatMessage(customInput ? questionsAndOptionsPlaceholder
            : questionPlaceholder)}
          {...{ MAX_INPUT_CHARS }}
          handlePollValuesText={(e) => this.handlePollValuesText(e)}
          as={customInput ? DraggableTextArea : 'textarea'}
          ref={this.textarea}
        />
        {hasQuestionError || hasOptionError ? (
          <Styled.InputError>{error}</Styled.InputError>
        ) : (
          <Styled.ErrorSpacer>&nbsp;</Styled.ErrorSpacer>
        )}
        {hasWarning ? (
          <Styled.Warning>{warning}</Styled.Warning>
        ) : (
          <Styled.ErrorSpacer>&nbsp;</Styled.ErrorSpacer>
        )}
      </div>
    );
  }

  renderResponseTypes() {
    const { intl, pollTypes, smallSidebar } = this.props;
    const { type, customInput } = this.state;
    if (!customInput) return (
      <div data-test="responseTypes">
        <Styled.SectionHeading>
          {intl.formatMessage(intlMessages.responseTypesLabel)}
        </Styled.SectionHeading>
        <Styled.ResponseType>
          <Styled.PollConfigButton
            selected={type === pollTypes.TrueFalse}
            small={!smallSidebar}
            label={intl.formatMessage(intlMessages.tf)}
            aria-describedby="poll-config-button"
            data-test="pollTrueFalse"
            color="default"
            onClick={() => {
              this.setState({
                type: pollTypes.TrueFalse,
                optList: [
                  { val: intl.formatMessage(intlMessages.true) },
                  { val: intl.formatMessage(intlMessages.false) },
                ],
              });
            }}
          />
          <Styled.PollConfigButton
            selected={type === pollTypes.Letter}
            small={!smallSidebar}
            label={intl.formatMessage(intlMessages.a4)}
            aria-describedby="poll-config-button"
            data-test="pollLetterAlternatives"
            color="default"
            onClick={() => {
              if (!customInput) {
                this.setState({
                  type: pollTypes.Letter,
                  optList: [
                    { val: intl.formatMessage(intlMessages.a) },
                    { val: intl.formatMessage(intlMessages.b) },
                    { val: intl.formatMessage(intlMessages.c) },
                    { val: intl.formatMessage(intlMessages.d) },
                  ],
                });
              }
            }}
          />
          <Styled.PollConfigButton
            selected={type === pollTypes.YesNoAbstention}
            small={false}
            full
            label={intl.formatMessage(intlMessages.yna)}
            aria-describedby="poll-config-button"
            data-test="pollYesNoAbstentionBtn"
            color="default"
            onClick={() => {
              this.setState({
                type: pollTypes.YesNoAbstention,
                optList: [
                  { val: intl.formatMessage(intlMessages.yes) },
                  { val: intl.formatMessage(intlMessages.no) },
                  { val: intl.formatMessage(intlMessages.abstention) },
                ],
              });
            }}
          />
          <Styled.PollConfigButton
            selected={type === pollTypes.Response}
            small={false}
            full
            label={intl.formatMessage(intlMessages.userResponse)}
            aria-describedby="poll-config-button"
            data-test="userResponseBtn"
            color="default"
            onClick={() => { this.setState({ type: pollTypes.Response }); }}
          />
        </Styled.ResponseType>
      </div>
    );
    return null;
  }

  renderResponseChoices() {
    const { intl, pollTypes } = this.props;
    const { type, questionAndOptions, question, customInput } = this.state;
    if ((!customInput && type) || (questionAndOptions && customInput)) return (
      <div data-test="responseChoices">
        {customInput && questionAndOptions && (
          <Styled.Question>
            <Styled.SectionHeading>
              {intl.formatMessage(intlMessages.pollingQuestion)}
            </Styled.SectionHeading>
            <Styled.PollParagraph>
              <span>{question}</span>
            </Styled.PollParagraph>
          </Styled.Question>
        )}
        <Styled.SectionHeading>
          {intl.formatMessage(intlMessages.responseChoices)}
        </Styled.SectionHeading>
        {type === pollTypes.Response && (
          <Styled.PollParagraph>
            <span>{intl.formatMessage(intlMessages.typedResponseDesc)}</span>
          </Styled.PollParagraph>
        )}
        {this.renderResponseArea()}
      </div>
    );
    return null;
  }

  renderPollOptions() {
    return (
      <div>
        {ALLOW_CUSTOM_INPUT && this.renderCustomInputRow()}
        {this.renderPollQuestionArea()}
        {this.renderResponseTypes()}
        {this.renderResponseChoices()}
      </div>
    );
  }

  renderNoSlidePanel() {
    const { intl } = this.props;
    return (
      <Styled.NoSlidePanelContainer>
        <Styled.SectionHeading data-test="noPresentation">
          {intl.formatMessage(intlMessages.noPresentationSelected)}
        </Styled.SectionHeading>
        <Styled.PollButton
          label={intl.formatMessage(intlMessages.clickHereToSelect)}
          color="primary"
          onClick={() => Session.set('showUploadPresentationView', true)}
        />
      </Styled.NoSlidePanelContainer>
    );
  }

  renderPollPanel() {
    const { isPolling } = this.state;
    const {
      currentPoll,
      currentSlide,
    } = this.props;

    if (!currentSlide) return this.renderNoSlidePanel();
    if (isPolling || currentPoll) {
      return this.renderActivePollOptions();
    }

    return this.renderPollOptions();
  }

  render() {
    const {
      intl,
      stopPoll,
      currentPoll,
      layoutContextDispatch,
    } = this.props;

    return (
      <div>
        <Header
          leftButtonProps={{
            'aria-label': intl.formatMessage(intlMessages.hidePollDesc),
            'data-test': "hidePollDesc",
            label: intl.formatMessage(intlMessages.pollPaneTitle),
            onClick: () => {
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: false,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: PANELS.NONE,
              });
            },
          }}
          rightButtonProps={{
            'aria-label': `${intl.formatMessage(intlMessages.closeLabel)} ${intl.formatMessage(intlMessages.pollPaneTitle)}`,
            'data-test': "closePolling",
            icon: "close",
            label: intl.formatMessage(intlMessages.closeLabel),
            onClick: () => {
              if (currentPoll) stopPoll();
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: false,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: PANELS.NONE,
              });
              Session.set('forcePollOpen', false);
              Session.set('pollInitiated', false);
            },
          }}
        />
        {this.renderPollPanel()}
        <span className="sr-only" id="poll-config-button">{intl.formatMessage(intlMessages.showRespDesc)}</span>
        <span className="sr-only" id="add-item-button">{intl.formatMessage(intlMessages.addRespDesc)}</span>
        <span className="sr-only" id="start-poll-button">{intl.formatMessage(intlMessages.startPollDesc)}</span>
      </div>
    );
  }
}

export default injectIntl(Poll);

Poll.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  pollTypes: PropTypes.instanceOf(Object).isRequired,
  startPoll: PropTypes.func.isRequired,
  startCustomPoll: PropTypes.func.isRequired,
  stopPoll: PropTypes.func.isRequired,
};
