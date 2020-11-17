import { useEffect } from "React";

// {
//   chatId:{
//     preJoinMessages:[], //loginTime
//     posJoinMessages:[],
//   },
//   chatId:{
//     messageGroups:{
//       abc123_20201013_1738: {
//         status: string
//         sender: string
//         messages: [
//           {
//             id: string
//             text: string            
//           }
//           //jujuba1
//           //jujuba2
//           //jujuba3
//         ]
//       } //user_id_timewindow
//     },
    
//   },
// }

// <base>
//   <contextProviders>
//     <app>
//   </contextProviders>
// </base>

export const ACTIONS = {
  TEST: 'test',
};

export const ChatContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.TEST: {
      return {
        ...state,
        ...action.value,
      };
    }
    default: {
      throw new Error('Unexpected action');
    }
  }
};

const chatContextProvider = (props) => {
  const [chatContextState, chatContextDispatch] = useReducer(reducer, {});
 return  (
    <ChatContext.provider value={
      {
      dispatch: chatContextDispatch,
      chats: chatContextState,
      ...props,
      }
      }
    >
    {props.children}
    </ChatContext.provider>
  );
}


const ContextConsumer = Component => props => (
  <ChatContext.Consumer>
    {contexts => <Component {...props} {...contexts} />}
  </ChatContext.Consumer>
);

withTracker(({}) => {
  const fetchFunction = () => groupChatMsgs.find().fetch();
  return {
    chats: fetchFunction(),
  };
})(chatContextProvider((props) => {
  const usingChatContext = useContext(ChatContext);
  const {
    chats,
    dispatch,
    ...restProps,
  } = props;
  useEffect(()=> {
    if (props.chats != usingChatContext.chats){
      usingChatContext.dispatch({
        type: ACTIONS.TEST,
        value: chats,
      })
    }
  }, restProps);
  return null;
}));

ContextConsumer(
  withTracker(({ chats }) => {
    const fetchFunction = () => groupChatMsgs.find().fetch();
    const chatsFromMongo = fetchFunction();
    if (chats != chatsFromMongo){
      usingChatContext.dispatch({
        type: ACTIONS.TEST,
        value: chats,
      })
    }
    return {
      // chats: fetchFunction(),
    };
  })(chatContextProvider((props) => null)));

// chat container

const ChatContainer = (props) => {
  useEffect(() => {
    ChatService.removeFromClosedChatsSession();
  }, []);

  const usingChatContext = useContext(ChatContext);
  const {
    children,
    unmounting,
  } = props;
  if (unmounting === true) {
    return null;
  }
  
  return (
    <Chat {...{...props, chats: usingChatContext.chats} }>
      {children}
    </Chat>
  );
};
// 
const providerList = [chatContextProvider, chatContextProvider ];

const nestedComponents = providerList.reduce((acc, El) => (
  <El>
    {acc}
  </El>
), children);


<contextProviders>
  <chatContextProvider>
    <userContext.provider>
      children
    </userContext.provider>
  </chatContextProvider>
</contextProviders>