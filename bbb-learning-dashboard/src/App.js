import React from 'react';
import './App.css';
import './bbb-icons.css';
import {
  FormattedMessage, FormattedDate, injectIntl, FormattedTime,
} from 'react-intl';
import { emojiConfigs } from './services/EmojiService';
import Card from './components/Card';
import UsersTable from './components/UsersTable';
import UserDetails from './components/UserDetails/component';
import { UserDetailsContext } from './components/UserDetails/context';
import StatusTable from './components/StatusTable';
import PollsTable from './components/PollsTable';
import ErrorMessage from './components/ErrorMessage';
import { makeUserCSVData, tsToHHmmss } from './services/UserService';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      invalidSessionCount: 0,
      activitiesJson: {},
      tab: 'overview',
      meetingId: '',
      learningDashboardAccessToken: '',
      ldAccessTokenCopied: false,
      sessionToken: '',
      lastUpdated: null,
    };
  }

  componentDidMount() {
    this.setDashboardParams(() => {
      this.fetchActivitiesJson();
    });
  }

  handleSaveSessionData(e) {
    const { target: downloadButton } = e;
    const { intl } = this.props;
    const { activitiesJson } = this.state;
    const {
      name: meetingName, createdOn, users, polls,
    } = activitiesJson;
    const link = document.createElement('a');
    const data = makeUserCSVData(users, polls, intl);
    const filename = `LearningDashboard_${meetingName}_${new Date(createdOn).toISOString().substr(0, 10)}.csv`.replace(/ /g, '-');

    downloadButton.setAttribute('disabled', 'true');
    downloadButton.style.cursor = 'not-allowed';
    link.setAttribute('href', `data:text/csv;charset=UTF-8,${encodeURIComponent(data)}`);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    downloadButton.innerHTML = intl.formatMessage({ id: 'app.learningDashboard.sessionDataDownloadedLabel', defaultMessage: 'Downloaded!' });
    setTimeout(() => {
      downloadButton.innerHTML = intl.formatMessage({ id: 'app.learningDashboard.downloadSessionDataLabel', defaultMessage: 'Download Session Data' });
      downloadButton.removeAttribute('disabled');
      downloadButton.style.cursor = 'pointer';
      downloadButton.focus();
    }, 3000);
    document.body.removeChild(link);
  }

  setDashboardParams(callback) {
    let learningDashboardAccessToken = '';
    let meetingId = '';
    let sessionToken = '';

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (typeof params.meeting !== 'undefined') {
      meetingId = params.meeting;
    }

    if (typeof params.sessionToken !== 'undefined') {
      sessionToken = params.sessionToken;
    }

    if (typeof params.report !== 'undefined') {
      learningDashboardAccessToken = params.report;
    } else {
      const cookieName = `ld-${params.meeting}`;
      const cDecoded = decodeURIComponent(document.cookie);
      const cArr = cDecoded.split('; ');
      cArr.forEach((val) => {
        if (val.indexOf(`${cookieName}=`) === 0) {
          learningDashboardAccessToken = val.substring((`${cookieName}=`).length);
        }
      });

      // Extend AccessToken lifetime by 7d (in each access)
      if (learningDashboardAccessToken !== '') {
        const cookieExpiresDate = new Date();
        cookieExpiresDate.setTime(cookieExpiresDate.getTime() + (3600000 * 24 * 7));
        const value = `ld-${meetingId}=${learningDashboardAccessToken};`;
        const expire = `expires=${cookieExpiresDate.toGMTString()};`;
        const args = 'path=/;SameSite=None;Secure';
        document.cookie = `${value} ${expire} ${args}`;
      }
    }

    this.setState({ learningDashboardAccessToken, meetingId, sessionToken }, () => {
      if (typeof callback === 'function') callback();
    });
  }

  fetchMostUsedEmojis() {
    const { activitiesJson } = this.state;
    if (!activitiesJson) { return []; }

    // Icon elements
    const emojis = [...Object.keys(emojiConfigs)];
    const icons = {};
    emojis.forEach((emoji) => {
      icons[emoji] = (<i className={`${emojiConfigs[emoji].icon} bbb-icon-card`} />);
    });

    // Count each emoji
    const emojiCount = {};
    emojis.forEach((emoji) => {
      emojiCount[emoji] = 0;
    });
    const allEmojisUsed = Object
      .values(activitiesJson.users || {})
      .map((user) => user.emojis || [])
      .flat(1);
    allEmojisUsed.forEach((emoji) => {
      emojiCount[emoji.name] += 1;
    });

    // Get the three most used
    const mostUsedEmojis = Object
      .entries(emojiCount)
      .filter(([, count]) => count)
      .sort(([, countA], [, countB]) => countA - countB)
      .reverse()
      .slice(0, 3);
    return mostUsedEmojis.map(([emoji]) => icons[emoji]);
  }

  updateModalUser() {
    const { user, dispatch, isOpen } = this.context;
    const { activitiesJson } = this.state;
    const { users } = activitiesJson;

    if (isOpen && users[user.userKey]) {
      dispatch({
        type: 'changeUser',
        user: users[user.userKey],
      });
    }
  }

  fetchActivitiesJson() {
    const {
      learningDashboardAccessToken, meetingId, sessionToken, invalidSessionCount,
    } = this.state;

    if (learningDashboardAccessToken !== '') {
      fetch(`${meetingId}/${learningDashboardAccessToken}/learning_dashboard_data.json`)
        .then((response) => response.json())
        .then((json) => {
          this.setState({
            activitiesJson: json,
            loading: false,
            invalidSessionCount: 0,
            lastUpdated: Date.now(),
          });
          document.title = `Learning Dashboard - ${json.name}`;
          this.updateModalUser();
        }).catch(() => {
          this.setState({ loading: false, invalidSessionCount: invalidSessionCount + 1 });
        });
    } else if (sessionToken !== '') {
      const url = new URL('/bigbluebutton/api/learningDashboard', window.location);
      fetch(`${url}?sessionToken=${sessionToken}`)
        .then((response) => response.json())
        .then((json) => {
          if (json.response.returncode === 'SUCCESS') {
            const jsonData = JSON.parse(json.response.data);
            this.setState({
              activitiesJson: jsonData,
              loading: false,
              invalidSessionCount: 0,
              lastUpdated: Date.now(),
            });
            document.title = `Learning Dashboard - ${jsonData.name}`;
            this.updateModalUser();
          } else {
            // When meeting is ended the sessionToken stop working, check for new cookies
            this.setDashboardParams();
            this.setState({ loading: false, invalidSessionCount: invalidSessionCount + 1 });
          }
        })
        .catch(() => {
          this.setState({ loading: false, invalidSessionCount: invalidSessionCount + 1 });
        });
    } else {
      this.setState({ loading: false });
    }

    setTimeout(() => {
      this.fetchActivitiesJson();
    }, 10000 * (2 ** invalidSessionCount));
  }

  render() {
    const {
      activitiesJson, tab, sessionToken, loading, lastUpdated,
      learningDashboardAccessToken, ldAccessTokenCopied,
    } = this.state;
    const { intl } = this.props;

    document.title = `${intl.formatMessage({ id: 'app.learningDashboard.dashboardTitle', defaultMessage: 'Learning Dashboard' })} - ${activitiesJson.name}`;

    function totalOfEmojis() {
      if (activitiesJson && activitiesJson.users) {
        return Object.values(activitiesJson.users)
          .reduce((prevVal, elem) => prevVal + elem.emojis.length, 0);
      }
      return 0;
    }

    function totalOfActivity() {
      const usersTimes = Object.values(activitiesJson.users || {}).reduce((prev, user) => ([
        ...prev,
        ...Object.values(user.intIds),
      ]), []);

      const minTime = Object.values(usersTimes || {}).reduce((prevVal, elem) => {
        if (prevVal === 0 || elem.registeredOn < prevVal) return elem.registeredOn;
        return prevVal;
      }, 0);

      const maxTime = Object.values(usersTimes || {}).reduce((prevVal, elem) => {
        if (elem.leftOn === 0) return (new Date()).getTime();
        if (elem.leftOn > prevVal) return elem.leftOn;
        return prevVal;
      }, 0);

      return maxTime - minTime;
    }

    function getAverageActivityScore() {
      let meetingAveragePoints = 0;

      const allUsers = Object.values(activitiesJson.users || {})
        .filter((currUser) => !currUser.isModerator);
      const nrOfUsers = allUsers.length;

      if (nrOfUsers === 0) return meetingAveragePoints;

      // Calculate points of Talking
      const usersTalkTime = allUsers.map((currUser) => currUser.talk.totalTime);
      const maxTalkTime = Math.max(...usersTalkTime);
      const totalTalkTime = usersTalkTime.reduce((prev, val) => prev + val, 0);
      if (totalTalkTime > 0) {
        meetingAveragePoints += ((totalTalkTime / nrOfUsers) / maxTalkTime) * 2;
      }

      // Calculate points of Chatting
      const usersTotalOfMessages = allUsers.map((currUser) => currUser.totalOfMessages);
      const maxMessages = Math.max(...usersTotalOfMessages);
      const totalMessages = usersTotalOfMessages.reduce((prev, val) => prev + val, 0);
      if (maxMessages > 0) {
        meetingAveragePoints += ((totalMessages / nrOfUsers) / maxMessages) * 2;
      }

      // Calculate points of Raise hand
      const usersRaiseHand = allUsers.map((currUser) => currUser.emojis.filter((emoji) => emoji.name === 'raiseHand').length);
      const maxRaiseHand = Math.max(...usersRaiseHand);
      const totalRaiseHand = usersRaiseHand.reduce((prev, val) => prev + val, 0);
      if (maxRaiseHand > 0) {
        meetingAveragePoints += ((totalRaiseHand / nrOfUsers) / maxRaiseHand) * 2;
      }

      // Calculate points of Emojis
      const usersEmojis = allUsers.map((currUser) => currUser.emojis.filter((emoji) => emoji.name !== 'raiseHand').length);
      const maxEmojis = Math.max(...usersEmojis);
      const totalEmojis = usersEmojis.reduce((prev, val) => prev + val, 0);
      if (maxEmojis > 0) {
        meetingAveragePoints += ((totalEmojis / nrOfUsers) / maxEmojis) * 2;
      }

      // Calculate points of Polls
      const totalOfPolls = Object.values(activitiesJson.polls || {}).length;
      if (totalOfPolls > 0) {
        const totalAnswers = allUsers
          .reduce((prevVal, currUser) => prevVal + Object.values(currUser.answers || {}).length, 0);
        meetingAveragePoints += ((totalAnswers / nrOfUsers) / totalOfPolls) * 2;
      }

      return meetingAveragePoints;
    }

    function getErrorMessage() {
      if (learningDashboardAccessToken === '' && sessionToken === '') {
        return intl.formatMessage({ id: 'app.learningDashboard.errors.invalidToken', defaultMessage: 'Invalid session token' });
      }

      if (activitiesJson === {} || typeof activitiesJson.name === 'undefined') {
        return intl.formatMessage({ id: 'app.learningDashboard.errors.dataUnavailable', defaultMessage: 'Data is no longer available' });
      }

      return '';
    }

    if (loading === false && getErrorMessage() !== '') return <ErrorMessage message={getErrorMessage()} />;

    return (
      <div className="mx-10">
        <div className="flex flex-col sm:flex-row items-start justify-between pb-3">
          <h1 className="mt-3 text-2xl font-semibold whitespace-nowrap inline-block">
            <FormattedMessage id="app.learningDashboard.dashboardTitle" defaultMessage="Learning Dashboard" />
            {
              ldAccessTokenCopied === true
                ? (
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    <FormattedMessage id="app.learningDashboard.linkCopied" defaultMessage="Link successfully copied!" />
                  </span>
                )
                : null
            }
            <br />
            <span className="text-sm font-medium">{activitiesJson.name || ''}</span>
          </h1>
          <div className="mt-3 col-text-right py-1 text-gray-500 inline-block">
            <p className="font-bold">
              <div className="inline">
                <FormattedDate
                  value={activitiesJson.createdOn}
                  year="numeric"
                  month="short"
                  day="numeric"
                />
              </div>
              &nbsp;&nbsp;
              {
                activitiesJson.endedOn > 0
                  ? (
                    <span className="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full">
                      <FormattedMessage id="app.learningDashboard.indicators.meetingStatusEnded" defaultMessage="Ended" />
                    </span>
                  )
                  : null
              }
              {
                activitiesJson.endedOn === 0
                  ? (
                    <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
                      <FormattedMessage id="app.learningDashboard.indicators.meetingStatusActive" defaultMessage="Active" />
                    </span>
                  )
                  : null
              }
            </p>
            <p>
              <FormattedMessage id="app.learningDashboard.indicators.duration" defaultMessage="Duration" />
              :&nbsp;
              {tsToHHmmss(totalOfActivity())}
            </p>
          </div>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
          <div aria-hidden="true" className="cursor-pointer" onClick={() => { this.setState({ tab: 'overview' }); }}>
            <Card
              name={
                activitiesJson.endedOn === 0
                  ? intl.formatMessage({ id: 'app.learningDashboard.indicators.usersOnline', defaultMessage: 'Active Users' })
                  : intl.formatMessage({ id: 'app.learningDashboard.indicators.usersTotal', defaultMessage: 'Total Number Of Users' })
              }
              number={Object
                .values(activitiesJson.users || {})
                .filter((u) => activitiesJson.endedOn > 0
                  || Object.values(u.intIds)[Object.values(u.intIds).length - 1].leftOn === 0)
                .length}
              cardClass={tab === 'overview' ? 'border-pink-500' : 'hover:border-pink-500 border-white'}
              iconClass="bg-pink-50 text-pink-500"
              onClick={() => {
                this.setState({ tab: 'overview' });
              }}
            >
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </Card>
          </div>
          <div aria-hidden="true" className="cursor-pointer" onClick={() => { this.setState({ tab: 'overview_activityscore' }); }}>
            <Card
              name={intl.formatMessage({ id: 'app.learningDashboard.indicators.activityScore', defaultMessage: 'Activity Score' })}
              number={intl.formatNumber((getAverageActivityScore() || 0), {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              })}
              cardClass={tab === 'overview_activityscore' ? 'border-green-500' : 'hover:border-green-500 border-white'}
              iconClass="bg-green-200 text-green-500"
            >
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
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
            </Card>
          </div>
          <div aria-hidden="true" className="cursor-pointer" onClick={() => { this.setState({ tab: 'status_timeline' }); }}>
            <Card
              name={intl.formatMessage({ id: 'app.learningDashboard.indicators.timeline', defaultMessage: 'Timeline' })}
              number={totalOfEmojis()}
              cardClass={tab === 'status_timeline' ? 'border-purple-500' : 'hover:border-purple-500 border-white'}
              iconClass="bg-purple-200 text-purple-500"
            >
              {this.fetchMostUsedEmojis()}
            </Card>
          </div>
          <div aria-hidden="true" className="cursor-pointer" onClick={() => { this.setState({ tab: 'polling' }); }}>
            <Card
              name={intl.formatMessage({ id: 'app.learningDashboard.indicators.polls', defaultMessage: 'Polls' })}
              number={Object.values(activitiesJson.polls || {}).length}
              cardClass={tab === 'polling' ? 'border-blue-500' : 'hover:border-blue-500 border-white'}
              iconClass="bg-blue-100 text-blue-500"
            >
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
            </Card>
          </div>
        </div>
        <h1 className="block my-2 pr-2 text-xl font-semibold">
          { tab === 'overview' || tab === 'overview_activityscore'
            ? <FormattedMessage id="app.learningDashboard.usersTable.title" defaultMessage="Overview" />
            : null }
          { tab === 'status_timeline'
            ? <FormattedMessage id="app.learningDashboard.statusTimelineTable.title" defaultMessage="Timeline" />
            : null }
          { tab === 'polling'
            ? <FormattedMessage id="app.learningDashboard.pollsTable.title" defaultMessage="Polls" />
            : null }
        </h1>
        <div className="w-full overflow-hidden rounded-md shadow-xs border-2 border-gray-100">
          <div className="w-full overflow-x-auto">
            { (tab === 'overview' || tab === 'overview_activityscore')
              ? (
                <UsersTable
                  allUsers={activitiesJson.users}
                  totalOfActivityTime={totalOfActivity()}
                  totalOfPolls={Object.values(activitiesJson.polls || {}).length}
                  tab={tab}
                />
              )
              : null }
            { (tab === 'status_timeline')
              ? (
                <StatusTable
                  allUsers={activitiesJson.users}
                  slides={activitiesJson.presentationSlides}
                  meetingId={activitiesJson.intId}
                />
              )
              : null }
            { tab === 'polling'
              ? <PollsTable polls={activitiesJson.polls} allUsers={activitiesJson.users} />
              : null }
            <UserDetails dataJson={activitiesJson} />
          </div>
        </div>
        <hr className="my-8" />
        <div className="flex justify-between pb-8 text-xs text-gray-700 dark:text-gray-400 whitespace-nowrap flex-col sm:flex-row">
          <div className="flex flex-col justify-center mb-4 sm:mb-0">
            <p>
              {
                lastUpdated && (
                  <>
                    <FormattedMessage
                      id="app.learningDashboard.lastUpdatedLabel"
                      defaultMessage="Last updated at"
                    />
                    &nbsp;
                    <FormattedTime
                      value={lastUpdated}
                    />
                    &nbsp;
                    <FormattedDate
                      value={lastUpdated}
                      year="numeric"
                      month="long"
                      day="numeric"
                    />
                  </>
                )
              }
            </p>
          </div>
          <button
            type="button"
            className="border-2 border-gray-200 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring ring-offset-2 focus:ring-gray-500 focus:ring-opacity-50"
            onClick={this.handleSaveSessionData.bind(this)}
          >
            <FormattedMessage
              id="app.learningDashboard.downloadSessionDataLabel"
              defaultMessage="Download Session Data"
            />
          </button>
        </div>
      </div>
    );
  }
}

App.contextType = UserDetailsContext;

export default injectIntl(App);
