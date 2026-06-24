import React from 'react';
import { Paper } from '@mui/material';
import { injectIntl } from 'react-intl';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getActivityScore } from '../services/UserService';
import UserAvatar from './UserAvatar';

const QuizzesChart = (props) => {
  const {
    allUsers,
    totalOfPolls,
    quizzes,
    intl,
  } = props;

  if (!Object.keys(quizzes).length) return null;

  const chartData = [];

  Object.values(allUsers).forEach((u) => {
    if (u?.isModerator && Object.keys(u?.answers)?.length === 0) return;

    const result = Object
      .entries(quizzes || {})
      .map(([pollId, poll]) => {
        const userAnswers = u.answers[pollId] ?? [];
        const isCorrect = userAnswers.includes(poll.correctOption);
        return [pollId, isCorrect];
      });

    const activityScore = Number(
      ((getActivityScore(u, allUsers, totalOfPolls) / 10) * 100).toFixed(2),
    );
    const numberOfCorrectAnswers = result.filter(([, isCorrect]) => isCorrect).length;
    const numberOfQuizzes = Object.values(quizzes).length;
    const quizPerformance = Number(((numberOfCorrectAnswers / numberOfQuizzes) * 100).toFixed(2));

    const existingDot = chartData.find((v) => (v.x === activityScore && v.y === quizPerformance));

    if (existingDot) {
      existingDot.users.push(u);
      return;
    }

    chartData.push({
      users: [u],
      x: activityScore,
      y: quizPerformance,
    });
  });

  return (
    <Paper className="p-4">
      <h2 className="font-lg font-bold">
        {intl.formatMessage({
          id: 'app.learningDashboard.quizzes.chartTitle',
          defaultMessage: 'Quiz Performance vs Activity Level',
        })}
      </h2>
      <ResponsiveContainer width="100%" height={450}>
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            height={50}
            tickMargin={18}
            name={intl.formatMessage({
              id: 'app.learningDashboard.quizzes.activityLevel',
              defaultMessage: 'Activity Level',
            })}
            label={{
              value: `${intl.formatMessage({
                id: 'app.learningDashboard.quizzes.activityLevel',
                defaultMessage: 'Activity Level',
              })} (%)`,
              position: 'bottom',
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            width={80}
            tickMargin={18}
            name={intl.formatMessage({
              id: 'app.learningDashboard.quizzes.quizScore',
              defaultMessage: 'Quiz Score',
            })}
            label={{
              value: `${intl.formatMessage({
                id: 'app.learningDashboard.quizzes.quizScore',
                defaultMessage: 'Quiz Score',
              })} (%)`,
              position: 'insideLeft',
              angle: -90,
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={(tooltipProps) => {
              const { active, payload } = tooltipProps;
              const isVisible = active && payload?.length;
              return (
                <Paper style={{ visibility: isVisible ? 'visible' : 'hidden' }} className="p-2">
                  {isVisible && (
                    <>
                      <div className="space-y-2">
                        {payload[0]?.payload.users.map((user) => (
                          <div key={user.userKey} className="flex items-center">
                            {user.avatar ? (
                              <div
                                style={{ backgroundImage: `url(${user.avatar})` }}
                                alt={user.name}
                                className="inline-block w-8 h-8 rounded-full mr-2 bg-cover bg-center"
                              />
                            ) : (
                              <div className="relative hidden w-8 h-8 rounded-full md:block mr-2">
                                <UserAvatar user={user} />
                              </div>
                            )}
                            <span className="font-bold">{user.name}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-gray-600">
                        {`${intl.formatMessage({
                          id: 'app.learningDashboard.quizzes.activityLevel',
                          defaultMessage: 'Activity Level',
                        })}: ${payload[0].value}%`}
                      </p>
                      <p className="text-gray-600">
                        {`${intl.formatMessage({
                          id: 'app.learningDashboard.quizzes.quizScore',
                          defaultMessage: 'Quiz Score',
                        })}: ${payload[1].value}%`}
                      </p>
                    </>
                  )}
                </Paper>
              );
            }}
          />
          <Scatter
            name={intl.formatMessage({
              id: 'app.learningDashboard.quizzes.chartTitle',
              defaultMessage: 'Quiz Performance vs Activity Level',
            })}
            data={chartData}
            fill="#f97316"
            shape={(data) => {
              const IMAGE_SIZE = 36;
              const FALLBACK_IMAGE_SIZE = 32;

              const {
                x, y, width, height,
              } = data;
              const pickedUser = data?.users?.[0];
              const imageSize = pickedUser?.avatar ? IMAGE_SIZE : FALLBACK_IMAGE_SIZE;
              const adjustedX = (x - Math.abs(imageSize - width) / 2).toFixed(2);
              const adjustedY = (y - Math.abs(imageSize - height) / 2).toFixed(2);

              if (!pickedUser) return null;

              return pickedUser.avatar ? (
                <>
                  <image
                    href={pickedUser.avatar}
                    x={adjustedX}
                    y={adjustedY}
                    width={IMAGE_SIZE}
                    height={IMAGE_SIZE}
                    clipPath="circle(38.5%)"
                  />
                </>
              ) : (
                <foreignObject
                  x={adjustedX}
                  y={adjustedY}
                  width={FALLBACK_IMAGE_SIZE}
                  height={FALLBACK_IMAGE_SIZE}
                >
                  <UserAvatar user={pickedUser} />
                </foreignObject>
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default injectIntl(QuizzesChart);
