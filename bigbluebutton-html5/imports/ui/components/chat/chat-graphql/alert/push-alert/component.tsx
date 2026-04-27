import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import injectNotify from '/imports/ui/components/common/toast/inject-notify/component';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';

interface ChatPushAlertProps {
  notify: (...args: unknown[]) => void;
  chatId: string;
  title: React.ReactNode;
  content: React.ReactNode;
  alertDuration: number;
  layoutContextDispatch: (...args: unknown[]) => void;
  isMention?: boolean;
}

const MENTION_BADGE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  flexShrink: 0,
  alignSelf: 'flex-start',
  fontWeight: 700,
  fontSize: '0.9rem',
  color: 'var(--toast-info-color, #fff)',
  backgroundColor: 'var(--toast-info-bg, var(--color-primary, #527ACE))',
  marginRight: '0.5rem',
};

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
        <div style={{ width: '100%' }} role="alert">
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={MENTION_BADGE_STYLE} aria-hidden="true">@</div>
            <div style={{ marginTop: 'auto', marginBottom: 'auto', fontSize: '0.85rem' }}>
              {link(title, chatId)}
            </div>
          </div>
          <hr style={{ margin: '0.4rem 0', border: 'none', borderTop: '1px solid #d4d9df' }} />
          {link(content, chatId)}
        </div>
      );

      if (toast.isActive(toastId)) {
        toast.update(toastId, { render: mentionToast, autoClose: alertDuration, progress: 0 });
      } else {
        toast(mentionToast, { autoClose: alertDuration, toastId });
      }
      return;
    }

    return notify(
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
