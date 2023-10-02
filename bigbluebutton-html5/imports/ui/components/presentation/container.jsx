import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { notify } from '/imports/ui/services/notification';
import Presentation from '/imports/ui/components/presentation/component';
import PresentationToolbarService from './presentation-toolbar/service';
import { UsersContext } from '../components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
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
import { useSubscription } from '@apollo/client';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CURRENT_PAGE_WRITERS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import POLL_SUBSCRIPTION from '/imports/ui/core/graphql/queries/pollSubscription';

const PresentationContainer = ({
  presentationIsOpen, presentationPodIds, mountPresentation, layoutType, currentSlide, ...props
}) => {
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const presentation = layoutSelectOutput((i) => i.presentation);
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

  if (!currentSlide) return null;

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
        currentSlide,
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
    const { data: presentationPageData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
    const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
    const currentPresentationPage = presentationPageArray && presentationPageArray[0];
    const slideImageUrls = currentPresentationPage && JSON.parse(currentPresentationPage.urls);

    const { data: whiteboardWritersData } = useSubscription(CURRENT_PAGE_WRITERS_SUBSCRIPTION);
    const whiteboardWriters = whiteboardWritersData?.pres_page_writers || [];

    const multiUserData = {
      active: whiteboardWriters?.length > 0,
      size: whiteboardWriters?.length || 0,
      hasAccess: whiteboardWriters?.some((writer) => writer.userId === Auth.userID),
    };

    const { data: pollData } = useSubscription(POLL_SUBSCRIPTION);
    const poll = pollData?.poll[0] || {};

    const currentSlide = currentPresentationPage ? {
      content: currentPresentationPage.content,
      current: currentPresentationPage.isCurrentPage,
      height: currentPresentationPage.height,
      width: currentPresentationPage.width,
      id: currentPresentationPage.pageId,
      imageUri: slideImageUrls.svg,
      num: currentPresentationPage?.num,
      podId: 'DEFAULT_PRESENTATION_POD', // TODO: remove this when is not needed anymore
      presentationId: currentPresentationPage?.presentationId,
      svgUri: slideImageUrls?.svg,
    } : null;

    const numPages = currentPresentationPage?.numPages;
    const presentationIsDownloadable = currentPresentationPage?.downloadable;
    const isViewersCursorLocked = userLocks?.hideViewersCursor;
    const isViewersAnnotationsLocked = userLocks?.hideViewersAnnotation;

    let slidePosition;
    if (currentSlide) {
      const { presentationId } = currentSlide;

      slidePosition = {
        height: currentPresentationPage.scaledHeight,
        id: currentPresentationPage.pageId,
        podId: currentSlide.podId,
        presentationId: currentPresentationPage.presentationId,
        viewBoxHeight: currentPresentationPage.scaledViewBoxHeight,
        viewBoxWidth: currentPresentationPage.scaledViewBoxWidth,
        width: currentPresentationPage.scaledWidth,
        x: currentPresentationPage.xOffset,
        y: currentPresentationPage.yOffset,
      };

      if (PRELOAD_NEXT_SLIDE && !fetchedpresentation[presentationId]) {
        fetchedpresentation[presentationId] = {
          canFetch: true,
          fetchedSlide: {},
        };
      }
      const presentation = fetchedpresentation[presentationId];

      if (PRELOAD_NEXT_SLIDE
        && !presentation.fetchedSlide[currentSlide.num + PRELOAD_NEXT_SLIDE]
        && presentation.canFetch) {
        // TODO: preload next slides should be reimplemented in graphql
        const slidesToFetch = [currentPresentationPage];

        const promiseImageGet = slidesToFetch
          .filter((s) => !fetchedpresentation[presentationId].fetchedSlide[s.num])
          .map(async (slide) => {
            const slideUrls = JSON.parse(slide.urls);
            if (presentation.canFetch) presentation.canFetch = false;
            const image = await fetch(slideUrls.svg);
            if (image.ok) {
              presentation.fetchedSlide[slide.num] = true;
            }
          });
        Promise.all(promiseImageGet).then(() => {
          presentation.canFetch = true;
        });
      }
    }

    // TODO: add to graphql
    const isInitialPresentation = currentPresentationPage?.isInitialPresentation || false;
    const presentationName = currentPresentationPage?.presentationName || 'Presentation';

    return {
      currentSlide,
      slidePosition,
      downloadPresentationUri: currentPresentationPage?.downloadFileUri,
      multiUser: (multiUserData.hasAccess || multiUserData.active) && presentationIsOpen,
      presentationIsDownloadable,
      mountPresentation: !!currentSlide,
      currentPresentationId: currentPresentationPage?.presentationId,
      numPages,
      notify,
      zoomSlide: PresentationToolbarService.zoomSlide,
      podId,
      publishedPoll: poll?.published || false,
      restoreOnUpdate: getFromUserSettings(
        'bbb_force_restore_presentation_on_new_events',
        Meteor.settings.public.presentation.restoreOnUpdate,
      ),
      addWhiteboardGlobalAccess: WhiteboardService.addGlobalAccess,
      removeWhiteboardGlobalAccess: WhiteboardService.removeGlobalAccess,
      multiUserSize: multiUserData.size,
      isViewersCursorLocked,
      setPresentationIsOpen: MediaService.setPresentationIsOpen,
      isViewersAnnotationsLocked,
      isInitialPresentation,
      presentationName,
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
