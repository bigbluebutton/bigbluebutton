import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import PresentationContainer from '../presentation/container';

class PresentationPods extends PureComponent {
  constructor() {
    super();

    this.state = {
      separatePresentationWindow: false,
    };

    this.previousSvgSize = {width:0, height:0};
    this.previousToolbarHeight = 0;
    this.setSeparatePresentationWindow = this.setSeparatePresentationWindow.bind(this);
    this.toggleSeparatePresentationWindow = this.toggleSeparatePresentationWindow.bind(this);
    this.setPreviousSvgSize = this.setPreviousSvgSize.bind(this);
    this.getPreviousSvgSize = this.getPreviousSvgSize.bind(this);
    this.setPreviousToolbarHeight = this.setPreviousToolbarHeight.bind(this);
    this.getPreviousToolbarHeight = this.getPreviousToolbarHeight.bind(this);
  }

  setSeparatePresentationWindow(isSeparate) {
    this.setState({ separatePresentationWindow: isSeparate });
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

  toggleSeparatePresentationWindow() {
    const { separatePresentationWindow } = this.state;
    this.setState({ separatePresentationWindow: !separatePresentationWindow });
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
        key={this.state.separatePresentationWindow && this.state.separatePresentationWindow.id}
        separatePresentationWindow={this.state.separatePresentationWindow}
        setSeparatePresentationWindow={this.setSeparatePresentationWindow}
        toggleSeparatePresentationWindow={this.toggleSeparatePresentationWindow}
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
