import React from 'react';
import {
  FormattedMessage, FormattedDate, FormattedNumber, injectIntl,
} from 'react-intl';
import { getUserEmojisSummary, emojiConfigs } from '../services/EmojiService';
import UserAvatar from './UserAvatar';

class UsersTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activityscoreOrder: 'desc',
    };
  }

  toggleActivityScoreOrder() {
    const { activityscoreOrder } = this.state;

    if (activityscoreOrder === 'asc') {
      this.setState({ activityscoreOrder: 'desc' });
    } else {
      this.setState({ activityscoreOrder: 'asc' });
    }
  }

  render() {
    const {
      allUsers, totalOfActivityTime, totalOfPolls, tab,
    } = this.props;

    const { activityscoreOrder } = this.state;

    function getSumOfTime(eventsArr) {
      return eventsArr.reduce((prevVal, elem) => {
        if (elem.stoppedOn > 0) return prevVal + (elem.stoppedOn - elem.startedOn);
        return prevVal + (new Date().getTime() - elem.startedOn);
      }, 0);
    }

    function getActivityScore(user) {
      if (user.isModerator) return 0;

      const allUsersArr = Object.values(allUsers || {}).filter((currUser) => !currUser.isModerator);
      let userPoints = 0;

      // Calculate points of Talking
      const usersTalkTime = allUsersArr.map((currUser) => currUser.talk.totalTime);
      const maxTalkTime = Math.max(...usersTalkTime);
      if (maxTalkTime > 0) {
        userPoints += (user.talk.totalTime / maxTalkTime) * 2;
      }

      // Calculate points of Chatting
      const usersTotalOfMessages = allUsersArr.map((currUser) => currUser.totalOfMessages);
      const maxMessages = Math.max(...usersTotalOfMessages);
      if (maxMessages > 0) {
        userPoints += (user.totalOfMessages / maxMessages) * 2;
      }

      // Calculate points of Raise hand
      const usersRaiseHand = allUsersArr.map((currUser) => currUser.emojis.filter((emoji) => emoji.name === 'raiseHand').length);
      const maxRaiseHand = Math.max(...usersRaiseHand);
      const userRaiseHand = user.emojis.filter((emoji) => emoji.name === 'raiseHand').length;
      if (maxRaiseHand > 0) {
        userPoints += (userRaiseHand / maxRaiseHand) * 2;
      }

      // Calculate points of Emojis
      const usersEmojis = allUsersArr.map((currUser) => currUser.emojis.filter((emoji) => emoji.name !== 'raiseHand').length);
      const maxEmojis = Math.max(...usersEmojis);
      const userEmojis = user.emojis.filter((emoji) => emoji.name !== 'raiseHand').length;
      if (maxEmojis > 0) {
        userPoints += (userEmojis / maxEmojis) * 2;
      }

      // Calculate points of Polls
      if (totalOfPolls > 0) {
        userPoints += (Object.values(user.answers || {}).length / totalOfPolls) * 2;
      }

      return userPoints;
    }

    const usersEmojisSummary = {};
    Object.values(allUsers || {}).forEach((user) => {
      usersEmojisSummary[user.userKey] = getUserEmojisSummary(user, 'raiseHand');
    });

    function getOnlinePercentage(registeredOn, leftOn) {
      const totalUserOnlineTime = ((leftOn > 0 ? leftOn : (new Date()).getTime())) - registeredOn;
      return Math.ceil((totalUserOnlineTime / totalOfActivityTime) * 100);
    }

    function tsToHHmmss(ts) {
      return (new Date(ts).toISOString().substr(11, 8));
    }

    const usersActivityScore = {};
    Object.values(allUsers || {}).forEach((user) => {
      usersActivityScore[user.userKey] = getActivityScore(user);
    });

    return (
      <table className="w-full">
        <thead>
          <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-100">
            <th className="px-3.5 2xl:px-4 py-3 col-text-left">
              <FormattedMessage id="app.learningDashboard.user" defaultMessage="User" />
              {
                tab === 'overview'
                  ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 inline"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  )
                  : null
              }
            </th>
            <th className="px-3.5 2xl:px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.usersTable.colOnline" defaultMessage="Online time" />
            </th>
            <th className="px-3.5 2xl:px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.usersTable.colTalk" defaultMessage="Talk time" />
            </th>
            <th className="px-3.5 2xl:px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.usersTable.colWebcam" defaultMessage="Webcam Time" />
            </th>
            <th className="px-3.5 2xl:px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.usersTable.colMessages" defaultMessage="Messages" />
            </th>
            <th className="px-3.5 2xl:px-4 py-3 col-text-left">
              <FormattedMessage id="app.learningDashboard.usersTable.colEmojis" defaultMessage="Emojis" />
            </th>
            <th className="px-3.5 2xl:px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.usersTable.colRaiseHands" defaultMessage="Raise Hand" />
            </th>
            <th
              className={`px-3.5 2xl:px-4 py-3 text-center ${tab === 'overview_activityscore' ? 'cursor-pointer' : ''}`}
              onClick={() => { if (tab === 'overview_activityscore') this.toggleActivityScoreOrder(); }}
            >
              <FormattedMessage id="app.learningDashboard.usersTable.colActivityScore" defaultMessage="Activity Score" />
              {
                tab === 'overview_activityscore'
                  ? (
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
                        d={activityscoreOrder === 'asc' ? 'M17 13l-5 5m0 0l-5-5m5 5V6' : 'M7 11l5-5m0 0l5 5m-5-5v12'}
                      />
                    </svg>
                  )
                  : null
              }
            </th>
            <th className="px-3.5 2xl:px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.usersTable.colStatus" defaultMessage="Status" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y whitespace-nowrap">
          { typeof allUsers === 'object' && Object.values(allUsers || {}).length > 0 ? (
            Object.values(allUsers || {})
              .sort((a, b) => {
                if (tab === 'overview_activityscore' && usersActivityScore[a.userKey] < usersActivityScore[b.userKey]) {
                  return activityscoreOrder === 'desc' ? 1 : -1;
                }
                if (tab === 'overview_activityscore' && usersActivityScore[a.userKey] > usersActivityScore[b.userKey]) {
                  return activityscoreOrder === 'desc' ? -1 : 1;
                }
                if (a.isModerator === false && b.isModerator === true) return 1;
                if (a.isModerator === true && b.isModerator === false) return -1;
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                return 0;
              })
              .map((user) => (
                <tr key={user} className="text-gray-700">
                  <td className="flex items-center px-3.5 2xl:px-4 py-3 col-text-left text-sm">
                    <div className="inline-block relative w-8 h-8 rounded-full">
                      {/* <img className="object-cover w-full h-full rounded-full" */}
                      {/*     src="" */}
                      {/*     alt="" loading="lazy" /> */}
                      <UserAvatar user={user} />
                      <div
                        className="absolute inset-0 rounded-full shadow-inner"
                        aria-hidden="true"
                      />
                    </div>
                    &nbsp;&nbsp;&nbsp;
                    <div className="inline-block">
                      <p className="font-semibold truncate xl:max-w-sm max-w-xs">
                        {user.name}
                      </p>
                      { Object.values(user.intIds || {}).map((intId, index) => (
                        <>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
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
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                              />
                            </svg>
                            <FormattedDate
                              value={intId.registeredOn}
                              month="short"
                              day="numeric"
                              hour="2-digit"
                              minute="2-digit"
                              second="2-digit"
                            />
                          </p>
                          { intId.leftOn > 0
                            ? (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
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
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                  />
                                </svg>

                                <FormattedDate
                                  value={intId.leftOn}
                                  month="short"
                                  day="numeric"
                                  hour="2-digit"
                                  minute="2-digit"
                                  second="2-digit"
                                />
                              </p>
                            )
                            : null }
                          { index === Object.values(user.intIds).length - 1
                            ? null
                            : (
                              <hr className="my-1" />
                            ) }
                        </>
                      )) }
                    </div>
                  </td>
                  <td className="px-3.5 2xl:px-4 py-3 text-sm text-center items-center">
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
                        d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                    &nbsp;
                    { tsToHHmmss(Object.values(user.intIds).reduce((prev, intId) => (
                      prev + ((intId.leftOn > 0
                        ? intId.leftOn
                        : (new Date()).getTime()) - intId.registeredOn)
                    ), 0)) }
                    <br />
                    {
                      (function getPercentage() {
                        const { intIds } = user;
                        const percentage = Object.values(intIds || {}).reduce((prev, intId) => (
                          prev + getOnlinePercentage(intId.registeredOn, intId.leftOn)
                        ), 0);

                        return (
                          <div
                            className="bg-gray-200 transition-colors duration-500 rounded-full overflow-hidden"
                            title={`${percentage.toString()}%`}
                          >
                            <div
                              aria-label=" "
                              className="bg-gradient-to-br from-green-100 to-green-600 transition-colors duration-900 h-1.5"
                              style={{ width: `${percentage.toString()}%` }}
                              role="progressbar"
                            />
                          </div>
                        );
                      }())
                    }
                  </td>
                  <td className="px-3.5 2xl:px-4 py-3 text-sm text-center">
                    { user.talk.totalTime > 0
                      ? (
                        <span className="text-center">
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
                              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                          </svg>
                          &nbsp;
                          { tsToHHmmss(user.talk.totalTime) }
                        </span>
                      ) : null }
                  </td>
                  <td className="px-3.5 2xl:px-4 py-3 text-sm text-center">
                    { getSumOfTime(user.webcams) > 0
                      ? (
                        <span className="text-center">
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
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          &nbsp;
                          { tsToHHmmss(getSumOfTime(user.webcams)) }
                        </span>
                      ) : null }
                  </td>
                  <td className="px-3.5 2xl:px-4 py-3 text-sm text-center">
                    { user.totalOfMessages > 0
                      ? (
                        <span>
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
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          &nbsp;
                          {user.totalOfMessages}
                        </span>
                      ) : null }
                  </td>
                  <td className="px-3.5 2xl:px-4 py-3 text-sm col-text-left">
                    {
                      Object.keys(usersEmojisSummary[user.userKey] || {}).map((emoji) => (
                        <div className="text-xs whitespace-nowrap">
                          <i className={`${emojiConfigs[emoji].icon} text-sm`} />
                          &nbsp;
                          { usersEmojisSummary[user.userKey][emoji] }
                          &nbsp;
                          <FormattedMessage
                            id={emojiConfigs[emoji].intlId}
                            defaultMessage={emojiConfigs[emoji].defaultMessage}
                          />
                        </div>
                      ))
                    }
                  </td>
                  <td className="px-3.5 2xl:px-4 py-3 text-sm text-center">
                    { user.emojis.filter((emoji) => emoji.name === 'raiseHand').length > 0
                      ? (
                        <span>
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
                              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                            />
                          </svg>
                          &nbsp;
                          {user.emojis.filter((emoji) => emoji.name === 'raiseHand').length}
                        </span>
                      ) : null }
                  </td>
                  {
                    !user.isModerator ? (
                      <td className="px-3.5 2xl:px-4 py-3 text-sm text-center items">
                        <svg viewBox="0 0 82 12" width="82" height="12" className="flex-none m-auto inline">
                          <rect width="12" height="12" fill={usersActivityScore[user.userKey] > 0 ? '#A7F3D0' : '#e4e4e7'} />
                          <rect width="12" height="12" x="14" fill={usersActivityScore[user.userKey] > 2 ? '#6EE7B7' : '#e4e4e7'} />
                          <rect width="12" height="12" x="28" fill={usersActivityScore[user.userKey] > 4 ? '#34D399' : '#e4e4e7'} />
                          <rect width="12" height="12" x="42" fill={usersActivityScore[user.userKey] > 6 ? '#10B981' : '#e4e4e7'} />
                          <rect width="12" height="12" x="56" fill={usersActivityScore[user.userKey] > 8 ? '#059669' : '#e4e4e7'} />
                          <rect width="12" height="12" x="70" fill={usersActivityScore[user.userKey] === 10 ? '#047857' : '#e4e4e7'} />
                        </svg>
                        &nbsp;
                        <span className="text-xs bg-gray-200 rounded-full px-2">
                          <FormattedNumber value={usersActivityScore[user.userKey]} minimumFractionDigits="0" maximumFractionDigits="1" />
                        </span>
                      </td>
                    ) : <td />
                  }
                  <td className="px-3.5 2xl:px-4 py-3 text-xs text-center">
                    {
                      Object.values(user.intIds)[Object.values(user.intIds).length - 1].leftOn > 0
                        ? (
                          <span className="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full">
                            <FormattedMessage id="app.learningDashboard.usersTable.userStatusOffline" defaultMessage="Offline" />
                          </span>
                        )
                        : (
                          <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
                            <FormattedMessage id="app.learningDashboard.usersTable.userStatusOnline" defaultMessage="Online" />
                          </span>
                        )
                    }
                  </td>
                </tr>
              ))
          ) : (
            <tr className="text-gray-700">
              <td colSpan="8" className="px-3.5 2xl:px-4 py-3 text-sm text-center">
                <FormattedMessage id="app.learningDashboard.usersTable.noUsers" defaultMessage="No users" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

export default injectIntl(UsersTable);
