import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PresentationAreaContainer from '../presentation/container';

class PresentationPods extends Component {
  render() {
    /*
      filtering/sorting presentation pods goes here
      all the future UI for the pods also goes here
      PresentationAreaContainer should fill any empty box provided by us
    */
    return (
      <PresentationAreaContainer podId="DEFAULT_PRESENTATION_POD" {...this.props} />
    );
  }
}

export default PresentationPods;

PresentationPods.propTypes = {
  presentationPodIds: PropTypes.arrayOf(PropTypes.shape({
    podId: PropTypes.string.isRequired,
  })).isRequired,
};
