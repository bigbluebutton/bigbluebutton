import React from 'react';
import './App.css';
import './bbb-icons.css';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';
import Card from './components/Card';
import UsersTable from './components/UsersTable';
import StatusTable from './components/StatusTable';
import PollsTable from './components/PollsTable';
import ErrorMessage from './components/ErrorMessage';

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
    };
  }

  componentDidMount() {
    this.setDashboardParams(() => {
      this.fetchActivitiesJson();
    });
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
        if (val.indexOf(`${cookieName}=`) === 0) learningDashboardAccessToken = val.substring((`${cookieName}=`).length);
      });

      // Extend AccessToken lifetime by 7d (in each access)
      if (learningDashboardAccessToken !== '') {
        const cookieExpiresDate = new Date();
        cookieExpiresDate.setTime(cookieExpiresDate.getTime() + (3600000 * 24 * 7));
        document.cookie = `ld-${meetingId}=${learningDashboardAccessToken}; expires=${cookieExpiresDate.toGMTString()}; path=/;SameSite=None;Secure`;
      }
    }

    this.setState({ learningDashboardAccessToken, meetingId, sessionToken }, () => {
      if (typeof callback === 'function') callback();
    });
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
          });
          document.title = `Learning Dashboard - ${json.name}`;
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
            });
            document.title = `Learning Dashboard - ${jsonData.name}`;
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
      activitiesJson, tab, sessionToken, loading,
      learningDashboardAccessToken, ldAccessTokenCopied,
    } = this.state;
    const { intl } = this.props;

    document.title = `${intl.formatMessage({ id: 'app.learningDashboard.dashboardTitle', defaultMessage: 'Learning Dashboard' })} - ${activitiesJson.name}`;

    function totalOfRaiseHand() {
      if (activitiesJson && activitiesJson.users) {
        return Object.values(activitiesJson.users)
          .reduce((prevVal, elem) => prevVal + elem.emojis.filter((emoji) => emoji.name === 'raiseHand').length, 0);
      }
      return 0;
    }

    function tsToHHmmss(ts) {
      return (new Date(ts).toISOString().substr(11, 8));
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
        meetingAveragePoints += ((totalRaiseHand / nrOfUsers) / maxMessages) * 2;
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
        <div className="flex items-start justify-between pb-3">
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
              cardClass="border-pink-500"
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
          <div aria-hidden="true" className="cursor-pointer" onClick={() => { this.setState({ tab: 'polling' }); }}>
            <Card
              name={intl.formatMessage({ id: 'app.learningDashboard.indicators.polls', defaultMessage: 'Polls' })}
              number={Object.values(activitiesJson.polls || {}).length}
              cardClass="border-blue-500"
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
          <div aria-hidden="true" className="cursor-pointer" onClick={() => { this.setState({ tab: 'status_timeline' }); }}>
            <Card
              name={intl.formatMessage({ id: 'app.learningDashboard.indicators.raiseHand', defaultMessage: 'Raise Hand' })}
              number={totalOfRaiseHand()}
              cardClass="border-purple-500"
              iconClass="bg-purple-200 text-purple-500"
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
                  d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
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
              cardClass="border-green-500"
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
        </div>
        <h1 className="block my-1 pr-2 text-xl font-semibold">
          { tab === 'overview' || tab === 'overview_activityscore'
            ? <FormattedMessage id="app.learningDashboard.usersTable.title" defaultMessage="Overview" />
            : null }
          { tab === 'status_timeline'
            ? <FormattedMessage id="app.learningDashboard.statusTimelineTable.title" defaultMessage="Status Timeline" />
            : null }
          { tab === 'polling'
            ? <FormattedMessage id="app.learningDashboard.pollsTable.title" defaultMessage="Polling" />
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
              ? <StatusTable allUsers={activitiesJson.users} />
              : null }
            { tab === 'polling'
              ? <PollsTable polls={activitiesJson.polls} allUsers={activitiesJson.users} />
              : null }
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(App);
