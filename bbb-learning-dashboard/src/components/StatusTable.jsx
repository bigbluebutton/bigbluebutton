import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { emojiConfigs, filterUserEmojis } from '../services/EmojiService';
import UserAvatar from './UserAvatar';

class StatusTable extends React.Component {
  componentDidMount() {
    // This code is needed to prevent emojis from overflowing.
    const emojis = document.getElementsByClassName('timeline-emoji');
    for (let i = 0; i < emojis.length; i += 1) {
      const emojiStyle = window.getComputedStyle(emojis[i]);
      const offsetLeft = Number(emojiStyle
        .left
        .replace(/px/g, '')
        .trim());
      if (offsetLeft < 0) {
        emojis[i].style.left = '0';
      }
    }
  }

  componentDidUpdate() {
    // This code is needed to prevent emojis from overflowing.
    const emojis = document.getElementsByClassName('timeline-emoji');
    for (let i = 0; i < emojis.length; i += 1) {
      const emojiStyle = window.getComputedStyle(emojis[i]);
      const offsetLeft = Number(emojiStyle
        .left
        .replace(/px/g, '')
        .trim());
      if (offsetLeft < 0) {
        emojis[i].style.left = '0';
      }
    }
  }

  render() {
    const {
      allUsers, slides, meetingId, intl,
    } = this.props;

    function tsToHHmmss(ts) {
      return (new Date(ts).toISOString().substr(11, 8));
    }

    const usersPeriods = {};
    Object.values(allUsers || {}).forEach((user) => {
      usersPeriods[user.userKey] = [];
      Object.values(user.intIds || {}).forEach((intId, index, intIdsArray) => {
        let { leftOn } = intId;
        const nextPeriod = intIdsArray[index + 1];
        if (nextPeriod && Math.abs(leftOn - nextPeriod.registeredOn) <= 30000) {
          leftOn = nextPeriod.leftOn;
          intIdsArray.splice(index + 1, 1);
        }
        usersPeriods[user.userKey].push({
          registeredOn: intId.registeredOn,
          leftOn,
        });
      });
    });

    const usersRegisteredTimes = Object
      .values(allUsers || {})
      .map((user) => Object.values(user.intIds).map((intId) => intId.registeredOn))
      .flat();
    const usersLeftTimes = Object
      .values(allUsers || {})
      .map((user) => Object.values(user.intIds).map((intId) => {
        if (intId.leftOn === 0) return (new Date()).getTime();
        return intId.leftOn;
      }))
      .flat();

    const firstRegisteredOnTime = Math.min(...usersRegisteredTimes);
    const lastLeftOnTime = Math.max(...usersLeftTimes);

    const periods = [];
    let hasSlides = false;
    if (slides && Array.isArray(slides) && slides.length > 0) {
      const filteredSlides = slides.filter((slide) => slide.presentationId !== '');
      if (filteredSlides.length > 0) {
        hasSlides = true;
        if (firstRegisteredOnTime < filteredSlides[0].setOn) {
          periods.push({
            start: firstRegisteredOnTime,
            end: filteredSlides[0].setOn - 1,
          });
        }
        filteredSlides.forEach((slide, index, slidesArray) => {
          periods.push({
            slide,
            start: slide.setOn,
            end: slidesArray[index + 1]?.setOn - 1 || lastLeftOnTime,
          });
        });
      }
    } else {
      periods.push({
        start: firstRegisteredOnTime,
        end: lastLeftOnTime,
      });
    }

    const isRTL = document.dir === 'rtl';

    function makeLineThrough(userPeriod, period) {
      const { registeredOn, leftOn } = userPeriod;
      const boundaryLeft = period.start;
      const boundaryRight = period.end;
      const interval = period.end - period.start;
      let roundedLeft = registeredOn >= boundaryLeft
        && registeredOn <= boundaryRight ? 'rounded-l' : '';
      let roundedRight = leftOn >= boundaryLeft
        && leftOn <= boundaryRight ? 'rounded-r' : '';
      let offsetLeft = 0;
      let offsetRight = 0;
      if (registeredOn >= boundaryLeft && registeredOn <= boundaryRight) {
        offsetLeft = ((registeredOn - boundaryLeft) * 100) / interval;
      }
      if (leftOn >= boundaryLeft && leftOn <= boundaryRight) {
        offsetRight = ((boundaryRight - leftOn) * 100) / interval;
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
        if (variation > -1 && variation < 1) {
          width = 'w-1.5';
        }
      }
      if (isRTL) {
        const aux = roundedRight;

        if (roundedLeft !== '') roundedRight = 'rounded-r';
        else roundedRight = '';

        if (aux !== '') roundedLeft = 'rounded-l';
        else roundedLeft = '';
      }
      const redress = '(0.375rem / 2)';
      return (
        <div
          className={
            'h-1.5 bg-gray-200 absolute inset-x-0 z-10'
            + ` ${width} ${roundedLeft} ${roundedRight}`
          }
          style={{
            top: `calc(50% - ${redress})`,
            left: `${isRTL ? offsetRight : offsetLeft}%`,
            right: `${isRTL ? offsetLeft : offsetRight}%`,
          }}
        />
      );
    }

    return (
      <table className="w-full">
        <thead>
          <tr className="text-xs font-semibold tracking-wide text-gray-500 uppercase border-b bg-gray-100">
            <th className={`z-30 bg-inherit px-4 py-3 col-text-left sticky ${isRTL ? 'right-0' : 'left-0'}`}>
              <FormattedMessage id="app.learningDashboard.user" defaultMessage="User" />
            </th>
            <th
              className="bg-inherit"
              colSpan={periods.length}
            >
              <span
                className="invisible"
                aria-label={intl.formatMessage({
                  id: 'app.learningDashboard.indicators.timeline',
                  defaultMessage: 'Timeline',
                })}
              >
                <FormattedMessage id="app.learningDashboard.indicators.timeline" defaultMessage="Timeline" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y whitespace-nowrap">
          { hasSlides ? (
            <tr className="bg-inherit">
              <td className={`bg-inherit z-30 sticky ${isRTL ? 'right-0' : 'left-0'}`} />
              { periods.map((period) => {
                const { slide, start, end } = period;
                const padding = isRTL ? 'paddingLeft' : 'paddingRight';
                const URLPrefix = `/bigbluebutton/presentation/${meetingId}/${meetingId}`;
                const { presentationId, pageNum } = slide || {};
                return (
                  <td
                    style={{
                      [padding]: `${(end - start) / 1000}px`,
                    }}
                  >
                    { slide && (
                      <div className="flex">
                        <div
                          className="my-4"
                          aria-label={tsToHHmmss(start - periods[0].start)}
                        >
                          <a
                            href={`${URLPrefix}/${presentationId}/svg/${pageNum}`}
                            className="block border-2 border-gray-300"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={`${URLPrefix}/${presentationId}/thumbnail/${pageNum}`}
                              alt={intl.formatMessage({
                                id: 'app.learningDashboard.statusTimelineTable.thumbnail',
                                defaultMessage: 'Presentation thumbnail',
                              })}
                              style={{
                                maxWidth: '150px',
                                width: '150px',
                                height: 'auto',
                              }}
                            />
                          </a>
                          <div className="text-xs text-center mt-1 text-gray-500">{tsToHHmmss(slide.setOn - periods[0].start)}</div>
                        </div>
                      </div>
                    ) }
                  </td>
                );
              }) }
            </tr>
          ) : null }
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
                  <td className={`z-30 px-4 py-3 bg-inherit sticky ${isRTL ? 'right-0' : 'left-0'}`}>
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
                    const boundaryLeft = period.start;
                    const boundaryRight = period.end;
                    const interval = period.end - period.start;
                    return (
                      <td className="relative px-3.5 2xl:px-4 py-3 text-sm col-text-left">
                        { usersPeriods[user.userKey].length > 0 ? (
                          usersPeriods[user.userKey].map((userPeriod) => {
                            const { registeredOn, leftOn } = userPeriod;
                            const userEmojisInPeriod = filterUserEmojis(user,
                              null,
                              registeredOn >= boundaryLeft && registeredOn <= boundaryRight
                                ? registeredOn : boundaryLeft,
                              leftOn >= boundaryLeft && leftOn <= boundaryRight
                                ? leftOn : boundaryRight);
                            return (
                              <>
                                { (registeredOn >= boundaryLeft && registeredOn <= boundaryRight)
                                  || (leftOn >= boundaryLeft && leftOn <= boundaryRight)
                                  || (boundaryLeft > registeredOn && boundaryRight < leftOn)
                                  || (boundaryLeft >= registeredOn && leftOn === 0)
                                  ? makeLineThrough(userPeriod, period)
                                  : null }
                                { userEmojisInPeriod.map((emoji) => {
                                  const offset = ((emoji.sentOn - period.start) * 100)
                                    / (interval);
                                  const origin = isRTL ? 'right' : 'left';
                                  const redress = '(0.875rem / 2 + 0.25rem + 2px)';
                                  return (
                                    <div
                                      className="flex absolute p-1 border-white border-2 rounded-full text-sm z-20 bg-purple-500 text-purple-200 timeline-emoji"
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
                                      <i
                                        className={
                                          'text-sm bbb-icon-timeline'
                                          + ` ${emojiConfigs[emoji.name].icon}`
                                        }
                                      />
                                    </div>
                                  );
                                }) }
                              </>
                            );
                          })
                        ) : null }
                      </td>
                    );
                  }) }
                </tr>
              )).flat()) : null }
        </tbody>
      </table>
    );
  }
}

export default injectIntl(StatusTable);
