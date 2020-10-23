import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '../modal/service';

import AppView from './AppView';

class AppContainer extends Component {
  componentDidMount() {
    console.log(this.props);
  }

  render() {
    return (
      <AppView {...this.props} />
    );
  }
}

export default withModalMounter(withTracker(() => ({}))(AppContainer));
