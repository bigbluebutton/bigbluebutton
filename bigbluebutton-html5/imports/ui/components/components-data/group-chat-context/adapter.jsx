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
    });
  }, []);
};

export default Adapter;
