import React, { Component, PropTypes, cloneElement } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import App from './component';
import { subscribeForData, wasUserKicked, redirectToLogoutUrl } from './service';
import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';
import SettingsModal from '../modals/settings/SettingsModal';
import ClosedCaptionsContainer from '../closed-captions/container';

const defaultProps = {
  navbar: <NavBarContainer />,
  actionsbar: <ActionsBarContainer />,
  media: <MediaContainer />,
  settings: <SettingsModal />,
  captions: <ClosedCaptionsContainer />,
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
    wasKicked: wasUserKicked(),
    isLoading: getLoading(),
    redirectToLogoutUrl,
  };
}, AppContainer);

AppContainer.defaultProps = defaultProps;
