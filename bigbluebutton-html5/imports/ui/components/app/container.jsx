import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import App from './component';
import { pollExists } from './service';

import NavBarContainer from '../nav-bar/NavBarContainer';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/MediaContainer';
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
