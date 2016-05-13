import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import App from './App.jsx';
import {pollExists} from './AppService';

import NavBarContainer from '../nav-bar/NavBarContainer.jsx';
import ActionsBarContainer from '../actions-bar/ActionsBarContainer.jsx';
import MediaContainer from '../media/MediaContainer.jsx';
import PollingContainer from '../polling/PollingContainer.jsx';
import SettingsModal from '../modals/settings/SettingsModal.jsx';

const defaultProps = {
  navbar: <NavBarContainer/>,
  actionsbar: <ActionsBarContainer/>,
  media: <MediaContainer/>,
  settings: <SettingsModal />,
};

class AppContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      meetingID: localStorage.getItem('meetingID'),
      userID: localStorage.getItem('userID'),
      authToken: localStorage.getItem('authToken'),
    };
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

export default createContainer(() => {
  const data = { actionsbar: actionControlsToShow() };
  return data;
}, AppContainer);
