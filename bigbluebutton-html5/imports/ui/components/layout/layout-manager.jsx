import React, { Component, Fragment } from 'react';
// import { withLayoutConsumer } from './context';
import Storage from '/imports/ui/services/storage/session';
import { Session } from 'meteor/session';

const windowWidth = () => window.innerWidth;
const windowHeight = () => window.innerHeight;
const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

// values based on sass file
const USERLIST_MIN_WIDTH = 150;
const USERLIST_MAX_WIDTH = 240;
const CHAT_MIN_WIDTH = 150;
const CHAT_MAX_WIDTH = 335;
const NAVBAR_HEIGHT = 85;
const ACTIONSBAR_HEIGHT = 42;

const storageLayoutData = () => Storage.getItem('layoutData');

class LayoutManager extends Component {
  constructor(props) {
    super(props);

    this.setLayoutSizes = this.setLayoutSizes.bind(this);
    this.calculaLayout = this.calculaLayout.bind(this);
  }

  componentDidMount() {
    this.setLayoutSizes();
    window.addEventListener('resize', _.throttle(() => this.setLayoutSizes(), 200));

    window.addEventListener('userListResizeChanged', () => {
      const userlistChanged = true;
      const chatChanged = false;
      this.setLayoutSizes(userlistChanged, chatChanged);
    });
    window.addEventListener('chatResizeChanged', () => {
      const userlistChanged = false;
      const chatChanged = true;
      this.setLayoutSizes(userlistChanged, chatChanged);
    });
  }

  setLayoutSizes(userlistChanged = false, chatChanged = false) {
    const { layoutContextDispatch } = this.props;

    let userListWidth;
    let chatWidth;
    let webcamsAreaWidth;
    let presentationAreaWidth;
    let webcamsAreaHeight;
    let storageWindowWidth;
    let presentationAreaHeight;

    const layoutSizes = this.calculaLayout(userlistChanged, chatChanged);
    // Get storage data and set in size variables
    const storageLData = storageLayoutData();
    if (storageLData) {
      storageWindowWidth = storageLData.windowSize.width;
      userListWidth = storageLData.userListSize.width;
      chatWidth = storageLData.chatSize.width;
      webcamsAreaWidth = storageLData.webcamsAreaSize.width;
      webcamsAreaHeight = storageLData.webcamsAreaSize.height;
      presentationAreaWidth = storageLData.presentationAreaSize.width;
      presentationAreaHeight = storageLData.presentationAreaSize.height;
    }

    // If storage data does not exist or window size is changed or layout is changed
    // (userlist or chat list size changed)
    // Get size from calc function
    if (!userListWidth
      || windowWidth() !== storageWindowWidth
      || userlistChanged
      || chatChanged) {
      userListWidth = layoutSizes.userListSize.width;
    }
    if (!chatWidth
      || windowWidth() !== storageWindowWidth
      || chatChanged
      || userlistChanged) {
      chatWidth = layoutSizes.chatSize.width;
    }
    if (!storageLayoutData() || windowWidth() !== storageWindowWidth) {
      webcamsAreaWidth = layoutSizes.webcamsAreaSize.width;
      webcamsAreaHeight = layoutSizes.webcamsAreaSize.height;
    }
    if (!storageLayoutData()
      || windowWidth() !== storageWindowWidth
      || layoutSizes.presentationAreaSize.width !== storageLayoutData().presentationAreaSize.width
      || userlistChanged
      || chatChanged) {
      presentationAreaWidth = layoutSizes.presentationAreaSize.width;
      presentationAreaHeight = layoutSizes.presentationAreaSize.height;
    }

    layoutContextDispatch(
      {
        type: 'setWindowSize',
        value: {
          width: windowWidth(),
          height: windowHeight(),
        },
      },
    );
    layoutContextDispatch(
      {
        type: 'setUserListSize',
        value: {
          width: userListWidth,
        },
      },
    );
    layoutContextDispatch(
      {
        type: 'setChatSize',
        value: {
          width: chatWidth,
        },
      },
    );
    layoutContextDispatch(
      {
        type: 'setWebcamsAreaSize',
        value: {
          width: webcamsAreaWidth,
          height: webcamsAreaHeight,
        },
      },
    );
    layoutContextDispatch(
      {
        type: 'setPresentationAreaSize',
        value: {
          width: presentationAreaWidth,
          height: presentationAreaHeight,
        },
      },
    );

    const newLayoutData = {
      windowSize: {
        width: windowWidth(),
        height: windowHeight(),
      },
      userListSize: {
        width: userListWidth,
      },
      chatSize: {
        width: chatWidth,
      },
      webcamsAreaSize: {
        width: webcamsAreaWidth,
        height: webcamsAreaHeight,
      },
      presentationAreaSize: {
        width: presentationAreaWidth,
        height: presentationAreaHeight,
      },
    };

    Storage.setItem('layoutData', newLayoutData);
  }

  calculaLayout(userlistChanged = false, chatChanged = false) {
    const { layoutContextState } = this.props;
    const {
      userListSize: userListSizeContext,
      chatSize: chatSizeContext,
      presentationIsFullscreen,
    } = layoutContextState;
    const openPanel = Session.get('openPanel');

    const storageLData = storageLayoutData();
    let storageUserListWidth;
    let storageChatWidth;
    if (storageLData) {
      storageUserListWidth = storageLData.userListSize.width;
      storageChatWidth = storageLData.chatSize.width;
    }

    let newUserListSize;
    let newChatSize;
    if (userlistChanged || chatChanged) {
      newUserListSize = userListSizeContext;
      newChatSize = chatSizeContext;
    } else {
      if (!storageUserListWidth) {
        newUserListSize = {
          width: min(max((windowWidth() * 0.1), USERLIST_MIN_WIDTH), USERLIST_MAX_WIDTH),
        };
      } else {
        newUserListSize = {
          width: storageUserListWidth,
        };
      }
      if (!storageChatWidth) {
        newChatSize = {
          width: min(max((windowWidth() * 0.2), CHAT_MIN_WIDTH), CHAT_MAX_WIDTH),
        };
      } else {
        newChatSize = {
          width: storageChatWidth,
        };
      }
    }

    if (openPanel === 'userlist') {
      newChatSize = {
        width: 0,
      };
    }

    if (!openPanel) {
      newUserListSize = {
        width: 0,
      };
      newChatSize = {
        width: 0,
      };
    }

    const newWebcamsAreaSize = {
      width: windowWidth() - (newUserListSize.width + newChatSize.width),
    };

    let newPresentationAreaSize;
    if (!presentationIsFullscreen) {
      newPresentationAreaSize = {
        width: windowWidth() - (newUserListSize.width + newChatSize.width),
        height: windowHeight() - (NAVBAR_HEIGHT + ACTIONSBAR_HEIGHT),
      };
    } else {
      newPresentationAreaSize = {
        width: windowWidth(),
        height: windowHeight(),
      };
    }

    return {
      userListSize: newUserListSize,
      chatSize: newChatSize,
      webcamsAreaSize: newWebcamsAreaSize,
      presentationAreaSize: newPresentationAreaSize,
    };
  }

  render() {
    return <Fragment />;
  }
}

export default LayoutManager;
export {
  USERLIST_MIN_WIDTH,
  USERLIST_MAX_WIDTH,
  CHAT_MIN_WIDTH,
  CHAT_MAX_WIDTH,
  NAVBAR_HEIGHT,
  ACTIONSBAR_HEIGHT,
};
