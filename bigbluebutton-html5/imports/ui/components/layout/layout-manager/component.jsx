import React, { Component } from 'react';
import Storage from '/imports/ui/services/storage/session';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';
import deviceInfo from '/imports/utils/deviceInfo';
import _ from 'lodash';
import NewLayoutManager from '../context/context';

const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

const { isMobile } = deviceInfo;

// values based on sass file
const USERLIST_MIN_WIDTH = 150;
const USERLIST_MAX_WIDTH = 240;
const CHAT_MIN_WIDTH = 320;
const CHAT_MAX_WIDTH = 400;
const NAVBAR_HEIGHT = 112;
const LARGE_NAVBAR_HEIGHT = 170;
const ACTIONSBAR_HEIGHT = isMobile ? 50 : 42;
const BREAKOUT_MIN_WIDTH = 320;
const BREAKOUT_MAX_WIDTH = 400;

const WEBCAMSAREA_MIN_PERCENT = 0.2;
const WEBCAMSAREA_MAX_PERCENT = 0.8;
// const PRESENTATIONAREA_MIN_PERCENT = 0.2;
const PRESENTATIONAREA_MIN_WIDTH = 385; // Value based on presentation toolbar
// const PRESENTATIONAREA_MAX_PERCENT = 0.8;
const storageLayoutData = () => Storage.getItem('layoutData');

class LayoutManagerComponent extends Component {
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
    this._isMounted = true;
    this.setLayoutSizes();
    window.addEventListener('resize', _.throttle(() => this.setLayoutSizes(), 200));

    window.addEventListener('panelChanged', () => {
      this.setLayoutSizes(true);
    });

    window.addEventListener('autoArrangeChanged', () => {
      setTimeout(() => this.setLayoutSizes(false, true), 200);
    });

    window.addEventListener('slideChanged', () => {
      setTimeout(() => this.setLayoutSizes(), 200);
    });

    window.addEventListener('togglePresentationHide', () => {
      setTimeout(() => this.setLayoutSizes(), 200);
    });

    window.addEventListener('webcamAreaResize', () => {
      this.setLayoutSizes();
    });

    window.addEventListener('webcamPlacementChange', () => {
      this.setLayoutSizes(false, false, true);
    });
    
    window.addEventListener('fullscreenchange', () => {
      setTimeout(() => this.setLayoutSizes(), 200);
    });

    window.addEventListener('localeChanged', () => {
      setTimeout(() => this.setLayoutSizes(), 200);
    });
  }

  componentDidUpdate(prevProps) {
    const {
      layoutContextState,
      layoutManagerLoaded,
      screenIsShared,
      newLayoutContextState,
    } = this.props;
    const {
      layoutContextState: prevLayoutContextState,
      screenIsShared: prevScreenIsShared,
      newLayoutContextState: prevNewLayoutContextState,
    } = prevProps;

    const {
      numUsersVideo,
    } = layoutContextState;
    const {
      numUsersVideo: prevNumUsersVideo,
    } = prevLayoutContextState;

    const { input } = newLayoutContextState;
    const { sidebarNavigation, sidebarContent } = input;

    const { input: prevInput } = prevNewLayoutContextState;
    const {
      sidebarNavigation: prevSidebarNavigation,
      sidebarContent: prevSidebarContent,
    } = prevInput;

    if (numUsersVideo !== prevNumUsersVideo
      || prevProps.layoutManagerLoaded !== layoutManagerLoaded
      || prevScreenIsShared !== screenIsShared
      || sidebarNavigation.isOpen !== prevSidebarNavigation.isOpen
      || sidebarContent.isOpen !== prevSidebarContent.isOpen) {
      setTimeout(() => this.setLayoutSizes(), 500);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setLayoutSizes(panelChanged = false, autoarrangeChanged = false, placementChanged = false) {
    const { layoutContextDispatch, layoutContextState } = this.props;
    const { autoArrangeLayout } = layoutContextState;

    if ((autoarrangeChanged && !autoArrangeLayout && !placementChanged) || !this._isMounted) return;

    const layoutSizes = this.calculatesLayout(panelChanged);

    layoutContextDispatch(
      {
        type: 'setWindowSize',
        value: {
          width: this.windowWidth(),
          height: this.windowHeight(),
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
        type: 'setSecondPanelSize',
        value: layoutSizes.secondPanelSize.width,
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
        width: this.windowWidth(),
        height: this.windowHeight(),
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
      secondPanelSize: {
        width: layoutSizes.secondPanelSize.width,
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

  windowWidth() {
    const { layoutManagerLoaded } = this.props;
    return (
      layoutManagerLoaded !== 'both'
        ? window.document.documentElement.clientWidth
        : window.document.documentElement.clientWidth * 0.5
    );
  }

  windowHeight() {
    const { layoutManagerLoaded } = this.props;
    return (
      layoutManagerLoaded !== 'both'
        ? window.document.documentElement.clientHeight
        : window.document.documentElement.clientHeight * 0.5
    );
  }

  defineWebcamPlacement(mediaAreaWidth, mediaAreaHeight, presentationWidth, presentationHeight) {
    const { layoutContextDispatch, layoutContextState } = this.props;
    const { autoArrangeLayout } = layoutContextState;
    const isScreenShare = isVideoBroadcasting();

    if (!autoArrangeLayout || !this._isMounted) return;

    if (isScreenShare) {
      layoutContextDispatch(
        {
          type: 'setWebcamsPlacement',
          value: 'top',
        },
      );
      Storage.setItem('webcamsPlacement', 'top');
      return;
    }

    if ((mediaAreaWidth - presentationWidth) > (mediaAreaHeight - presentationHeight)) {
      layoutContextDispatch(
        {
          type: 'setWebcamsPlacement',
          value: 'left',
        },
      );
      Storage.setItem('webcamsPlacement', 'left');
    } else {
      layoutContextDispatch(
        {
          type: 'setWebcamsPlacement',
          value: 'top',
        },
      );
      Storage.setItem('webcamsPlacement', 'top');
    }
  }

  calculatesPanelsSize(panelChanged) {
    const { layoutContextState } = this.props;
    const {
      userListSize: userListSizeContext,
      secondPanelSize,
    } = layoutContextState;
    const storageLData = storageLayoutData();

    let storageUserListWidth;
    let storageSecondPanelWidth;
    if (storageLData) {
      storageUserListWidth = storageLData?.userListSize?.width;
      storageSecondPanelWidth = storageLData?.secondPanelSize?.width;
    }

    let newUserListSize;
    let newPanelSize;

    if (panelChanged && userListSizeContext.width !== 0) {
      newUserListSize = userListSizeContext;
    } else if (!storageUserListWidth) {
      newUserListSize = {
        width: min(max((this.windowWidth() * 0.1), USERLIST_MIN_WIDTH), USERLIST_MAX_WIDTH),
      };
    } else {
      newUserListSize = {
        width: storageUserListWidth,
      };
    }

    if (panelChanged && secondPanelSize.width !== 0) {
      newPanelSize = {
        width: secondPanelSize.width,
      };
    } else if (!storageSecondPanelWidth) {
      newPanelSize = {
        width: min(max((this.windowWidth() * 0.2), CHAT_MIN_WIDTH), CHAT_MAX_WIDTH),
      };
    } else {
      newPanelSize = {
        width: storageSecondPanelWidth,
      };
    }

    return {
      newUserListSize,
      newPanelSize,
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
        presentationAreaHeight: mediaAreaHeight - 20,
      };
    }

    let presentationAreaWidth;
    let presentationAreaHeight;

    if (webcamsPlacement === 'left' || webcamsPlacement === 'right') {
      presentationAreaWidth = mediaAreaWidth - webcamAreaWidth - 20;
      presentationAreaHeight = mediaAreaHeight - 20;
    } else {
      presentationAreaWidth = mediaAreaWidth;
      presentationAreaHeight = mediaAreaHeight - webcamAreaHeight - 30;
    }

    return {
      presentationAreaWidth,
      presentationAreaHeight,
    };
  }

  calculatesLayout(panelChanged = false) {
    const {
      layoutContextState,
      newLayoutContextState,
    } = this.props;
    const { input } = newLayoutContextState;
    const { sidebarNavigation, sidebarContent } = input;
    const {
      presentationIsFullscreen,
      presentationSlideSize,
    } = layoutContextState;

    const {
      width: presentationSlideWidth,
      height: presentationSlideHeight,
    } = presentationSlideSize;

    const panelsSize = this.calculatesPanelsSize(panelChanged);

    const {
      newUserListSize,
      newPanelSize,
    } = panelsSize;

    const firstPanel = newUserListSize;
    let secondPanel = {
      width: 0,
    };
    if (newPanelSize.width > 0) {
      secondPanel = newPanelSize;
    }

    const isLargeFont = Session.get('isLargeFont');
    const realNavbarHeight = isLargeFont ? LARGE_NAVBAR_HEIGHT : NAVBAR_HEIGHT;

    const mediaAreaHeight = this.windowHeight() - (realNavbarHeight + ACTIONSBAR_HEIGHT) - 10;
    const mediaAreaWidth = this.windowWidth() - (
      (sidebarNavigation.isOpen ? firstPanel.width : 0)
      + (sidebarContent.isOpen ? secondPanel.width : 0)
    );

    const newMediaBounds = {
      width: mediaAreaWidth,
      height: mediaAreaHeight,
      top: realNavbarHeight,
      left: firstPanel.width + secondPanel.width,
    };

    const {
      presentationWidth,
      presentationHeight,
    } = LayoutManagerComponent.calculatesPresentationSize(
      mediaAreaWidth, mediaAreaHeight, presentationSlideWidth, presentationSlideHeight,
    );

    this.defineWebcamPlacement(
      mediaAreaWidth, mediaAreaHeight, presentationWidth, presentationHeight,
    );

    const { webcamsAreaWidth, webcamsAreaHeight } = this.calculatesWebcamsAreaSize(
      mediaAreaWidth, mediaAreaHeight, presentationWidth, presentationHeight,
    );

    const newWebcamsAreaSize = {
      width: webcamsAreaWidth,
      height: webcamsAreaHeight,
    };
    let newPresentationAreaSize;
    let newScreenShareAreaSize;
    const { presentationAreaWidth, presentationAreaHeight } = this.calculatesPresentationAreaSize(
      mediaAreaWidth, mediaAreaHeight, webcamsAreaWidth, webcamsAreaHeight,
    );
    if (!presentationIsFullscreen) {
      newPresentationAreaSize = {
        width: presentationAreaWidth || 0,
        height: presentationAreaHeight || 0,
      };
    } else {
      newPresentationAreaSize = {
        width: this.windowWidth(),
        height: this.windowHeight(),
      };
    }

    newScreenShareAreaSize = {
      width: presentationAreaWidth || 0,
      height: presentationAreaHeight || 0,
    };

    return {
      mediaBounds: newMediaBounds,
      userListSize: newUserListSize,
      secondPanelSize: newPanelSize,
      webcamsAreaSize: newWebcamsAreaSize,
      presentationAreaSize: newPresentationAreaSize,
      screenShareAreaSize: newScreenShareAreaSize,
    };
  }

  render() {
    return <></>;
  }
}

export default withLayoutConsumer(NewLayoutManager.withConsumer(LayoutManagerComponent));
export {
  USERLIST_MIN_WIDTH,
  USERLIST_MAX_WIDTH,
  CHAT_MIN_WIDTH,
  CHAT_MAX_WIDTH,
  NAVBAR_HEIGHT,
  LARGE_NAVBAR_HEIGHT,
  ACTIONSBAR_HEIGHT,
  WEBCAMSAREA_MIN_PERCENT,
  WEBCAMSAREA_MAX_PERCENT,
  PRESENTATIONAREA_MIN_WIDTH,
  BREAKOUT_MIN_WIDTH,
  BREAKOUT_MAX_WIDTH,
};
