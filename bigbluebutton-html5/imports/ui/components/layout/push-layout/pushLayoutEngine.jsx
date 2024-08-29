import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import MediaService from '/imports/ui/components/media/service';
import { LAYOUT_TYPE, ACTIONS } from '../enums';
import { isMobile } from '../utils';
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
import { useMeetingLayoutUpdater, usePushLayoutUpdater } from './hooks';

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
  layoutContextDispatch: PropTypes.func,
  meetingLayout: PropTypes.string,
  meetingLayoutCameraPosition: PropTypes.string,
  meetingLayoutFocusedCamera: PropTypes.string,
  meetingLayoutVideoRate: PropTypes.number,
  meetingPresentationIsOpen: PropTypes.bool,
  meetingLayoutUpdatedAt: PropTypes.number,
  presentationIsOpen: PropTypes.bool,
  presentationVideoRate: PropTypes.number,
  pushLayout: PropTypes.bool,
  pushLayoutMeeting: PropTypes.bool,
  selectedLayout: PropTypes.string,
  setMeetingLayout: PropTypes.func,
  setPushLayout: PropTypes.func,
  shouldShowScreenshare: PropTypes.bool,
  shouldShowExternalVideo: PropTypes.bool,
  enforceLayout: PropTypes.string,
  setLocalSettings: PropTypes.func.isRequired,
};

const PushLayoutEngine = (props) => {
  const prevProps = usePreviousValue(props) || {};

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
    enforceLayout,
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
    presentationIsOpen,
    presentationVideoRate,
    pushLayout,
    selectedLayout,
    setMeetingLayout,
    setPushLayout,
  } = props;

  useEffect(() => {
    const Settings = getSettingsSingletonInstance();

    const changeLayout = LAYOUT_TYPE[getFromUserSettings('bbb_change_layout', null)];
    const defaultLayout = LAYOUT_TYPE[getFromUserSettings('bbb_default_layout', null)];
    const enforcedLayout = LAYOUT_TYPE[enforceLayout] || null;

    Settings.application.selectedLayout = enforcedLayout
      || changeLayout
      || defaultLayout
      || meetingLayout;

    let { selectedLayout: actualLayout } = Settings.application;
    if (isMobile()) {
      actualLayout = actualLayout === 'custom' ? 'smart' : actualLayout;
      Settings.application.actualLayout = actualLayout;
    }
    Session.setItem('isGridEnabled', actualLayout === LAYOUT_TYPE.VIDEO_FOCUS);

    Settings.save(setLocalSettings);

    const HIDE_PRESENTATION = window.meetingClientSettings.public.layout.hidePresentationOnJoin;

    const shouldOpenPresentation = shouldShowScreenshare || shouldShowExternalVideo;
    let presentationLastState = !getFromUserSettings('bbb_hide_presentation_on_join', HIDE_PRESENTATION);
    presentationLastState = pushLayoutMeeting ? meetingPresentationIsOpen : presentationLastState;
    presentationLastState = shouldOpenPresentation || presentationLastState;
    MediaService.setPresentationIsOpen(layoutContextDispatch, presentationLastState);
    Session.setItem('presentationLastState', presentationLastState);

    if (actualLayout === 'custom') {
      setTimeout(() => {
        layoutContextDispatch({
          type: ACTIONS.SET_FOCUSED_CAMERA_ID,
          value: meetingLayoutFocusedCamera,
        });

        layoutContextDispatch({
          type: ACTIONS.SET_CAMERA_DOCK_POSITION,
          value: meetingLayoutCameraPosition || 'contentTop',
        });

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
  }, []);

  useEffect(() => {
    const meetingLayoutDidChange = meetingLayout !== prevProps.meetingLayout;
    const pushLayoutMeetingDidChange = pushLayoutMeeting !== prevProps.pushLayoutMeeting;
    const enforceLayoutDidChange = enforceLayout !== prevProps.enforceLayout;
    const shouldSwitchLayout = isPresenter
      ? meetingLayoutDidChange || enforceLayoutDidChange
      : ((meetingLayoutDidChange || pushLayoutMeetingDidChange) && pushLayoutMeeting)
        || enforceLayoutDidChange;
    const Settings = getSettingsSingletonInstance();

    if (shouldSwitchLayout) {
      let contextLayout = enforceLayout || meetingLayout;
      if (isMobile()) {
        if (contextLayout === 'custom') {
          contextLayout = 'smart';
        }
      }

      layoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_TYPE,
        value: contextLayout,
      });

      updateSettings({
        application: {
          ...Settings.application,
          selectedLayout: contextLayout,
        },
      }, null, setLocalSettings);
    }

    if (!enforceLayout && pushLayoutMeetingDidChange) {
      updateSettings({
        application: {
          ...Settings.application,
          pushLayout: pushLayoutMeeting,
        },
      }, null, setLocalSettings);
    }

    if (meetingLayout === 'custom' && selectedLayout === 'custom' && !isPresenter) {
      if (meetingLayoutFocusedCamera !== prevProps.meetingLayoutFocusedCamera
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {
        layoutContextDispatch({
          type: ACTIONS.SET_FOCUSED_CAMERA_ID,
          value: meetingLayoutFocusedCamera,
        });
      }

      if (meetingLayoutCameraPosition !== prevProps.meetingLayoutCameraPosition
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {
        layoutContextDispatch({
          type: ACTIONS.SET_CAMERA_DOCK_POSITION,
          value: meetingLayoutCameraPosition,
        });
      }

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
        });
      }

      if (meetingPresentationIsOpen !== prevProps.meetingPresentationIsOpen
        || meetingLayoutUpdatedAt !== prevProps.meetingLayoutUpdatedAt) {
        layoutContextDispatch({
          type: ACTIONS.SET_PRESENTATION_IS_OPEN,
          value: meetingPresentationIsOpen,
        });
      }
    }

    const layoutChanged = presentationIsOpen !== prevProps.presentationIsOpen
      || selectedLayout !== prevProps.selectedLayout
      || cameraIsResizing !== prevProps.cameraIsResizing
      || cameraPosition !== prevProps.cameraPosition
      || focusedCamera !== prevProps.focusedCamera
      || enforceLayout !== prevProps.enforceLayout
      || !equalDouble(presentationVideoRate, prevProps.presentationVideoRate);

    // push layout once after presenter toggles
    // special case where we set pushLayout to false in all viewers
    if (pushLayout !== prevProps.pushLayout) {
      if (isModerator) {
        setPushLayout(pushLayout);
      }
    }

    // change layout sizes / states
    if ((pushLayout && layoutChanged) || pushLayout !== prevProps.pushLayout) {
      if (isPresenter) {
        setMeetingLayout();
      }
    }

    if (selectedLayout !== prevProps.selectedLayout) {
      Session.setItem('isGridEnabled', selectedLayout === LAYOUT_TYPE.VIDEO_FOCUS);
    }
  });

  return null;
};

const PushLayoutEngineContainer = (props) => {
  const cameraDockOutput = layoutSelectOutput((i) => i.cameraDock);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const presentationInput = layoutSelectInput((i) => i.presentation);
  const layoutContextDispatch = layoutDispatch();

  const applicationSettings = useSettings(SETTINGS.APPLICATION);
  const {
    selectedLayout,
    pushLayout,
  } = applicationSettings;

  const {
    width: cameraWidth,
    height: cameraHeight,
    position: cameraPosition,
    focusedId: focusedCamera,
  } = cameraDockOutput;

  const {
    isResizing: cameraIsResizing,
  } = cameraDockInput;

  const horizontalPosition = cameraPosition === 'contentLeft' || cameraPosition === 'contentRight';

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    layout: m.layout,
  }));
  const meetingLayout = LAYOUT_TYPE[currentMeeting?.layout.currentLayoutType];
  const meetingLayoutUpdatedAt = new Date(currentMeeting?.layout.updatedAt).getTime();
  const {
    propagateLayout: pushLayoutMeeting,
    cameraDockIsResizing: isMeetingLayoutResizing,
    cameraDockPlacement: meetingLayoutCameraPosition,
    cameraDockAspectRatio: meetingLayoutVideoRate,
    cameraWithFocus: meetingLayoutFocusedCamera,
    presentationMinimized: meetingPresentationMinimized,
  } = (currentMeeting?.layout || {});

  const { isOpen: presentationIsOpen } = presentationInput;

  const { data: currentUserData } = useCurrentUser((user) => ({
    enforceLayout: user.enforceLayout,
    isModerator: user.isModerator,
    presenter: user.presenter,
  }));
  const isModerator = currentUserData?.isModerator;
  const isPresenter = currentUserData?.presenter;

  const presentationVideoRate = calculatePresentationVideoRate(cameraDockOutput);

  const setLocalSettings = useUserChangedLocalSettings();
  const setPushLayout = usePushLayoutUpdater(pushLayout);
  const setMeetingLayout = useMeetingLayoutUpdater(
    cameraDockOutput,
    cameraDockInput,
    presentationInput,
    applicationSettings,
  );

  const validateEnforceLayout = (currUser) => {
    const layoutTypes = Object.keys(LAYOUT_TYPE);
    const enforceLayout = currUser?.enforceLayout;
    return enforceLayout && layoutTypes.includes(enforceLayout) ? enforceLayout : null;
  };

  const enforceLayout = validateEnforceLayout(currentUserData);
  const meetingPresentationIsOpen = !meetingPresentationMinimized;

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
        enforceLayout,
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
        presentationIsOpen,
        presentationVideoRate,
        pushLayout,
        selectedLayout,
        setMeetingLayout,
        setPushLayout,
        ...props,
      }}
    />
  );
};

PushLayoutEngine.propTypes = propTypes;

export default PushLayoutEngineContainer;
