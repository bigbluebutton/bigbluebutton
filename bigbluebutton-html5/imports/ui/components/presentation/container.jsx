import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { notify } from '/imports/ui/services/notification';
import Presentation from '/imports/ui/components/presentation/component';
import Auth from '/imports/ui/services/auth';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { useMutation, useLazyQuery } from '@apollo/client';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';
import { DEVICE_TYPE } from '../layout/enums';
import MediaService from '../media/service';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CURRENT_PAGE_WRITERS_SUBSCRIPTION,
  CURRENT_PAGE_ANNOTATIONS_STREAM,
} from '/imports/ui/components/whiteboard/queries';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { PRESENTATION_SET_ZOOM, PRESENTATION_SET_WRITERS } from './mutations';
import { GET_USER_IDS } from '/imports/ui/core/graphql/queries/users';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';

const fetchedpresentation = {};

const PresentationContainer = (props) => {
  const presentationIsOpen = props?.presentationIsOpen ?? true;
  const layoutContextDispatch = layoutDispatch();
  const { selectedLayout } = useSettings(SETTINGS.APPLICATION);

  const { data: presentationPageData } = useDeduplicatedSubscription(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );

  const { data: annotationStreamData } = useDeduplicatedSubscription(
    CURRENT_PAGE_ANNOTATIONS_STREAM,
    {
      variables: { lastUpdatedAt: new Date(0).toISOString() },
    },
  );

  useEffect(() => {
    if (
      (
        annotationStreamData?.pres_annotation_curr_stream
        && annotationStreamData.pres_annotation_curr_stream.length > 0)
      && !presentationIsOpen) {
      MediaService.setPresentationIsOpen(layoutContextDispatch, true);
    }
  }, [annotationStreamData]);

  const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
  const currentPresentationPage = presentationPageArray && presentationPageArray[0];
  const slideSvgUrl = currentPresentationPage && currentPresentationPage.svgUrl;

  const { data: whiteboardWritersData } = useDeduplicatedSubscription(
    CURRENT_PAGE_WRITERS_SUBSCRIPTION,
    {
      variables: { pageId: currentPresentationPage?.pageId },
      skip: !currentPresentationPage?.pageId,
    },
  );

  const whiteboardWriters = whiteboardWritersData?.pres_page_writers || [];

  const [presentationSetZoom] = useMutation(PRESENTATION_SET_ZOOM);
  const [presentationSetWriters] = useMutation(PRESENTATION_SET_WRITERS);

  const [getUsers, { data: usersData }] = useLazyQuery(GET_USER_IDS, { fetchPolicy: 'no-cache' });
  const users = usersData?.user || [];

  const APP_CONFIG = window.meetingClientSettings.public.app;
  const PRELOAD_NEXT_SLIDE = APP_CONFIG.preloadNextSlides;

  const addWhiteboardGlobalAccess = () => {
    const usersIds = users.map((user) => user.userId);
    const { pageId } = currentPresentationPage;

    presentationSetWriters({
      variables: {
        pageId,
        usersIds,
      },
    });
  };

  // users will only be fetched when getUsers is called
  useEffect(() => {
    if (users.length > 0) {
      addWhiteboardGlobalAccess();
    }
  }, [users]);

  const removeWhiteboardGlobalAccess = () => {
    const { pageId } = currentPresentationPage;

    presentationSetWriters({
      variables: {
        pageId,
        usersIds: [],
      },
    });
  };

  const zoomSlide = (widthRatio, heightRatio, xOffset, yOffset) => {
    const { presentationId, pageId, num } = currentPresentationPage;

    presentationSetZoom({
      variables: {
        presentationId,
        pageId,
        pageNum: num,
        xOffset,
        yOffset,
        widthRatio,
        heightRatio,
      },
    });
  };

  const meeting = useMeeting((m) => ({
    lockSettings: m?.lockSettings,
  }));

  const isViewersAnnotationsLocked = meeting ? meeting.lockSettings?.hideViewersAnnotation : true;

  const multiUserData = {
    active: whiteboardWriters?.length > 0,
    size: whiteboardWriters?.length || 0,
    hasAccess: whiteboardWriters?.some((writer) => writer.userId === Auth.userID),
  };

  const currentSlide = currentPresentationPage ? {
    content: currentPresentationPage.content,
    current: currentPresentationPage.isCurrentPage,
    height: currentPresentationPage.height,
    width: currentPresentationPage.width,
    id: currentPresentationPage.pageId,
    imageUri: slideSvgUrl,
    num: currentPresentationPage?.num,
    presentationId: currentPresentationPage?.presentationId,
    svgUri: slideSvgUrl,
    infiniteWhiteboard: currentPresentationPage.infiniteWhiteboard,
  } : null;

  let slidePosition;
  if (currentSlide) {
    const { presentationId } = currentSlide;

    slidePosition = {
      height: currentPresentationPage.scaledHeight,
      id: currentPresentationPage.pageId,
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
      const nextSlidesSvgUrl = (currentPresentationPage.nextPagesSvg || [])
        .map((url) => ({ svgUrl: url }));
      const slidesToFetch = [
        currentPresentationPage,
        ...nextSlidesSvgUrl,
      ];

      const promiseImageGet = slidesToFetch
        .filter((s) => !fetchedpresentation[presentationId].fetchedSlide[s.svgUrl])
        .map(async (slide) => {
          if (presentation.canFetch) presentation.canFetch = false;
          const image = await fetch(slide.svgUrl);
          if (image.ok) {
            presentation.fetchedSlide[slide.svgUrl] = true;
          }
        });
      Promise.all(promiseImageGet).then(() => {
        presentation.canFetch = true;
      });
    }
  }

  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const presentation = layoutSelectOutput((i) => i.presentation);
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const deviceType = layoutSelect((i) => i.deviceType);
  const layoutType = layoutSelect((i) => i.layoutType);

  const { numCameras } = cameraDock;
  const { element } = fullscreen;
  const fullscreenElementId = 'Presentation';
  const fullscreenContext = (element === fullscreenElementId);

  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  const { data: currentUser } = useCurrentUser((user) => ({
    presenter: user.presenter,
    userId: user.userId,
    isModerator: user.isModerator,
  }));
  const userIsPresenter = currentUser?.presenter;

  const presentationAreaSize = {
    presentationAreaWidth: presentation?.width,
    presentationAreaHeight: presentation?.height,
  };

  if (layoutType === 'videoFocus' && presentation?.width === 0) return null;

  return (
    <Presentation
      {
        ...{
          layoutContextDispatch,
          numCameras,
          ...props,
          userIsPresenter,
          presentationBounds: presentation,
          fullscreenContext,
          fullscreenElementId,
          isMobile: deviceType === DEVICE_TYPE.MOBILE,
          isIphone,
          currentSlide,
          slidePosition,
          hasWBAccess: multiUserData.hasAccess,
          downloadPresentationUri: `${APP_CONFIG.bbbWebBase}/${currentPresentationPage?.downloadFileUri}`,
          multiUser: (multiUserData.hasAccess || multiUserData.active) && presentationIsOpen,
          presentationIsDownloadable: currentPresentationPage?.downloadable,
          mountPresentation: !!currentSlide,
          currentPresentationId: currentPresentationPage?.presentationId,
          totalPages: currentPresentationPage?.totalPages || 0,
          notify,
          zoomSlide,
          restoreOnUpdate: getFromUserSettings(
            'bbb_force_restore_presentation_on_new_events',
            window.meetingClientSettings.public.presentation.restoreOnUpdate,
          ),
          addWhiteboardGlobalAccess: getUsers,
          removeWhiteboardGlobalAccess,
          multiUserSize: multiUserData.size,
          isViewersAnnotationsLocked,
          setPresentationIsOpen: MediaService.setPresentationIsOpen,
          isDefaultPresentation: currentPresentationPage?.isDefaultPresentation,
          presentationAreaSize,
          currentUser,
          currentPresentationPage,
          layoutType: selectedLayout || '',
        }
      }
    />
  );
};

export default PresentationContainer;

PresentationContainer.propTypes = {
  presentationIsOpen: PropTypes.bool,
};
