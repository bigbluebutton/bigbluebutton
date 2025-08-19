import React, { useEffect, useReducer, useRef } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import PropTypes from 'prop-types';
import { clone, equals } from 'ramda';
import {
  ACTIONS, PRESENTATION_AREA, PANELS, LAYOUT_TYPE,
} from '/imports/ui/components/layout/enums';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { INITIAL_INPUT_STATE, INITIAL_OUTPUT_STATE } from './initState';
import useUpdatePresentationAreaContentForPlugin from '/imports/ui/components/plugins-engine/ui-data-hooks/layout/presentation-area/utils';
import { useIsPresentationEnabled } from '/imports/ui/services/features';
import { usePrevious } from '../whiteboard/utils';
import Session from '/imports/ui/services/storage/in-memory';
import useMeeting from '../../core/hooks/useMeeting';

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

const LayoutContextSelector = createContext();

const initPresentationAreaContentActions = [{
  type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
  value: {
    content: PRESENTATION_AREA.WHITEBOARD_OPEN,
    open: true,
  },
}];

const initState = {
  presentationAreaContentActions: initPresentationAreaContentActions,
  deviceType: null,
  isRTL: DEFAULT_VALUES.isRTL,
  layoutType: DEFAULT_VALUES.layoutType,
  fontSize: DEFAULT_VALUES.fontSize,
  idChatOpen: '',
  fullscreen: {
    element: '',
    group: '',
  },
  input: INITIAL_INPUT_STATE,
  output: INITIAL_OUTPUT_STATE,
};

const reducer = (state, action) => {
  debugActions(action.type, action.value);
  switch (action.type) {
    case ACTIONS.SET_FOCUSED_CAMERA_ID: {
      const { cameraDock } = state.input;
      const { focusedId } = cameraDock;

      if (focusedId === action.value) return state;

      return {
        ...state,
        input: {
          ...state.input,
          cameraDock: {
            ...cameraDock,
            focusedId: action.value,
          },
        },
      };
    }

    case ACTIONS.SET_LAYOUT_INPUT: {
      if (state.input === action.value) return state;
      return {
        ...state,
        input: typeof action.value === 'function' ? action.value(state.input) : action.value,
      };
    }

    case ACTIONS.SET_IS_RTL: {
      const { isRTL } = state;
      if (isRTL === action.value) return state;
      return {
        ...state,
        isRTL: action.value,
      };
    }

    // LAYOUT TYPE
    // using to load a different layout manager
    case ACTIONS.SET_LAYOUT_TYPE: {
      const { layoutType } = state.input;
      if (layoutType === action.value) return state;
      return {
        ...state,
        layoutType: action.value,
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

    // BANNER BAR
    case ACTIONS.SET_HAS_BANNER_BAR: {
      const { bannerBar } = state.input;
      if (bannerBar.hasBanner === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          bannerBar: {
            ...bannerBar,
            hasBanner: action.value,
          },
        },
      };
    }

    // NOTIFICATIONS BAR
    case ACTIONS.SET_HAS_NOTIFICATIONS_BAR: {
      const { notificationsBar } = state.input;
      if (notificationsBar.hasNotification === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          notificationsBar: {
            ...notificationsBar,
            hasNotification: action.value,
          },
        },
      };
    }

    // NOTIFICATION TOASTS
    case ACTIONS.SET_HIDE_NOTIFICATION_TOASTS: {
      const { notificationsBar } = state.input;
      if (notificationsBar.hideNotificationToasts === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          notificationsBar: {
            ...notificationsBar,
            hideNotificationToasts: action.value,
          },
        },
      };
    }

    // NAV BAR

    case ACTIONS.SET_HAS_NAVBAR: {
      const { navBar } = state.input;
      if (navBar.hasNavBar === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          navBar: {
            ...navBar,
            hasNavBar: action.value,
          },
        },
      };
    }

    case ACTIONS.SET_HIDE_NAVBAR_TOP_ROW: {
      const { navBar } = state.output;
      if (navBar.hideTopRow === action.value) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          navBar: {
            ...navBar,
            hideTopRow: action.value,
          },
        },
      };
    }

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
    case ACTIONS.SET_HAS_ACTIONBAR: {
      const { actionBar } = state.input;
      if (actionBar.hasActionBar === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          actionBar: {
            ...actionBar,
            hasActionBar: action.value,
          },
        },
      };
    }

    case ACTIONS.SET_ACTIONBAR_OUTPUT: {
      const {
        display, width, height, innerHeight, top, left, padding, tabOrder, zIndex,
      } = action.value;
      const { actionBar } = state.output;
      if (actionBar.display === display
        && actionBar.width === width
        && actionBar.height === height
        && actionBar.innerHeight === innerHeight
        && actionBar.top === top
        && actionBar.left === left
        && actionBar.padding === padding
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
            innerHeight,
            top,
            left,
            padding,
            tabOrder,
            zIndex,
          },
        },
      };
    }

    // CAPTIONS
    case ACTIONS.SET_CAPTIONS_OUTPUT: {
      const {
        left, right, maxWidth,
      } = action.value;
      const { captions } = state.output;
      if (captions.left === left
        && captions.right === right
        && captions.maxWidth === maxWidth) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          captions: {
            ...captions,
            left,
            right,
            maxWidth,
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
        right,
        tabOrder,
        isResizable,
        zIndex,
      } = action.value;
      const { sidebarNavigation } = state.output;
      if (sidebarNavigation.display === display
        && sidebarNavigation.minWidth === minWidth
        && sidebarNavigation.maxWidth === maxWidth
        && sidebarNavigation.width === width
        && sidebarNavigation.minHeight === minHeight
        && sidebarNavigation.height === height
        && sidebarNavigation.maxHeight === maxHeight
        && sidebarNavigation.top === top
        && sidebarNavigation.left === left
        && sidebarNavigation.right === right
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
            right,
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
      const { sidebarContent, sidebarNavigation } = state.input;
      if (sidebarContent.isOpen === action.value) {
        return state;
      }
      // When opening content sidebar, the navigation sidebar should be opened as well
      if (action.value === true) sidebarNavigation.isOpen = true;
      return {
        ...state,
        input: {
          ...state.input,
          sidebarNavigation,
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
      const {
        width,
        browserWidth,
        height,
        browserHeight,
      } = action.value;
      const { sidebarContent } = state.input;
      if (sidebarContent.width === width
        && sidebarContent.browserWidth === browserWidth
        && sidebarContent.height === height
        && sidebarContent.browserHeight === browserHeight) {
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
            height,
            browserHeight,
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
        right,
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
        && sidebarContent.right === right
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
            right,
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
    case ACTIONS.SET_CAMERA_DOCK_IS_RESIZING: {
      const { cameraDock } = state.input;
      if (cameraDock.isResizing === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          cameraDock: {
            ...cameraDock,
            isResizing: action.value,
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
    case ACTIONS.SET_CAMERA_DOCK_OPTIMAL_GRID_SIZE: {
      const { width, height } = action.value;
      const { cameraDock } = state.input;
      const { cameraOptimalGridSize } = cameraDock;
      if (cameraOptimalGridSize.width === width
        && cameraOptimalGridSize.height === height) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          cameraDock: {
            ...cameraDock,
            cameraOptimalGridSize: {
              width,
              height,
            },
          },
        },
      };
    }
    case ACTIONS.SET_CAMERA_DOCK_OUTPUT: {
      const {
        display,
        position,
        minWidth,
        width,
        maxWidth,
        presenterMaxWidth,
        minHeight,
        height,
        maxHeight,
        top,
        left,
        right,
        tabOrder,
        isDraggable,
        resizableEdge,
        zIndex,
        focusedId,
      } = action.value;
      const { cameraDock } = state.output;
      if (cameraDock.display === display
        && cameraDock.position === position
        && cameraDock.width === width
        && cameraDock.maxWidth === maxWidth
        && cameraDock.presenterMaxWidth === presenterMaxWidth
        && cameraDock.height === height
        && cameraDock.maxHeight === maxHeight
        && cameraDock.top === top
        && cameraDock.left === left
        && cameraDock.right === right
        && cameraDock.tabOrder === tabOrder
        && cameraDock.isDraggable === isDraggable
        && cameraDock.zIndex === zIndex
        && cameraDock.resizableEdge === resizableEdge
        && cameraDock.focusedId === focusedId) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          cameraDock: {
            ...cameraDock,
            display,
            position,
            minWidth,
            width,
            maxWidth,
            presenterMaxWidth,
            minHeight,
            height,
            maxHeight,
            top,
            left,
            right,
            tabOrder,
            isDraggable,
            resizableEdge,
            zIndex,
            focusedId,
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
      const { presentationAreaContentActions } = state;
      presentationAreaContentActions[presentationAreaContentActions.length - 1]
        .value.open = action.value;
      return {
        ...state,
        input: {
          ...state.input,
          presentation: {
            ...presentation,
            isOpen: action.value,
          },
        },
        presentationAreaContentActions,
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
        right,
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
        && presentation.right === right
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
            right,
            tabOrder,
            isResizable,
            zIndex,
          },
        },
      };
    }

    // FULLSCREEN
    case ACTIONS.SET_FULLSCREEN_ELEMENT: {
      const { fullscreen } = state;
      if (fullscreen.element === action.value.element
        && fullscreen.group === action.value.group) {
        return state;
      }
      return {
        ...state,
        fullscreen: {
          element: action.value.element,
          group: action.value.group,
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
        right,
        zIndex,
      } = action.value;
      const { screenShare } = state.output;
      if (screenShare.width === width
        && screenShare.height === height
        && screenShare.top === top
        && screenShare.left === left
        && screenShare.right === right
        && screenShare.zIndex === zIndex) {
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
            right,
            zIndex,
          },
        },
      };
    }

    // EXTERNAL VIDEO
    case ACTIONS.SET_HAS_EXTERNAL_VIDEO: {
      const { externalVideo } = state.input;
      if (externalVideo?.hasExternalVideo === action.value) {
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
        right,
        display,
      } = action.value;
      const { externalVideo } = state.output;
      if (externalVideo.width === width
        && externalVideo.height === height
        && externalVideo.top === top
        && externalVideo.left === left
        && externalVideo.right === right
        && externalVideo.display === display) {
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
            right,
            display,
          },
        },
      };
    }

    // GENERIC COMPONENT
    case ACTIONS.SET_HAS_GENERIC_CONTENT: {
      const { genericMainContent } = state.input;
      if (genericMainContent.genericContentId === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          genericMainContent: {
            ...genericMainContent,
            genericContentId: action.value,
          },
        },
      };
    }

    case ACTIONS.SET_GENERIC_CONTENT_OUTPUT: {
      const {
        width,
        height,
        top,
        left,
        right,
      } = action.value;
      const { genericMainContent } = state.output;
      if (genericMainContent.width === width
        && genericMainContent.height === height
        && genericMainContent.top === top
        && genericMainContent.left === left
        && genericMainContent.right === right) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          genericMainContent: {
            ...genericMainContent,
            width,
            height,
            top,
            left,
            right,
          },
        },
      };
    }

    // NOTES
    case ACTIONS.SET_SHARED_NOTES_OUTPUT: {
      const {
        width,
        height,
        top,
        left,
        right,
      } = action.value;
      const { sharedNotes } = state.output;
      if (sharedNotes.width === width
        && sharedNotes.height === height
        && sharedNotes.top === top
        && sharedNotes.left === left
        && sharedNotes.right === right) {
        return state;
      }
      return {
        ...state,
        output: {
          ...state.output,
          sharedNotes: {
            ...sharedNotes,
            width,
            height,
            top,
            left,
            right,
          },
        },
      };
    }
    case ACTIONS.SET_NOTES_IS_PINNED: {
      const { sharedNotes } = state.input;
      if (sharedNotes.isPinned === action.value) {
        return state;
      }
      return {
        ...state,
        input: {
          ...state.input,
          sharedNotes: {
            ...sharedNotes,
            isPinned: action.value,
          },
        },
      };
    }
    case ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA: {
      const { presentationAreaContentActions } = state;
      if (action.value.open) {
        presentationAreaContentActions.push(action);
      } else {
        let indexesOfOpenedContent = presentationAreaContentActions.reduce((indexes, p, index) => {
          if (action.value.content === PRESENTATION_AREA.GENERIC_CONTENT) {
            if (
              p.value.content === action.value.content
              && p.value.open
              && p.value.genericContentId === action.value.genericContentId
            ) {
              indexes.push(index);
            }
          } else if (p.value.content === action.value.content) {
            indexes.push(index);
          }
          return indexes;
        }, []);
        indexesOfOpenedContent = indexesOfOpenedContent.length > 0 ? indexesOfOpenedContent : -1;
        if (
          indexesOfOpenedContent !== -1
        ) {
          indexesOfOpenedContent.reverse().forEach((index) => {
            presentationAreaContentActions.splice(index, 1);
          });
        }
      }
      return {
        ...state,
        presentationAreaContentActions,
      };
    }
    default: {
      throw new Error('Unexpected action');
    }
  }
};

const updatePresentationAreaContent = (
  layoutContextState,
  previousLayoutType,
  previousPresentationAreaContentActions,
  layoutContextDispatch,
  isPresentationEnabled,
) => {
  const { layoutType } = layoutContextState;
  const { sidebarContent, sharedNotes } = layoutContextState.input;
  const {
    presentationAreaContentActions: currentPresentationAreaContentActions,
  } = layoutContextState;
  if (!equals(
    currentPresentationAreaContentActions.map((action) => action.value.content),
    previousPresentationAreaContentActions.current.map((action) => action.value.content),
  ) || layoutType !== previousLayoutType) {
    const CHAT_CONFIG = window.meetingClientSettings.public.chat;
    const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

    // eslint-disable-next-line no-param-reassign
    previousPresentationAreaContentActions.current = clone(currentPresentationAreaContentActions);
    const lastIndex = currentPresentationAreaContentActions.length - 1;
    const lastPresentationContentInPile = clone(currentPresentationAreaContentActions[lastIndex]);
    let shouldOpenPresentation = true;
    switch (lastPresentationContentInPile.value.content) {
      case PRESENTATION_AREA.GENERIC_CONTENT: {
        layoutContextDispatch({
          type: ACTIONS.SET_NOTES_IS_PINNED,
          value: !lastPresentationContentInPile.value.open,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_HAS_GENERIC_CONTENT,
          value: lastPresentationContentInPile.value.genericContentId,
        });
        break;
      }
      case PRESENTATION_AREA.PINNED_NOTES: {
        if (
          (sidebarContent.isOpen || !isPresentationEnabled)
          && (sidebarContent.sidebarContentPanel === PANELS.SHARED_NOTES
            || !isPresentationEnabled)
        ) {
          if (layoutType === LAYOUT_TYPE.VIDEO_FOCUS) {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.CHAT,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_ID_CHAT_OPEN,
              value: PUBLIC_CHAT_ID,
            });
          } else {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.NONE,
            });
          }
        }

        layoutContextDispatch({
          type: ACTIONS.SET_HAS_GENERIC_CONTENT,
          value: undefined,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_NOTES_IS_PINNED,
          value: sharedNotes.isPinned,
        });
        break;
      }
      case PRESENTATION_AREA.EXTERNAL_VIDEO: {
        layoutContextDispatch({
          type: ACTIONS.SET_HAS_GENERIC_CONTENT,
          value: undefined,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_NOTES_IS_PINNED,
          value: !lastPresentationContentInPile.value.open,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_HAS_EXTERNAL_VIDEO,
          value: lastPresentationContentInPile.value.open,
        });
        break;
      }
      case PRESENTATION_AREA.SCREEN_SHARE: {
        layoutContextDispatch({
          type: ACTIONS.SET_HAS_GENERIC_CONTENT,
          value: undefined,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_NOTES_IS_PINNED,
          value: !lastPresentationContentInPile.value.open,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_HAS_SCREEN_SHARE,
          value: lastPresentationContentInPile.value.open,
        });
        break;
      }
      case PRESENTATION_AREA.WHITEBOARD_OPEN: {
        layoutContextDispatch({
          type: ACTIONS.SET_HAS_SCREEN_SHARE,
          value: !lastPresentationContentInPile.value.open,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_HAS_EXTERNAL_VIDEO,
          value: !lastPresentationContentInPile.value.open,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_HAS_GENERIC_CONTENT,
          value: undefined,
        });
        layoutContextDispatch({
          type: ACTIONS.PINNED_NOTES,
          value: !lastPresentationContentInPile.value.open,
        });
        shouldOpenPresentation = Session.getItem('presentationLastState');
        break;
      }
      default:
        break;
    }
    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_IS_OPEN,
      value: shouldOpenPresentation,
    });
  }
};

const LayoutContextProvider = (props) => {
  const previousPresentationAreaContentActions = useRef(
    [{
      type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
      value: {
        content: PRESENTATION_AREA.WHITEBOARD_OPEN,
        open: true,
      },
    }],
  );

  const { data: currentMeeting } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  const isSharedNotesPinned = currentMeeting?.componentsFlags?.isSharedNotesPinned;

  const [layoutContextState, layoutContextDispatch] = useReducer(reducer, initState);
  const isPresentationEnabled = useIsPresentationEnabled();
  const { children } = props;
  const { layoutType } = layoutContextState;
  const previousLayoutType = usePrevious(layoutType);

  useEffect(() => {
    updatePresentationAreaContent(
      layoutContextState,
      previousLayoutType,
      previousPresentationAreaContentActions,
      layoutContextDispatch,
      isPresentationEnabled,
    );
  }, [layoutContextState, isPresentationEnabled]);
  useEffect(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_NOTES_IS_PINNED,
      value: isSharedNotesPinned,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
      value: {
        content: PRESENTATION_AREA.PINNED_NOTES,
        open: isSharedNotesPinned,
      },
    });
  }, [isSharedNotesPinned]);
  useUpdatePresentationAreaContentForPlugin(layoutContextState);
  return (
    <LayoutContextSelector.Provider value={
      [
        layoutContextState,
        layoutContextDispatch,
      ]
    }
    >
      {children}
    </LayoutContextSelector.Provider>
  );
};
LayoutContextProvider.propTypes = providerPropTypes;

const layoutSelect = (
  selector,
) => useContextSelector(LayoutContextSelector, (layout) => selector(layout[0]));
const layoutSelectInput = (
  selector,
) => useContextSelector(LayoutContextSelector, (layout) => selector(layout[0].input));
const layoutSelectOutput = (
  selector,
) => useContextSelector(LayoutContextSelector, (layout) => selector(layout[0].output));
const layoutDispatch = () => useContextSelector(LayoutContextSelector, (layout) => layout[1]);

export {
  LayoutContextProvider,
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
};
