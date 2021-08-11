import React from 'react';
import './App.css';
import './bbb-icons.css';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';
import Card from './components/Card';
import UsersTable from './components/UsersTable';
import PollsTable from './components/PollsTable';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activitiesJson: {},
      tab: 'overview',
    };
  }

  componentDidMount() {
    this.fetchActivitiesJson();
    setInterval(() => {
      this.fetchActivitiesJson();
    }, 10000);
  }

  fetchActivitiesJson() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if (typeof params.meeting === 'undefined') return;
    if (typeof params.report === 'undefined') return;

    fetch(`${params.meeting}/${params.report}/activity_report.json`)
      .then((response) => response.json())
      .then((json) => {
        this.setState({ activitiesJson: json });
        document.title = `Dashboard - ${json.name}`;
      });
  }

  render() {
    const { activitiesJson, tab } = this.state;
    const { intl } = this.props;

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
      const minTime = Object.values(activitiesJson.users || {}).reduce((prevVal, elem) => {
        if (prevVal === 0 || elem.registeredOn < prevVal) return elem.registeredOn;
        return prevVal;
      }, 0);

      const maxTime = Object.values(activitiesJson.users || {}).reduce((prevVal, elem) => {
        if (elem.leftOn === 0) return (new Date()).getTime();
        if (elem.leftOn > prevVal) return elem.leftOn;
        return prevVal;
      }, 0);

      return maxTime - minTime;
    }

    return (
      <div className="mx-10">
        <div className="flex items-start justify-between pb-3">
          <h1 className="mt-3 text-2xl font-semibold whitespace-nowrap inline-block">
            <FormattedMessage id="app.learningDashboard.dashboardTitle" defaultMessage="Learning Dashboard" />
          </h1>
          <div className="mt-3 text-right px-4 py-1 text-gray-500 inline-block">
            <p className="font-bold">
              {activitiesJson.name || ''}
              {
                        activitiesJson.endedOn > 0
                          ? (
                            <span className="px-2 py-1 ml-3 font-semibold leading-tight text-red-700 bg-red-100 rounded-full">
                              <FormattedMessage id="app.learningDashboard.indicators.meetingStatusEnded" defaultMessage="Ended" />
                            </span>
                          )
                          : (
                            <span className="px-2 py-1 ml-3 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
                              <FormattedMessage id="app.learningDashboard.indicators.meetingStatusActive" defaultMessage="Active" />
                            </span>
                          )
                    }
            </p>
            <p>
              <FormattedDate
                value={activitiesJson.createdOn}
                year="numeric"
                month="short"
                day="numeric"
              />
            </p>
          </div>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
          <Card
            name={intl.formatMessage({ id: 'app.learningDashboard.indicators.participants', defaultMessage: 'Participants' })}
            number={Object.values(activitiesJson.users || {}).length}
            cardClass="border-pink-500"
            iconClass="bg-pink-50 text-pink-500"
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
          <Card
            name={intl.formatMessage({ id: 'app.learningDashboard.indicators.duration', defaultMessage: 'Duration' })}
            number={tsToHHmmss(totalOfActivity())}
            cardClass="border-green-500"
            iconClass="bg-green-100 text-green-500"
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
        <select
          className="block my-1 rounded-md border-gray-300 text-xl font-semibold bg-gray-50 pr-2"
          onChange={(event) => {
            this.setState({ tab: event.target.value });
          }}
        >
          <option value="overview">
            {
                    intl.formatMessage({
                      id: 'app.learningDashboard.participantsTable.title',
                      defaultMessage: 'Overview',
                    })
                }
          </option>
          <option value="polling">
            {
                    intl.formatMessage({
                      id: 'app.learningDashboard.pollsTable.title',
                      defaultMessage: 'Polling',
                    })
                }
          </option>
        </select>
        <div className="w-full overflow-hidden rounded-md shadow-xs border-2 border-gray-100">
          <div className="w-full overflow-x-auto">
            { tab === 'overview'
              ? (
                <UsersTable
                  allUsers={activitiesJson.users}
                  totalOfActivityTime={totalOfActivity()}
                />
              )
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
