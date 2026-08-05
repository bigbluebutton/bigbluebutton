import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
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

    if (isMention) {
      const toastId = `mention-${chatId}`;
      const mentionToast = (
        <Styled.MentionToast role="alert" data-test="chatMentionToast">
          <Styled.MentionHeader>
            <Styled.MentionBadge aria-hidden="true">@</Styled.MentionBadge>
            <Styled.MentionTitle>
              {link(title, chatId)}
            </Styled.MentionTitle>
          </Styled.MentionHeader>
          <Styled.MentionDivider />
          {link(content, chatId)}
        </Styled.MentionToast>
      );

      if (toast.isActive(toastId)) {
        toast.update(toastId, { render: mentionToast, autoClose: alertDuration, progress: 0 });
      } else {
        toast(mentionToast, { autoClose: alertDuration, toastId });
      }
      return;
    }

    notify(
      link(title, chatId),
      'info',
      'chat',
      { autoClose: alertDuration },
      link(content, chatId),
      true,
    );
  };

  return null;
};

export default injectNotify(ChatPushAlert);
