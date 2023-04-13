import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { notify } from '/imports/ui/services/notification';
import PresentationService from './service';
import { Slides } from '/imports/api/slides';
import Presentation from '/imports/ui/components/presentation/component';
import PresentationToolbarService from './presentation-toolbar/service';
import { UsersContext } from '../components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import getFromUserSettings from '/imports/ui/services/users-settings';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import WhiteboardService from '/imports/ui/components/whiteboard/service';
import { DEVICE_TYPE } from '../layout/enums';
import MediaService from '../media/service';

const PresentationContainer = ({
  presentationIsOpen, presentationPodIds, mountPresentation, ...props
}) => {
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const presentation = layoutSelectOutput((i) => i.presentation);
  const layoutType = layoutSelect((i) => i.layoutType);
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const deviceType = layoutSelect((i) => i.deviceType);
  const layoutContextDispatch = layoutDispatch();

  const { numCameras } = cameraDock;
  const { element } = fullscreen;
  const fullscreenElementId = 'Presentation';
  const fullscreenContext = (element === fullscreenElementId);

  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const userIsPresenter = currentUser.presenter;

  return (
    <Presentation
      {
      ...{
        layoutContextDispatch,
        numCameras,
        ...props,
        userIsPresenter,
        presentationBounds: presentation,
        layoutType,
        fullscreenContext,
        fullscreenElementId,
        isMobile: deviceType === DEVICE_TYPE.MOBILE,
        isIphone,
        presentationIsOpen,
      }
      }
    />
  );
};

const APP_CONFIG = Meteor.settings.public.app;
const PRELOAD_NEXT_SLIDE = APP_CONFIG.preloadNextSlides;
const fetchedpresentation = {};

export default lockContextContainer(
  withTracker(({ podId, presentationIsOpen, userLocks }) => {
    const currentSlide = PresentationService.getCurrentSlide(podId);
    const numPages = PresentationService.getSlidesLength(podId);
    const presentationIsDownloadable = PresentationService.isPresentationDownloadable(podId);
    const isViewersCursorLocked = userLocks?.hideViewersCursor;

    let slidePosition;
    if (currentSlide) {
      const {
        presentationId,
        id: slideId,
      } = currentSlide;
      slidePosition = PresentationService.getSlidePosition(podId, presentationId, slideId);
      if (PRELOAD_NEXT_SLIDE && !fetchedpresentation[presentationId]) {
        fetchedpresentation[presentationId] = {
          canFetch: true,
          fetchedSlide: {},
        };
      }
      const currentSlideNum = currentSlide.num;
      const presentation = fetchedpresentation[presentationId];

      if (PRELOAD_NEXT_SLIDE
        && !presentation.fetchedSlide[currentSlide.num + PRELOAD_NEXT_SLIDE]
        && presentation.canFetch) {
        const slidesToFetch = Slides.find({
          podId,
          presentationId,
          num: {
            $in: Array(PRELOAD_NEXT_SLIDE).fill(1).map((v, idx) => currentSlideNum + (idx + 1)),
          },
        }).fetch();

        const promiseImageGet = slidesToFetch
          .filter((s) => !fetchedpresentation[presentationId].fetchedSlide[s.num])
          .map(async (slide) => {
            if (presentation.canFetch) presentation.canFetch = false;
            const image = await fetch(slide.imageUri);
            if (image.ok) {
              presentation.fetchedSlide[slide.num] = true;
            }
          });
        Promise.all(promiseImageGet).then(() => {
          presentation.canFetch = true;
        });
      }
    }
    const currentPresentation = PresentationService.getCurrentPresentation(podId);
    return {
      currentSlide,
      slidePosition,
      downloadPresentationUri: PresentationService.downloadPresentationUri(podId),
      multiUser:
        (WhiteboardService.hasMultiUserAccess(currentSlide && currentSlide.id, Auth.userID)
          || WhiteboardService.isMultiUserActive(currentSlide?.id)
        ) && presentationIsOpen,
      presentationIsDownloadable,
      mountPresentation: !!currentSlide,
      currentPresentation,
      currentPresentationId: currentPresentation?.id,
      numPages,
      notify,
      zoomSlide: PresentationToolbarService.zoomSlide,
      podId,
      publishedPoll: Meetings.findOne({ meetingId: Auth.meetingID }, {
        fields: {
          publishedPoll: 1,
        },
      }).publishedPoll,
      restoreOnUpdate: getFromUserSettings(
        'bbb_force_restore_presentation_on_new_events',
        Meteor.settings.public.presentation.restoreOnUpdate,
      ),
      addWhiteboardGlobalAccess: WhiteboardService.addGlobalAccess,
      removeWhiteboardGlobalAccess: WhiteboardService.removeGlobalAccess,
      multiUserSize: WhiteboardService.getMultiUserSize(currentSlide?.id),
      isViewersCursorLocked,
      setPresentationIsOpen: MediaService.setPresentationIsOpen,
    };
  })(PresentationContainer),
);

PresentationContainer.propTypes = {
  presentationPodIds: PropTypes.arrayOf(PropTypes.shape({
    podId: PropTypes.string.isRequired,
  })).isRequired,
  presentationIsOpen: PropTypes.bool.isRequired,
  mountPresentation: PropTypes.bool.isRequired,
};
