import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Header from '/imports/ui/components/common/control-header/component';
import { useMutation } from '@apollo/client';
import { Input } from '../layout/layoutTypes';
import { layoutDispatch, layoutSelectInput } from '../layout/context';
import { addAlert } from '../screenreader-alert/service';
import { PANELS, ACTIONS } from '../layout/enums';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { POLL_CANCEL } from './mutations';
import { getSplittedQuestionAndOptions, pollTypes, validateInput } from './service';
import Toggle from '/imports/ui/components/common/switch/component';
import Styled from './styles';
import ResponseChoices from './components/ResponseChoices';
import ResponseTypes from './components/ResponseTypes';
import PollQuestionArea from './components/PollQuestionArea';
import LiveResultContainer from './components/LiveResult';
import Session from '/imports/ui/services/storage/in-memory';
import SessionStorage from '/imports/ui/services/storage/session';
import { useStorageKey } from '../../services/storage/hooks';

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
  },
});

interface PollCreationPanelProps {
  layoutContextDispatch: (action: {
    type: string;
    value: string | boolean;
  }) => void;
  hasPoll: boolean;
}

const PollCreationPanel: React.FC<PollCreationPanelProps> = ({
  layoutContextDispatch,
  hasPoll,
}) => {
  const POLL_SETTINGS = window.meetingClientSettings.public.poll;
  const ALLOW_CUSTOM_INPUT = POLL_SETTINGS.allowCustomResponseInput;
  const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
  const [stopPoll] = useMutation(POLL_CANCEL);

  const intl = useIntl();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [customInput, setCustomInput] = React.useState(false);
  const [question, setQuestion] = useState<string[] | string>('');
  const [questionAndOptions, setQuestionAndOptions] = useState<string[] | string>('');
  const [optList, setOptList] = useState<Array<{val: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMultipleResponse, setIsMultipleResponse] = useState(false);
  const [secretPoll, setSecretPoll] = useState(false);
  const [warning, setWarning] = useState<string | null>('');
  const [isPasting, setIsPasting] = useState(false);
  const [type, setType] = useState<string | null>('');

  const quickPollVariables = useStorageKey('quickPollVariables') as {
    isMultipleResponse: boolean;
    pollType: string;
    question: string;
    secretPoll: boolean;
    answers: string[]
  };

  useEffect(() => {
    if (quickPollVariables) {
      const {
        answers,
        isMultipleResponse,
        pollType,
        question,
        secretPoll,
      } = quickPollVariables;
      const isCustom = pollType === pollTypes.Custom;

      const questionAndOptionsList = isCustom
        ? [question, ...answers].join('\n')
        : '';

      setError(null);
      setWarning(null);
      setCustomInput(isCustom);
      setIsMultipleResponse(isMultipleResponse);
      setQuestionAndOptions(questionAndOptionsList);
      setQuestion(question);
      setSecretPoll(secretPoll);
      setType(
        pollType.startsWith(pollTypes.Letter)
          ? pollTypes.Letter
          : pollType,
      );

      if (answers.length) {
        setOptList(answers.map((answer) => ({ val: answer })));
        return;
      }

      if (pollType.startsWith(pollTypes.Letter)) {
        const length = Number(pollType.split('-')[1]) || 4;
        const optionChars: Record<number, string> = {
          1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E',
        };
        const optList = Array.from({ length }).map((_, idx) => ({
          val: optionChars[idx + 1],
        }));
        setOptList(optList);
        return;
      }

      switch (pollType) {
        case pollTypes.TrueFalse: {
          setOptList([
            { val: intl.formatMessage(intlMessages.true) },
            { val: intl.formatMessage(intlMessages.false) },
          ]);
          break;
        }
        case pollTypes.YesNo: {
          setOptList([
            { val: intl.formatMessage(intlMessages.yes) },
            { val: intl.formatMessage(intlMessages.no) },
          ]);
          break;
        }
        case pollTypes.YesNoAbstention: {
          setOptList([
            { val: intl.formatMessage(intlMessages.yes) },
            { val: intl.formatMessage(intlMessages.no) },
            { val: intl.formatMessage(intlMessages.abstention) },
          ]);
          break;
        }
        default: {
          setOptList([]);
        }
      }
    }
  }, [quickPollVariables]);

  useEffect(() => () => {
    Session.removeItem('quickPollVariables');
  }, []);

  const getPollCurrentState = useCallback(() => {
    return {
      customInput,
      question,
      questionAndOptions,
      optList,
      error,
      isMultipleResponse,
      secretPoll,
      warning,
      type,
    };
  }, [
    customInput, question, questionAndOptions, optList,
    isMultipleResponse, secretPoll, warning, type, error,
  ]);

  useEffect(() => () => {
    SessionStorage.setItem('pollSavedState', getPollCurrentState());
  }, [getPollCurrentState]);

  useEffect(() => {
    const pollSavedState = SessionStorage.getItem('pollSavedState') as {
      customInput: boolean;
      question: string[] | string;
      questionAndOptions: string[] | string;
      optList: { val: string }[];
      error: string;
      isMultipleResponse: boolean;
      secretPoll: boolean;
      warning: string;
      type: string;
    };

    if (pollSavedState) {
      const {
        customInput,
        isMultipleResponse,
        optList,
        error,
        question,
        questionAndOptions,
        secretPoll,
        type,
        warning,
      } = pollSavedState;

      setCustomInput(customInput);
      setIsMultipleResponse(isMultipleResponse);
      setOptList(optList);
      setError(error);
      setQuestion(question);
      setQuestionAndOptions(questionAndOptions);
      setSecretPoll(secretPoll);
      setType(type);
      setWarning(warning);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const list = [...optList];
    const validatedVal = validateInput(e.target.value).replace(/\s{2,}/g, ' ');
    const charsRemovedCount = e.target.value.length - validatedVal.length;
    const clearError = validatedVal.length > 0 && type !== pollTypes.Response;
    const input = e.target;
    const caretStart = e.target.selectionStart ?? 0;
    const caretEnd = e.target.selectionEnd ?? 0;
    let questionAndOptionsList: string[] = [];
    list[index] = { val: validatedVal };

    if (questionAndOptions.length > 0) {
      const QnO = questionAndOptions as string;
      questionAndOptionsList = QnO.split('\n');
      questionAndOptionsList[index + 1] = validatedVal;
    }
    setOptList(list);
    setQuestionAndOptions(questionAndOptionsList.length > 0
      ? questionAndOptionsList.join('\n') : '');
    setError(clearError ? null : error);

    input.focus();
    input.selectionStart = caretStart - charsRemovedCount;
    input.selectionEnd = caretEnd - charsRemovedCount;
  };

  const setQuestionAndOptionsFn = (input: string[] | string) => {
    const { splittedQuestion, optionsList } = getSplittedQuestionAndOptions(input);
    const optionsListLength = optionsList.length;
    let maxOptionsWarning = warning;
    const clearWarning = maxOptionsWarning && optionsListLength <= MAX_CUSTOM_FIELDS;
    const clearError = input.length > 0 && type === pollTypes.Response;

    if (optionsListLength > MAX_CUSTOM_FIELDS && optList[MAX_CUSTOM_FIELDS] === undefined) {
      setWarning(intl.formatMessage(intlMessages.maxOptionsWarning));
      if (isPasting) {
        maxOptionsWarning = intl.formatMessage(intlMessages.maxOptionsWarning);
        setIsPasting(false);
      }
    }
    setQuestionAndOptions(input);
    setOptList(optionsList);
    setQuestion(splittedQuestion);
    setError(clearError ? null : error);
    setWarning(clearWarning ? null : maxOptionsWarning);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const validatedInput = validateInput(e.target.value);
    const clearError = validatedInput.length > 0 && type === pollTypes.Response;

    if (!customInput) {
      setQuestion(validatedInput);
      setError(clearError ? null : error);
    } else {
      setQuestionAndOptionsFn(validatedInput);
    }
  };

  const handleRemoveOption = (index: number) => {
    const list = [...optList];
    const removed = list[index];
    let questionAndOptionsList: string[] = [];
    let clearWarning = false;

    list.splice(index, 1);

    // If customInput then removing text from input field.
    if (customInput) {
      const QnO = questionAndOptions as string;
      questionAndOptionsList = QnO.split('\n');
      delete questionAndOptionsList[index + 1];
      questionAndOptionsList = questionAndOptionsList.filter((val: string) => val !== undefined);
      clearWarning = !!warning && list.length <= MAX_CUSTOM_FIELDS;
    }
    setOptList(list);
    setQuestionAndOptions(questionAndOptionsList.length > 0
      ? questionAndOptionsList.join('\n') : '');
    setWarning(clearWarning ? null : warning);
    addAlert(`${intl.formatMessage(intlMessages.removePollOpt,
      { option: removed.val || intl.formatMessage(intlMessages.emptyPollOpt) })}`);
  };

  const handleAddOption = () => {
    setOptList([...optList, { val: '' }]);
  };

  const handleToggle = () => {
    const toggledValue = !secretPoll;
    Session.setItem('secretPoll', toggledValue);
    setSecretPoll(toggledValue);
  };

  const handlePollLetterOptions = () => {
    if (optList.length === 0) {
      setType(pollTypes.Letter);
      setOptList([
        { val: '' },
        { val: '' },
        { val: '' },
        { val: '' },
      ]);
    }
  };

  const toggleIsMultipleResponse = () => {
    setIsMultipleResponse((prev) => !prev);
    return !isMultipleResponse;
  };

  useEffect(() => {
    const cps = Session.getItem('customPollShortcut');
    if (cps) {
      setType(pollTypes.Custom);
      setCustomInput(!!cps);
    }

    return () => {
      Session.setItem('secretPoll', false);
      Session.setItem('customPollShortcut', false);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current?.focus();
    }
  }, [textareaRef, customInput]);

  const pollOptions = () => {
    if (hasPoll) return <LiveResultContainer />;
    return (
      <>
        {
          ALLOW_CUSTOM_INPUT && (
            <Styled.CustomInputRow>
              <Styled.CustomInputHeadingCol aria-hidden="true">
                <Styled.CustomInputHeading>
                  {intl.formatMessage(intlMessages.customInputToggleLabel)}
                </Styled.CustomInputHeading>
              </Styled.CustomInputHeadingCol>
              <Styled.CustomInputToggleCol>
                <Styled.Toggle>
                  <Styled.ToggleLabel>
                    {customInput
                      ? intl.formatMessage(intlMessages.on)
                      : intl.formatMessage(intlMessages.off)}
                  </Styled.ToggleLabel>
                  <Toggle
                  // @ts-ignore - JS component wrapped by intl
                    icons={false}
                    checked={customInput}
                    onChange={() => {
                      const newType = !customInput ? pollTypes.Custom : '';
                      setType(newType);
                      setCustomInput(!customInput);
                    }}
                    ariaLabel={intl.formatMessage(intlMessages.customInputToggleLabel)}
                    showToggleLabel={false}
                    data-test="autoOptioningPollBtn"
                  />
                </Styled.Toggle>
              </Styled.CustomInputToggleCol>
            </Styled.CustomInputRow>
          )
        }
        {customInput && (
          <Styled.PollParagraph>
            {intl.formatMessage(intlMessages.customInputInstructionsLabel)}
          </Styled.PollParagraph>
        )}
        <PollQuestionArea
          customInput={customInput}
          question={question}
          questionAndOptions={questionAndOptions}
          handleTextareaChange={handleTextareaChange}
          error={error}
          type={type}
          textareaRef={textareaRef}
          handlePollLetterOptions={handlePollLetterOptions}
          optList={optList}
          setIsPasting={setIsPasting}
          warning={warning}
        />
        <ResponseTypes
          customInput={customInput}
          type={type}
          setOptList={setOptList}
          setType={setType}
        />
        <ResponseChoices
          type={type}
          toggleIsMultipleResponse={toggleIsMultipleResponse}
          isMultipleResponse={isMultipleResponse}
          optList={optList}
          handleAddOption={handleAddOption}
          secretPoll={secretPoll}
          question={question}
          setError={setError}
          setIsPolling={() => {
            const newType = customInput ? pollTypes.Custom : '';
            setType(newType);
            setOptList([]);
            setQuestion('');
            setQuestionAndOptions('');
          }}
          handleToggle={handleToggle}
          error={error}
          handleInputChange={handleInputChange}
          handleRemoveOption={handleRemoveOption}
          customInput={customInput}
          questionAndOptions={questionAndOptions}
        />
      </>
    );
  };

  return (
    <div>
      <Header
        data-test="pollPaneTitle"
        leftButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.hidePollDesc),
          'data-test': 'hidePollDesc',
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
          'data-test': 'closePolling',
          icon: 'close',
          label: intl.formatMessage(intlMessages.closeLabel),
          onClick: () => {
            if (hasPoll) stopPoll();
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.NONE,
            });
            Session.setItem('forcePollOpen', false);
            Session.setItem('pollInitiated', false);
          },
        }}
        customRightButton={null}
      />
      {pollOptions()}
      <span className="sr-only" id="poll-config-button">{intl.formatMessage(intlMessages.showRespDesc)}</span>
      <span className="sr-only" id="add-item-button">{intl.formatMessage(intlMessages.addRespDesc)}</span>
      <span className="sr-only" id="start-poll-button">{intl.formatMessage(intlMessages.startPollDesc)}</span>
    </div>
  );
};

const PollCreationPanelContainer: React.FC = () => {
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = sidebarContent;
  const {
    data: currentUser,
    loading: currentUserLoading,
  } = useCurrentUser((u) => {
    return {
      presenter: u?.presenter,
    };
  });

  const {
    data: currentMeeting,
    loading: currentMeetingLoading,
  } = useMeeting((m) => {
    return {
      componentsFlags: m?.componentsFlags,
    };
  });

  if (currentUserLoading || !currentUser) return null;
  if (currentMeetingLoading || !currentMeeting) return null;

  if (!currentUser.presenter && sidebarContentPanel === PANELS.POLL) {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  }

  return (
    <PollCreationPanel
      layoutContextDispatch={layoutContextDispatch}
      hasPoll={currentMeeting.componentsFlags?.hasPoll ?? false}
    />
  );
};

export default PollCreationPanelContainer;
