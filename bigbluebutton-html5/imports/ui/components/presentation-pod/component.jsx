import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import PresentationContainer from '../presentation/container';

class PresentationPods extends PureComponent {
  render() {
    /*
      filtering/sorting presentation pods goes here
      all the future UI for the pods also goes here
      PresentationContainer should fill any empty box provided by us
    */
    return (
      <PresentationContainer podId="DEFAULT_PRESENTATION_POD" {...this.props} />
    );
  }
}

export default PresentationPods;

PresentationPods.propTypes = {
  presentationPodIds: PropTypes.arrayOf(PropTypes.shape({
    podId: PropTypes.string.isRequired,
  })).isRequired,
};
