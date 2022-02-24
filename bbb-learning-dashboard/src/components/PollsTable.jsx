import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import UserAvatar from './UserAvatar';

class PollsTable extends React.Component {
  render() {
    const { allUsers, polls } = this.props;
    const { intl } = this.props;

    function getUserAnswer(user, poll) {
      if (typeof user.answers[poll.pollId] !== 'undefined') {
        return Array.isArray(user.answers[poll.pollId])
          ? user.answers[poll.pollId]
          : [user.answers[poll.pollId]];
      }
      return [];
    }

    if (typeof polls === 'object' && Object.values(polls).length === 0) {
      return (
        <div className="flex flex-col items-center py-24 bg-white">
          <div className="mb-1 p-3 rounded-full bg-blue-100 text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-700">
            <FormattedMessage
              id="app.learningDashboard.pollsTable.noPollsCreatedHeading"
              defaultMessage="No polls have been created"
            />
          </p>
          <p className="mb-2 text-sm font-medium text-gray-600">
            <FormattedMessage
              id="app.learningDashboard.pollsTable.noPollsCreatedMessage"
              defaultMessage="Once a poll has been sent to users, their results will appear in this list."
            />
          </p>
        </div>
      );
    }

    return (
      <table className="w-full">
        <thead>
          <tr className="text-xs font-semibold tracking-wide col-text-left text-gray-500 uppercase border-b bg-gray-100">
            <th className="px-3.5 2xl:px-4 py-3">
              <FormattedMessage id="app.learningDashboard.user" defaultMessage="User" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </th>
            {typeof polls === 'object' && Object.values(polls || {}).length > 0 ? (
              Object.values(polls || {})
                .sort((a, b) => ((a.createdOn > b.createdOn) ? 1 : -1))
                .map((poll, index) => <th className="px-3.5 2xl:px-4 py-3 text-center">{poll.question || `Poll ${index + 1}`}</th>)
            ) : null }
          </tr>
        </thead>
        <tbody className="bg-white divide-y whitespace-nowrap">
          { typeof allUsers === 'object' && Object.values(allUsers || {}).length > 0 ? (
            Object.values(allUsers || {})
              .filter((user) => Object.values(user.answers).length > 0)
              .sort((a, b) => {
                if (a.isModerator === false && b.isModerator === true) return 1;
                if (a.isModerator === true && b.isModerator === false) return -1;
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                return 0;
              })
              .map((user) => (
                <tr className="text-gray-700">
                  <td className="px-3.5 2xl:px-4 py-3">
                    <div className="flex items-center text-sm">
                      <div className="relative hidden w-8 h-8 rounded-full md:block">
                        <UserAvatar user={user} />
                      </div>
                      &nbsp;&nbsp;
                      <div>
                        <p className="font-semibold truncate xl:max-w-sm max-w-xs">{user.name}</p>
                      </div>
                    </div>
                  </td>

                  {typeof polls === 'object' && Object.values(polls || {}).length > 0 ? (
                    Object.values(polls || {})
                      .sort((a, b) => ((a.createdOn > b.createdOn) ? 1 : -1))
                      .map((poll) => (
                        <td className="px-4 py-3 text-sm text-center">
                          { getUserAnswer(user, poll).map((answer) => <p>{answer}</p>) }
                          { poll.anonymous
                            ? (
                              <span title={intl.formatMessage({
                                id: 'app.learningDashboard.pollsTable.anonymousAnswer',
                                defaultMessage: 'Anonymous Poll (answers in the last row)',
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
                            )
                            : null }
                        </td>
                      ))
                  ) : null }
                </tr>
              ))) : null }
          {typeof polls === 'object'
            && Object.values(polls || {}).length > 0
            && Object.values(polls).reduce((prev, poll) => ([
              ...prev,
              ...poll.anonymousAnswers,
            ]), []).length > 0 ? (
              <tr className="text-gray-700">
                <td className="px-3.5 2xl:px-4 py-3">
                  <div className="flex items-center text-sm">
                    <div className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                      {/* <img className="object-cover w-full h-full rounded-full" */}
                      {/*     src="" */}
                      {/*     alt="" loading="lazy" /> */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="relative hidden w-8 h-8 mr-3 rounded-full md:block"
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
                      <div
                        className="absolute inset-0 rounded-full shadow-inner"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">
                        <FormattedMessage id="app.learningDashboard.pollsTable.anonymousRowName" defaultMessage="Anonymous" />
                      </p>
                    </div>
                  </div>
                </td>
                {Object.values(polls || {})
                  .sort((a, b) => ((a.createdOn > b.createdOn) ? 1 : -1))
                  .map((poll) => (
                    <td className="px-3.5 2xl:px-4 py-3 text-sm text-center">
                      { poll.anonymousAnswers.map((answer) => <p>{answer}</p>) }
                    </td>
                  ))}
              </tr>
            ) : null}
        </tbody>
      </table>
    );
  }
}

export default injectIntl(PollsTable);
