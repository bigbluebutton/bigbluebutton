import React, { useEffect } from 'react';
import injectNotify from '/imports/ui/components/common/toast/inject-notify/component';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';
import Styled from '../styles';

interface ChatPushAlertProps {
  notify: (...args: unknown[]) => void;
  chatId: string;
  title: React.ReactNode;
  content: React.ReactNode;
  alertDuration: number;
  layoutContextDispatch: (...args: unknown[]) => void;
  isMention?: boolean;
}

const ChatPushAlert: React.FC<ChatPushAlertProps> = (props) => {
  useEffect(() => {
    showNotify();
  });

  const link = (title: React.ReactNode, chatId: string) => {
    const { layoutContextDispatch } = props;

    return (
      <div
        key={chatId}
        role="button"
        tabIndex={0}
        onClick={() => {
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: true,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_ID_CHAT_OPEN,
            value: chatId,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.CHAT,
          });
        }}
        onKeyDown={() => null}
      >
        {title}
      </div>
    );
  };

  const showNotify = () => {
    const {
      notify,
      chatId,
      title,
      content,
      alertDuration,
      isMention,
    } = props;

    // One toast per chat: a second mention refreshes it instead of stacking a new one.
    const icon = isMention
      ? { svgContent: <Styled.MentionIcon data-test="chatMentionToast" aria-hidden="true">@</Styled.MentionIcon> }
      : 'chat';
    const options = isMention
      ? { autoClose: alertDuration, toastId: `mention-${chatId}` }
      : { autoClose: alertDuration };

    notify(
      link(title, chatId),
      'info',
      icon,
      options,
      link(content, chatId),
      true,
    );
  };

  return null;
};

export default injectNotify(ChatPushAlert);
