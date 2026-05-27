import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
} from 'react';
import PropTypes from 'prop-types';
import { notify } from '/imports/ui/services/notification';
import Presentation from '/imports/ui/components/presentation/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Auth from '/imports/ui/services/auth';
import {
  useMutation, useSubscription, useQuery,
} from '@apollo/client';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';
import { DEVICE_TYPE, ACTIONS } from '/imports/ui/components/layout/enums';
import MediaService from '../media/service';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CURRENT_PAGE_WRITERS_SUBSCRIPTION,
  ANNOTATION_HISTORY_STREAM,
  CURRENT_PAGE_ANNOTATIONS_QUERY,
} from '/imports/ui/components/whiteboard/queries';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { PRESENTATION_SET_ZOOM, USER_SET_WHITEBOARD_WRITE_ACCESS } from './mutations';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import usePresentationFitToWidth from '/imports/ui/components/presentation/hooks/usePresentationFitToWidth';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';

const fetchedpresentation = {};
const FORCE_RESTORE_PRESENTATION_ON_NEW_EVENTS = 'bbb_force_restore_presentation_on_new_events';

const PresentationContainer = ({
  presentationIsOpen = true,
  darkTheme,
}) => {
  const [annotationStreamData, setAnnotationStreamData] = useState([]);
  const layoutContextDispatch = layoutDispatch();
  const { selectedLayout } = useSettings(SETTINGS.LAYOUT);

  const {
    data: presentationPageData,
    loading: loadingPresentationPageData,
  } = useDeduplicatedSubscription(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );

  const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
  const currentPresentationPage = presentationPageArray?.[0];
  const slideSvgUrl = currentPresentationPage?.svgUrl
    ? Auth.authenticateURL(currentPresentationPage.svgUrl) : undefined;
  const currentPageId = currentPresentationPage?.pageId;
  const currentPresentationId = currentPresentationPage?.presentationId;
  const prevPresentationId = usePreviousValue(currentPresentationId);

  const {
    data: currentMeeting,
    loading: loadingMeeting,
  } = useMeeting((m) => ({
    createdTime: m.createdTime,
    isBreakout: m.isBreakout,
    usersPolicies: m.usersPolicies,
  }));

  // Track whether the presentation was closed by this effect (no page available),
  // so it can be re-opened when a page becomes available again (e.g. after a
  // pre-uploaded presentation finishes converting on slow CI machines).
  const closedDueToAbsentPresentation = useRef(false);

  useEffect(() => {
    // close presentation if there isn't any
    // case when the presentation has been manually removed in the media area drop up
    // or when defaultUploadedPresentation is null in bigbluebutton.properties
    if (loadingPresentationPageData || loadingMeeting) return;
    if (!currentPageId && !currentMeeting?.isBreakout) {
      closedDueToAbsentPresentation.current = true;
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: false,
      });
    } else if (currentPageId && closedDueToAbsentPresentation.current) {
      // restore presentation when a page becomes available after having been absent
      // (e.g. preUploadedPresentationOverrideDefault=true on a slow server)
      closedDueToAbsentPresentation.current = false;
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: true,
      });
    }
  }, [currentPageId, loadingPresentationPageData, loadingMeeting, currentMeeting?.isBreakout]);

  const { data: whiteboardWritersData } = useDeduplicatedSubscription(
    CURRENT_PAGE_WRITERS_SUBSCRIPTION,
    {
      skip: !currentPresentationPage?.pageId,
    },
  );

  const restoreOnUpdate = getFromUserSettings(
    FORCE_RESTORE_PRESENTATION_ON_NEW_EVENTS,
    window.meetingClientSettings.public.presentation.restoreOnUpdate,
  );

  const { data: initialPageAnnotations, refetch: refetchInitialPageAnnotations } = useQuery(
    CURRENT_PAGE_ANNOTATIONS_QUERY,
    {
      variables: { pageId: currentPageId },
      skip: !currentPageId,
    },
  );

  const lastUpdatedAt = useMemo(() => {
    if (!initialPageAnnotations) return null;

    if (!initialPageAnnotations?.pres_annotation_curr?.length) {
      return currentMeeting?.createdTime
        ? new Date(currentMeeting.createdTime).toISOString()
        : null;
    }
    return initialPageAnnotations.pres_annotation_curr.reduce((latest, annotation) => {
      const updatedAt = new Date(annotation.lastUpdatedAt);
      return updatedAt > latest ? updatedAt : latest;
    }, new Date(0)).toISOString();
  }, [initialPageAnnotations, currentMeeting?.createdTime]);

  const canStream = !!lastUpdatedAt;

  useSubscription(ANNOTATION_HISTORY_STREAM, {
    variables: { pageId: currentPageId, updatedAt: lastUpdatedAt },
    skip: !currentPageId || !canStream,
    onData: ({ data: subscriptionData }) => {
      const annotationStream = subscriptionData.data?.pres_annotation_history_curr_stream || [];
      if (annotationStream.length > 0 && restoreOnUpdate && !presentationIsOpen) {
        MediaService.setPresentationIsOpen(layoutContextDispatch, true);
      }
      setAnnotationStreamData(annotationStream);
    },
  });

  const [presentationSetZoom] = useMutation(PRESENTATION_SET_ZOOM);
  const [fitToWidth, setPresentationFitToWidth] = usePresentationFitToWidth();
  const [userSetWhiteboardWriteAccess] = useMutation(USER_SET_WHITEBOARD_WRITE_ACCESS);

  const APP_CONFIG = window.meetingClientSettings.public.app;
  const PRELOAD_NEXT_SLIDE = APP_CONFIG.preloadNextSlides;

  const setMultiUserWhiteboardEnabled = () => {
    userSetWhiteboardWriteAccess({
      variables: {
        userIds: [],
        allUsers: true,
        whiteboardWriteAccess: true,
      },
    });
  };

  const setMultiUserWhiteboardDisabled = () => {
    userSetWhiteboardWriteAccess({
      variables: {
        userIds: [],
        allUsers: true,
        whiteboardWriteAccess: false,
      },
    });
  };

  const zoomSlide = useCallback((widthRatio, heightRatio, xOffset, yOffset) => {
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
  }, [currentPresentationPage, presentationSetZoom]);

  const meeting = useMeeting((m) => ({
    lockSettings: m?.lockSettings,
  }));

  const isViewersAnnotationsLocked = meeting ? meeting.lockSettings?.hideViewersAnnotation : true;

  const multiUserData = {
    active: whiteboardWritersData?.user_whiteboardWriteAccess?.filter(
      (u) => !u.presenter,
    ).length > 0,
    size: whiteboardWritersData?.user_whiteboardWriteAccess?.length || 0,
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
        .map((url) => ({ svgUrl: Auth.authenticateURL(url) }));
      const slidesToFetch = nextSlidesSvgUrl;

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
  const isRTL = layoutSelect((i) => i.isRTL);
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
    whiteboardWriteAccess: user.whiteboardWriteAccess,
  }));
  const userIsPresenter = currentUser?.presenter;

  const presentationAreaSize = {
    presentationAreaWidth: presentation?.width,
    presentationAreaHeight: presentation?.height,
  };

  const shouldRestoreOnUpdate = userIsPresenter
    && currentPresentationId === prevPresentationId ? false : restoreOnUpdate;

  if (layoutType === 'videoFocus' && presentation?.width === 0) return null;

  const multiUserWhiteboardEnabled = currentMeeting?.usersPolicies?.multiUserWhiteboardEnabled
    ?? false;

  return (
    <Presentation
      {
        ...{
          layoutContextDispatch,
          numCameras,
          presentationIsOpen,
          setPresentationFitToWidth,
          fitToWidth,
          darkTheme,
          userIsPresenter,
          isRTL,
          presentationBounds: presentation,
          fullscreenContext,
          fullscreenElementId,
          isMobile: deviceType === DEVICE_TYPE.MOBILE,
          isTabledLandscape: deviceType === DEVICE_TYPE.TABLET_LANDSCAPE,
          isIphone,
          currentSlide,
          slidePosition,
          hasWBAccess: currentUser?.whiteboardWriteAccess,
          downloadPresentationUri: currentPresentationPage?.downloadFileUri
            ? Auth.authenticateURL(`${APP_CONFIG.bbbWebBase}/${currentPresentationPage.downloadFileUri}`)
            : undefined,
          multiUser: (multiUserWhiteboardEnabled || multiUserData.active) && presentationIsOpen,
          presentationIsDownloadable: currentPresentationPage?.downloadable,
          mountPresentation: !!currentSlide,
          currentPresentationId: currentPresentationPage?.presentationId,
          totalPages: currentPresentationPage?.totalPages || 0,
          notify,
          zoomSlide,
          restoreOnUpdate: shouldRestoreOnUpdate,
          setMultiUserWhiteboardEnabled,
          setMultiUserWhiteboardDisabled,
          multiUserSize: multiUserData.size,
          isViewersAnnotationsLocked,
          setPresentationIsOpen: MediaService.setPresentationIsOpen,
          isDefaultPresentation: currentPresentationPage?.isDefaultPresentation,
          presentationAreaSize,
          currentUser,
          currentPresentationPage,
          layoutType: selectedLayout || '',
          annotationStreamData,
          initialPageAnnotations,
          refetchInitialPageAnnotations,
        }
      }
    />
  );
};

export default memo(PresentationContainer);

PresentationContainer.propTypes = {
  presentationIsOpen: PropTypes.bool,
  darkTheme: PropTypes.bool.isRequired,
};
