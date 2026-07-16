import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  useReactiveVar,
} from '@apollo/client';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import MediaService from '/imports/ui/components/media/service';
import {
  LAYOUT_TYPE,
  ACTIONS,
  SYNC,
  LAYOUT_ELEMENTS,
  PANELS,
  HIDDEN_LAYOUTS,
} from '../enums';
import { isValidSynchronizationLayout, LAYOUTS_SYNC } from '../utils';
import { updateSettings } from '/imports/ui/components/settings/service';
import Session from '/imports/ui/services/storage/in-memory';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useUserChangedLocalSettings from '/imports/ui/services/settings/hooks/useUserChangedLocalSettings';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import {
  layoutDispatch,
  layoutSelectInput,
  layoutSelectOutput,
} from '../context';
import { calculatePresentationVideoRate } from './service';
import { useMeetingLayoutUpdater, usePushLayoutUpdater, useLayoutUpdater } from './hooks';
import { setEnforcedLayout } from '/imports/ui/components/plugins-engine/ui-commands/layout/handler';
import { useIsChatEnabled } from '/imports/ui/services/features';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';

const equalDouble = (n1, n2) => {
  const precision = 0.01;

  return Math.abs(n1 - n2) <= precision;
};

const propTypes = {
  cameraWidth: PropTypes.number,
  cameraHeight: PropTypes.number,
  cameraIsResizing: PropTypes.bool,
  cameraPosition: PropTypes.string,
  focusedCamera: PropTypes.string,
  horizontalPosition: PropTypes.bool,
  isMeetingLayoutResizing: PropTypes.bool,
  isPresenter: PropTypes.bool,
  isModerator: PropTypes.bool,
  isChatEnabled: PropTypes.bool,
  layoutContextDispatch: PropTypes.func,
  meetingLayout: PropTypes.string,
  meetingLayoutCameraPosition: PropTypes.string,
  meetingLayoutFocusedCamera: PropTypes.string,
  meetingLayoutVideoRate: PropTypes.number,
  meetingPresentationIsOpen: PropTypes.bool,
  meetingLayoutUpdatedAt: PropTypes.number,
  presentationIsOpen: PropTypes.bool,
  presentationContentUpdatedAt: PropTypes.number,
  presentationVideoRate: PropTypes.number,
  pushLayout: PropTypes.bool,
  pushLayoutMeeting: PropTypes.bool,
  selectedLayout: PropTypes.string,
  setMeetingLayout: PropTypes.func,
  setPushLayout: PropTypes.func,
  shouldShowScreenshare: PropTypes.bool,
  shouldShowExternalVideo: PropTypes.bool,
  enforceLayoutResult: PropTypes.string,
  setLocalSettings: PropTypes.func.isRequired,
  hasMeetingLayout: PropTypes.bool,
  meetingLayoutSetByUserId: PropTypes.string,
  isChatEnabled: PropTypes.bool,
};

const PushLayoutEngine = (props) => {
  const prevProps = usePreviousValue(props) || {};
  const setLayoutType = useLayoutUpdater();
  const hasInitiallyPropagated = useRef(false);

  const {
    cameraWidth,
    cameraHeight,
    horizontalPosition,
    meetingLayout,
    meetingLayoutCameraPosition,
    meetingLayoutFocusedCamera,
    meetingLayoutVideoRate,
    meetingPresentationIsOpen,
    shouldShowScreenshare,
    shouldShowExternalVideo,
    enforceLayoutResult,
    setLocalSettings,
    pushLayoutMeeting,
    cameraIsResizing,
    cameraPosition,
    focusedCamera,
    isMeetingLayoutResizing,
    isModerator,
    isPresenter,
    layoutContextDispatch,
    meetingLayoutUpdatedAt,
    presentationContentUpdatedAt,
    presentationIsOpen,
    presentationVideoRate,
    pushLayout,
    selectedLayout,
    setMeetingLayout,
    setPushLayout,
    hasMeetingLayout,
    isChatEnabled,
    meetingLayoutSetByUserId,
  } = props;

  useEffect(() => {
    const Settings = getSettingsSingletonInstance();
    const { selectedLayout: currentLayout } = Settings.layout;
    const hasLayoutEngineLoadedOnce = Session.getItem('hasLayoutEngineLoadedOnce');

    const changeLayout = LAYOUT_TYPE[getFromUserSettings('bbb_change_layout', null)];
    const defaultLayout = LAYOUT_TYPE[getFromUserSettings('bbb_default_layout', null)];
    const enforcedLayout = LAYOUT_TYPE[enforceLayoutResult] || null;
    const contextLayout = enforcedLayout || changeLayout || defaultLayout
      || meetingLayout || currentLayout;

    Session.setItem('isGridEnabled', currentLayout === LAYOUT_TYPE.UNIFIED_LAYOUT && !presentationIsOpen);

    setLayoutType(
      contextLayout,
      setLocalSettings,
    );

    const HIDE_PRESENTATION = window.meetingClientSettings.public.layout.hidePresentationOnJoin;
    const HIDE_CHAT = window.meetingClientSettings.public.chat.startClosed;

    const shouldOpenPresentation = shouldShowScreenshare || shouldShowExternalVideo;
    const shouldOpenChat = isChatEnabled && getFromUserSettings('bbb_show_public_chat_on_login', !HIDE_CHAT);
    let presentationLastState = !getFromUserSettings('bbb_hide_presentation_on_join', HIDE_PRESENTATION);
    presentationLastState = pushLayoutMeeting ? meetingPresentationIsOpen : presentationLastState;
    presentationLastState = shouldOpenPresentation || presentationLastState;
    MediaService.setPresentationIsOpen(layoutContextDispatch, presentationLastState);
    Session.setItem('presentationLastState', presentationLastState);

    if (currentLayout === LAYOUT_TYPE.UNIFIED_LAYOUT) {
      setTimeout(() => {
        layoutContextDispatch({
          type: ACTIONS.SET_FOCUSED_CAMERA_ID,
          value: meetingLayoutFocusedCamera,
        });

        layoutContextDispatch({
          type: ACTIONS.SET_CAMERA_DOCK_POSITION,
          value: meetingLayoutCameraPosition || DEFAULT_VALUES.cameraPosition,
          isLocalChange: false,
        });
        if (shouldOpenChat && !hasLayoutEngineLoadedOnce) {
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: true,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.CHAT,
          });
        }
        if (!equalDouble(meetingLayoutVideoRate, 0)) {
          let w; let h;
          if (horizontalPosition) {
            w = window.innerWidth * meetingLayoutVideoRate;
            h = cameraHeight;
          } else {
            w = cameraWidth;
            h = window.innerHeight * meetingLayoutVideoRate;
          }

          layoutContextDispatch({
            type: ACTIONS.SET_CAMERA_DOCK_SIZE,
            value: {
              width: w,
              height: h,
              browserWidth: window.innerWidth,
              browserHeight: window.innerHeight,
            },
          });
        }
      }, 0);
    }
    if (currentLayout === LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.CHAT,
      });
    }
  }, [hasMeetingLayout, enforceLayoutResult]);

  useEffect(() => {
    if (!isValidSynchronizationLayout(selectedLayout)) return () => {};
    const meetingLayoutDidChange = prevProps.meetingLayout !== undefined
      && meetingLayout !== prevProps.meetingLayout;
    const pushLayoutMeetingDidChange = prevProps.pushLayoutMeeting !== undefined
      && pushLayoutMeeting !== prevProps.pushLayoutMeeting;
    const enforceLayoutDidChange = enforceLayoutResult !== undefined
      && enforceLayoutResult !== prevProps.enforceLayoutResult;
    const shouldSwitchLayout = isPresenter
      ? meetingLayoutDidChange || enforceLayoutDidChange
      : ((meetingLayoutDidChange || pushLayoutMeetingDidChange) && pushLayoutMeeting)
        || enforceLayoutDidChange;
    const layoutReplicateElements = LAYOUTS_SYNC[selectedLayout][SYNC.REPLICATE_ELEMENTS];
    const layoutPropagateElements = LAYOUTS_SYNC[selectedLayout][SYNC.PROPAGATE_ELEMENTS];
    const Settings = getSettingsSingletonInstance();

    const replicateLayoutType = () => {
      const contextLayout = LAYOUT_TYPE[enforceLayoutResult] || meetingLayout;
      setLayoutType(
        contextLayout,
        setLocalSettings,
      );
    };

    const replicatePresentationState = () => {
      if (meetingPresentationIsOpen !== prevProps.meetingPresentationIsOpen
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {
        layoutContextDispatch({
          type: ACTIONS.SET_PRESENTATION_IS_OPEN,
          value: meetingPresentationIsOpen,
        });
        Session.setItem('presentationLastState', meetingPresentationIsOpen);
      }
    };

    const replicateFocusedCamera = () => {
      if (meetingLayoutFocusedCamera !== prevProps.meetingLayoutFocusedCamera
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {
        layoutContextDispatch({
          type: ACTIONS.SET_FOCUSED_CAMERA_ID,
          value: meetingLayoutFocusedCamera,
          isLocalChange: false,
        });
      }
    };

    const replicateCameraDockPosition = () => {
      if (meetingLayoutCameraPosition !== prevProps.meetingLayoutCameraPosition
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {
        layoutContextDispatch({
          type: ACTIONS.SET_CAMERA_DOCK_POSITION,
          value: meetingLayoutCameraPosition || DEFAULT_VALUES.cameraPosition,
          isLocalChange: false,
        });
      }
    };

    const replicateCameraDockSize = () => {
      if (!equalDouble(meetingLayoutVideoRate, prevProps.meetingLayoutVideoRate)
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {
        let w; let h;
        if (horizontalPosition) {
          w = window.innerWidth * meetingLayoutVideoRate;
          h = cameraHeight;
        } else {
          w = cameraWidth;
          h = window.innerHeight * meetingLayoutVideoRate;
        }

        if (isMeetingLayoutResizing !== prevProps.isMeetingLayoutResizing) {
          layoutContextDispatch({
            type: ACTIONS.SET_CAMERA_DOCK_IS_RESIZING,
            value: isMeetingLayoutResizing,
            isLocalChange: false,
          });
        }

        layoutContextDispatch({
          type: ACTIONS.SET_CAMERA_DOCK_SIZE,
          value: {
            width: w,
            height: h,
            browserWidth: window.innerWidth,
            browserHeight: window.innerHeight,
          },
          isLocalChange: false,
        });
      }
    };
    // Sync local state of push layout
    if ((isModerator || isPresenter)
      && pushLayoutMeetingDidChange
      && pushLayoutMeeting !== pushLayout) {
      updateSettings({
        layout: {
          ...Settings.layout,
          pushLayout: pushLayoutMeeting,
        },
      }, null, setLocalSettings);
    }

    const notInitialValues = meetingLayoutSetByUserId && meetingLayoutSetByUserId !== 'system';

    // REPLICATE LAYOUT
    if (shouldSwitchLayout && layoutReplicateElements.includes(LAYOUT_ELEMENTS.LAYOUT_TYPE)) {
      replicateLayoutType();
    }
    if (!isPresenter && notInitialValues) {
      const { syncCameraDockSizeAndPosition } = window.meetingClientSettings.public.layout;

      if (layoutReplicateElements.includes(LAYOUT_ELEMENTS.PRESENTATION_STATE)) {
        replicatePresentationState();
      }
      if (layoutReplicateElements.includes(LAYOUT_ELEMENTS.FOCUSED_CAMERA)) {
        replicateFocusedCamera();
      }

      if (syncCameraDockSizeAndPosition) {
        if (layoutReplicateElements.includes(LAYOUT_ELEMENTS.CAMERA_DOCK_POSITION)) {
          replicateCameraDockPosition();
        }
        if (layoutReplicateElements.includes(LAYOUT_ELEMENTS.CAMERA_DOCK_SIZE)) {
          replicateCameraDockSize();
        }
      }
    }

    // PROPAGATE LAYOUT
    const layoutChanged = presentationIsOpen !== prevProps.presentationIsOpen
      || selectedLayout !== prevProps.selectedLayout
      || cameraIsResizing !== prevProps.cameraIsResizing
      || cameraPosition !== prevProps.cameraPosition
      || focusedCamera !== prevProps.focusedCamera
      || enforceLayoutResult !== prevProps.enforceLayoutResult
      || !equalDouble(presentationVideoRate, prevProps.presentationVideoRate)
      || presentationContentUpdatedAt !== prevProps.presentationContentUpdatedAt;

    if (pushLayoutMeeting !== undefined
      && pushLayout !== prevProps.pushLayout
      && pushLayout !== pushLayoutMeeting) {
      if (isModerator) {
        setPushLayout(pushLayout);
      }
    }

    // change layout sizes / states
    if (isPresenter
      // since all meeting layout properties are pushed together in a
      // single call just check whether there is any element to be propagate
      && layoutPropagateElements.length > 0
      // Only propagate after the meeting layout has been applied locally at
      // least once. This prevents intermediate renders (while the meeting data
      // is still loading) from pushing the default value to the
      // server and overwriting the meeting configured layout type.
      && hasInitiallyPropagated.current
    ) {
      if (pushLayout && (layoutChanged || pushLayout !== prevProps.pushLayout)) {
        setMeetingLayout(pushLayout);
      }
    }
    if (!hasInitiallyPropagated.current && hasMeetingLayout) {
      hasInitiallyPropagated.current = true;
    }

    if (selectedLayout !== prevProps.selectedLayout
      && selectedLayout !== LAYOUT_TYPE.UNIFIED_LAYOUT) {
      Session.setItem('isGridEnabled', false);
    }

    if (selectedLayout === LAYOUT_TYPE.UNIFIED_LAYOUT
      && (selectedLayout !== prevProps.selectedLayout
        || presentationIsOpen !== prevProps.presentationIsOpen)) {
      Session.setItem('isGridEnabled', !presentationIsOpen);
    }

    return () => {};
  });

  return null;
};

const PushLayoutEngineContainer = (props) => {
  const cameraDockOutput = layoutSelectOutput((i) => i.cameraDock);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const presentationInput = layoutSelectInput((i) => i.presentation);
  const layoutContextDispatch = layoutDispatch();
  const isChatEnabled = useIsChatEnabled();

  const layoutSettings = useSettings(SETTINGS.LAYOUT);
  const {
    selectedLayout,
  } = layoutSettings;

  const {
    width: cameraWidth,
    height: cameraHeight,
    position: cameraPosition,
    focusedId: focusedCamera,
  } = cameraDockOutput;

  const getKeepPushingLayout = () => {
    // check if current layout is a hidden layout
    if (selectedLayout
      && selectedLayout !== LAYOUT_TYPE.UNIFIED_LAYOUT
      && HIDDEN_LAYOUTS.includes(selectedLayout)) {
      return false;
    }

    return true;
  };

  const pushLayout = getKeepPushingLayout();

  const {
    isResizing: cameraIsResizing,
  } = cameraDockInput;

  const horizontalPosition = cameraPosition === 'contentLeft' || cameraPosition === 'contentRight';

  const currentPluginLayoutRaw = useReactiveVar(setEnforcedLayout);

  const validatePluginLayout = (layout) => {
    const layoutTypes = Object.keys(LAYOUT_TYPE);
    return layout && layoutTypes.includes(layout) ? layout : undefined;
  };
  const pluginEnforcedLayout = validatePluginLayout(
    currentPluginLayoutRaw.pluginEnforcedLayout,
  );
  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    layout: m.layout,
  }));
  const meetingLayout = LAYOUT_TYPE[currentMeeting?.layout?.currentLayoutType];
  const meetingLayoutUpdatedAt = new Date(currentMeeting?.layout?.updatedAt).getTime();
  const {
    propagateLayout: pushLayoutMeeting,
    cameraDockIsResizing: isMeetingLayoutResizing,
    cameraDockPlacement: meetingLayoutCameraPosition,
    cameraDockAspectRatio: meetingLayoutVideoRate,
    cameraWithFocus: meetingLayoutFocusedCamera,
    presentationMinimized: meetingPresentationMinimized,
    setByUserId: meetingLayoutSetByUserId,
  } = (currentMeeting?.layout || {});

  const {
    isOpen: presentationIsOpen,
    contentUpdatedAt: presentationContentUpdatedAt,
  } = presentationInput;

  const { data: currentUserData, loading: enforcedLayoutLoading } = useCurrentUser((user) => ({
    enforceLayout: user.sessionCurrent?.enforceLayout,
    isModerator: user.isModerator,
    presenter: user.presenter,
  }));

  useEffect(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_LAYOUT_LOADING,
      value: enforcedLayoutLoading,
    });
  }, [enforcedLayoutLoading]);

  const presentationVideoRate = calculatePresentationVideoRate(cameraDockOutput);

  const setLocalSettings = useUserChangedLocalSettings();
  const setPushLayout = usePushLayoutUpdater(pushLayout);
  const setMeetingLayout = useMeetingLayoutUpdater(
    cameraDockOutput,
    cameraDockInput,
    presentationInput,
    layoutSettings,
  );

  if (!currentUserData || currentUserData === null) return null;
  const isModerator = currentUserData?.isModerator;
  const isPresenter = currentUserData?.presenter;

  const validateEnforceLayout = (currUser) => {
    const layoutTypes = Object.keys(LAYOUT_TYPE);
    const enforceLayout = currUser?.enforceLayout;
    return enforceLayout && layoutTypes.includes(enforceLayout) ? enforceLayout : undefined;
  };

  const enforceLayout = validateEnforceLayout(currentUserData);
  const meetingPresentationIsOpen = !meetingPresentationMinimized;

  const enforceLayoutResult = pluginEnforcedLayout || enforceLayout;
  return (
    <PushLayoutEngine
      {...{
        cameraWidth,
        cameraHeight,
        horizontalPosition,
        meetingLayout,
        meetingLayoutCameraPosition,
        meetingLayoutFocusedCamera,
        meetingLayoutVideoRate,
        meetingPresentationIsOpen,
        enforceLayoutResult,
        setLocalSettings,
        pushLayoutMeeting,
        cameraIsResizing,
        cameraPosition,
        focusedCamera,
        isMeetingLayoutResizing,
        isModerator,
        isPresenter,
        isChatEnabled,
        layoutContextDispatch,
        meetingLayoutUpdatedAt,
        presentationContentUpdatedAt,
        presentationIsOpen,
        presentationVideoRate,
        pushLayout,
        selectedLayout,
        setMeetingLayout,
        setPushLayout,
        hasMeetingLayout: !!meetingLayout,
        meetingLayoutSetByUserId,
        ...props,
      }}
    />
  );
};

PushLayoutEngine.propTypes = propTypes;

export default PushLayoutEngineContainer;
