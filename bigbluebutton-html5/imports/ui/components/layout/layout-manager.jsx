import React, { Component, Fragment } from 'react';
import Storage from '/imports/ui/services/storage/session';
import { Session } from 'meteor/session';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';

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
// const PRESENTATIONAREA_MIN_PERCENT = 0.2;
const PRESENTATIONAREA_MIN_WIDTH = 385; // Value based on presentation toolbar
// const PRESENTATIONAREA_MAX_PERCENT = 0.8;

const storageLayoutData = () => Storage.getItem('layoutData');

class LayoutManager extends Component {
  static calculatesPresentationSize(
    mediaAreaWidth, mediaAreaHeight, presentationSlideWidth, presentationSlideHeight,
  ) {
    let presentationWidth;
    let presentationHeight;
    if (presentationSlideWidth > presentationSlideHeight
      || presentationSlideWidth === presentationSlideHeight) {
      presentationWidth = mediaAreaWidth;
      presentationHeight = (mediaAreaWidth * presentationSlideHeight)
        / presentationSlideWidth;
      // if overflow
      if (presentationHeight > mediaAreaHeight) {
        presentationWidth = (mediaAreaHeight * presentationWidth) / presentationHeight;
        presentationHeight = mediaAreaHeight;
      }
    }
    if (presentationSlideHeight > presentationSlideWidth) {
      presentationWidth = (mediaAreaHeight * presentationSlideWidth)
        / presentationSlideHeight;
      presentationHeight = mediaAreaHeight;
      // if overflow
      if (presentationWidth > mediaAreaWidth) {
        presentationHeight = (mediaAreaWidth * presentationWidth) / presentationHeight;
        presentationWidth = mediaAreaWidth;
      }
    }

    return {
      presentationWidth,
      presentationHeight,
    };
  }

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

    window.addEventListener('autoArrangeChanged', () => {
      setTimeout(() => this.setLayoutSizes(), 200);
    });

    window.addEventListener('slideChanged', () => {
      setTimeout(() => this.setLayoutSizes(), 200);
    });
  }

  componentDidUpdate(prevProps) {
    const { layoutContextState } = this.props;
    const { layoutContextState: prevLayoutContextState } = prevProps;
    const {
      webcamsPlacement,
      webcamsAreaSize,
      presentationSlideSize,
      numUsersVideo,
    } = layoutContextState;
    const {
      webcamsPlacement: prevWebcamsPlacement,
      webcamsAreaSize: prevWebcamsAreaSize,
      presentationSlideSize: prevPresentationSlideSize,
      numUsersVideo: prevNumUsersVideo,
    } = prevLayoutContextState;

    if (numUsersVideo !== prevNumUsersVideo) {
      setTimeout(() => this.setLayoutSizes(), 500);
    }

    if (webcamsPlacement !== prevWebcamsPlacement
      || presentationSlideSize !== prevPresentationSlideSize) {
      this.setLayoutSizes();
    }

    if (webcamsAreaSize.width !== prevWebcamsAreaSize.width
      || webcamsAreaSize.height !== prevWebcamsAreaSize.height) {
      this.setLayoutSizes(true, true, webcamsAreaSize);
    }
  }

  setLayoutSizes(userlistChanged = false, chatChanged = false) {
    const { layoutContextDispatch } = this.props;

    const layoutSizes = this
      .calculatesLayout(userlistChanged, chatChanged);

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
        type: 'setTempWebcamsAreaSize',
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
    window.dispatchEvent(new Event('layoutSizesSets'));
  }

  defineWebcamPlacement(mediaAreaWidth, mediaAreaHeight, presentationWidth, presentationHeight) {
    const { layoutContextDispatch, layoutContextState } = this.props;
    const { autoArrangeLayout } = layoutContextState;

    if (autoArrangeLayout) {
      if ((mediaAreaWidth - presentationWidth) > (mediaAreaHeight - presentationHeight)) {
        layoutContextDispatch(
          {
            type: 'setWebcamsPlacement',
            value: 'left',
          },
        );
      } else {
        layoutContextDispatch(
          {
            type: 'setWebcamsPlacement',
            value: 'top',
          },
        );
      }
    }
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
    mediaAreaWidth, mediaAreaHeight, presentationWidth, presentationHeight,
  ) {
    const {
      layoutContextState,
    } = this.props;
    const { webcamsPlacement, numUsersVideo } = layoutContextState;

    const autoArrangeLayout = Storage.getItem('autoArrangeLayout');
    const webcamsAreaUserSetsHeight = Storage.getItem('webcamsAreaUserSetsHeight');
    const webcamsAreaUserSetsWidth = Storage.getItem('webcamsAreaUserSetsWidth');
    let webcamsAreaWidth;
    let webcamsAreaHeight;

    if (numUsersVideo < 1) {
      return {
        webcamsAreaWidth: 0,
        webcamsAreaHeight: 0,
      };
    }

    if (autoArrangeLayout) {
      if (webcamsPlacement === 'left' || webcamsPlacement === 'right') {
        webcamsAreaWidth = (mediaAreaWidth - presentationWidth)
          < (mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT)
          ? mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT
          : mediaAreaWidth - presentationWidth;
        webcamsAreaHeight = mediaAreaHeight;
      } else {
        webcamsAreaWidth = mediaAreaWidth;
        webcamsAreaHeight = (mediaAreaHeight - presentationHeight)
          < (mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT)
          ? mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT
          : mediaAreaHeight - presentationHeight;
      }
    } else if (webcamsPlacement === 'left' || webcamsPlacement === 'right') {
      webcamsAreaWidth = min(
        max(
          webcamsAreaUserSetsWidth
          || mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT,
          mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT,
        ),
        mediaAreaWidth * WEBCAMSAREA_MAX_PERCENT,
      );
      webcamsAreaHeight = mediaAreaHeight;
    } else {
      webcamsAreaWidth = mediaAreaWidth;
      webcamsAreaHeight = min(
        max(
          webcamsAreaUserSetsHeight
          || mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT,
          mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT,
        ),
        mediaAreaHeight * WEBCAMSAREA_MAX_PERCENT,
      );
    }

    if ((webcamsPlacement === 'left' || webcamsPlacement === 'right') && (mediaAreaWidth - webcamsAreaWidth) < PRESENTATIONAREA_MIN_WIDTH) {
      webcamsAreaWidth = mediaAreaWidth - PRESENTATIONAREA_MIN_WIDTH;
    }

    return {
      webcamsAreaWidth,
      webcamsAreaHeight,
    };
  }

  calculatesPresentationAreaSize(
    mediaAreaWidth, mediaAreaHeight, webcamAreaWidth, webcamAreaHeight,
  ) {
    const {
      layoutContextState,
    } = this.props;
    const {
      webcamsPlacement,
      numUsersVideo,
    } = layoutContextState;

    if (numUsersVideo < 1) {
      return {
        presentationAreaWidth: mediaAreaWidth,
        presentationAreaHeight: mediaAreaHeight,
      };
    }

    let presentationAreaWidth;
    let presentationAreaHeight;

    if (webcamsPlacement === 'left' || webcamsPlacement === 'right') {
      presentationAreaWidth = mediaAreaWidth - webcamAreaWidth;
      presentationAreaHeight = mediaAreaHeight;
    } else {
      presentationAreaWidth = mediaAreaWidth;
      presentationAreaHeight = mediaAreaHeight - webcamAreaHeight - 30;
    }

    return {
      presentationAreaWidth,
      presentationAreaHeight,
    };
  }

  calculatesLayout(userlistChanged = false, chatChanged = false) {
    const {
      layoutContextState,
    } = this.props;
    const {
      presentationIsFullscreen,
      presentationSlideSize,
    } = layoutContextState;

    const {
      width: presentationSlideWidth,
      height: presentationSlideHeight,
    } = presentationSlideSize;

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

    const { presentationWidth, presentationHeight } = LayoutManager.calculatesPresentationSize(
      mediaAreaWidth, mediaAreaHeight, presentationSlideWidth, presentationSlideHeight,
    );

    this.defineWebcamPlacement(
      mediaAreaWidth, mediaAreaHeight, presentationWidth, presentationHeight,
    );

    const { webcamsAreaWidth, webcamsAreaHeight } = this.calculatesWebcamsAreaSize(
      mediaAreaWidth, mediaAreaHeight, presentationWidth, presentationHeight,
    );

    const { presentationAreaWidth, presentationAreaHeight } = this.calculatesPresentationAreaSize(
      mediaAreaWidth, mediaAreaHeight, webcamsAreaWidth, webcamsAreaHeight,
    );

    const newWebcamsAreaSize = {
      width: webcamsAreaWidth,
      height: webcamsAreaHeight,
    };

    let newPresentationAreaSize;
    if (!presentationIsFullscreen) {
      newPresentationAreaSize = {
        width: presentationAreaWidth,
        height: presentationAreaHeight,
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

export default withLayoutConsumer(LayoutManager);
export {
  USERLIST_MIN_WIDTH,
  USERLIST_MAX_WIDTH,
  CHAT_MIN_WIDTH,
  CHAT_MAX_WIDTH,
  NAVBAR_HEIGHT,
  ACTIONSBAR_HEIGHT,
  WEBCAMSAREA_MIN_PERCENT,
  WEBCAMSAREA_MAX_PERCENT,
  PRESENTATIONAREA_MIN_WIDTH,
};
