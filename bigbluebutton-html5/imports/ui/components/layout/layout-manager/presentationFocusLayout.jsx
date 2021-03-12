// import React, { Component, Fragment } from 'react';
// import LayoutContext from '../context/context';
// import DEFAULT_VALUES from '../defaultValues';
// import _ from 'lodash';
// import { INITIAL_INPUT_STATE } from '../context/initState';
// import { DEVICE_TYPE, ACTIONS } from '../enums';
// import slides from '../../presentation/slides-mock';

// const windowWidth = () => window.document.documentElement.clientWidth;
// const windowHeight = () => window.document.documentElement.clientHeight;
// const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
// const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

// class PresentationFocusLayout extends Component {
//   constructor(props) {
//     super(props);

//     this.throttledCalculatesLayout = _.throttle(() => this.calculatesLayout(),
//       50, { 'trailing': true, 'leading': true });
//   }

//   shouldComponentUpdate(nextProps) {
//     return this.props.contextState.input !== nextProps.contextState.input
//       || this.props.contextState.deviceType !== nextProps.contextState.deviceType;
//   }

//   componentDidMount() {
//     this.init();
//     const { contextDispatch } = this.props;
//     window.addEventListener('resize', () => {
//       contextDispatch({
//         type: ACTIONS.SET_BROWSER_SIZE,
//         value: {
//           width: window.document.documentElement.clientWidth,
//           height: window.document.documentElement.clientHeight,
//         }
//       });
//     });
//     contextDispatch({
//       type: ACTIONS.SET_PRESENTATION_SLIDES_LENGTH,
//       value: slides.length,
//     });
//   }

//   componentDidUpdate(prevProps) {
//     const { contextState } = this.props;
//     const { deviceType } = contextState;
//     if (prevProps.contextState.deviceType !== deviceType) {
//       this.init();
//     } else {
//       this.throttledCalculatesLayout();
//     }
//   }

//   init() {
//     const { contextState, contextDispatch } = this.props;
//     const { input } = contextState;
//     const { deviceType } = contextState;
//     if (deviceType === DEVICE_TYPE.MOBILE) {
//       contextDispatch({
//         type: ACTIONS.SET_LAYOUT_INPUT,
//         value: _.defaultsDeep({
//           sidebarNavigation: {
//             isOpen: false,
//           },
//           sidebarContent: {
//             isOpen: false,
//           },
//           SidebarContentHorizontalResizer: {
//             isOpen: false,
//           },
//           presentation: {
//             slidesLength: input.presentation.slidesLength,
//             currentSlide: {
//               ...input.presentation.currentSlide,
//             }
//           }
//         }, INITIAL_INPUT_STATE),
//       })
//     }
//     if (deviceType !== DEVICE_TYPE.MOBILE) {
//       contextDispatch({
//         type: ACTIONS.SET_LAYOUT_INPUT,
//         value: _.defaultsDeep({
//           sidebarNavigation: {
//             isOpen: true,
//           },
//           sidebarContent: {
//             isOpen: deviceType === DEVICE_TYPE.TABLET_LANDSCAPE || deviceType === DEVICE_TYPE.DESKTOP ? true : false,
//           },
//           SidebarContentHorizontalResizer: {
//             isOpen: false,
//           },
//           presentation: {
//             slidesLength: input.presentation.slidesLength,
//             currentSlide: {
//               ...input.presentation.currentSlide,
//             }
//           }
//         }, INITIAL_INPUT_STATE),
//       })
//     }
//     this.throttledCalculatesLayout();
//   }

//   reset() {
//     this.init();
//   }

//   calculatesNavbarBounds(mediaAreaBounds) {
//     return {
//       width: windowWidth() - mediaAreaBounds.left,
//       height: DEFAULT_VALUES.navBarHeight,
//       top: DEFAULT_VALUES.navBarTop,
//       left: mediaAreaBounds.left,
//       zIndex: 1,
//     }
//   }

//   calculatesActionbarBounds(mediaAreaBounds) {
//     const { contextState } = this.props;
//     const { input } = contextState;
//     return {
//       display: input.actionBar.hasActionBar,
//       width: windowWidth() - mediaAreaBounds.left,
//       height: DEFAULT_VALUES.actionBarHeight,
//       top: windowHeight() - DEFAULT_VALUES.actionBarHeight,
//       left: mediaAreaBounds.left,
//       zIndex: 1,
//     }
//   }

//   calculatesSidebarNavWidth() {
//     const { contextState } = this.props;
//     const { deviceType, input } = contextState;
//     const {
//       sidebarNavMinWidth,
//       sidebarNavMaxWidth,
//     } = DEFAULT_VALUES;
//     let minWidth = 0;
//     let width = 0;
//     let maxWidth = 0;
//     if (input.sidebarNavigation.isOpen) {
//       if (deviceType === DEVICE_TYPE.MOBILE) {
//         minWidth = windowWidth();
//         width = windowWidth();
//         maxWidth = windowWidth();
//       } else {
//         if (input.sidebarNavigation.width === 0) {
//           width = min(max((windowWidth() * 0.2), sidebarNavMinWidth), sidebarNavMaxWidth);
//         } else {
//           width = min(max(input.sidebarNavigation.width, sidebarNavMinWidth), sidebarNavMaxWidth);
//         }
//         minWidth = sidebarNavMinWidth;
//         maxWidth = sidebarNavMaxWidth;
//       }
//     }
//     return {
//       minWidth,
//       width,
//       maxWidth,
//     };
//   }

//   calculatesSidebarNavHeight() {
//     const { contextState } = this.props;
//     const { input } = contextState;
//     let sidebarNavHeight = 0;
//     if (input.sidebarNavigation.isOpen) {
//       sidebarNavHeight = windowHeight();
//     }
//     return sidebarNavHeight;
//   }

//   calculatesSidebarNavBounds() {
//     const { contextState } = this.props;
//     const { deviceType } = contextState;
//     return {
//       top: DEFAULT_VALUES.sidebarNavTop,
//       left: DEFAULT_VALUES.sidebarNavLeft,
//       zIndex: deviceType === DEVICE_TYPE.MOBILE ? 10 : 2,
//     }
//   }

//   calculatesSidebarContentWidth() {
//     const { contextState } = this.props;
//     const { deviceType, input } = contextState;
//     const {
//       sidebarContentMinWidth,
//       sidebarContentMaxWidth,
//     } = DEFAULT_VALUES;
//     let minWidth = 0;
//     let width = 0;
//     let maxWidth = 0;
//     if (input.sidebarContent.isOpen) {
//       if (deviceType === DEVICE_TYPE.MOBILE) {
//         minWidth = windowWidth();
//         width = windowWidth();
//         maxWidth = windowWidth();
//       } else {
//         if (input.sidebarContent.width === 0) {
//           width = min(max((windowWidth() * 0.2), sidebarContentMinWidth), sidebarContentMaxWidth);
//         } else {
//           width = min(max(input.sidebarContent.width, sidebarContentMinWidth), sidebarContentMaxWidth);
//         }
//         minWidth = sidebarContentMinWidth;
//         maxWidth = sidebarContentMaxWidth;
//       }
//     }
//     return {
//       minWidth,
//       width,
//       maxWidth,
//     };
//   }

//   calculatesSidebarContentHeight(cameraDockHeight) {
//     const { contextState } = this.props;
//     const { deviceType, input } = contextState;
//     let sidebarContentHeight = 0;
//     if (input.sidebarContent.isOpen) {
//       if (deviceType === DEVICE_TYPE.MOBILE || input.cameraDock.numCameras < 1) {
//         sidebarContentHeight = windowHeight();
//       } else {
//         sidebarContentHeight = windowHeight() - cameraDockHeight;
//       }
//     } else {
//       sidebarContentHeight = 0;
//     }
//     return sidebarContentHeight;
//   }

//   calculatesSidebarContentBounds(sidebarNavWidth) {
//     const { contextState } = this.props;
//     const { deviceType } = contextState;
//     return {
//       top: 0,
//       left: deviceType === DEVICE_TYPE.MOBILE || deviceType === DEVICE_TYPE.TABLET_PORTRAIT ? 0 : sidebarNavWidth,
//       zIndex: deviceType === DEVICE_TYPE.MOBILE ? 11 : 2,
//     }
//   }

//   calculatesMediaAreaBounds(sidebarNavWidth, sidebarContentWidth) {
//     const { contextState } = this.props;
//     const { deviceType, input } = contextState;
//     const { sidebarContent } = input;
//     let left = 0;
//     let width = 0;
//     if (deviceType === DEVICE_TYPE.MOBILE) {
//       left = 0;
//       width = windowWidth();
//     } else if (deviceType === DEVICE_TYPE.TABLET_PORTRAIT) {
//       if (sidebarContent.isOpen) {
//         left = sidebarContentWidth;
//         width = windowWidth() - sidebarContentWidth;
//       } else {
//         left = sidebarNavWidth;
//         width = windowWidth() - sidebarNavWidth;
//       }
//     } else {
//       left = sidebarNavWidth + sidebarContentWidth;
//       width = windowWidth() - sidebarNavWidth - sidebarContentWidth;
//     }

//     return {
//       width,
//       height: windowHeight() - (DEFAULT_VALUES.navBarHeight + DEFAULT_VALUES.actionBarHeight),
//       top: DEFAULT_VALUES.navBarHeight,
//       left,
//     }
//   }

//   calculatesCameraDockBounds(presentationBounds, mediaAreaBounds, sidebarNavWidth, sidebarContentWidth) {
//     const { contextState } = this.props;
//     const { deviceType, input } = contextState;
//     let cameraDockBounds = {};

//     if (input.cameraDock.isFullscreen) {
//       cameraDockBounds.width = windowWidth();
//       cameraDockBounds.minWidth = windowWidth();
//       cameraDockBounds.maxWidth = windowWidth();
//       cameraDockBounds.height = windowHeight();
//       cameraDockBounds.minHeight = windowHeight();
//       cameraDockBounds.maxHeight = windowHeight();
//       cameraDockBounds.top = 0;
//       cameraDockBounds.left = 0;
//       cameraDockBounds.zIndex = 99;
//       return cameraDockBounds;
//     }

//     if (input.cameraDock.numCameras > 0) {
//       let cameraDockHeight = 0;
//       if (deviceType === DEVICE_TYPE.MOBILE) {
//         cameraDockBounds.top = mediaAreaBounds.top + presentationBounds.height;
//         cameraDockBounds.left = mediaAreaBounds.left;
//         cameraDockBounds.minWidth = mediaAreaBounds.width;
//         cameraDockBounds.width = mediaAreaBounds.width;
//         cameraDockBounds.maxWidth = mediaAreaBounds.width;
//         cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
//         cameraDockBounds.height = mediaAreaBounds.height - presentationBounds.height;
//         cameraDockBounds.maxHeight = mediaAreaBounds.height - presentationBounds.height;
//       } else {
//         if (input.cameraDock.height === 0) {
//           cameraDockHeight = min(max((windowHeight() * 0.2), DEFAULT_VALUES.cameraDockMinHeight), (windowHeight() - DEFAULT_VALUES.cameraDockMinHeight));
//         } else {
//           cameraDockHeight = min(max(input.cameraDock.height, DEFAULT_VALUES.cameraDockMinHeight), (windowHeight() - DEFAULT_VALUES.cameraDockMinHeight));
//         }
//         cameraDockBounds.top = windowHeight() - cameraDockHeight;
//         cameraDockBounds.left = sidebarNavWidth;
//         cameraDockBounds.minWidth = sidebarContentWidth;
//         cameraDockBounds.width = sidebarContentWidth;
//         cameraDockBounds.maxWidth = sidebarContentWidth;
//         cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
//         cameraDockBounds.height = cameraDockHeight;
//         cameraDockBounds.maxHeight = windowHeight() * 0.8;
//         cameraDockBounds.zIndex = 1;
//       }
//     } else {
//       cameraDockBounds.width = 0;
//       cameraDockBounds.height = 0;
//     }
//     return cameraDockBounds;
//   }

//   calculatesPresentationBounds(mediaAreaBounds) {
//     const { contextState } = this.props;
//     const { deviceType, input } = contextState;
//     let presentationBounds = {};

//     if (input.presentation.isFullscreen) {
//       presentationBounds.width = windowWidth();
//       presentationBounds.height = windowHeight();
//       presentationBounds.top = 0;
//       presentationBounds.left = 0;
//       presentationBounds.zIndex = 99;
//       return presentationBounds;
//     }

//     if (deviceType === DEVICE_TYPE.MOBILE && input.cameraDock.numCameras > 0) {
//       presentationBounds.height = mediaAreaBounds.height * 0.7;
//     } else {
//       presentationBounds.height = mediaAreaBounds.height;
//     }
//     presentationBounds.width = mediaAreaBounds.width;
//     presentationBounds.top = DEFAULT_VALUES.navBarHeight;
//     presentationBounds.left = mediaAreaBounds.left;
//     presentationBounds.zIndex = 1;

//     return presentationBounds;
//   }

//   calculatesLayout() {
//     const { contextState, contextDispatch } = this.props;
//     const { deviceType, input } = contextState;

//     const sidebarNavWidth = this.calculatesSidebarNavWidth();
//     const sidebarNavHeight = this.calculatesSidebarNavHeight();
//     const sidebarContentWidth = this.calculatesSidebarContentWidth();
//     const sidebarNavBounds = this.calculatesSidebarNavBounds(sidebarNavWidth.width, sidebarContentWidth.width);
//     const sidebarContentBounds = this.calculatesSidebarContentBounds(sidebarNavWidth.width, sidebarContentWidth.width);
//     const mediaAreaBounds = this.calculatesMediaAreaBounds(sidebarNavWidth.width, sidebarContentWidth.width);
//     const navbarBounds = this.calculatesNavbarBounds(mediaAreaBounds);
//     const actionbarBounds = this.calculatesActionbarBounds(mediaAreaBounds);
//     const presentationBounds = this.calculatesPresentationBounds(mediaAreaBounds);
//     const cameraDockBounds = this.calculatesCameraDockBounds(presentationBounds, mediaAreaBounds, sidebarNavWidth.width, sidebarContentWidth.width);
//     const sidebarContentHeight = this.calculatesSidebarContentHeight(cameraDockBounds.height);

//     contextDispatch({
//       type: ACTIONS.SET_NAVBAR_OUTPUT,
//       value: {
//         display: input.navBar.hasNavBar,
//         width: navbarBounds.width,
//         height: navbarBounds.height,
//         top: navbarBounds.top,
//         left: navbarBounds.left,
//         tabOrder: DEFAULT_VALUES.navBarTabOrder,
//         zIndex: navbarBounds.zIndex,
//       }
//     });

//     contextDispatch({
//       type: ACTIONS.SET_ACTIONBAR_OUTPUT,
//       value: {
//         display: input.actionBar.hasActionBar,
//         width: actionbarBounds.width,
//         height: actionbarBounds.height,
//         top: actionbarBounds.top,
//         left: actionbarBounds.left,
//         tabOrder: DEFAULT_VALUES.actionBarTabOrder,
//         zIndex: actionbarBounds.zIndex,
//       }
//     });

//     contextDispatch({
//       type: ACTIONS.SET_SIDEBAR_NAVIGATION_OUTPUT,
//       value: {
//         display: input.sidebarNavigation.isOpen,
//         minWidth: sidebarNavWidth.minWidth,
//         width: sidebarNavWidth.width,
//         maxWidth: sidebarNavWidth.maxWidth,
//         height: sidebarNavHeight,
//         top: sidebarNavBounds.top,
//         left: sidebarNavBounds.left,
//         tabOrder: DEFAULT_VALUES.sidebarNavTabOrder,
//         isResizable: deviceType === DEVICE_TYPE.MOBILE
//           || deviceType === DEVICE_TYPE.TABLET ? false : true,
//         zIndex: sidebarNavBounds.zIndex,
//       }
//     });

//     contextDispatch({
//       type: ACTIONS.SET_SIDEBAR_NAVIGATION_RESIZABLE_EDGE,
//       value: {
//         top: false,
//         right: true,
//         bottom: false,
//         left: false,
//       },
//     });

//     contextDispatch({
//       type: ACTIONS.SET_SIDEBAR_CONTENT_OUTPUT,
//       value: {
//         display: input.sidebarContent.isOpen,
//         minWidth: sidebarContentWidth.minWidth,
//         width: sidebarContentWidth.width,
//         maxWidth: sidebarContentWidth.maxWidth,
//         height: sidebarContentHeight,
//         top: sidebarContentBounds.top,
//         left: sidebarContentBounds.left,
//         currentPanelType: input.currentPanelType,
//         tabOrder: DEFAULT_VALUES.sidebarContentTabOrder,
//         isResizable: deviceType === DEVICE_TYPE.MOBILE
//           || deviceType === DEVICE_TYPE.TABLET ? false : true,
//         zIndex: sidebarContentBounds.zIndex,
//       },
//     });

//     contextDispatch({
//       type: ACTIONS.SET_SIDEBAR_CONTENT_RESIZABLE_EDGE,
//       value: {
//         top: false,
//         right: true,
//         bottom: false,
//         left: false,
//       },
//     });

//     contextDispatch({
//       type: ACTIONS.SET_MEDIA_AREA_SIZE,
//       value: {
//         width: mediaAreaBounds.width,
//         height: mediaAreaBounds.height,
//       }
//     });

//     contextDispatch({
//       type: ACTIONS.SET_CAMERA_DOCK_OUTPUT,
//       value: {
//         display: input.cameraDock.numCameras > 0,
//         minWidth: cameraDockBounds.minWidth,
//         width: cameraDockBounds.width,
//         maxWidth: cameraDockBounds.maxWidth,
//         minHeight: cameraDockBounds.minHeight,
//         height: cameraDockBounds.height,
//         maxHeight: cameraDockBounds.maxHeight,
//         top: cameraDockBounds.top,
//         left: cameraDockBounds.left,
//         tabOrder: 4,
//         isDraggable: false,
//         isResizable: deviceType === DEVICE_TYPE.MOBILE
//           || deviceType === DEVICE_TYPE.TABLET ? false : true,
//         zIndex: cameraDockBounds.zIndex,
//       }
//     });

//     contextDispatch({
//       type: ACTIONS.SET_CAMERA_DOCK_RESIZABLE_EDGE,
//       value: {
//         top: true,
//         right: false,
//         bottom: false,
//         left: false,
//       },
//     });

//     contextDispatch({
//       type: ACTIONS.SET_PRESENTATION_OUTPUT,
//       value: {
//         display: input.presentation.isOpen,
//         width: presentationBounds.width,
//         height: presentationBounds.height,
//         top: presentationBounds.top,
//         left: presentationBounds.left,
//         tabOrder: DEFAULT_VALUES.presentationTabOrder,
//         isResizable: false,
//         zIndex: presentationBounds.zIndex,
//       }
//     });
//   }

//   render() {
//     return (
//       <Fragment />
//     );
//   }
// }

// export default LayoutContext.withConsumer(PresentationFocusLayout);
