import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { emojiConfigs, filterUserEmojis } from '../services/EmojiService';
import UserAvatar from './UserAvatar';

class StatusTable extends React.Component {
  componentDidMount() {
    // This code is needed to prevent the emoji in the first cell
    // after the username from overflowing
    const emojis = document.getElementsByClassName('emojiOnFirstCell');
    for (let i = 0; i < emojis.length; i += 1) {
      const emojiStyle = window.getComputedStyle(emojis[i]);
      let offsetLeft = emojiStyle
        .left
        .replace(/px/g, '')
        .trim();
      offsetLeft = Number(offsetLeft);
      if (offsetLeft < 0) {
        emojis[i].style.offsetLeft = '0px';
      }
    }
  }

  render() {
    const spanMinutes = 10 * 60000; // 10 minutes default
    const { allUsers, intl } = this.props;

    function tsToHHmmss(ts) {
      return (new Date(ts).toISOString().substr(11, 8));
    }

    const usersRegisteredTimes = Object.values(allUsers || {}).map((user) => user.registeredOn);
    const usersLeftTimes = Object.values(allUsers || {}).map((user) => {
      if (user.leftOn === 0) return (new Date()).getTime();
      return user.leftOn;
    });

    const firstRegisteredOnTime = Math.min(...usersRegisteredTimes);
    const lastLeftOnTime = Math.max(...usersLeftTimes);

    const periods = [];
    let currPeriod = firstRegisteredOnTime;
    while (currPeriod < lastLeftOnTime) {
      periods.push(currPeriod);
      currPeriod += spanMinutes;
    }

    return (
      <table className="w-full">
        <thead>
          <tr className="text-xs font-semibold tracking-wide text-gray-500 uppercase border-b bg-gray-100">
            <th className="px-4 py-3 col-text-left sticky left-0 z-30 bg-inherit">
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
            { periods.map((period) => <th className="px-3.5 2xl:px-4 py-3 col-text-left">{ `${tsToHHmmss(period - firstRegisteredOnTime)}` }</th>) }
          </tr>
        </thead>
        <tbody className="bg-white divide-y whitespace-nowrap">
          { typeof allUsers === 'object' && Object.values(allUsers || {}).length > 0 ? (
            Object.values(allUsers || {})
              .sort((a, b) => {
                if (a.isModerator === false && b.isModerator === true) return 1;
                if (a.isModerator === true && b.isModerator === false) return -1;
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                return 0;
              })
              .map((user) => (
                <tr className="text-gray-700 bg-inherit">
                  <td className="bg-inherit sticky left-0 z-30 px-4 py-3">
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
                  { periods.map((period) => {
                    const userEmojisInPeriod = filterUserEmojis(user,
                      null,
                      period,
                      period + spanMinutes);
                    const { registeredOn, leftOn } = user;
                    const boundaryLeft = period;
                    const boundaryRight = period + spanMinutes - 1;
                    return (
                      <td className="relative px-3.5 2xl:px-4 py-3 text-sm col-text-left">
                        {
                          (registeredOn >= boundaryLeft && registeredOn <= boundaryRight)
                          || (leftOn >= boundaryLeft && leftOn <= boundaryRight)
                          || (boundaryLeft > registeredOn && boundaryRight < leftOn)
                          || (boundaryLeft >= registeredOn && leftOn === 0)
                            ? (
                              (function makeLineThrough() {
                                let roundedLeft = registeredOn >= boundaryLeft
                                  && registeredOn <= boundaryRight ? 'rounded-l' : '';
                                let roundedRight = leftOn > boundaryLeft
                                  && leftOn < boundaryRight ? 'rounded-r' : '';
                                let offsetLeft = 0;
                                let offsetRight = 0;
                                if (registeredOn >= boundaryLeft && registeredOn <= boundaryRight) {
                                  offsetLeft = ((registeredOn - boundaryLeft) * 100) / spanMinutes;
                                }
                                if (leftOn >= boundaryLeft && leftOn <= boundaryRight) {
                                  offsetRight = ((boundaryRight - leftOn) * 100) / spanMinutes;
                                }
                                let width = '';
                                if (offsetLeft === 0 && offsetRight >= 99) {
                                  width = 'w-1.5';
                                }
                                if (offsetRight === 0 && offsetLeft >= 99) {
                                  width = 'w-1.5';
                                }
                                if (offsetLeft && offsetRight) {
                                  const variation = offsetLeft - offsetRight;
                                  if (
                                    variation > -1 && variation < 1
                                  ) {
                                    width = 'w-1.5';
                                  }
                                }
                                const isRTL = document.dir === 'rtl';
                                if (isRTL) {
                                  const aux = roundedRight;

                                  if (roundedLeft !== '') roundedRight = 'rounded-r';
                                  else roundedRight = '';

                                  if (aux !== '') roundedLeft = 'rounded-l';
                                  else roundedLeft = '';
                                }
                                // height / 2
                                const redress = '(0.375rem / 2)';
                                return (
                                  <div
                                    className={`h-1.5 ${width} bg-gray-200 absolute inset-x-0 z-10 ${roundedLeft} ${roundedRight}`}
                                    style={{
                                      top: `calc(50% - ${redress})`,
                                      left: `${isRTL ? offsetRight : offsetLeft}%`,
                                      right: `${isRTL ? offsetLeft : offsetRight}%`,
                                    }}
                                  />
                                );
                              })()
                            ) : null
                        }
                        { userEmojisInPeriod.map((emoji) => {
                          const offset = ((emoji.sentOn - period) * 100) / spanMinutes;
                          const origin = document.dir === 'rtl' ? 'right' : 'left';
                          const onFirstCell = period === firstRegisteredOnTime;
                          // font-size / 2 + padding right/left + border-width
                          const redress = '(0.875rem / 2 + 0.25rem + 2px)';
                          return (
                            <div
                              className={`flex absolute p-1 border-white border-2 rounded-full text-sm z-20 bg-purple-500 text-purple-200 ${onFirstCell ? 'emojiOnFirstCell' : ''}`}
                              role="status"
                              style={{
                                top: `calc(50% - ${redress})`,
                                [origin]: `calc(${offset}% - ${redress})`,
                              }}
                              title={intl.formatMessage({
                                id: emojiConfigs[emoji.name].intlId,
                                defaultMessage: emojiConfigs[emoji.name].defaultMessage,
                              })}
                            >
                              <i className={`${emojiConfigs[emoji.name].icon} text-sm bbb-icon-timeline`} />
                            </div>
                          );
                        })}
                      </td>
                    );
                  }) }
                </tr>
              ))) : null }
        </tbody>
      </table>
    );
  }
}

export default injectIntl(StatusTable);
