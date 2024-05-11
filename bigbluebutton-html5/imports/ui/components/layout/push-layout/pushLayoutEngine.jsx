import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Settings from '/imports/ui/services/settings';
import MediaService from '/imports/ui/components/media/service';
import { LAYOUT_TYPE, ACTIONS } from '../enums';
import { isMobile } from '../utils';
import { updateSettings } from '/imports/ui/components/settings/service';
import { Session } from 'meteor/session';

const HIDE_PRESENTATION = window.meetingClientSettings.public.layout.hidePresentationOnJoin;

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

class PushLayoutEngine extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {
      cameraWidth,
      cameraHeight,
      horizontalPosition,
      layoutContextDispatch,
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
    } = this.props;

    const changeLayout = LAYOUT_TYPE[getFromUserSettings('bbb_change_layout', null)];
    const defaultLayout = LAYOUT_TYPE[getFromUserSettings('bbb_default_layout', null)];
    const enforcedLayout = LAYOUT_TYPE[enforceLayout] || null;

    Settings.application.selectedLayout = enforcedLayout
      || changeLayout
      || defaultLayout
      || meetingLayout;

    let { selectedLayout } = Settings.application;
    if (isMobile()) {
      selectedLayout = selectedLayout === 'custom' ? 'smart' : selectedLayout;
      Settings.application.selectedLayout = selectedLayout;
    }
    Session.set('isGridEnabled', selectedLayout === LAYOUT_TYPE.VIDEO_FOCUS);

    Settings.save(setLocalSettings);

    const shouldOpenPresentation = shouldShowScreenshare || shouldShowExternalVideo;
    let presentationIsOpen = !getFromUserSettings('bbb_hide_presentation_on_join', HIDE_PRESENTATION);
    presentationIsOpen = pushLayoutMeeting ? meetingPresentationIsOpen : presentationIsOpen;
    presentationIsOpen = shouldOpenPresentation || presentationIsOpen;
    MediaService.setPresentationIsOpen(layoutContextDispatch, presentationIsOpen);
    Session.set('presentationLastState', presentationIsOpen);

    if (selectedLayout === 'custom') {
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
          let w, h;
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
            }
          });
        }
      }, 0);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      cameraWidth,
      cameraHeight,
      cameraIsResizing,
      cameraPosition,
      focusedCamera,
      horizontalPosition,
      isMeetingLayoutResizing,
      isModerator,
      isPresenter,
      layoutContextDispatch,
      meetingLayout,
      meetingLayoutUpdatedAt,
      meetingPresentationIsOpen,
      meetingLayoutCameraPosition,
      meetingLayoutFocusedCamera,
      meetingLayoutVideoRate,
      presentationIsOpen,
      presentationVideoRate,
      pushLayout,
      pushLayoutMeeting,
      selectedLayout,
      setMeetingLayout,
      setPushLayout,
      enforceLayout,
      setLocalSettings,
    } = this.props;

    const meetingLayoutDidChange = meetingLayout !== prevProps.meetingLayout;
    const pushLayoutMeetingDidChange = pushLayoutMeeting !== prevProps.pushLayoutMeeting;
    const enforceLayoutDidChange = enforceLayout !== prevProps.enforceLayout;
    const shouldSwitchLayout = isPresenter
      ? meetingLayoutDidChange || enforceLayoutDidChange
      : ((meetingLayoutDidChange || pushLayoutMeetingDidChange) && pushLayoutMeeting) || enforceLayoutDidChange;

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

    if (meetingLayout === "custom" && selectedLayout === "custom" && !isPresenter) {

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

        let w, h;
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
          }
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

    if (pushLayout !== prevProps.pushLayout) { // push layout once after presenter toggles / special case where we set pushLayout to false in all viewers
      if (isModerator) {
        setPushLayout(pushLayout);
      }
    }

    if (pushLayout && layoutChanged || pushLayout !== prevProps.pushLayout) { // change layout sizes / states
      if (isPresenter) {
        setMeetingLayout();
      }
    }

    if (selectedLayout !== prevProps.selectedLayout) {
      Session.set('isGridEnabled', selectedLayout === LAYOUT_TYPE.VIDEO_FOCUS);
    }
  }

  render() {
    return null;
  }
};

PushLayoutEngine.propTypes = propTypes;

export default PushLayoutEngine;
