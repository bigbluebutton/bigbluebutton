import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import PresentationContainer from '../presentation/container';

class PresentationPods extends PureComponent {
  constructor() {
    super();

    this.state = {
      isPresentationDetached: false,
    };

    this.previousSvgSize = {width:0, height:0};
    this.previousToolbarHeight = 0;
    this.setPresentationDetached = this.setPresentationDetached.bind(this);
    this.togglePresentationDetached = this.togglePresentationDetached.bind(this);
    this.setPreviousSvgSize = this.setPreviousSvgSize.bind(this);
    this.getPreviousSvgSize = this.getPreviousSvgSize.bind(this);
    this.setPreviousToolbarHeight = this.setPreviousToolbarHeight.bind(this);
    this.getPreviousToolbarHeight = this.getPreviousToolbarHeight.bind(this);
  }

  setPresentationDetached(isDetached) {
    this.setState({ isPresentationDetached: isDetached });
  }

  setPreviousSvgSize(w, h) {
    this.previousSvgSize = {
      width: w,
      height: h,
    }
  }

  getPreviousSvgSize() {
    return this.previousSvgSize;
  }

  setPreviousToolbarHeight(h) {
    this.previousToolBarHeight = h;
  }

  getPreviousToolbarHeight() {
    return this.previousToolBarHeight;
  }

  togglePresentationDetached() {
    const { isPresentationDetached } = this.state;
    this.setState({ isPresentationDetached: !isPresentationDetached });
  }

  render() {
    /*
      filtering/sorting presentation pods goes here
      all the future UI for the pods also goes here
      PresentationContainer should fill any empty box provided by us
    */
    return (
      <PresentationContainer
        podId="DEFAULT_PRESENTATION_POD"
        key={this.state.isPresentationDetached && this.state.isPresentationDetached.id}
        isPresentationDetached={this.state.isPresentationDetached}
        setPresentationDetached={this.setPresentationDetached}
        togglePresentationDetached={this.togglePresentationDetached}
        setPreviousSvgSize={this.setPreviousSvgSize}
        getPreviousSvgSize={this.getPreviousSvgSize}
        setPreviousToolbarHeight={this.setPreviousToolbarHeight}
        getPreviousToolbarHeight={this.getPreviousToolbarHeight}
        {...this.props}
      />
    );
  }
}

export default PresentationPods;

PresentationPods.propTypes = {
  presentationPodIds: PropTypes.arrayOf(PropTypes.shape({
    podId: PropTypes.string.isRequired,
  })).isRequired,
};
