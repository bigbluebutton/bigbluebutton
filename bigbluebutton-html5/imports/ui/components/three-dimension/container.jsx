import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import Three from '/imports/api/three-dimension';


class ThreeDContainer extends Component {
  render() {
    return (
      <canvas width={400} height={300} render={this.threed} />

    );
  }
}

export default withTracker(() => {
  const sceneHandle = Meteor.subscribe('three-d');
  const threed = Three.find({}).fetch();
  return {
    threed,

  };
})(ThreeDContainer);
