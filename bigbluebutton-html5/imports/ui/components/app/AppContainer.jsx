import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import App from './App.jsx';

import NavBarContainer from '../nav-bar/NavBarContainer.jsx';
import ActionsBarContainer from '../actions-bar/ActionsBarContainer.jsx';
import MediaContainer from '../media/MediaContainer.jsx';

const defaultProps = {
  navbar: <NavBarContainer/>,
  actionsbar: <ActionsBarContainer/>,
  media: <MediaContainer/>,
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

export default createContainer(() => {
  return {};
}, AppContainer);
