import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import App from './component';
import { subscribeForData, pollExists } from './service';

import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';
import PollingContainer from '../polling/container';
import SettingsModal from '../modals/settings/SettingsModal';

const defaultProps = {
  navbar: <NavBarContainer/>,
  actionsbar: <ActionsBarContainer/>,
  media: <MediaContainer/>,
  settings: <SettingsModal />,
};

class AppContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <App {...this.props}>
        {this.props.children}
      </App>
    );
  }
}

AppContainer.defaultProps = defaultProps;

const actionControlsToShow = () => {
  if (pollExists()) {
    return <PollingContainer />;
  } else {
    return <ActionsBarContainer />;
  }
};

var loading = true;
var loadingDep = new Tracker.Dependency;

var getLoading = () => {
  loadingDep.depend()
  return loading;
};

var setLoading = (val) => {
  if (val !== loading) {
    loading = val;
    loadingDep.changed();
  }
};

export default createContainer(() => {
  Promise.all(subscribeForData())
  .then(() => {
    setLoading(false);
  })
  .catch(reason => console.error(reason));

  return {
    isLoading: getLoading(),
    actionsbar: actionControlsToShow()
  };
}, AppContainer);
