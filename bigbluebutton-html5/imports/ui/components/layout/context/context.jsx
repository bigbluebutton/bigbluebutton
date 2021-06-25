import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import { ACTIONS } from '../enums';
import DEFAULT_VALUES from '../defaultValues';
import { INITIAL_INPUT_STATE, INITIAL_OUTPUT_STATE } from './initState';

// variable to debug in console log
const debug = false;

const debugActions = (action, value) => {
  const baseStyles = [
    'color: #fff',
    'background-color: #d64541',
    'padding: 2px 4px',
    'border-radius: 2px',
  ].join(';');
  return debug && console.log(`%c${action}`, baseStyles, value);
};

const providerPropTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export const NLayoutContext = createContext();

const initState = {
  deviceType: null,
  layoutType: DEFAULT_VALUES.layoutType,
  layoutLoaded: 'legacy',
  fontSize: DEFAULT_VALUES.fontSize,
  idChatOpen: DEFAULT_VALUES.idChatOpen,
  input: INITIAL_INPUT_STATE,
  output: INITIAL_OUTPUT_STATE,
};

const reducer = (state, action) => {
  debugActions(action.type, action.value);
  switch (action.type) {
    case ACTIONS.SET_LAYOUT_INPUT: {
      if (state.input === action.value) return state;
      return {
        ...state,
        input: action.value,
      };
    }

    case ACTIONS.SET_AUTO_ARRANGE_LAYOUT: {
      const { autoarrAngeLayout } = state.input;
      if (autoarrAngeLayout === action.value) return state;
      return {
        ...state,
        input: {
          ...state.input,
          autoarrAngeLayout: action.value,
        },
      };
    }

    // LAYOUT TYPE
    // using to load a diferent layout manager
    case ACTIONS.SET_LAYOUT_TYPE: {
      const { layoutType } = state.input;
      if (layoutType === action.value) return state;
      return {
        ...state,
        layoutType: action.value,
      };
    }

    // LAYOUT TYPE LOADED
    // only while the new layout manager is being developed
    case ACTIONS.SET_LAYOUT_LOADED: {
      const { layoutLoaded } = state;
      if (layoutLoaded === action.value) return state;
      return {
        ...state,
        layoutLoaded: action.value,
      };
    }

    // FONT SIZE
    case ACTIONS.SET_FONT_SIZE: {
      const { fontSize } = state;
      if (fontSize === action.value) return state;
      return {
        ...state,
        fontSize: action.value,
      };
    }

    // ID CHAT open in sidebar content panel
    case ACTIONS.SET_ID_CHAT_OPEN: {
      if (state.idChatOpen === action.value) return state;
      return {
        ...state,
        idChatOpen: action.value,
      };
    }

    // DEVICE
    case ACTIONS.SET_DEVICE_TYPE: {
      const { deviceType } = state;
      if (deviceType === action.value) return state;
      return {
        ...state,
        deviceType: action.value,
      };
    }

    // BROWSER
    case ACTIONS.SET_BROWSER_SIZE: {
      const { width, height } = action.value;
      const { browser } = state.input;
      if (browser.width === width
        && browser.height === height) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          browser: {
            width,
            height,
          },
        },
      };
    }

    // NAV BAR
    case ACTIONS.SET_NAVBAR_OUTPUT: {
      const {
        display, width, height, top, left, tabOrder, zIndex,
      } = action.value;
      const { navBar } = state.output;
      if (navBar.display === display
        && navBar.width === width
        && navBar.height === height
        && navBar.top === top
        && navBar.left === left
        && navBar.zIndex === zIndex
        && navBar.tabOrder === tabOrder) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          navBar: {
            ...navBar,
            display,
            width,
            height,
            top,
            left,
            tabOrder,
            zIndex,
          },
        },
      };
    }

    // ACTION BAR
    case ACTIONS.SET_ACTIONBAR_OUTPUT: {
      const {
        display, width, height, top, left, tabOrder, zIndex,
      } = action.value;
      const { actionBar } = state.output;
      if (actionBar.display === display
        && actionBar.width === width
        && actionBar.height === height
        && actionBar.top === top
        && actionBar.left === left
        && actionBar.zIndex === zIndex
        && actionBar.tabOrder === tabOrder) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          actionBar: {
            ...actionBar,
            display,
            width,
            height,
            top,
            left,
            tabOrder,
            zIndex,
          },
        },
      };
    }

    // SIDEBAR NAVIGATION
    case ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN: {
      const { sidebarNavigation } = state.input;
      if (sidebarNavigation.isOpen === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          sidebarNavigation: {
            ...sidebarNavigation,
            isOpen: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_SIDEBAR_NAVIGATION_PANEL: {
      const { sidebarNavigation } = state.input;
      if (sidebarNavigation.sidebarNavPanel === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          sidebarNavigation: {
            ...sidebarNavigation,
            sidebarNavPanel: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_SIDEBAR_NAVIGATION_SIZE: {
      const { width, browserWidth } = action.value;
      const { sidebarNavigation } = state.input;
      if (sidebarNavigation.width === width
        && sidebarNavigation.browserWidth === browserWidth) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          sidebarNavigation: {
            ...sidebarNavigation,
            width,
            browserWidth,
          },
        },
      };
    }
    case ACTIONS.SET_SIDEBAR_NAVIGATION_OUTPUT: {
      const {
        display,
        minWidth,
        width,
        maxWidth,
        minHeight,
        height,
        maxHeight,
        top,
        left,
        tabOrder,
        isResizable,
        zIndex,
      } = action.value;
      const { sidebarNavigation } = state.output;
      if (sidebarNavigation.display === display
        && sidebarNavigation.minWidth === width
        && sidebarNavigation.maxWidth === width
        && sidebarNavigation.width === width
        && sidebarNavigation.minHeight === height
        && sidebarNavigation.height === height
        && sidebarNavigation.maxHeight === height
        && sidebarNavigation.top === top
        && sidebarNavigation.left === left
        && sidebarNavigation.tabOrder === tabOrder
        && sidebarNavigation.zIndex === zIndex
        && sidebarNavigation.isResizable === isResizable) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          sidebarNavigation: {
            ...sidebarNavigation,
            display,
            minWidth,
            width,
            maxWidth,
            minHeight,
            height,
            maxHeight,
            top,
            left,
            tabOrder,
            isResizable,
            zIndex,
          },
        },
      };
    }
    case ACTIONS.SET_SIDEBAR_NAVIGATION_RESIZABLE_EDGE: {
      const {
        top, right, bottom, left,
      } = action.value;
      const { sidebarNavigation } = state.output;
      if (sidebarNavigation.resizableEdge.top === top
        && sidebarNavigation.resizableEdge.right === right
        && sidebarNavigation.resizableEdge.bottom === bottom
        && sidebarNavigation.resizableEdge.left === left) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          sidebarNavigation: {
            ...sidebarNavigation,
            resizableEdge: {
              top,
              right,
              bottom,
              left,
            },
          },
        },
      };
    }

    // SIDEBAR CONTENT
    case ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN: {
      const { sidebarContent } = state.input;
      if (sidebarContent.isOpen === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          sidebarContent: {
            ...sidebarContent,
            isOpen: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_SIDEBAR_CONTENT_PANEL: {
      const { sidebarContent } = state.input;
      if (sidebarContent.sidebarContentPanel === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          sidebarContent: {
            ...sidebarContent,
            sidebarContentPanel: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_SIDEBAR_CONTENT_SIZE: {
      const { width, browserWidth } = action.value;
      const { sidebarContent } = state.input;
      if (sidebarContent.width === width
        && sidebarContent.browserWidth === browserWidth) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          sidebarContent: {
            ...sidebarContent,
            width,
            browserWidth,
          },
        },
      };
    }
    case ACTIONS.SET_SIDEBAR_CONTENT_OUTPUT: {
      const {
        display,
        minWidth,
        width,
        maxWidth,
        minHeight,
        height,
        maxHeight,
        top,
        left,
        currentPanelType,
        tabOrder,
        isResizable,
        zIndex,
      } = action.value;
      const { sidebarContent } = state.output;
      if (sidebarContent.display === display
        && sidebarContent.minWidth === minWidth
        && sidebarContent.width === width
        && sidebarContent.maxWidth === maxWidth
        && sidebarContent.minHeight === minHeight
        && sidebarContent.height === height
        && sidebarContent.maxHeight === maxHeight
        && sidebarContent.top === top
        && sidebarContent.left === left
        && sidebarContent.tabOrder === tabOrder
        && sidebarContent.zIndex === zIndex
        && sidebarContent.isResizable === isResizable) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          sidebarContent: {
            ...sidebarContent,
            display,
            minWidth,
            width,
            maxWidth,
            minHeight,
            height,
            maxHeight,
            top,
            left,
            currentPanelType,
            tabOrder,
            isResizable,
            zIndex,
          },
        },
      };
    }
    case ACTIONS.SET_SIDEBAR_CONTENT_RESIZABLE_EDGE: {
      const {
        top, right, bottom, left,
      } = action.value;
      const { sidebarContent } = state.output;
      if (sidebarContent.resizableEdge.top === top
        && sidebarContent.resizableEdge.right === right
        && sidebarContent.resizableEdge.bottom === bottom
        && sidebarContent.resizableEdge.left === left) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          sidebarContent: {
            ...sidebarContent,
            resizableEdge: {
              top,
              right,
              bottom,
              left,
            },
          },
        },
      };
    }

    // MEDIA
    case ACTIONS.SET_MEDIA_AREA_SIZE: {
      const { width, height } = action.value;
      const { mediaArea } = state.output;
      if (mediaArea.width === width
        && mediaArea.height === height) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          mediaArea: {
            ...mediaArea,
            width,
            height,
          },
        },
      };
    }

    // WEBCAMS
    case ACTIONS.SET_NUM_CAMERAS: {
      const { cameraDock } = state.input;
      if (cameraDock.numCameras === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          cameraDock: {
            ...cameraDock,
            numCameras: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_CAMERA_DOCK_IS_DRAGGING: {
      const { cameraDock } = state.input;
      if (cameraDock.isDragging === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          cameraDock: {
            ...cameraDock,
            isDragging: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_CAMERA_DOCK_POSITION: {
      const { cameraDock } = state.input;
      if (cameraDock.position === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          cameraDock: {
            ...cameraDock,
            position: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_CAMERA_DOCK_SIZE: {
      const {
        width, height, browserWidth, browserHeight,
      } = action.value;
      const { cameraDock } = state.input;
      if (cameraDock.width === width
        && cameraDock.height === height
        && cameraDock.browserWidth === browserWidth
        && cameraDock.browserHeight === browserHeight) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          cameraDock: {
            ...cameraDock,
            width,
            height,
            browserWidth,
            browserHeight,
          },
        },
      };
    }
    case ACTIONS.SET_CAMERA_DOCK_OUTPUT: {
      const {
        display,
        minWidth,
        width,
        maxWidth,
        minHeight,
        height,
        maxHeight,
        top,
        left,
        tabOrder,
        isDraggable,
        isResizable,
        zIndex,
      } = action.value;
      const { cameraDock } = state.output;
      if (cameraDock.display === display
        && cameraDock.width === width
        && cameraDock.height === height
        && cameraDock.maxHeight === maxHeight
        && cameraDock.top === top
        && cameraDock.left === left
        && cameraDock.tabOrder === tabOrder
        && cameraDock.isDraggable === isDraggable
        && cameraDock.zIndex === zIndex
        && cameraDock.isResizable === isResizable) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          cameraDock: {
            ...cameraDock,
            display,
            minWidth,
            width,
            maxWidth,
            minHeight,
            height,
            maxHeight,
            top,
            left,
            tabOrder,
            isDraggable,
            isResizable,
            zIndex,
          },
        },
      };
    }
    case ACTIONS.SET_CAMERA_DOCK_IS_DRAGGABLE: {
      const { cameraDock } = state.output;
      if (cameraDock.isDraggable === action.value) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          cameraDock: {
            ...cameraDock,
            isDraggable: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_CAMERA_DOCK_IS_FULLSCREEN: {
      const { cameraDock } = state.input;
      if (cameraDock.isFullscreen === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          cameraDock: {
            ...cameraDock,
            isFullscreen: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_CAMERA_DOCK_RESIZABLE_EDGE: {
      const {
        top, right, bottom, left,
      } = action.value;
      const { cameraDock } = state.output;
      if (cameraDock.resizableEdge.top === top
        && cameraDock.resizableEdge.right === right
        && cameraDock.resizableEdge.bottom === bottom
        && cameraDock.resizableEdge.left === left) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          cameraDock: {
            ...cameraDock,
            resizableEdge: {
              top,
              right,
              bottom,
              left,
            },
          },
        },
      };
    }

    // WEBCAMS DROP AREAS
    case ACTIONS.SET_DROP_AREAS: {
      const { dropZoneAreas } = state.output;
      if (dropZoneAreas === action.value) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          dropZoneAreas: action.value,
        },
      };
    }

    // PRESENTATION
    case ACTIONS.SET_PRESENTATION_IS_OPEN: {
      const { presentation } = state.input;
      if (presentation.isOpen === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          presentation: {
            ...presentation,
            isOpen: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_PRESENTATION_IS_FULLSCREEN: {
      const { presentation } = state.input;
      if (presentation.isFullscreen === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          presentation: {
            ...presentation,
            isFullscreen: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_PRESENTATION_SLIDES_LENGTH: {
      const { presentation } = state.input;
      if (presentation.slidesLength === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          presentation: {
            ...presentation,
            slidesLength: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_PRESENTATION_NUM_CURRENT_SLIDE: {
      const { presentation } = state.input;
      if (presentation.currentSlide.num === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          presentation: {
            ...presentation,
            currentSlide: {
              ...presentation.currentSlide,
              num: action.value,
            },
          },
        },
      };
    }
    case ACTIONS.SET_PRESENTATION_CURRENT_SLIDE_SIZE: {
      const { width, height } = action.value;
      const { presentation } = state.input;
      const { currentSlide } = presentation;
      if (currentSlide.size.width === width
        && currentSlide.size.height === height) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          presentation: {
            ...presentation,
            currentSlide: {
              ...currentSlide,
              size: {
                width,
                height,
              },
            },
          },
        },
      };
    }
    case ACTIONS.SET_PRESENTATION_RESIZABLE_EDGE: {
      const {
        top, right, bottom, left,
      } = action.value;
      const { presentation } = state.output;
      const { resizableEdge } = presentation;
      if (resizableEdge.top === top
        && resizableEdge.right === right
        && resizableEdge.bottom === bottom
        && resizableEdge.left === left) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          presentation: {
            ...presentation,
            resizableEdge: {
              top,
              right,
              bottom,
              left,
            },
          },
        },
      };
    }
    case ACTIONS.SET_PRESENTATION_SIZE: {
      const {
        width, height, browserWidth, browserHeight,
      } = action.value;
      const { presentation } = state.input;
      if (presentation.width === width
        && presentation.height === height
        && presentation.browserWidth === browserWidth
        && presentation.browserHeight === browserHeight) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          presentation: {
            ...presentation,
            width,
            height,
            browserWidth,
            browserHeight,
          },
        },
      };
    }
    case ACTIONS.SET_PRESENTATION_OUTPUT: {
      const {
        display,
        minWidth,
        width,
        maxWidth,
        minHeight,
        height,
        maxHeight,
        top,
        left,
        tabOrder,
        isResizable,
        zIndex,
      } = action.value;
      const { presentation } = state.output;
      if (presentation.display === display
        && presentation.minWidth === minWidth
        && presentation.width === width
        && presentation.maxWidth === maxWidth
        && presentation.minHeight === minHeight
        && presentation.height === height
        && presentation.maxHeight === maxHeight
        && presentation.top === top
        && presentation.left === left
        && presentation.tabOrder === tabOrder
        && presentation.zIndex === zIndex
        && presentation.isResizable === isResizable) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          presentation: {
            ...presentation,
            display,
            minWidth,
            width,
            maxWidth,
            minHeight,
            height,
            maxHeight,
            top,
            left,
            tabOrder,
            isResizable,
            zIndex,
          },
        },
      };
    }

    // SCREEN SHARE
    case ACTIONS.SET_HAS_SCREEN_SHARE: {
      const { screenShare } = state.input;
      if (screenShare.hasScreenShare === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          screenShare: {
            ...screenShare,
            hasScreenShare: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_SCREEN_SHARE_SIZE: {
      const {
        width, height, browserWidth, browserHeight,
      } = action.value;
      const { screenShare } = state.input;
      if (screenShare.width === width
        && screenShare.height === height
        && screenShare.browserWidth === browserWidth
        && screenShare.browserHeight === browserHeight) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          screenShare: {
            ...screenShare,
            width,
            height,
            browserWidth,
            browserHeight,
          },
        },
      };
    }
    case ACTIONS.SET_SCREEN_SHARE_OUTPUT: {
      const {
        width,
        height,
        top,
        left,
      } = action.value;
      const { screenShare } = state.output;
      if (screenShare.width === width
        && screenShare.height === height
        && screenShare.top === top
        && screenShare.left === left) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          screenShare: {
            ...screenShare,
            width,
            height,
            top,
            left,
          },
        },
      };
    }

    // EXTERNAL VIDEO
    case ACTIONS.SET_HAS_EXTERNAL_VIDEO: {
      const { externalVideo } = state.input;
      if (externalVideo.hasExternalVideo === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          externalVideo: {
            ...externalVideo,
            hasExternalVideo: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_EXTERNAL_VIDEO_SIZE: {
      const {
        width, height, browserWidth, browserHeight,
      } = action.value;
      const { externalVideo } = state.input;
      if (externalVideo.width === width
        && externalVideo.height === height
        && externalVideo.browserWidth === browserWidth
        && externalVideo.browserHeight === browserHeight) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          externalVideo: {
            ...externalVideo,
            width,
            height,
            browserWidth,
            browserHeight,
          },
        },
      };
    }
    case ACTIONS.SET_EXTERNAL_VIDEO_OUTPUT: {
      const {
        width,
        height,
        top,
        left,
      } = action.value;
      const { externalVideo } = state.output;
      if (externalVideo.width === width
        && externalVideo.height === height
        && externalVideo.top === top
        && externalVideo.left === left) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          externalVideo: {
            ...externalVideo,
            width,
            height,
            top,
            left,
          },
        },
      };
    }
    default: {
      throw new Error('Unexpected action');
    }
  }
};

const ContextProvider = (props) => {
  const [newLayoutContextState, newLayoutContextDispatch] = useReducer(reducer, initState);
  const { children } = props;
  return (
    <NLayoutContext.Provider value={{
      newLayoutContextState,
      newLayoutContextDispatch,
    }}
    >
      {children}
    </NLayoutContext.Provider>
  );
};
ContextProvider.propTypes = providerPropTypes;

const withProvider = (Component) => (props) => (
  <ContextProvider>
    <Component {...props} />
  </ContextProvider>
);

const withConsumer = (Component) => (props) => (
  <NLayoutContext.Consumer>
    {(contexts) => <Component {...props} {...contexts} />}
  </NLayoutContext.Consumer>
);

export default {
  withProvider,
  withConsumer,
  withContext: (Component) => withProvider(withConsumer(Component)),
};
