import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import App from './component';
import { pollExists } from './service';

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

export default createContainer(() => {
  const data = { actionsbar: <ActionsBarContainer /> };
  return data;
}, AppContainer);
