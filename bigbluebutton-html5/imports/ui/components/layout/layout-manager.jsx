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
const PRESENTATIONAREA_MIN_PERCENT = 0.2;
const PRESENTATIONAREA_MAX_PERCENT = 0.8;

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
    const {
      webcamsPlacement,
      webcamsAreaSize,
      presentationSlideSize,
    } = layoutContextState;
    const {
      webcamsPlacement: prevWebcamsPlacement,
      webcamsAreaSize: prevWebcamsAreaSize,
      presentationSlideSize: prevPresentationSlideSize,
    } = prevLayoutContextState;

    if (usersVideo.length !== prevUsersVideo.length
      || webcamsPlacement !== prevWebcamsPlacement
      || presentationSlideSize !== prevPresentationSlideSize) {
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

  calculatesPanelsSize(userlistChanged, chatChanged) {
    const { layoutContextState } = this.props;
    const {
      userListSize: userListSizeContext,
      chatSize: chatSizeContext,
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

    return {
      newUserListSize,
      newChatSize,
    };
  }

  calculatesWebcamsAreaSize(
    mediaAreaWidth, mediaAreaHeight, presentationWidth = null, presentationHeight = null,
  ) {
    const {
      layoutContextState,
      usersVideo,
    } = this.props;
    const { webcamsPlacement } = layoutContextState;

    const webcamsAreaUserSetsHeight = Storage.getItem('webcamsAreaUserSetsHeight');
    const webcamsAreaUserSetsWidth = Storage.getItem('webcamsAreaUserSetsWidth');
    let newWebcamAreaHeight;
    let newWebcamAreaWidth;

    if (usersVideo.length < 1) {
      return {
        newWebcamAreaWidth: 0,
        newWebcamAreaHeight: 0,
      };
    }

    console.log('>> webcamsAreaUserSetsWidth', webcamsAreaUserSetsWidth);


    if (presentationWidth === null || presentationHeight === null) {
      if (webcamsPlacement === 'left' || webcamsPlacement === 'right') {
        newWebcamAreaWidth = min(
          max(
            webcamsAreaUserSetsWidth || mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT,
            mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT,
          ),
          mediaAreaWidth * WEBCAMSAREA_MAX_PERCENT,
        );
        newWebcamAreaHeight = mediaAreaHeight;
      } else {
        newWebcamAreaWidth = mediaAreaWidth;
        newWebcamAreaHeight = min(
          max(
            webcamsAreaUserSetsHeight || mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT,
            mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT,
          ),
          mediaAreaHeight * WEBCAMSAREA_MAX_PERCENT,
        );
      }
    } else if (webcamsPlacement === 'left' || webcamsPlacement === 'right') {
      newWebcamAreaWidth = min(
        max(
          mediaAreaWidth - presentationWidth,
          mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT,
        ),
        mediaAreaWidth * WEBCAMSAREA_MAX_PERCENT,
      );
      newWebcamAreaHeight = mediaAreaHeight;
    } else {
      newWebcamAreaWidth = mediaAreaWidth;
      newWebcamAreaHeight = min(
        max(
          mediaAreaHeight - presentationHeight,
          mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT,
        ),
        mediaAreaHeight * WEBCAMSAREA_MAX_PERCENT,
      );
    }

    return {
      newWebcamAreaWidth,
      newWebcamAreaHeight,
    };
  }

  calculatesPresentationMaxSize(
    mediaAreaWidth, mediaAreaHeight, presentationSlideWidth, presentationSlideHeight,
  ) {
    const { usersVideo, layoutContextState } = this.props;
    const { webcamsPlacement } = layoutContextState;

    let presentationWidthAvailable;
    let presentationHeightAvailable;

    if (usersVideo.length > 0) {
      if (webcamsPlacement === 'top' || webcamsPlacement === 'bottom') {
        presentationWidthAvailable = mediaAreaWidth;
        presentationHeightAvailable = mediaAreaHeight * PRESENTATIONAREA_MAX_PERCENT;
      } else {
        presentationWidthAvailable = mediaAreaWidth * PRESENTATIONAREA_MAX_PERCENT;
        presentationHeightAvailable = mediaAreaHeight;
      }
    } else {
      presentationWidthAvailable = mediaAreaWidth;
      presentationHeightAvailable = mediaAreaHeight;
    }

    let presentationWidth;
    let presentationHeight;
    if (presentationSlideWidth > presentationSlideHeight
      || presentationSlideWidth === presentationSlideHeight) {
      presentationWidth = presentationWidthAvailable;
      presentationHeight = (presentationWidthAvailable * presentationSlideHeight)
        / presentationSlideWidth;
      // if overflow
      if (presentationHeight > presentationHeightAvailable) {
        presentationWidth = (presentationHeightAvailable * presentationWidth) / presentationHeight;
        presentationHeight = presentationHeightAvailable;
      }
    }
    if (presentationSlideHeight > presentationSlideWidth) {
      presentationWidth = (presentationHeightAvailable * presentationSlideWidth)
        / presentationSlideHeight;
      presentationHeight = presentationHeightAvailable;
      // if overflow
      if (presentationWidth > presentationWidthAvailable) {
        presentationHeight = (presentationWidthAvailable * presentationWidth) / presentationHeight;
        presentationWidth = presentationWidthAvailable;
      }
    }
    return {
      presentationWidth,
      presentationHeight,
    };
  }

  calculatesPresentationAreaSize(
    mediaAreaWidth, mediaAreaHeight, webcamAreaWidth = null, webcamAreaHeight = null,
  ) {
    const {
      layoutContextState,
      usersVideo,
    } = this.props;
    const { webcamsPlacement, presentationSlideSize } = layoutContextState;

    let newPresentationAreaWidth;
    let newPresentationAreaHeight;
    if (usersVideo.length < 1) {
      return {
        newPresentationAreaWidth: mediaAreaWidth,
        newPresentationAreaHeight: mediaAreaHeight - 20, // 20 is margins
      };
    }

    const {
      width: presentationSlideWidth,
      height: presentationSlideHeight,
    } = presentationSlideSize;
    const presentationMaxSize = this.calculatesPresentationMaxSize(
      mediaAreaWidth, mediaAreaHeight, presentationSlideWidth, presentationSlideHeight,
    );
    const { presentationWidth, presentationHeight } = presentationMaxSize;

    console.log('mediaAreaHeight', mediaAreaHeight);


    console.log('>> webcamAreaWidth', webcamAreaWidth);


    if (webcamAreaWidth === null || webcamAreaHeight === null) {
      newPresentationAreaWidth = presentationWidth; // 30 is margins
      newPresentationAreaHeight = presentationHeight; // 20 is margins
    } else if (webcamsPlacement === 'left' || webcamsPlacement === 'right') {
      newPresentationAreaWidth = mediaAreaWidth - webcamAreaWidth - 30; // 30 is margins
      newPresentationAreaHeight = mediaAreaHeight - 20; // 20 is margins
    } else {
      newPresentationAreaWidth = mediaAreaWidth;
      newPresentationAreaHeight = mediaAreaHeight - webcamAreaHeight - 30; // 30 is margins
    }
    console.log('>> newPresentationAreaWidth', newPresentationAreaWidth);

    if (newPresentationAreaWidth < (mediaAreaWidth * PRESENTATIONAREA_MIN_PERCENT)) {
      if (newPresentationAreaWidth < 400) {
        newPresentationAreaWidth = 400;
      } else {
        newPresentationAreaWidth = mediaAreaWidth * PRESENTATIONAREA_MIN_PERCENT;
      }
    }


    console.log('>> newPresentationAreaWidth', newPresentationAreaWidth);


    return {
      newPresentationAreaWidth,
      newPresentationAreaHeight: newPresentationAreaHeight
        < (mediaAreaHeight * PRESENTATIONAREA_MIN_PERCENT)
        ? mediaAreaHeight * PRESENTATIONAREA_MIN_PERCENT
        : newPresentationAreaHeight,
    };
  }

  calculatesLayout(userlistChanged = false, chatChanged = false) {
    const {
      layoutContextState,
    } = this.props;
    const { presentationIsFullscreen } = layoutContextState;

    const autoArrangeLayout = Storage.getItem('autoArrangeLayout');

    const panelsSize = this.calculatesPanelsSize(userlistChanged, chatChanged);
    const { newUserListSize, newChatSize } = panelsSize;

    const mediaAreaHeight = windowHeight() - (NAVBAR_HEIGHT + ACTIONSBAR_HEIGHT);
    const mediaAreaWidth = windowWidth() - (newUserListSize.width + newChatSize.width);
    const newMediaBounds = {
      width: mediaAreaWidth,
      height: mediaAreaHeight,
      top: NAVBAR_HEIGHT,
      left: newUserListSize.width + newChatSize.width,
    };

    let webcamsSize;
    let presentationSize;
    if (autoArrangeLayout) {
      presentationSize = this.calculatesPresentationAreaSize(mediaAreaWidth, mediaAreaHeight);
      webcamsSize = this.calculatesWebcamsAreaSize(
        mediaAreaWidth,
        mediaAreaHeight,
        presentationSize.newPresentationAreaWidth,
        presentationSize.newPresentationAreaHeight,
      );
    } else {
      webcamsSize = this.calculatesWebcamsAreaSize(mediaAreaWidth, mediaAreaHeight);
      presentationSize = this.calculatesPresentationAreaSize(
        mediaAreaWidth,
        mediaAreaHeight,
        webcamsSize.newWebcamAreaWidth,
        webcamsSize.newWebcamAreaHeight,
      );
    }

    const newWebcamsAreaSize = {
      width: webcamsSize.newWebcamAreaWidth,
      height: webcamsSize.newWebcamAreaHeight,
    };

    let newPresentationAreaSize;
    if (!presentationIsFullscreen) {
      newPresentationAreaSize = {
        width: presentationSize.newPresentationAreaWidth,
        height: presentationSize.newPresentationAreaHeight,
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
