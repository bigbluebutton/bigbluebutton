import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PresenterLayoutService from './service';
import PresenterLayout from './component';

class PresenterLayoutContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <PresenterLayout {...this.props}/>
    );
  }
}

export default createContainer(() => ({
  updateCursor: PresenterLayoutService.updateCursor,
  isUserPresenter: PresenterLayoutService.getUserData().isUserPresenter,
}), PresenterLayoutContainer);
