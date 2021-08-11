import React from 'react';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';

class UsersTable extends React.Component {
  render() {
    const { allUsers, totalOfActivityTime } = this.props;

    function getSumOfTime(eventsArr) {
      return eventsArr.reduce((prevVal, elem) => {
        if (elem.stoppedOn > 0) return prevVal + (elem.stoppedOn - elem.startedOn);
        return prevVal + (new Date().getTime() - elem.startedOn);
      }, 0);
    }

    function getOnlinePercentage(registeredOn, leftOn) {
      const totalUserOnlineTime = ((leftOn > 0 ? leftOn : (new Date()).getTime())) - registeredOn;
      return Math.ceil((totalUserOnlineTime / totalOfActivityTime) * 100);
    }

    function tsToHHmmss(ts) {
      return (new Date(ts).toISOString().substr(11, 8));
    }

    return (
      <table className="w-full whitespace-no-wrap">
        <thead>
          <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-100">
            <th className="px-4 py-3">
              <FormattedMessage id="app.learningDashboard.participantsTable.colParticipant" defaultMessage="Participant" />
            </th>
            <th className="px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.participantsTable.colOnline" defaultMessage="Online time" />
            </th>
            <th className="px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.participantsTable.colTalk" defaultMessage="Talk time" />
            </th>
            <th className="px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.participantsTable.colWebcam" defaultMessage="Webcam Time" />
            </th>
            <th className="px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.participantsTable.colMessages" defaultMessage="Messages" />
            </th>
            <th className="px-4 py-3 text-left">
              <FormattedMessage id="app.learningDashboard.participantsTable.colEmojis" defaultMessage="Emojis" />
            </th>
            <th className="px-4 py-3 text-center">
              <FormattedMessage id="app.learningDashboard.participantsTable.colRaiseHands" defaultMessage="Raise Hand" />
            </th>
            <th className="px-4 py-3">
              <FormattedMessage id="app.learningDashboard.participantsTable.colStatus" defaultMessage="Status" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y">
          { typeof allUsers === 'object' && Object.values(allUsers || {}).length > 0 ? (
            Object.values(allUsers || {})
              .sort((a, b) => {
                if (a.isModerator === true && b.isModerator === false) return -1;
                if (a.isModerator === false && b.isModerator === true) return 1;
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
              })
              .map((user) => (
                <tr key={user} className="text-gray-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center text-sm">
                      <div className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                        {/* <img className="object-cover w-full h-full rounded-full" */}
                        {/*     src="" */}
                        {/*     alt="" loading="lazy" /> */}
                        <div className={`border-2 border-gray-800 items-center ${user.isModerator ? 'rounded-md' : 'rounded-full'}`}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-full w-full p-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div
                          className="absolute inset-0 rounded-full shadow-inner"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {user.name}
                        </p>
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
                            value={user.registeredOn}
                            month="short"
                            day="numeric"
                            hour="2-digit"
                            minute="2-digit"
                            second="2-digit"
                          />
                          <br />
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
                            value={user.leftOn}
                            month="short"
                            day="numeric"
                            hour="2-digit"
                            minute="2-digit"
                            second="2-digit"
                          />
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 inline"
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
                    { tsToHHmmss(
                      (user.leftOn > 0 ? user.leftOn : (new Date()).getTime()) - user.registeredOn,
                    ) }
                    <br />
                    <div
                      className="bg-gray-200 transition-colors duration-500 rounded-full overflow-hidden"
                      title={`${getOnlinePercentage(user.registeredOn, user.leftOn).toString()}%`}
                    >
                      <div
                        aria-label=" "
                        className="bg-gradient-to-br from-green-100 to-green-600 transition-colors duration-900 h-1.5"
                        style={{ width: `${getOnlinePercentage(user.registeredOn, user.leftOn).toString()}%` }}
                        role="progressbar"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    { user.talk.totalTime > 0
                      ? (
                        <span className="text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1 inline"
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
                          { tsToHHmmss(user.talk.totalTime) }
                        </span>
                      ) : null }
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    { getSumOfTime(user.webcams) > 0
                      ? (
                        <span className="text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1 inline"
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
                          { tsToHHmmss(getSumOfTime(user.webcams)) }
                        </span>
                      ) : null }
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    { user.totalOfMessages > 0
                      ? (
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1 inline"
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
                          {user.totalOfMessages}
                        </span>
                      ) : null }
                  </td>
                  <td className="px-4 py-3 text-sm text-left">
                    { user.emojis.filter((emoji) => emoji.name === 'away').length > 0 ? (
                      <div className="text-xs">
                        <i className="icon-bbb-time text-sm" />
                        &nbsp;
                        {user.emojis.filter((emoji) => emoji.name === 'away').length}
                        &nbsp;
                        <FormattedMessage id="app.actionsBar.emojiMenu.awayLabel" defaultMessage="Away" />
                      </div>
                    ) : null}
                    { user.emojis.filter((emoji) => emoji.name === 'neutral').length > 0 ? (
                      <div className="text-xs">
                        <i className="icon-bbb-undecided text-sm" />
                        &nbsp;
                        {user.emojis.filter((emoji) => emoji.name === 'neutral').length}
                        &nbsp;
                        <FormattedMessage id="app.actionsBar.emojiMenu.neutralLabel" defaultMessage="Undecided" />
                      </div>
                    ) : null}
                    { user.emojis.filter((emoji) => emoji.name === 'confused').length > 0 ? (
                      <div className="text-xs">
                        <i className="icon-bbb-undecided text-sm" />
                        &nbsp;
                        {user.emojis.filter((emoji) => emoji.name === 'confused').length}
                        &nbsp;
                        <FormattedMessage id="app.actionsBar.emojiMenu.confusedLabel" defaultMessage="Confused" />
                      </div>
                    ) : null}
                    { user.emojis.filter((emoji) => emoji.name === 'sad').length > 0 ? (
                      <div className="text-xs">
                        <i className="icon-bbb-sad text-sm" />
                        &nbsp;
                        {user.emojis.filter((emoji) => emoji.name === 'sad').length}
                        &nbsp;
                        <FormattedMessage id="app.actionsBar.emojiMenu.sadLabel" defaultMessage="Sad" />
                      </div>
                    ) : null}
                    { user.emojis.filter((emoji) => emoji.name === 'happy').length > 0 ? (
                      <div className="text-xs">
                        <i className="icon-bbb-happy text-sm" />
                        &nbsp;
                        {user.emojis.filter((emoji) => emoji.name === 'happy').length}
                        &nbsp;
                        <FormattedMessage id="app.actionsBar.emojiMenu.happyLabel" defaultMessage="Happy" />
                      </div>
                    ) : null}
                    { user.emojis.filter((emoji) => emoji.name === 'applause').length > 0 ? (
                      <div className="text-xs">
                        <i className="icon-bbb-applause text-sm" />
                        &nbsp;
                        {user.emojis.filter((emoji) => emoji.name === 'applause').length}
                        &nbsp;
                        <FormattedMessage id="app.actionsBar.emojiMenu.applauseLabel" defaultMessage="Applaud" />
                      </div>
                    ) : null}
                    { user.emojis.filter((emoji) => emoji.name === 'thumbsUp').length > 0 ? (
                      <div className="text-xs">
                        <i className="icon-bbb-thumbs_up text-sm" />
                        &nbsp;
                        {user.emojis.filter((emoji) => emoji.name === 'thumbsUp').length}
                        &nbsp;
                        <FormattedMessage id="app.actionsBar.emojiMenu.thumbsUpLabel" defaultMessage="Thumbs up" />
                      </div>
                    ) : null}
                    { user.emojis.filter((emoji) => emoji.name === 'thumbsDown').length > 0 ? (
                      <div className="text-xs">
                        <i className="icon-bbb-thumbs_down text-sm" />
                        &nbsp;
                        {user.emojis.filter((emoji) => emoji.name === 'thumbsDown').length}
                        &nbsp;
                        <FormattedMessage id="app.actionsBar.emojiMenu.thumbsDownLabel" defaultMessage="Thumbs down" />
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    { user.emojis.filter((emoji) => emoji.name === 'raiseHand').length > 0
                      ? (
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1 inline"
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
                          {user.emojis.filter((emoji) => emoji.name === 'raiseHand').length}
                        </span>
                      ) : null }
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {
                                      user.leftOn > 0
                                        ? (
                                          <span className="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full">
                                            <FormattedMessage id="app.learningDashboard.participantsTable.userStatusOffline" defaultMessage="Offline" />
                                          </span>
                                        )
                                        : (
                                          <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
                                            <FormattedMessage id="app.learningDashboard.participantsTable.userStatusOnline" defaultMessage="Online" />
                                          </span>
                                        )
                                  }
                  </td>
                </tr>
              ))
          ) : (
            <tr className="text-gray-700">
              <td colSpan="8" className="px-4 py-3 text-sm text-center">
                <FormattedMessage id="app.learningDashboard.participantsTable.noUsers" defaultMessage="No users" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

export default injectIntl(UsersTable);
