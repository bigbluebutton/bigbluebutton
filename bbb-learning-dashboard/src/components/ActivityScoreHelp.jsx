import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

const ActivityScoreHelp = () => {
  const intl = useIntl();

  return (
    <section className="text-base whitespace-normal space-y-4 text-gray-600">
      <h3 className="text-gray-700 font-bold">
        <FormattedMessage
          id="app.learningDashboard.help.activityScore.title"
          defaultMessage="How The Activity Score is Computed"
        />
      </h3>
      <p>
        <FormattedMessage
          id="app.learningDashboard.help.activityScore.desc"
          defaultMessage="The user's activity score is calculated based on their participation in a session. The score is a sum of 5 normalized metrics, each contributing up to 2 points. Each metric is normalized so that the highest performer in each category gets the full 2 points, and others get proportionally less."
        />
      </p>
      <table className="w-full table-auto border-collapse text-left">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.metric"
                defaultMessage="Metric"
              />
            </th>
            <th className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.formula"
                defaultMessage="Formula"
              />
            </th>
            <th className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.maxValue"
                defaultMessage="Maximum Value"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.talkingTime"
                defaultMessage="Talking Time"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <code>
                (
                {`${intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.userTalkingTime',
                  defaultMessage: 'user talking time',
                })} / ${intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.maxTalkingTime',
                  defaultMessage: 'max talking time',
                })}`}
                ) * 2
              </code>
            </td>
            <td className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.maxMetricPointsLabel"
                defaultMessage="2 points"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.messagesSent"
                defaultMessage="Messages Sent"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <code>
                (
                {`${intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.userMessagesSent',
                  defaultMessage: 'user messages sent',
                })} / ${intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.maxMessagesSent',
                  defaultMessage: 'max messages sent',
                })}`}
                ) * 2
              </code>
            </td>
            <td className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.maxMetricPointsLabel"
                defaultMessage="2 points"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.raiseHandEvents"
                defaultMessage="Raise Hand Events"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <code>
                (
                {`${intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.userRaisedHands',
                  defaultMessage: 'user raised hands',
                })} / ${intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.maxRaisedHands',
                  defaultMessage: 'max raised hands',
                })}`}
                ) * 2
              </code>
            </td>
            <td className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.maxMetricPointsLabel"
                defaultMessage="2 points"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.reactions"
                defaultMessage="Reactions"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <code>
                (
                {`${intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.userReactions',
                  defaultMessage: 'user reactions',
                })} / ${intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.maxReactions',
                  defaultMessage: 'max reactions',
                })}`}
                ) * 2
              </code>
            </td>
            <td className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.maxMetricPointsLabel"
                defaultMessage="2 points"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.pollAnswers"
                defaultMessage="Poll Answers"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <code>
                (
                {`${intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.userPollAnswers',
                  defaultMessage: 'user poll answers',
                })} / ${intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.maxPollAnswers',
                  defaultMessage: 'max poll answers',
                })}`}
                ) * 2
              </code>
            </td>
            <td className="border border-gray-300 p-2">
              <FormattedMessage
                id="app.learningDashboard.help.activityScore.maxMetricPointsLabel"
                defaultMessage="2 points"
              />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="border border-gray-300 p-2">
              <strong>
                <FormattedMessage
                  id="app.learningDashboard.help.activityScore.totalActivityScore"
                  defaultMessage="Total Activity Score"
                />
              </strong>
            </td>
            <td className="border border-gray-300 p-2">
              <strong>
                {intl.formatMessage({
                  id: 'app.learningDashboard.help.activityScore.sumLabel',
                  defaultMessage: 'Sum of all components above',
                })}
              </strong>
            </td>
            <td className="border border-gray-300 p-2">
              <strong>
                <FormattedMessage
                  id="app.learningDashboard.help.activityScore.maxPointsLabel"
                  defaultMessage="10 points"
                />
              </strong>
            </td>
          </tr>
        </tfoot>
      </table>
      <p>
        <em>
          <FormattedMessage
            id="app.learningDashboard.help.activityScore.moderatorWarning"
            defaultMessage="Moderators always receive a score of 0 and do not participate in the metrics computation."
          />
        </em>
      </p>
    </section>
  );
};

export default ActivityScoreHelp;
