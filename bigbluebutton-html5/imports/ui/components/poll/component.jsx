import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import PresentationUploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
import { withModalMounter } from '/imports/ui/components/modal/service';
import _ from 'lodash';
import { Session } from 'meteor/session';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import LiveResult from './live-result/component';
import { styles } from './styles.scss';
import DragAndDrop from './dragAndDrop/component';

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
  pollPanelDesc: {
    id: 'app.poll.panel.desc',
    description: '',
  },
  questionLabel: {
    id: 'app.poll.question.label',
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
  questionTitle: {
    id: 'app.poll.question.title',
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
  no: {
    id: 'app.poll.n',
    description: '',
  },
  abstention: {
    id: 'app.poll.abstention',
    description: '',
  },
});

const CHAT_ENABLED = Meteor.settings.public.chat.enabled;
const MAX_CUSTOM_FIELDS = Meteor.settings.public.poll.max_custom;
const MAX_INPUT_CHARS = 45;
const FILE_DRAG_AND_DROP_ENABLED = Meteor.settings.public.poll.allowDragAndDropFile;

const validateInput = (i) => {
  let _input = i;
  if (/^\s/.test(_input)) _input = '';
  return _input;
};

class Poll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPolling: false,
      question: '',
      optList: [],
      error: null,
    };

    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleRemoveOption = this.handleRemoveOption.bind(this);
    this.handleTextareaChange = this.handleTextareaChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    const { props } = this.hideBtn;
    const { className } = props;

    const hideBtn = document.getElementsByClassName(`${className}`);
    if (hideBtn[0]) hideBtn[0].focus();
  }

  componentDidUpdate() {
    const { amIPresenter } = this.props;

    if (Session.equals('resetPollPanel', true)) {
      this.handleBackClick();
    }

    if (!amIPresenter) {
      Session.set('openPanel', 'userlist');
      Session.set('forcePollOpen', false);
    }
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

  handleInputChange(index, event) {
    this.handleInputTextChange(index, event.target.value);
  }

  handleInputTextChange(index, text) {
    const { optList } = this.state;
    // This regex will replace any instance of 2 or more consecutive white spaces
    // with a single white space character.
    const option = text.replace(/\s{2,}/g, ' ').trim();

    if (index < optList.length) optList[index].val = option === '' ? '' : option;

    this.setState({ optList });
  }

  handleInputChange(e, index) {
    const { optList, type, error } = this.state;
    const list = [...optList];
    const validatedVal = validateInput(e.target.value).replace(/\s{2,}/g, ' ');
    const clearError = validatedVal.length > 0 && type !== 'RP';
    list[index] = { val: validatedVal };
    this.setState({ optList: list, error: clearError ? null : error });
  }

  handleTextareaChange(e) {
    const { type, error } = this.state;
    const validatedQuestion = validateInput(e.target.value);
    const clearError = validatedQuestion.length > 0 && type === 'RP';
    this.setState({ question: validateInput(e.target.value), error: clearError ? null : error });
  }

  pushToCustomPollValues(text) {
    const lines = text.split('\n');
    for (let i = 0; i < MAX_CUSTOM_FIELDS; i += 1) {
      let line = '';
      if (i < lines.length) {
        line = lines[i];
        line = line.length > MAX_INPUT_CHARS ? line.substring(0, MAX_INPUT_CHARS) : line;
      }
      this.handleInputTextChange(i, line);
    }
  }

  handlePollValuesText(text) {
    if (text && text.length > 0) {
      this.pushToCustomPollValues(text);
    }
  }

  handleRemoveOption(index) {
    const { optList } = this.state;
    const list = [...optList];
    list.splice(index, 1);
    this.setState({ optList: list });
  }

  handleAddOption() {
    const { optList } = this.state;
    this.setState({ optList: [...optList, { val: '' }] });
  }

  checkPollType() {
    const { type, optList } = this.state;
    let _type = type;
    let pollString = '';
    let defaultMatch = null;
    let isDefault = null;

    switch (_type) {
      case 'A-':
        pollString = optList.map(x => x.val).sort().join('');
        defaultMatch = pollString.match(/^(ABCDEFG)|(ABCDEF)|(ABCDE)|(ABCD)|(ABC)|(AB)$/gi);
        isDefault = defaultMatch && pollString.length === defaultMatch[0].length;
        _type = isDefault ? `${_type}${defaultMatch[0].length}` : 'custom';
        break;
      case 'TF':
        pollString = optList.map(x => x.val).join('');
        defaultMatch = pollString.match(/^(TRUEFALSE)|(FALSETRUE)$/gi);
        isDefault = defaultMatch && pollString.length === defaultMatch[0].length;
        if (!isDefault) _type = 'custom';
        break;
      case 'YNA':
        pollString = optList.map(x => x.val).join('');
        defaultMatch = pollString.match(/^(YesNoAbstention)$/gi);
        isDefault = defaultMatch && pollString.length === defaultMatch[0].length;
        if (!isDefault) _type = 'custom';
        break;
      default:
        break;
    }
    return _type;
  }

  renderInputs() {
    const { intl } = this.props;
    const { optList, type, error } = this.state;
    let hasVal = false;
    return optList.map((o, i) => {
      if (o.val.length > 0) hasVal = true;
      const pollOptionKey = `poll-option-${i}`;
      return (
        <span>
          <div
            key={pollOptionKey}
            style={{
              display: 'flex',
              justifyContent: 'spaceBetween',
            }}
          >
            <input
              type="text"
              value={o.val}
              placeholder={intl.formatMessage(intlMessages.customPlaceholder)}
              data-test="pollOptionItem"
              className={styles.pollOption}
              onChange={e => this.handleInputChange(e, i)}
              maxLength={MAX_INPUT_CHARS}
            />
            { i > 1 ? (
              <Button
                className={styles.deleteBtn}
                label={intl.formatMessage(intlMessages.delete)}
                icon="delete"
                data-test="deletePollOption"
                hideLabel
                circle
                color="default"
                onClick={() => {
                  this.handleRemoveOption(i);
                }}
              />) : <div style={{ width: '40px' }} />
        }
          </div>
          {!hasVal && type !== 'RP' && error ? (
            <div className={styles.inputError}>{error}</div>
          ) : (
            <div className={styles.errorSpacer}>&nbsp;</div>
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
    } = this.props;

    return (
      <div>
        <div className={styles.instructions}>
          {intl.formatMessage(intlMessages.activePollInstruction)}
        </div>
        <LiveResult
          {...{
            isMeteorConnected,
            stopPoll,
            currentPoll,
            pollAnswerIds,
          }}
          handleBackClick={this.handleBackClick}
        />
      </div>
    );
  }

  renderPollOptions() {
    const {
      type, optList, question, error,
    } = this.state;
    const { startPoll, startCustomPoll, intl } = this.props;
    const defaultPoll = type === 'TF' || type === 'A-' || type === 'YNA';
    return (
      <div>
        <div className={styles.instructions}>
          {intl.formatMessage(intlMessages.pollPanelDesc)}
        </div>
        <div>
          <h4>{intl.formatMessage(intlMessages.questionTitle)}</h4>
          <textarea
            data-test="pollQuestionArea"
            className={styles.pollQuestion}
            value={question}
            onChange={e => this.handleTextareaChange(e)}
            rows="4"
            cols="35"
            placeholder={intl.formatMessage(intlMessages.questionLabel)}
          />
          {(type === 'RP' && question.length === 0 && error) ? (
            <div className={styles.inputError}>{error}</div>
          ) : (
            <div className={styles.errorSpacer}>&nbsp;</div>
          )}
        </div>
        <div data-test="responseTypes">
          <h4>{intl.formatMessage(intlMessages.responseTypesLabel)}</h4>
          <div className={styles.responseType}>
            <Button
              label={intl.formatMessage(intlMessages.tf)}
              color="default"
              onClick={() => {
                this.setState({
                  type: 'TF',
                  optList: [
                    { val: intl.formatMessage(intlMessages.true) },
                    { val: intl.formatMessage(intlMessages.false) },
                  ],
                });
              }}
              className={cx(styles.pBtn, { [styles.selectedBtnBlue]: type === 'TF' })}
            />
            <Button
              label={intl.formatMessage(intlMessages.a4)}
              color="default"
              onClick={() => {
                this.setState({
                  type: 'A-',
                  optList: [
                    { val: intl.formatMessage(intlMessages.a) },
                    { val: intl.formatMessage(intlMessages.b) },
                    { val: intl.formatMessage(intlMessages.c) },
                    { val: intl.formatMessage(intlMessages.d) },
                  ],
                });
              }}
              className={cx(styles.pBtn, { [styles.selectedBtnBlue]: type === 'A-' })}
            />
          </div>
          <Button
            label={intl.formatMessage(intlMessages.yna)}
            color="default"
            onClick={() => {
              this.setState({
                type: 'YNA',
                optList: [
                  { val: intl.formatMessage(intlMessages.yes) },
                  { val: intl.formatMessage(intlMessages.no) },
                  { val: intl.formatMessage(intlMessages.abstention) },
                ],
              });
            }}
            className={cx(styles.pBtn, styles.yna, { [styles.selectedBtnBlue]: type === 'YNA' })}
          />
          <Button
            label={intl.formatMessage(intlMessages.userResponse)}
            color="default"
            onClick={() => { this.setState({ type: 'RP' }); }}
            className={cx(styles.pBtn, styles.fullWidth, { [styles.selectedBtnWhite]: type === 'RP' })}
          />
        </div>
        { type
              && (
              <div data-test="responseChoices">
                <h4>{intl.formatMessage(intlMessages.responseChoices)}</h4>
                {
                  type === 'RP'
                    && (
                    <div>
                      <span>{intl.formatMessage(intlMessages.typedResponseDesc)}</span>
                      <div className={styles.exampleResponse}>
                        <div className={styles.exampleTitle} />
                        <div className={styles.responseInput}>
                          <div className={styles.rInput} />
                        </div>
                      </div>
                    </div>
                    )
                }
                {
                  (defaultPoll || type === 'RP')
                    && (
                    <div style={{
                      display: 'flex',
                      flexFlow: 'column',
                    }}
                    >
                      {defaultPoll && this.renderInputs()}
                      {defaultPoll
                        && (
                        <Button
                          className={styles.addItemBtn}
                          data-test="addItem"
                          label={intl.formatMessage(intlMessages.addOptionLabel)}
                          color="default"
                          icon="add"
                          disabled={optList.length === MAX_CUSTOM_FIELDS}
                          onClick={() => this.handleAddOption()}
                        />
                        )
                      }
                      <Button
                        className={styles.startPollBtn}
                        data-test="startPoll"
                        label={intl.formatMessage(intlMessages.startPollLabel)}
                        color="primary"
                        onClick={() => {
                          let hasVal = false;
                          optList.forEach((o) => {
                            if (o.val.length > 0) hasVal = true;
                          });

                          let err = null;
                          if (type === 'RP' && question.length === 0) err = intl.formatMessage(intlMessages.questionErr);
                          if (!hasVal && type !== 'RP') err = intl.formatMessage(intlMessages.optionErr);
                          if (err) return this.setState({ error: err });

                          this.setState({ isPolling: true }, () => {
                            const verifiedPollType = this.checkPollType();
                            const verifiedOptions = optList.map((o) => {
                              if (o.val.length > 0) return o.val;
                              return null;
                            });
                            if (verifiedPollType === 'custom') {
                              startCustomPoll(
                                verifiedPollType,
                                question,
                                _.compact(verifiedOptions),
                              );
                            } else {
                              startPoll(verifiedPollType, question);
                            }
                          });
                        }}
                      />
                      {
                        FILE_DRAG_AND_DROP_ENABLED && type !== 'RP' && this.renderDragDrop()
                      }
                    </div>
                    )
              }
              </div>
              )
        }
      </div>
    );
  }

  renderNoSlidePanel() {
    const { mountModal, intl } = this.props;
    return (
      <div className={styles.noSlidePanelContainer}>
        <h4>{intl.formatMessage(intlMessages.noPresentationSelected)}</h4>
        <Button
          label={intl.formatMessage(intlMessages.clickHereToSelect)}
          color="primary"
          onClick={() => mountModal(<PresentationUploaderContainer />)}
          className={styles.pollBtn}
        />
      </div>
    );
  }

  renderPollPanel() {
    const { isPolling } = this.state;
    const {
      currentPoll,
      currentSlide,
    } = this.props;

    if (!CHAT_ENABLED && !currentSlide) return this.renderNoSlidePanel();

    if (isPolling || (!isPolling && currentPoll)) {
      return this.renderActivePollOptions();
    }

    return this.renderPollOptions();
  }


  renderDragDrop() {
    const { intl } = this.props;
    return (
      <div>
        <div className={styles.instructions}>
          {intl.formatMessage(intlMessages.dragDropPollInstruction)}
        </div>
        <DragAndDrop
          {...{ intl, MAX_INPUT_CHARS }}
          handlePollValuesText={e => this.handlePollValuesText(e)}
        >
          <div className={styles.dragAndDropPollContainer} />
        </DragAndDrop>
      </div>
    );
  }


  render() {
    const {
      intl,
      stopPoll,
      currentPoll,
      amIPresenter,
    } = this.props;

    if (!amIPresenter) return null;

    return (
      <div>
        <header className={styles.header}>
          <Button
            ref={(node) => { this.hideBtn = node; }}
            data-test="hidePollDesc"
            tabIndex={0}
            label={intl.formatMessage(intlMessages.pollPaneTitle)}
            icon="left_arrow"
            aria-label={intl.formatMessage(intlMessages.hidePollDesc)}
            className={styles.hideBtn}
            onClick={() => { Session.set('openPanel', 'userlist'); }}
          />
          <Button
            label={intl.formatMessage(intlMessages.closeLabel)}
            aria-label={`${intl.formatMessage(intlMessages.closeLabel)} ${intl.formatMessage(intlMessages.pollPaneTitle)}`}
            onClick={() => {
              if (currentPoll) stopPoll();
              Session.set('openPanel', 'userlist');
              Session.set('forcePollOpen', false);
              Session.set('pollInitiated', false);
            }}
            className={styles.closeBtn}
            icon="close"
            size="sm"
            hideLabel
          />
        </header>
        {this.renderPollPanel()}
      </div>
    );
  }
}

export default withModalMounter(injectIntl(Poll));

Poll.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  pollTypes: PropTypes.instanceOf(Array).isRequired,
  startPoll: PropTypes.func.isRequired,
  startCustomPoll: PropTypes.func.isRequired,
  stopPoll: PropTypes.func.isRequired,
};
