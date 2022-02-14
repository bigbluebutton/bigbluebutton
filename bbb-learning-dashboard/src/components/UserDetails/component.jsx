import React, { useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  FormattedMessage, injectIntl,
} from 'react-intl';
import { UserDetailsContext } from './context';
import UserAvatar from '../UserAvatar';
import { getSumOfTime } from '../../services/UserService';

const UserDatailsComponent = (props) => {
  const {
    isOpen, dispatch, user, dataJson,
  } = props;

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') dispatch({ type: 'closeModal' });
    });
  }, []);

  if (!isOpen) return null;

  const { createdOn, endedOn, polls } = dataJson;

  const currTime = () => new Date().getTime();
  const registeredTimes = Object.values(user.intIds).map((intId) => intId.registeredOn);
  const leftTimes = Object.values(user.intIds).map((intId) => intId.leftOn || currTime());
  const joinTime = Math.min(...registeredTimes);
  const leftTime = Math.max(...leftTimes);
  const sessionDuration = (endedOn || currTime()) - createdOn;
  const userEndOffsetTime = (((endedOn || currTime()) - leftTime) * 100) / sessionDuration;
  const userStartOffsetTime = ((joinTime - createdOn) * 100) / sessionDuration;
  const offsetOrigin = document.dir === 'rtl' ? 'left' : 'right';

  function renderPollItem(question, answer, mostCommomAnswer) {
    return (
      <div className="p-6 flex flex-row justify-between">
        <div className="min-w-[40%] text-ellipsis">{question}</div>
        <div className="grow text-center">{answer}</div>
        <div className="min-w-[40%] text-ellipsis text-center">{mostCommomAnswer || '-'}</div>
      </div>
    );
  }

  function renderActivityScoreItem(category, average, activityPoints) {
    return (
      <div className="p-6 flex flex-row justify-between items-end">
        <div className="min-w-[20%] text-ellipsis overflow-hidden">{category}</div>
        <div className="min-w-[60%] grow text-center text-sm">
          <div className="mb-2">{average ?? (<FormattedMessage id="app.learningDashboard.usersTable.notAvailable" defaultMessage="N/A" />)}</div>
          <div className="rounded-2xl bg-gray-200 before:bg-gray-500 h-4 relative before:absolute before:top-[-50%] before:bottom-[-50%] before:w-[2px] before:left-[calc(50%-1px)]">
            <div
              className="rounded-2xl bg-gradient-to-br from-green-100 to-green-600 absolute inset-0"
              style={{
                [offsetOrigin]: '50%',
              }}
            />
          </div>
        </div>
        <div className="min-w-[20%] text-sm text-ellipsis overflow-hidden text-right rtl:text-left">{activityPoints ?? (<FormattedMessage id="app.learningDashboard.usersTable.notAvailable" defaultMessage="N/A" />)}</div>
      </div>
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

  return (
    <div className="fixed inset-0 flex flex-row">
      <div
        className="bg-black grow opacity-50"
        role="none"
        onClick={() => dispatch({ type: 'closeModal' })}
      />
      <div className="overflow-auto w-full md:w-2/4 bg-gray-100 p-6">
        <div className="text-right rtl:text-left">
          <button
            onClick={() => dispatch({ type: 'closeModal' })}
            type="button"
            aria-label="Close user details modal"
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
          <p className="break-words text-center">{user.name}</p>
        </div>
        <div className="bg-white shadow rounded mb-4">
          <div className="p-6 text-lg flex items-center">
            <div className="p-2 rounded-full bg-pink-50 text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="ltr:ml-2 rtl:mr-2"><FormattedMessage id="app.learningDashboard.usersTable.title" defaultMessage="Overview" /></p>
          </div>
          <div className="p-6 m-px bg-gray-100">
            <div className="h-6 relative before:bg-gray-500 before:absolute before:w-[10px] before:h-[10px] before:rounded-full before:left-0 before:top-[calc(50%-5px)] after:bg-gray-500 after:absolute after:w-[10px] after:h-[10px] after:rounded-full after:right-0 after:top-[calc(50%-5px)]">
              <div className="bg-gray-500 [--line-height:2px] h-[var(--line-height)] absolute top-[calc(50%-var(--line-height)/2)] left-[10px] right-[10px] rounded-2xl" />
              <div
                className="ltr:bg-gradient-to-br rtl:bg-gradient-to-bl from-green-100 to-green-600 absolute h-full rounded-2xl text-right rtl:text-left text-ellipsis overflow-hidden"
                style={{
                  right: `calc(${document.dir === 'ltr' ? userEndOffsetTime : userStartOffsetTime}% + 10px)`,
                  left: `calc(${document.dir === 'ltr' ? userStartOffsetTime : userEndOffsetTime}% + 10px)`,
                }}
              >
                <div className="mx-3 inline-block text-white">
                  { new Date(getSumOfTime(Object.values(user.intIds)))
                    .toISOString()
                    .substring(11, 19) }
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between font-light text-gray-700">
              <div>
                <div><FormattedMessage id="app.learningDashboard.userDetails.startTime" defaultMessage="Start Time" /></div>
                <div>{new Date(createdOn).toISOString().substring(11, 19)}</div>
              </div>
              <div className="ltr:text-right rtl:text-left">
                <div><FormattedMessage id="app.learningDashboard.userDetails.endTime" defaultMessage="End Time" /></div>
                <div>
                  { endedOn === 0 ? (
                    <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
                      <FormattedMessage id="app.learningDashboard.indicators.meetingStatusActive" defaultMessage="Active" />
                    </span>
                  ) : new Date(endedOn || Date.now()).toISOString().substring(11, 19) }
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 flex flex-row justify-between text-gray-700">
            <div>
              <div className="text-gray-900 font-medium">
                { new Date(getSumOfTime(Object.values(user.intIds)))
                  .toISOString()
                  .substring(11, 19) }
              </div>
              <div><FormattedMessage id="app.learningDashboard.indicators.duration" defaultMessage="Duration" /></div>
            </div>
            <div>
              <div className="font-medium">
                { new Date(joinTime).toISOString().substring(11, 19) }
              </div>
              <div><FormattedMessage id="app.learningDashboard.userDetails.joined" defaultMessage="Joined" /></div>
            </div>
            <div>
              <div className="font-medium">
                { new Date(leftTime).toISOString().substring(11, 19) }
              </div>
              <div><FormattedMessage id="app.learningDashboard.usersTable.left" defaultMessage="Left" /></div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded mb-4 table w-full">
          <div className="p-6 text-lg flex items-center">
            <div className="p-2 rounded-full bg-green-200 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <p className="ltr:ml-2 rtl:mr-2"><FormattedMessage id="app.learningDashboard.indicators.activityScore" defaultMessage="Activity Score" /></p>
          </div>
          <div className="p-6 py-2 m-px bg-gray-200 flex flex-row justify-between text-xs text-gray-700">
            <div className="min-w-[20%] text-ellipsis"><FormattedMessage id="app.learningDashboard.userDetails.category" defaultMessage="Category" /></div>
            <div className="grow text-center"><FormattedMessage id="app.learningDashboard.userDetails.average" defaultMessage="Average" /></div>
            <div className="min-w-[20%] text-ellipsis text-right rtl:text-left"><FormattedMessage id="app.learningDashboard.userDetails.activityPoints" defaultMessage="Activity Points" /></div>
          </div>
          { ['Talks', 'Messages', 'Emojis', 'Raise Hands', 'Poll Votes'].map((category) => renderActivityScoreItem(category, null, null)) }
        </div>
        <div className="bg-white shadow rounded">
          <div className="p-6 text-lg flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="ltr:ml-2 rtl:mr-2"><FormattedMessage id="app.learningDashboard.indicators.polls" defaultMessage="Polls" /></p>
          </div>
          <div className="p-6 py-2 m-px bg-gray-200 flex flex-row justify-between text-xs text-gray-700">
            <div className="min-w-[40%] text-ellipsis"><FormattedMessage id="app.learningDashboard.userDetails.poll" defaultMessage="Poll" /></div>
            <div className="grow text-center"><FormattedMessage id="app.learningDashboard.userDetails.response" defaultMessage="Response" /></div>
            <div className="min-w-[40%] text-ellipsis text-center"><FormattedMessage id="app.learningDashboard.userDetails.mostCommonAnswer" defaultMessage="Most Common Answer" /></div>
          </div>
          { Object.values(polls || {})
            .map((poll) => renderPollItem(poll.question, getUserAnswer(poll), null)) }
        </div>
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
