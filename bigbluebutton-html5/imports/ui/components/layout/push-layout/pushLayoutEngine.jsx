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
import {
  getInitialSidebarContentPanel,
  isPhoneLandscape,
  isValidSynchronizationLayout,
  LAYOUTS_SYNC,
} from '../utils';
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
} from '../context';
import { useShellState } from '../shell/context';
import { cameraDockPosition as reportedCameraDockPosition } from '../shell/selectors';
import { hasCameraDockChanged, meetingCameraDockSize } from './service';
import { useMeetingLayoutUpdater, usePushLayoutUpdater, useLayoutUpdater } from './hooks';
import {
  applyMeetingDockSize, DOCK_SIZE_STORAGE_KEY, fractionFor, readStoredDockSize,
} from '../dockSize';
import { useStorageKey, STORAGES } from '/imports/ui/services/storage/hooks';
import { setEnforcedLayout } from '/imports/ui/components/plugins-engine/ui-commands/layout/handler';
import { useIsChatEnabled } from '/imports/ui/services/features';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import deviceInfo from '/imports/utils/deviceInfo';

const propTypes = {
  cameraDockSize: PropTypes.number,
  cameraPosition: PropTypes.string,
  focusedCamera: PropTypes.string,
  isPresenter: PropTypes.bool,
  isModerator: PropTypes.bool,
  isChatEnabled: PropTypes.bool,
  isCameraDockPropagationSuppressed: PropTypes.bool,
  layoutContextDispatch: PropTypes.func,
  meetingLayout: PropTypes.string,
  meetingLayoutCameraPosition: PropTypes.string,
  meetingLayoutFocusedCamera: PropTypes.string,
  meetingLayoutDockSize: PropTypes.number,
  meetingPresentationIsOpen: PropTypes.bool,
  presentationIsOpen: PropTypes.bool,
  presentationContentUpdatedAt: PropTypes.number,
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
};

const PushLayoutEngine = (props) => {
  const prevProps = usePreviousValue(props) || {};
  const setLayoutType = useLayoutUpdater();
  const hasInitiallyPropagated = useRef(false);

  const {
    cameraDockSize,
    meetingLayout,
    meetingLayoutCameraPosition,
    meetingLayoutFocusedCamera,
    meetingLayoutDockSize,
    meetingPresentationIsOpen,
    shouldShowScreenshare,
    shouldShowExternalVideo,
    enforceLayoutResult,
    setLocalSettings,
    pushLayoutMeeting,
    cameraPosition,
    focusedCamera,
    isModerator,
    isPresenter,
    layoutContextDispatch,
    presentationContentUpdatedAt,
    presentationIsOpen,
    pushLayout,
    selectedLayout,
    setMeetingLayout,
    setPushLayout,
    hasMeetingLayout,
    isChatEnabled,
    isCameraDockPropagationSuppressed,
    meetingLayoutSetByUserId,
  } = props;

  useEffect(() => {
    const Settings = getSettingsSingletonInstance();
    const { selectedLayout: currentLayout } = Settings.layout;
    const hasLayoutEngineLoadedOnce = Session.getItem('hasLayoutEngineLoadedOnce');

    const defaultLayout = LAYOUT_TYPE[getFromUserSettings('bbb_default_layout', null)];
    const enforcedLayout = LAYOUT_TYPE[enforceLayoutResult] || null;
    const contextLayout = enforcedLayout || defaultLayout
      || meetingLayout || currentLayout;

    // What follows keys off the layout this pass applied, not the one in effect before
    // it: the two differ whenever the meeting layout arrives after the mount.
    const appliedLayout = setLayoutType(
      contextLayout,
      setLocalSettings,
    );

    Session.setItem('isGridEnabled', appliedLayout === LAYOUT_TYPE.UNIFIED_LAYOUT && !presentationIsOpen);

    const HIDE_PRESENTATION = window.meetingClientSettings.public.layout.hidePresentationOnJoin;
    const shouldOpenPresentation = shouldShowScreenshare || shouldShowExternalVideo;
    const initialSidebarContentPanel = getInitialSidebarContentPanel(isChatEnabled);
    // Same phone guard the layout observer applies: the sidebar content covers the
    // whole screen on phones, so no panel is opened automatically on join.
    const shouldOpenChatPanel = initialSidebarContentPanel === PANELS.CHAT && !deviceInfo.isPhone;
    let presentationLastState = !getFromUserSettings('bbb_hide_presentation_on_join', HIDE_PRESENTATION);
    presentationLastState = pushLayoutMeeting ? meetingPresentationIsOpen : presentationLastState;
    presentationLastState = shouldOpenPresentation || presentationLastState;
    MediaService.setPresentationIsOpen(layoutContextDispatch, presentationLastState);
    Session.setItem('presentationLastState', presentationLastState);

    if (appliedLayout === LAYOUT_TYPE.UNIFIED_LAYOUT) {
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
        if (shouldOpenChatPanel && !hasLayoutEngineLoadedOnce) {
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: true,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.CHAT,
          });
        }
        // a joiner takes the size the presenter set, under the same conditions as a follower
        const { syncCameraDockSizeAndPosition } = window.meetingClientSettings.public.layout;
        if (meetingLayoutDockSize !== 0 && !isPresenter && syncCameraDockSizeAndPosition
          && meetingLayoutSetByUserId && meetingLayoutSetByUserId !== 'system') {
          applyMeetingDockSize(meetingLayoutCameraPosition, meetingLayoutDockSize);
        }
      }, 0);
    }
    if (appliedLayout === LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY) {
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

    const replicateLayoutType = () => {
      const contextLayout = LAYOUT_TYPE[enforceLayoutResult] || meetingLayout;
      setLayoutType(
        contextLayout,
        setLocalSettings,
      );
    };

    const replicatePresentationState = () => {
      if (meetingPresentationIsOpen !== prevProps.meetingPresentationIsOpen) {
        layoutContextDispatch({
          type: ACTIONS.SET_PRESENTATION_IS_OPEN,
          value: meetingPresentationIsOpen,
        });
        Session.setItem('presentationLastState', meetingPresentationIsOpen);
      }
    };

    const replicateFocusedCamera = () => {
      if (meetingLayoutFocusedCamera !== prevProps.meetingLayoutFocusedCamera) {
        layoutContextDispatch({
          type: ACTIONS.SET_FOCUSED_CAMERA_ID,
          value: meetingLayoutFocusedCamera,
          isLocalChange: false,
        });
      }
    };

    const replicateCameraDockPosition = () => {
      if (meetingLayoutCameraPosition !== prevProps.meetingLayoutCameraPosition) {
        layoutContextDispatch({
          type: ACTIONS.SET_CAMERA_DOCK_POSITION,
          value: meetingLayoutCameraPosition || DEFAULT_VALUES.cameraPosition,
          isLocalChange: false,
        });
      }
    };

    // the size is a fraction for the axis of the meeting's position: a new position needs it again
    const replicateCameraDockSize = () => {
      if (meetingLayoutDockSize !== prevProps.meetingLayoutDockSize
        || meetingLayoutCameraPosition !== prevProps.meetingLayoutCameraPosition) {
        applyMeetingDockSize(meetingLayoutCameraPosition, meetingLayoutDockSize);
      }
    };

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

      // Not guarded on the enforcing device: the layout manager overrides the position
      // it renders, and a guard here would drop the push for good, nothing replays it.
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
      || hasCameraDockChanged({
        isCameraDockPropagationSuppressed,
        cameraPosition,
        cameraDockSize,
      }, prevProps)
      || focusedCamera !== prevProps.focusedCamera
      || enforceLayoutResult !== prevProps.enforceLayoutResult
      || presentationContentUpdatedAt !== prevProps.presentationContentUpdatedAt;
    // A follower's presentation state is local (never propagated) and its restore
    // memory may be stale: on becoming presenter, adopt what is being shown.
    const becamePresenter = isPresenter && prevProps.isPresenter === false;
    if (becamePresenter) {
      Session.setItem('presentationLastState', presentationIsOpen);
    }
    const presenterStateDiverged = becamePresenter
      && presentationIsOpen !== meetingPresentationIsOpen;

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
      if (pushLayout
        && (layoutChanged || presenterStateDiverged || pushLayout !== prevProps.pushLayout)) {
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
  const shell = useShellState();
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const browserInput = layoutSelectInput((i) => i.browser);
  const presentationInput = layoutSelectInput((i) => i.presentation);
  const layoutContextDispatch = layoutDispatch();
  const isChatEnabled = useIsChatEnabled();

  const layoutSettings = useSettings(SETTINGS.LAYOUT);
  const {
    selectedLayout,
  } = layoutSettings;

  // where the dock is drawn (the layout state, as the CSS layout reads it)
  const cameraDockPosition = shell && reportedCameraDockPosition(shell);
  const { focusedId: focusedCamera } = cameraDockInput;
  // the size the user stored on release, for the dock's axis (a fraction of its area; 0 = not set)
  const storedDockSize = readStoredDockSize(useStorageKey(DOCK_SIZE_STORAGE_KEY, STORAGES.SESSION));
  const cameraDockSize = fractionFor(storedDockSize, cameraDockPosition);
  const cameraDock = { position: cameraDockPosition, size: cameraDockSize };

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
  const {
    propagateLayout: pushLayoutMeeting,
    cameraDockPlacement: meetingLayoutCameraPosition,
    cameraDockSize: meetingCameraDockSizeRaw,
    cameraWithFocus: meetingLayoutFocusedCamera,
    presentationMinimized: meetingPresentationMinimized,
    setByUserId: meetingLayoutSetByUserId,
  } = (currentMeeting?.layout || {});
  // A numeric column: it arrives as a string, or not at all while loading.
  const meetingLayoutDockSize = meetingCameraDockSize(meetingCameraDockSizeRaw);

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

  // A phone in landscape locks the dock beside the media for this user only (isLocalOnly).
  const isCameraDockPropagationSuppressed = isPhoneLandscape(browserInput);

  const setLocalSettings = useUserChangedLocalSettings();
  const setPushLayout = usePushLayoutUpdater(pushLayout);
  const setMeetingLayout = useMeetingLayoutUpdater({
    cameraDock,
    cameraDockInput,
    presentationInput,
    layoutSettings,
    isCameraDockPropagationSuppressed,
    meetingCameraDock: { position: meetingLayoutCameraPosition, size: meetingLayoutDockSize },
  });

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
        cameraDockSize,
        meetingLayout,
        meetingLayoutCameraPosition,
        meetingLayoutFocusedCamera,
        meetingLayoutDockSize,
        meetingPresentationIsOpen,
        enforceLayoutResult,
        setLocalSettings,
        pushLayoutMeeting,
        focusedCamera,
        cameraPosition: cameraDockPosition,
        isModerator,
        isPresenter,
        isChatEnabled,
        isCameraDockPropagationSuppressed,
        layoutContextDispatch,
        presentationContentUpdatedAt,
        presentationIsOpen,
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
