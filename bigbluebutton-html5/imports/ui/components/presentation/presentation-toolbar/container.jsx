import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { useIsInfiniteWhiteboardEnabled, useIsPollingEnabled, useIsQuizEnabled } from '/imports/ui/services/features';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { POLL_CREATE } from '/imports/ui/components/poll/mutations';
import { PRESENTATION_SET_ZOOM, PRESENTATION_SET_PAGE, PRESENTATION_SET_PAGE_INFINITE_WHITEBOARD } from '../mutations';
import PresentationToolbar from './component';
import Session from '/imports/ui/services/storage/in-memory';
import { useMeetingIsBreakout } from '/imports/ui/components/app/service';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';

const infiniteWhiteboardIcon = (isinfiniteWhiteboard) => {
  if (isinfiniteWhiteboard) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.6667 3H1.33333C1.14924 3 1 3.14924 1 3.33333V13.3333C1 13.5174
             1.14924 13.6667 1.33333 13.6667H14.6667C14.8508 13.6667 15 13.5174 15 13.3333V3.33333C15
             3.14924 14.8508 3 14.6667 3ZM1.33333 2C0.596954 2 0 2.59695 0 3.33333V13.3333C0 14.0697
             0.596953 14.6667 1.33333 14.6667H14.6667C15.403 14.6667 16 14.0697 16 13.3333V3.33333C16
             2.59695 15.403 2 14.6667 2H1.33333Z"
          fill="#4E5A66"
        />
        <path
          d="M12.875 11.875L9.125 8.125M9.125 8.125L9.125 10.9375M9.125 8.125L11.9375 8.125"
          stroke="#4E5A66"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.125 5.125L6.875 8.875M6.875 8.875L6.875 6.0625M6.875 8.875L4.0625 8.875"
          stroke="#4E5A66"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.6667 3H1.33333C1.14924 3 1 3.14924 1 3.33333V13.3333C1 13.5174
             1.14924 13.6667 1.33333 13.6667H14.6667C14.8508 13.6667 15 13.5174 15 13.3333V3.33333C15
             3.14924 14.8508 3 14.6667 3ZM1.33333 2C0.596954 2 0 2.59695 0 3.33333V13.3333C0 14.0697
             0.596953 14.6667 1.33333 14.6667H14.6667C15.403 14.6667 16 14.0697 16 13.3333V3.33333C16
             2.59695 15.403 2 14.6667 2H1.33333Z"
        fill="#4E5A66"
      />
      <path
        d="M9.125 8.125L12.875 11.875M12.875 11.875L12.875 9.0625M12.875 11.875L10.0625 11.875"
        stroke="#4E5A66"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.875 8.875L3.125 5.125M3.125 5.125L3.125 7.9375M3.125 5.125L5.9375 5.125"
        stroke="#4E5A66"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const PresentationToolbarContainer = (props) => {
  const pluginsContext = useContext(PluginsContext);
  const { pluginsExtensibleAreasAggregatedState } = pluginsContext;

  const WHITEBOARD_CONFIG = window.meetingClientSettings.public.whiteboard;
  const isQuizEnabled = useIsQuizEnabled();

  const {
    userIsPresenter,
    layoutSwapped,
    currentSlideNum,
    presentationId,
    numberOfSlides,
    currentSlide,
    currentPresentationPage,
  } = props;

  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);

  const [createPoll] = useMutation(POLL_CREATE);
  const [presentationSetZoom] = useMutation(PRESENTATION_SET_ZOOM);
  const [presentationSetPage] = useMutation(PRESENTATION_SET_PAGE);
  const [presentationSetPageInfiniteWhiteboard] = useMutation(
    PRESENTATION_SET_PAGE_INFINITE_WHITEBOARD,
  );

  const resetSlide = () => {
    const { pageId, num } = currentPresentationPage;
    presentationSetZoom({
      variables: {
        presentationId,
        pageId,
        pageNum: num,
        xOffset: 0,
        yOffset: 0,
        widthRatio: 100,
        heightRatio: 100,
      },
    });
  };

  const setPresentationPage = (pageId) => {
    presentationSetPage({
      variables: {
        presentationId,
        pageId,
      },
    });
  };

  const setPresentationPageInfiniteWhiteboard = (infiniteWhiteboard) => {
    const pageId = `${presentationId}/${currentSlideNum}`;
    presentationSetPageInfiniteWhiteboard({
      variables: {
        pageId,
        infiniteWhiteboard,
      },
    });
  };

  const skipToSlide = (slideNum) => {
    const slideId = `${presentationId}/${slideNum}`;
    setPresentationPage(slideId);
  };

  const previousSlide = () => {
    const prevSlideNum = currentSlideNum - 1;
    if (prevSlideNum < 1) {
      return;
    }
    skipToSlide(prevSlideNum);
  };

  const nextSlide = () => {
    const nextSlideNum = currentSlideNum + 1;
    if (nextSlideNum > numberOfSlides) {
      return;
    }
    skipToSlide(nextSlideNum);
  };

  const startPoll = (
    pollType,
    pollId,
    answers = [],
    question,
    multipleResponse = false,
    isQuiz = false,
    correctAnswer = '',
  ) => {
    Session.setItem('openPanel', 'poll');
    Session.setItem('forcePollOpen', true);

    if (window.meetingClientSettings.public.poll.quickPollConfirmationStep) {
      Session.setItem('quickPollVariables', {
        pollType,
        secretPoll: false,
        question,
        multipleResponse,
        answers,
        isQuiz: isQuizEnabled ? isQuiz : false,
        correctAnswer: isQuizEnabled ? correctAnswer : '',
      });
    } else {
      createPoll({
        variables: {
          pollType,
          pollId: `${pollId}/${new Date().getTime()}`,
          secretPoll: false,
          question,
          multipleResponse,
          answers,
          quiz: isQuizEnabled ? isQuiz : false,
          correctAnswer: isQuizEnabled ? correctAnswer : '',
        },
      });
    }

    window.dispatchEvent(new Event('panelChanged'));
  };

  const isPollingEnabled = useIsPollingEnabled();
  const meetingIsBreakout = useMeetingIsBreakout();
  const allowInfiniteWhiteboard = useIsInfiniteWhiteboardEnabled();
  const { data: countData } = useDeduplicatedSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION);
  const numberOfJoinedUsers = countData?.user_aggregate?.aggregate?.count || 0;

  if (userIsPresenter && !layoutSwapped) {
    // Only show controls if user is presenter and layout isn't swapped

    const pluginProvidedPresentationToolbarItems = pluginsExtensibleAreasAggregatedState
      ?.presentationToolbarItems;

    return (
      <PresentationToolbar
        {...props}
        amIPresenter={userIsPresenter}
        isPollingEnabled={isPollingEnabled}
        allowInfiniteWhiteboardInBreakouts={WHITEBOARD_CONFIG?.allowInfiniteWhiteboardInBreakouts}
        allowInfiniteWhiteboard={allowInfiniteWhiteboard}
        // TODO: Remove this
        isMeteorConnected
        maxNumberOfActiveUsers={WHITEBOARD_CONFIG.maxNumberOfActiveUsers}
        numberOfJoinedUsers={numberOfJoinedUsers}
        {...{
          pluginProvidedPresentationToolbarItems,
          handleToggleFullScreen,
          startPoll,
          previousSlide,
          nextSlide,
          skipToSlide,
          setPresentationPageInfiniteWhiteboard,
          currentSlide,
          currentPresentationPage,
          infiniteWhiteboardIcon,
          resetSlide,
          meetingIsBreakout,
        }}
      />
    );
  }
  return null;
};

export default PresentationToolbarContainer;

PresentationToolbarContainer.propTypes = {
  // Number of current slide being displayed
  currentSlideNum: PropTypes.number.isRequired,

  // Total number of slides in this presentation
  numberOfSlides: PropTypes.number.isRequired,

  // Actions required for the presenter toolbar
  layoutSwapped: PropTypes.bool,

  userIsPresenter: PropTypes.bool,
  presentationId: PropTypes.string,
  hasPoll: PropTypes.bool.isRequired,
  currentSlide: PropTypes.shape({
    content: PropTypes.string.isRequired,
    current: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    imageUri: PropTypes.string.isRequired,
    isInfiniteWhiteboard: PropTypes.bool,
    num: PropTypes.number.isRequired,
    presentationId: PropTypes.string.isRequired,
    svgUri: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
  }),
  currentPresentationPage: PropTypes.shape({
    pageId: PropTypes.string.isRequired,
    num: PropTypes.number.isRequired,
  }).isRequired,
};
