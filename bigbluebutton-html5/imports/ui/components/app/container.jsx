import React, { Component, PropTypes, cloneElement } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import App from './component';
import { subscribeForData, pollExists, didUserWasKicked, redirectToLogoutUrl } from './service';
import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';
import SettingsModal from '../modals/settings/SettingsModal';

const defaultProps = {
  navbar: <NavBarContainer />,
  actionsbar: <ActionsBarContainer />,
  media: <MediaContainer />,
  settings: <SettingsModal />,
};

class AppContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // inject location on the navbar container
    let navbarWithLocation = cloneElement(this.props.navbar, { location: this.props.location });

    return (
      <App {...this.props} navbar={navbarWithLocation}>
        {this.props.children}
      </App>
    );
  }
}

const actionControlsToShow = () => {
  if (pollExists()) {
    return <PollingContainer />;
  } else {
    return <ActionsBarContainer />;
  }
};

let loading = true;
const loadingDep = new Tracker.Dependency;

const getLoading = () => {
  loadingDep.depend();
  return loading;
};

const setLoading = (val) => {
  if (val !== loading) {
    loading = val;
    loadingDep.changed();
  }
};

export default createContainer(() => {
  Promise.all(subscribeForData())
  .then(() => {
    setLoading(false);
  });

  return {
    wasKicked: didUserWasKicked(),
    isLoading: getLoading(),
    redirectToLogoutUrl,
    actionsbar: <ActionsBarContainer />,
  };
}, AppContainer);

AppContainer.defaultProps = defaultProps;
