import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import Icon from '/imports/ui/components/common/icon/component';
import {
  Cancel, Container, Highlighted, Left, Root,
} from './styles';

const intlMessages = defineMessages({
  editing: {
    id: 'app.chat.toolbar.edit.editing',
    description: '',
  },
  cancel: {
    id: 'app.chat.toolbar.edit.cancel',
    description: '',
  },
});

const CANCEL_KEY_LABEL = 'esc';

const ChatEditingWarning = () => {
  const [show, setShow] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    const handleEditingMessage = (e: Event) => {
      if (e instanceof CustomEvent) {
        setShow(true);
      }
    };

    const handleCancelEditingMessage = (e: Event) => {
      if (e instanceof CustomEvent) {
        setShow(false);
      }
    };
    window.addEventListener(ChatEvents.CHAT_EDIT_REQUEST, handleEditingMessage);
    window.addEventListener(ChatEvents.CHAT_CANCEL_EDIT_REQUEST, handleCancelEditingMessage);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_EDIT_REQUEST, handleEditingMessage);
      window.removeEventListener(ChatEvents.CHAT_CANCEL_EDIT_REQUEST, handleCancelEditingMessage);
    };
  }, []);

  if (!show) return null;

  const cancelMessage = intl.formatMessage(intlMessages.cancel, { cancelKey: CANCEL_KEY_LABEL });
  const editingMessage = intl.formatMessage(intlMessages.editing);

  return (
    <Root role="note" aria-describedby="cancel-editing-msg">
      <Container data-test="chatEditingWarningContainer">
        <Left>
          <Icon iconName="pen_tool" />
          {editingMessage}
        </Left>
        <Cancel
          onClick={() => {
            window.dispatchEvent(new CustomEvent(ChatEvents.CHAT_CANCEL_EDIT_REQUEST));
          }}
          data-test="cancelEditingButton"
        >
          {cancelMessage.split(CANCEL_KEY_LABEL)[0]}
          &nbsp;
          <Highlighted>{CANCEL_KEY_LABEL}</Highlighted>
          &nbsp;
          {cancelMessage.split(CANCEL_KEY_LABEL)[1]}
        </Cancel>
        <span className="sr-only" id="cancel-editing-msg">
          {`${editingMessage} ${cancelMessage}`}
        </span>
      </Container>
    </Root>
  );
};

export default ChatEditingWarning;
