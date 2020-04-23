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

const WEBCAMSAREA_MIN_PERCENT = 0.2;
const WEBCAMSAREA_MAX_PERCENT = 0.8;

// TODO function calPercentScreenOfUserSets
// Salvar porcentagem de uso do media setado pelo usuário
// Auto arange default true
// Não pegar só proporção e sim calcular área disponível
// Primeiro calculo pega orientação e medidas originais da apresentação
// Segundo calculo olha para os valores e verifica se tem overflow e recalcula

const storageLayoutData = () => Storage.getItem('layoutData');

class LayoutManager extends Component {
  constructor(props) {
    super(props);

    this.setLayoutSizes = this.setLayoutSizes.bind(this);
    this.calculatesLayout = this.calculatesLayout.bind(this);
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

  componentDidUpdate(prevProps) {
    const { usersVideo, layoutContextState } = this.props;
    const { usersVideo: prevUsersVideo, layoutContextState: prevLayoutContextState } = prevProps;
    const { webcamsPlacement, webcamsAreaSize } = layoutContextState;
    const {
      webcamsPlacement: prevWebcamsPlacement,
      webcamsAreaSize: prevWebcamsAreaSize,
    } = prevLayoutContextState;

    if (usersVideo.length !== prevUsersVideo.length
      || webcamsPlacement !== prevWebcamsPlacement) {
      this.setLayoutSizes();
    }

    if (webcamsAreaSize.width !== prevWebcamsAreaSize.width
      || webcamsAreaSize.height !== prevWebcamsAreaSize.height) {
      this.setLayoutSizes(true, true, webcamsAreaSize);
    }
  }

  setLayoutSizes(userlistChanged = false, chatChanged = false, webcamsAreaSize = null) {
    const { layoutContextDispatch } = this.props;

    const layoutSizes = this
      .calculatesLayout(userlistChanged, chatChanged, webcamsAreaSize);

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
        type: 'setMediaBounds',
        value: {
          width: layoutSizes.mediaBounds.width,
          height: layoutSizes.mediaBounds.height,
          top: layoutSizes.mediaBounds.top,
          left: layoutSizes.mediaBounds.left,
        },
      },
    );
    layoutContextDispatch(
      {
        type: 'setUserListSize',
        value: {
          width: layoutSizes.userListSize.width,
        },
      },
    );
    layoutContextDispatch(
      {
        type: 'setChatSize',
        value: {
          width: layoutSizes.chatSize.width,
        },
      },
    );
    layoutContextDispatch(
      {
        type: 'setWebcamsAreaSize',
        value: {
          width: layoutSizes.webcamsAreaSize.width,
          height: layoutSizes.webcamsAreaSize.height,
        },
      },
    );
    layoutContextDispatch(
      {
        type: 'setPresentationAreaSize',
        value: {
          width: layoutSizes.presentationAreaSize.width,
          height: layoutSizes.presentationAreaSize.height,
        },
      },
    );

    const newLayoutData = {
      windowSize: {
        width: windowWidth(),
        height: windowHeight(),
      },
      mediaBounds: {
        width: layoutSizes.mediaBounds.width,
        height: layoutSizes.mediaBounds.height,
        top: layoutSizes.mediaBounds.top,
        left: layoutSizes.mediaBounds.left,
      },
      userListSize: {
        width: layoutSizes.userListSize.width,
      },
      chatSize: {
        width: layoutSizes.chatSize.width,
      },
      webcamsAreaSize: {
        width: layoutSizes.webcamsAreaSize.width,
        height: layoutSizes.webcamsAreaSize.height,
      },
      presentationAreaSize: {
        width: layoutSizes.presentationAreaSize.width,
        height: layoutSizes.presentationAreaSize.height,
      },
    };

    Storage.setItem('layoutData', newLayoutData);
  }

  calculatesLayout(userlistChanged = false, chatChanged = false) {
    const {
      layoutContextState,
      usersVideo,
    } = this.props;
    const {
      webcamsAreaSize,
      userListSize: userListSizeContext,
      chatSize: chatSizeContext,
      presentationIsFullscreen,
      presentationOrientation,
      webcamsPlacement,
    } = layoutContextState;
    const openPanel = Session.get('openPanel');

    const storageLData = storageLayoutData();
    const autoArrangeLayout = Storage.getItem('autoArrangeLayout');

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

    const fullAreaHeight = windowHeight() - (NAVBAR_HEIGHT + ACTIONSBAR_HEIGHT);
    const fullAreaWidth = windowWidth() - (newUserListSize.width + newChatSize.width);


    const newMediaBounds = {
      width: fullAreaWidth,
      height: fullAreaHeight,
      top: NAVBAR_HEIGHT,
      left: newUserListSize.width + newChatSize.width,
    };
    console.log('webcamsAreaSize', webcamsAreaSize);
    console.log('autoArrangeLayout', autoArrangeLayout);
    

    let newWebcamAreaHeight;
    let newWebcamAreaWidth;
    let newPresentationAreaHeight;
    let newPresentationAreaWidth;
    if (usersVideo.length > 0) {
      if (presentationOrientation === 'portrait'
        || webcamsPlacement === 'left'
        || webcamsPlacement === 'right'
      ) {
        newWebcamAreaWidth = min(
          max(
            webcamsAreaSize && autoArrangeLayout === false
              ? webcamsAreaSize.width
              : fullAreaWidth * WEBCAMSAREA_MIN_PERCENT,
            fullAreaWidth * WEBCAMSAREA_MIN_PERCENT,
          ),
          fullAreaWidth * WEBCAMSAREA_MAX_PERCENT,
        );
        newWebcamAreaHeight = fullAreaHeight;

        newPresentationAreaWidth = fullAreaWidth - newWebcamAreaWidth - 30; // 30 is margins
        newPresentationAreaHeight = fullAreaHeight - 20; // 20 is margins
      } else {
        newWebcamAreaWidth = fullAreaWidth;
        newWebcamAreaHeight = min(
          max(
            webcamsAreaSize && autoArrangeLayout === false
              ? webcamsAreaSize.height
              : fullAreaHeight * WEBCAMSAREA_MIN_PERCENT,
            fullAreaHeight * WEBCAMSAREA_MIN_PERCENT,
          ),
          fullAreaHeight * WEBCAMSAREA_MAX_PERCENT,
        );

        newPresentationAreaWidth = fullAreaWidth;
        newPresentationAreaHeight = fullAreaHeight - newWebcamAreaHeight - 30; // 30 is margins
      }
    } else {
      newWebcamAreaWidth = 0;
      newWebcamAreaHeight = 0;

      newPresentationAreaWidth = fullAreaWidth;
      newPresentationAreaHeight = fullAreaHeight - 20; // 20 is margins
    }

    const newWebcamsAreaSize = {
      width: newWebcamAreaWidth,
      height: newWebcamAreaHeight,
    };

    let newPresentationAreaSize;
    if (!presentationIsFullscreen) {
      newPresentationAreaSize = {
        width: newPresentationAreaWidth,
        height: newPresentationAreaHeight,
      };
    } else {
      newPresentationAreaSize = {
        width: windowWidth(),
        height: windowHeight(),
      };
    }

    return {
      mediaBounds: newMediaBounds,
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
  WEBCAMSAREA_MIN_PERCENT,
  WEBCAMSAREA_MAX_PERCENT,
};
