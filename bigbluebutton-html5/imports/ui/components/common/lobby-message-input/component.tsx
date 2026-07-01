import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import KEYS from '/imports/utils/keys';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Styled from './styles';

const DEFAULT_MAX_LENGTH = 128;
const SENDING_DELAY_MS = 500;
const SENT_FEEDBACK_MS = 2000;

interface LobbyMessageInputProps {
  initialMessage?: string;
  placeholder: string;
  submitLabel: string;
  successLabel: string;
  onSend: (message: string) => void;
  onDraftChange?: (message: string) => void;
  maxLength?: number;
  inputDataTest?: string;
  sendButtonDataTest?: string;
}

const LobbyMessageInput: React.FC<LobbyMessageInputProps> = ({
  initialMessage = '',
  placeholder,
  submitLabel,
  successLabel,
  onSend,
  onDraftChange,
  maxLength = DEFAULT_MAX_LENGTH,
  inputDataTest = 'lobbyMessageInput',
  sendButtonDataTest = 'sendLobbyMessageButton',
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState(initialMessage);
  const messageSentTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isSendingTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => {
    clearTimeout(messageSentTimerRef.current);
    clearTimeout(isSendingTimerRef.current);
  }, []);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    onSend(message);
    setLastSentMessage(message);
    clearTimeout(isSendingTimerRef.current);
    clearTimeout(messageSentTimerRef.current);
    setIsSending(true);
    isSendingTimerRef.current = setTimeout(() => {
      setIsSending(false);
      setMessageSent(true);
      messageSentTimerRef.current = setTimeout(() => setMessageSent(false), SENT_FEEDBACK_MS);
    }, SENDING_DELAY_MS);
  }, [message, onSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMessage(value);
    onDraftChange?.(value);
  }, [onDraftChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYS.ENTER) handleSend();
  }, [handleSend]);

  const sendButton = (
    <Styled.SendButton
      variant="contained"
      aria-label={submitLabel}
      onClick={handleSend}
      disabled={!message.trim() || isSending || message === lastSentMessage}
      data-test={sendButtonDataTest}
    >
      {isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
    </Styled.SendButton>
  );

  return (
    <>
      <Styled.InputWrapper>
        <Styled.Input
          placeholder={placeholder}
          aria-label={placeholder}
          maxLength={maxLength}
          value={message}
          autoComplete="off"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(e) => { e.stopPropagation(); }}
          onCut={(e) => { e.stopPropagation(); }}
          onCopy={(e) => { e.stopPropagation(); }}
          data-test={inputDataTest}
        />
        {lastSentMessage ? (
          <TooltipContainer title={lastSentMessage} position="top">
            <Styled.TooltipWrapper>
              {sendButton}
            </Styled.TooltipWrapper>
          </TooltipContainer>
        ) : sendButton}
      </Styled.InputWrapper>
      {messageSent && (
        <Styled.SuccessMessage role="status" aria-live="polite">
          <CheckCircleOutlineIcon fontSize="small" />
          {successLabel}
        </Styled.SuccessMessage>
      )}
    </>
  );
};

export default LobbyMessageInput;
