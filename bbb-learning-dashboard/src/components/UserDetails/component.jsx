import React, { useContext, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  FormattedMessage, FormattedNumber, FormattedTime, injectIntl,
} from 'react-intl';
import { UserDetailsContext } from './context';
import UserAvatar from '../UserAvatar';
import { getSumOfTime, tsToHHmmss, getActivityScore } from '../../services/UserService';
import { usePreviousValue } from '../../utils/hooks';
import { toCamelCase } from '../../utils/string';

const UserDatailsComponent = (props) => {
  const {
    isOpen, dispatch, user, dataJson, intl,
  } = props;

  const modalRef = useRef();
  const closeButtonRef = useRef();
  const wasModalOpen = usePreviousValue(isOpen);

  useEffect(() => {
    const keydownHandler = (e) => {
      if (e.code === 'Escape') dispatch({ type: 'closeModal' });
    };

    const focusHandler = () => {
      if (modalRef.current && document.activeElement) {
        if (!modalRef.current.contains(document.activeElement)) {
          closeButtonRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', keydownHandler);
    window.addEventListener('focus', focusHandler, true);

    return () => {
      window.removeEventListener('keydown', keydownHandler);
      window.removeEventListener('focus', focusHandler, true);
    };
  }, []);

  useEffect(() => {
    if (!wasModalOpen) closeButtonRef.current?.focus();
  });

  if (!isOpen) return null;

  const {
    createdOn, endedOn, polls, users,
  } = dataJson;

  const currTime = () => new Date().getTime();

  // Join and left times.
  const registeredTimes = Object.values(user.intIds).map((intId) => intId.registeredOn);
  const leftTimes = Object.values(user.intIds).map((intId) => intId.leftOn);
  const joinTime = Math.min(...registeredTimes);
  const leftTime = Math.max(...leftTimes);
  const isOnline = Object.values(user.intIds).some((intId) => intId.leftOn === 0);

  // Used in the calculation of the online loader.
  const sessionDuration = (endedOn || currTime()) - createdOn;
  const userStartOffsetTime = ((joinTime - createdOn) * 100) / sessionDuration;
  const userEndOffsetTime = isOnline
    ? 0
    : (((endedOn || currTime()) - leftTime) * 100) / sessionDuration;

  const allUsers = () => Object.values(users || {}).filter((currUser) => !currUser.isModerator);
  const allUsersArr = allUsers();

  // Here we count each poll vote in order to find out the most common answer.
  const pollVotesCount = Object.keys(polls || {}).reduce((prevPollVotesCount, pollId) => {
    const currPollVotesCount = { ...prevPollVotesCount };
    currPollVotesCount[pollId] = {};

    if (polls[pollId].anonymous) {
      polls[pollId].anonymousAnswers.forEach((answer) => {
        const answerLowerCase = answer.toLowerCase();
        if (currPollVotesCount[pollId][answerLowerCase] === undefined) {
          currPollVotesCount[pollId][answerLowerCase] = 1;
        } else {
          currPollVotesCount[pollId][answerLowerCase] += 1;
        }
      });

      return currPollVotesCount;
    }

    allUsersArr.forEach((currUser) => {
      if (currUser.answers[pollId] !== undefined) {
        const userAnswers = Array.isArray(currUser.answers[pollId])
          ? currUser.answers[pollId]
          : [currUser.answers[pollId]];

        userAnswers.forEach((answer) => {
          const answerLowerCase = answer.toLowerCase();
          if (currPollVotesCount[pollId][answerLowerCase] === undefined) {
            currPollVotesCount[pollId][answerLowerCase] = 1;
          } else {
            currPollVotesCount[pollId][answerLowerCase] += 1;
          }
        });
      }
    });

    return currPollVotesCount;
  }, {});

  const usersTalkTime = allUsersArr.map((currUser) => currUser.talk.totalTime);
  const usersMessages = allUsersArr.map((currUser) => currUser.totalOfMessages);
  const usersEmojis = allUsersArr.map((currUser) => currUser.emojis.filter((emoji) => emoji.name !== 'raiseHand').length);
  const usersRaiseHands = allUsersArr.map((currUser) => currUser.emojis.filter((emoji) => emoji.name === 'raiseHand').length);
  const usersAnswers = allUsersArr.map((currUser) => Object.values(currUser.answers || {}).length);
  const totalPolls = Object.values(polls || {}).length;

  function getPointsOfTalk(u) {
    const maxTalkTime = Math.max(...usersTalkTime);
    if (maxTalkTime > 0) {
      return (u.talk.totalTime / maxTalkTime) * 2;
    }
    return 0;
  }

  function getPointsOfChatting(u) {
    const maxMessages = Math.max(...usersMessages);
    if (maxMessages > 0) {
      return (u.totalOfMessages / maxMessages) * 2;
    }
    return 0;
  }

  function getPointsOfRaiseHand(u) {
    const maxRaiseHand = Math.max(...usersRaiseHands);
    const userRaiseHand = u.emojis.filter((emoji) => emoji.name === 'raiseHand').length;
    if (maxRaiseHand > 0) {
      return (userRaiseHand / maxRaiseHand) * 2;
    }
    return 0;
  }

  function getPointsofEmoji(u) {
    const maxEmojis = Math.max(...usersEmojis);
    const userEmojis = u.emojis.filter((emoji) => emoji.name !== 'raiseHand').length;
    if (maxEmojis > 0) {
      return (userEmojis / maxEmojis) * 2;
    }
    return 0;
  }

  function getPointsOfPolls(u) {
    if (totalPolls > 0) {
      return (Object.values(u.answers || {}).length / totalPolls) * 2;
    }
    return 0;
  }

  const talkTimeAverage = usersTalkTime
    .reduce((prev, curr) => prev + curr, 0) / (allUsersArr.length || 1);

  const messagesAverage = usersMessages
    .reduce((prev, curr) => prev + curr, 0) / (allUsersArr.length || 1);

  const emojisAverage = usersEmojis
    .reduce((prev, curr) => prev + curr, 0) / (allUsersArr.length || 1);

  const raiseHandsAverage = usersRaiseHands
    .reduce((prev, curr) => prev + curr, 0) / (allUsersArr.length || 1);

  const pollsAverage = usersAnswers
    .reduce((prev, curr) => prev + curr, 0) / (allUsersArr.length || 1);

  const activityPointsFunctions = {
    'Talk Time': getPointsOfTalk,
    Messages: getPointsOfChatting,
    Emojis: getPointsofEmoji,
    'Raise Hands': getPointsOfRaiseHand,
    'Poll Votes': getPointsOfPolls,
  };

  const averages = {
    'Talk Time': talkTimeAverage,
    Messages: messagesAverage,
    Emojis: emojisAverage,
    'Raise Hands': raiseHandsAverage,
    'Poll Votes': pollsAverage,
  };

  function renderPollItem(poll, answers) {
    const { anonymous: isAnonymous, question, pollId } = poll;
    const answersSorted = Object
      .entries(pollVotesCount[pollId])
      .sort(([, countA], [, countB]) => countB - countA);
    let mostCommonAnswer = answersSorted[0]?.[0];
    const mostCommonAnswerCount = answersSorted[0]?.[1];

    if (mostCommonAnswer && mostCommonAnswerCount) {
      const hasDraw = answersSorted[1]?.[1] === mostCommonAnswerCount;
      if (hasDraw) mostCommonAnswer = null;
    }

    const capitalizeFirstLetter = (text) => (
      String.fromCharCode(text.charCodeAt(0) - 32)
      + text.substring(1)
    );

    return (
      <tr className="p-6 flex flex-row justify-between items-center">
        <td className="min-w-[40%] text-ellipsis">{question}</td>
        { isAnonymous ? (
          <td
            className="min-w-[20%] grow text-center mx-3"
          >
            <span
              title={intl.formatMessage({
                id: 'app.learningDashboard.userDetails.anonymousAnswer',
                defaultMessage: 'Anonymous Poll',
              })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
          </td>
        ) : (
          <td className="min-w-[20%] grow text-center mx-3">{answers.map((answer) => <p title={answer} className="overflow-hidden text-ellipsis">{answer}</p>)}</td>
        ) }
        <td
          className="min-w-[40%] text-ellipsis text-center overflow-hidden"
          title={mostCommonAnswer
            ? capitalizeFirstLetter(mostCommonAnswer)
            : null}
        >
          { mostCommonAnswer
            ? capitalizeFirstLetter(mostCommonAnswer)
            : intl.formatMessage({
              id: 'app.learningDashboard.usersTable.notAvailable',
              defaultMessage: 'N/A',
            }) }
        </td>
      </tr>
    );
  }

  function renderActivityScoreItem(
    category, average, activityPoints, totalOfActivity,
  ) {
    return (
      <tr className="p-6 flex flex-row justify-between items-end">
        <td className="min-w-[20%] text-ellipsis overflow-hidden">
          <FormattedMessage
            id={`app.learningDashboard.userDetails.${toCamelCase(category)}`}
            defaultMessage={category}
          />
        </td>
        <td className="min-w-[60%] grow text-center text-sm">
          <div className="mb-2">
            { (function getAverage() {
              if (average >= 0 && category === 'Talk Time') return tsToHHmmss(average);
              if (average >= 0 && category !== 'Talk Time') return <FormattedNumber value={average} minimumFractionDigits="0" maximumFractionDigits="1" />;
              return <FormattedMessage id="app.learningDashboard.usersTable.notAvailable" defaultMessage="N/A" />;
            }()) }
          </div>
          <div className="rounded-2xl bg-gray-200 before:bg-gray-500 h-4 relative before:absolute before:top-[-50%] before:bottom-[-50%] before:w-[2px] before:left-[calc(50%-1px)] before:z-10">
            <div
              className="flex justify-end items-center text-white rounded-2xl ltr:bg-gradient-to-br rtl:bg-gradient-to-bl from-green-100 to-green-600 absolute inset-0"
              style={{
                width: `${(activityPoints / 2) * 100}%`,
              }}
            >
              { totalOfActivity > 0
                ? <span className="ltr:mr-4 rtl:ml-4">{category === 'Talk Time' ? tsToHHmmss(totalOfActivity) : totalOfActivity}</span>
                : null }
            </div>
          </div>
        </td>
        <td className="min-w-[20%] text-sm text-ellipsis overflow-hidden text-right rtl:text-left">
          { activityPoints >= 0
            ? <FormattedNumber value={activityPoints} minimumFractionDigits="0" maximumFractionDigits="1" />
            : <FormattedMessage id="app.learningDashboard.usersTable.notAvailable" defaultMessage="N/A" /> }
        </td>
      </tr>
    );
  }

  function getUserAnswer(poll) {
    if (typeof user.answers[poll.pollId] !== 'undefined') {
      return Array.isArray(user.answers[poll.pollId])
        ? user.answers[poll.pollId]
        : [user.answers[poll.pollId]];
    }
    return [];
  }

  const Duration = new Date(getSumOfTime(Object.values(user.intIds)))
    .toISOString()
    .substring(11, 19);

  return (
    <div className="fixed inset-0 flex flex-row z-50">
      <div
        className="bg-black grow opacity-50"
        role="none"
        onClick={() => dispatch({ type: 'closeModal' })}
      />
      <div ref={modalRef} className="overflow-auto w-full md:w-2/4 bg-gray-100 p-6">
        <div className="text-right rtl:text-left">
          <button
            onClick={() => dispatch({ type: 'closeModal' })}
            type="button"
            aria-label="Close user details modal"
            ref={closeButtonRef}
            className="focus:rounded-md focus:outline-none focus:ring focus:ring-gray-500 focus:ring-opacity-50 hover:text-black/50 active:text-black/75"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center p-10">
          <div className="inline-block relative w-8 h-8 rounded-full">
            <UserAvatar user={user} />
            <div
              className="absolute inset-0 rounded-full shadow-inner"
              aria-hidden="true"
            />
          </div>
          <h3 className="break-words text-center">{user.name}</h3>
        </div>
        <div className="bg-white shadow rounded mb-4">
          <div className="p-6 text-lg flex items-center">
            <div className="p-2 rounded-full bg-pink-50 text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="ltr:ml-2 rtl:mr-2"><FormattedMessage id="app.learningDashboard.usersTable.title" defaultMessage="Overview" /></h3>
          </div>
          <div className="p-6 m-px bg-gray-100">
            <div className="h-6 relative before:bg-gray-500 before:absolute before:w-[10px] before:h-[10px] before:rounded-full before:left-0 before:top-[calc(50%-5px)] after:bg-gray-500 after:absolute after:w-[10px] after:h-[10px] after:rounded-full after:right-0 after:top-[calc(50%-5px)]">
              <div className="bg-gray-500 [--line-height:2px] h-[var(--line-height)] absolute top-[calc(50%-var(--line-height)/2)] left-[10px] right-[10px] rounded-2xl" />
              <div
                role="progressbar"
                aria-label={`${`${intl.formatMessage({ id: 'app.learningDashboard.userDetails.onlineIndicator', defaultMessage: '{0} online time' }, { 0: user.name })} ${Duration}`}`}
                className="ltr:bg-gradient-to-br rtl:bg-gradient-to-bl from-green-100 to-green-600 absolute h-full rounded-2xl text-right rtl:text-left text-ellipsis overflow-hidden"
                style={{
                  right: `calc(${document.dir === 'ltr' ? userEndOffsetTime : userStartOffsetTime}% + 10px)`,
                  left: `calc(${document.dir === 'ltr' ? userStartOffsetTime : userEndOffsetTime}% + 10px)`,
                }}
              >
                <div className="mx-3 inline-block text-white">
                  { Duration }
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between font-light text-gray-700">
              <div aria-label={`${intl.formatMessage({ id: 'app.learningDashboard.userDetails.startTime', defaultMessage: 'Joined' })} ${new Date(createdOn).toISOString().substring(11, 19)}`}>
                <div aria-hidden="true"><FormattedMessage id="app.learningDashboard.userDetails.startTime" defaultMessage="Start Time" /></div>
                <div aria-hidden="true">
                  <FormattedTime value={createdOn} />
                </div>
              </div>
              <div className="ltr:text-right rtl:text-left">
                <div aria-hidden="true"><FormattedMessage id="app.learningDashboard.userDetails.endTime" defaultMessage="End Time" /></div>
                <div>
                  { endedOn === 0 ? (
                    <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
                      <FormattedMessage id="app.learningDashboard.indicators.meetingStatusActive" defaultMessage="Active" />
                    </span>
                  ) : (
                    <FormattedTime value={endedOn} />
                  ) }
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 flex flex-row justify-between text-gray-700">
            <div aria-label={`Duration ${Duration}`}>
              <div aria-hidden="true" className="text-gray-900 font-medium">
                { Duration }
              </div>
              <div aria-hidden="true"><FormattedMessage id="app.learningDashboard.indicators.duration" defaultMessage="Duration" /></div>
            </div>
            <div aria-label={`${intl.formatMessage({ id: 'app.learningDashboard.userDetails.joined', defaultMessage: 'Joined' })} ${new Date(joinTime).toISOString().substring(11, 19)}`}>
              <div aria-hidden="true" className="font-medium">
                <FormattedTime value={joinTime} />
              </div>
              <div aria-hidden="true"><FormattedMessage id="app.learningDashboard.userDetails.joined" defaultMessage="Joined" /></div>
            </div>
            <div>
              <div className="font-medium">
                { isOnline ? (
                  <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
                    <FormattedMessage id="app.learningDashboard.indicators.userStatusOnline" defaultMessage="Online" />
                  </span>
                ) : (
                  <FormattedTime value={leftTime} />
                ) }
              </div>
              <div className="px-2"><FormattedMessage id="app.learningDashboard.usersTable.left" defaultMessage="Left" /></div>
            </div>
          </div>
        </div>
        { !user.isModerator && (
          <>
            <div className="bg-white shadow rounded mb-4 w-full">
              <div className="p-6 text-lg flex items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="ltr:ml-2 rtl:mr-2">
                  <FormattedMessage id="app.learningDashboard.indicators.activityScore" defaultMessage="Activity Score" />
                  :&nbsp;
                  <span className="font-bold">
                    <FormattedNumber value={getActivityScore(user, users, totalPolls)} minimumFractionDigits="0" maximumFractionDigits="1" />
                  </span>
                </h3>
              </div>
              <table className="bg-white shadow rounded mb-4 table w-full">
                <tr className="p-6 py-2 m-px bg-gray-200 flex flex-row justify-between text-xs text-gray-700">
                  <th aria-label="Category" className="min-w-[20%] text-ellipsis font-normal text-left"><FormattedMessage id="app.learningDashboard.userDetails.category" defaultMessage="Category" /></th>
                  <th aria-label="Average" className="grow text-center font-normal"><FormattedMessage id="app.learningDashboard.userDetails.average" defaultMessage="Average" /></th>
                  <th aria-label="Activity Points" className="min-w-[20%] text-ellipsis text-right rtl:text-left font-normal"><FormattedMessage id="app.learningDashboard.userDetails.activityPoints" defaultMessage="Activity Points" /></th>
                </tr>
                { ['Talk Time', 'Messages', 'Emojis', 'Raise Hands', 'Poll Votes'].map((category) => {
                  let totalOfActivity = 0;

                  switch (category) {
                    case 'Talk Time':
                      totalOfActivity = user.talk.totalTime;
                      break;
                    case 'Messages':
                      totalOfActivity = user.totalOfMessages;
                      break;
                    case 'Emojis':
                      totalOfActivity = user.emojis.filter((emoji) => emoji.name !== 'raiseHand').length;
                      break;
                    case 'Raise Hands':
                      totalOfActivity = user.emojis.filter((emoji) => emoji.name === 'raiseHand').length;
                      break;
                    case 'Poll Votes':
                      totalOfActivity = Object.values(user.answers).length;
                      break;
                    default:
                  }

                  return renderActivityScoreItem(
                    category,
                    averages[category],
                    activityPointsFunctions[category](user),
                    totalOfActivity,
                  );
                }) }
              </table>
            </div>
            <div className="bg-white shadow rounded">
              <div className="p-6 text-lg flex items-center">
                <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="ltr:ml-2 rtl:mr-2"><FormattedMessage id="app.learningDashboard.indicators.polls" defaultMessage="Polls" /></h3>
              </div>
              <table className="w-full">
                <tr className="p-6 py-2 m-px bg-gray-200 flex flex-row justify-between text-xs text-gray-700">
                  <th aria-label="Poll" className="min-w-[40%] text-ellipsis font-normal text-left"><FormattedMessage id="app.learningDashboard.userDetails.poll" defaultMessage="Poll" /></th>
                  <th aria-label="Response" className="grow text-center font-normal"><FormattedMessage id="app.learningDashboard.userDetails.response" defaultMessage="Response" /></th>
                  <th aria-label="Most Common Answer" className="min-w-[40%] text-ellipsis text-center font-normal"><FormattedMessage id="app.learningDashboard.userDetails.mostCommonAnswer" defaultMessage="Most Common Answer" /></th>
                </tr>
                { Object.values(polls || {})
                  .map((poll) => renderPollItem(
                    poll,
                    getUserAnswer(poll),
                  )) }
              </table>
            </div>
          </>
        ) }
      </div>
    </div>
  );
};

const UserDetailsContainer = (props) => {
  const { isOpen, dispatch, user } = useContext(UserDetailsContext);
  return ReactDOM.createPortal(
    <UserDatailsComponent
      {...{
        ...props,
        isOpen,
        dispatch,
        user,
      }}
    />,
    document.getElementById('modal-container'),
  );
};

export default injectIntl(UserDetailsContainer);
