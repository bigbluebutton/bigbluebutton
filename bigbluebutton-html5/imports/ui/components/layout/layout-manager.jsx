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
    const { layoutContextDispatch } = this.props;

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

  calculatesPresentationSize(
    mediaAreaWidth, mediaAreaHeight, presentationSlideWidth, presentationSlideHeight,
  ) {
    const { layoutContextState } = this.props;
    const { numUsersVideo } = layoutContextState;

    // let presentationWidthAvailable;
    // let presentationHeightAvailable;

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

  calculatesWebcamsAreaSize(
    mediaAreaWidth, mediaAreaHeight,
  ) {
    const {
      layoutContextState,
      // layoutContextDispatch,
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
        webcamsAreaWidth = mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT;
        webcamsAreaHeight = mediaAreaHeight;
      } else {
        webcamsAreaWidth = mediaAreaWidth;
        webcamsAreaHeight = mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT;
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

    if ((mediaAreaWidth - webcamsAreaWidth) < PRESENTATIONAREA_MIN_WIDTH) {
      webcamsAreaWidth = mediaAreaWidth - PRESENTATIONAREA_MIN_WIDTH;
    }

    // if (presentationWidth === null || presentationHeight === null) {
    //   if (webcamsPlacement === 'left' || webcamsPlacement === 'right') {
    //     newWebcamAreaWidth = min(
    //       max(
    //         webcamsAreaUserSetsWidth && !autoArrangeLayout
    //           ? webcamsAreaUserSetsWidth : mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT,
    //         mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT,
    //       ),
    //       mediaAreaWidth * WEBCAMSAREA_MAX_PERCENT,
    //     );
    //     if ((mediaAreaWidth - newWebcamAreaWidth) < PRESENTATIONAREA_MIN_WIDTH) {
    //       newWebcamAreaWidth = mediaAreaWidth - PRESENTATIONAREA_MIN_WIDTH;
    //     }
    //     newWebcamAreaHeight = mediaAreaHeight;
    //   } else {
    //     newWebcamAreaWidth = mediaAreaWidth;
    //     newWebcamAreaHeight = min(
    //       max(
    //         webcamsAreaUserSetsHeight && !autoArrangeLayout
    //           ? webcamsAreaUserSetsHeight : mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT,
    //         mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT,
    //       ),
    //       mediaAreaHeight * WEBCAMSAREA_MAX_PERCENT,
    //     );
    //   }
    // }

    // if (autoArrangeLayout) {
    //   console.log('mediaAreaWidth', mediaAreaWidth);
    //   console.log('presentationWidth', presentationWidth);
    //   console.log('mediaAreaHeight', mediaAreaHeight);
    //   console.log('presentationHeight', presentationHeight);

    //   if ((mediaAreaWidth - presentationWidth) > (mediaAreaHeight - presentationHeight)) {
    //     layoutContextDispatch(
    //       {
    //         type: 'setWebcamsPlacement',
    //         value: 'left',
    //       },
    //     );

    //     newWebcamAreaWidth = (mediaAreaWidth - presentationWidth)
    //       < (mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT)
    //       ? mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT
    //       : mediaAreaWidth - presentationWidth;
    //     newWebcamAreaHeight = mediaAreaHeight;
    //   } else {
    //     layoutContextDispatch(
    //       {
    //         type: 'setWebcamsPlacement',
    //         value: 'top',
    //       },
    //     );

    //     newWebcamAreaWidth = mediaAreaWidth;
    //     newWebcamAreaHeight = (mediaAreaHeight - presentationHeight)
    //       < (mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT)
    //       ? (mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT)
    //       : mediaAreaHeight - presentationHeight - 30;
    //   }
    // }

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
      // webcamsPlacement,
      // presentationSlideSize,
      // autoArrangeLayout,
      numUsersVideo,
    } = layoutContextState;

    // let newPresentationAreaWidth;
    // let newPresentationAreaHeight;
    if (numUsersVideo < 1) {
      return {
        presentationAreaWidth: mediaAreaWidth,
        presentationAreaHeight: mediaAreaHeight,
      };
    }

    const presentationAreaWidth = mediaAreaWidth - webcamAreaWidth;
    const presentationAreaHeight = mediaAreaHeight - webcamAreaHeight;

    return {
      presentationAreaWidth,
      presentationAreaHeight,
    };

    // const {
    //   width: presentationSlideWidth,
    //   height: presentationSlideHeight,
    // } = presentationSlideSize;
    // const presentationMaxSize = this.calculatesPresentationMaxSize(
    //   mediaAreaWidth, mediaAreaHeight, presentationSlideWidth, presentationSlideHeight,
    // );
    // const { presentationWidth, presentationHeight } = presentationMaxSize;

    // if (webcamAreaWidth === null || webcamAreaHeight === null) {
    //   if (numUsersVideo < 1) {
    //     newPresentationAreaWidth = presentationWidth;
    //     newPresentationAreaHeight = presentationHeight;
    //   } else if (webcamsPlacement === 'left' || webcamsPlacement === 'right') {
    //     newPresentationAreaWidth = mediaAreaWidth - (mediaAreaWidth * WEBCAMSAREA_MIN_PERCENT);
    //     newPresentationAreaHeight = mediaAreaHeight;
    //   } else {
    //     newPresentationAreaWidth = mediaAreaWidth;
    //     newPresentationAreaHeight = mediaAreaHeight
    //       - (mediaAreaHeight * WEBCAMSAREA_MIN_PERCENT) - 30; // 30 is margins
    //   }
    // } else if (webcamsPlacement === 'left' || webcamsPlacement === 'right') {
    //   newPresentationAreaWidth = mediaAreaWidth - webcamAreaWidth;
    //   newPresentationAreaHeight = mediaAreaHeight;
    // } else {
    //   newPresentationAreaWidth = mediaAreaWidth;
    //   newPresentationAreaHeight = mediaAreaHeight - webcamAreaHeight;
    // }

    // return {
    //   newPresentationAreaWidth: autoArrangeLayout
    //     ? newPresentationAreaWidth - 10 : newPresentationAreaWidth - 26,
    //   newPresentationAreaHeight: newPresentationAreaHeight
    //     < (mediaAreaHeight * PRESENTATIONAREA_MIN_PERCENT)
    //     ? mediaAreaHeight * PRESENTATIONAREA_MIN_PERCENT
    //     : newPresentationAreaHeight,
    // };
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

    // const autoArrangeLayout = Storage.getItem('autoArrangeLayout');

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

    // let webcamsSize;
    // let presentationSize;

    const { presentationWidth, presentationHeight } = this.calculatesPresentationSize(
      mediaAreaWidth, mediaAreaHeight, presentationSlideWidth, presentationSlideHeight,
    );

    console.log('presentationWidth', presentationWidth);
    console.log('presentationHeight', presentationHeight);

    this.defineWebcamPlacement(
      mediaAreaWidth, mediaAreaHeight, presentationWidth, presentationHeight,
    );

    console.log('mediaAreaWidth', mediaAreaWidth);
    console.log('mediaAreaHeight', mediaAreaHeight);

    const { webcamsAreaWidth, webcamsAreaHeight } = this
      .calculatesWebcamsAreaSize(mediaAreaWidth, mediaAreaHeight);

    console.log('webcamsAreaWidth', webcamsAreaWidth);
    console.log('webcamsAreaHeight', webcamsAreaHeight);
    
    const { presentationAreaWidth, presentationAreaHeight } = this.calculatesPresentationAreaSize(
      mediaAreaWidth, mediaAreaHeight, webcamsAreaWidth, webcamsAreaHeight,
    );

    console.log('presentationAreaWidth', presentationAreaWidth);
    console.log('presentationAreaHeight', presentationAreaHeight);
    

    // if (autoArrangeLayout) {
    //   presentationSize = this.calculatesPresentationAreaSize(mediaAreaWidth, mediaAreaHeight);
    //   webcamsSize = this.calculatesWebcamsAreaSize(
    //     mediaAreaWidth,
    //     mediaAreaHeight,
    //     presentationSize.newPresentationAreaWidth,
    //     presentationSize.newPresentationAreaHeight,
    //   );
    // } else {
    //   webcamsSize = this.calculatesWebcamsAreaSize(mediaAreaWidth, mediaAreaHeight);
    //   presentationSize = this.calculatesPresentationAreaSize(
    //     mediaAreaWidth,
    //     mediaAreaHeight,
    //     webcamsSize.newWebcamAreaWidth,
    //     webcamsSize.newWebcamAreaHeight,
    //   );
    // }

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
