import { useContext, useEffect } from 'react';
import GroupChat from '/imports/api/group-chat';
import { GroupChatContext, ACTIONS } from './context';

const Adapter = () => {
  const usingGroupChatContext = useContext(GroupChatContext);
  const { dispatch } = usingGroupChatContext;

  useEffect(() => {
    const alreadyDispatched = new Set();
    const notDispatchedCount = { count: 100 };
    // TODO: listen to websocket message to avoid full list comparsion
    const diffAndDispatch = () => {
      setTimeout(() => {
        const groupChatCursor = GroupChat.find({}, { reactive: false }).fetch();
        const notDispatched = groupChatCursor.filter(objMsg => !alreadyDispatched.has(objMsg._id));
        notDispatchedCount.count = notDispatched.length;

        notDispatched.forEach((groupChat) => {
          dispatch({
            type: ACTIONS.ADDED,
            value: {
              groupChat,
            },
          });

          alreadyDispatched.add(groupChat._id);
        });
        diffAndDispatch();
      }, notDispatchedCount.count >= 10 ? 1000 : 500);
    };
    diffAndDispatch();
  }, []);

  return null;
};

export default Adapter;
