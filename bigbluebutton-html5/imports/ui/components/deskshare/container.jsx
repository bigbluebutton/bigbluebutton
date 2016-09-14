import React from 'react';
import {shouldShowComponent, presenterDeskshareHasEnded} from './service';
import { createContainer } from 'meteor/react-meteor-data';
import DeskshareComponent from './component';

class DeskshareContainer extends React.Component {
  render() {
    if (this.props.shouldShowComponent) {
      return <DeskshareComponent />;
    } else {
      return <p>hello</p>;
    }
  }

  componentWillUnmount() {
    presenterDeskshareHasEnded();
  }

}

export default createContainer(() => {
  const data = { shouldShowComponent: shouldShowComponent() };
  return data;
}, DeskshareContainer);
