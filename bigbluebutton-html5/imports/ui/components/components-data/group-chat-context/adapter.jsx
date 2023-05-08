import { useContext, useEffect } from 'react';
import GroupChat from '/imports/api/group-chat';
import { GroupChatContext, ACTIONS } from './context';

const Adapter = () => {
  const usingGroupChatContext = useContext(GroupChatContext);
  const { dispatch } = usingGroupChatContext;

  useEffect(() => {
    const groupChatCursor = GroupChat.find({});

    groupChatCursor.observe({
      added: (obj) => {
        dispatch({
          type: ACTIONS.ADDED,
          value: {
            groupChat: obj,
          },
        });
      },
      // These arguments are ordered and there is no callback "changed" with only `oldDocument`
      changed: (newDocument, oldDocument) => {
        dispatch({
          type: ACTIONS.CHANGED,
          value: {
            groupChat: oldDocument,
          },
        });
      }
    });
  }, []);
  return null;
};

export default Adapter;
