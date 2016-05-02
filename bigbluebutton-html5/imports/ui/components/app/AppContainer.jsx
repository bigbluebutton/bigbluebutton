import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import App from './App.jsx';

import NavbarContainer from '../navbar/NavbarContainer.jsx';
import ActionsbarContainer from '../actionsbar/ActionsbarContainer.jsx';
import MediaContainer from '../media/MediaContainer.jsx';

const defaultProps = {
  navbar: <NavbarContainer/>,
  actionsbar: <ActionsbarContainer/>,
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
