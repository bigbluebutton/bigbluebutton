import React from 'react';
import PropTypes from 'prop-types';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import WhiteboardOverlayContainer from '/imports/ui/components/whiteboard/whiteboard-overlay/container';
import WhiteboardToolbarContainer from '/imports/ui/components/whiteboard/whiteboard-toolbar/container';
import PollingContainer from '/imports/ui/components/polling/container';
import CursorWrapperContainer from './cursor/cursor-wrapper-container/container';
import AnnotationGroupContainer from '../whiteboard/annotation-group/container';
import PresentationToolbarContainer from './presentation-toolbar/container';
import PresentationOverlayContainer from './presentation-overlay/container';
import Slide from './slide/component';
import styles from './styles.scss';


export default class PresentationArea extends React.Component {
  constructor() {
    super();

    this.state = {
      paperWidth: 0,
      paperHeight: 0,
      showSlide: false,
    };

    this.getSvgRef = this.getSvgRef.bind(this);
  }

  componentDidMount() {
    // adding an event listener to scale the whiteboard on 'resize' events sent by chat/userlist etc
    window.addEventListener('resize', () => {
      setTimeout(this.handleResize.bind(this), 0);
    });

    const { presentationPaper, whiteboardSizeAvailable } = this;
    this.getInitialPaperSizes(presentationPaper, whiteboardSizeAvailable);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  // returns a ref to the svg element, which is required by a WhiteboardOverlay
  // to transform screen coordinates to svg coordinate system
  getSvgRef() {
    return this.svggroup;
  }

  getInitialPaperSizes(presentationPaper, whiteboardSizeAvailable) {
    // determining the paperWidth and paperHeight (available space for the svg) on the initial load
    let clientHeight;
    let clientWidth;
    if (this.props.userIsPresenter) {
      clientHeight = whiteboardSizeAvailable.clientHeight;
      clientWidth = whiteboardSizeAvailable.clientWidth;
    } else {
      clientHeight = presentationPaper.clientHeight;
      clientWidth = presentationPaper.clientWidth;
    }

    // setting the state of the paperWidth and paperheight (available space for the svg)
    // and set the showSlide to true to start rendering the slide
    this.setState({
      paperHeight: clientHeight,
      paperWidth: clientWidth,
      showSlide: true,
    });
  }

  handleResize() {
    const { presentationPaper, whiteboardSizeAvailable } = this;

    // if a user is a presenter - this means there is a whiteboardToolBar on the right
    // and we have to get the width/height of the whiteboardSizeAvailable
    // (inner hidden div with absolute position)
    let clientHeight;
    let clientWidth;
    if (this.props.userIsPresenter) {
      clientHeight = whiteboardSizeAvailable.clientHeight;
      clientWidth = whiteboardSizeAvailable.clientWidth;
    // user is not a presenter - we can get the sizes of the presentationPaper
    // direct parent of the svg wrapper
    } else {
      clientHeight = presentationPaper.clientHeight;
      clientWidth = presentationPaper.clientWidth;
    }

    // updating the size of the space available for the slide
    this.setState({
      paperHeight: clientHeight,
      paperWidth: clientWidth,
    });
  }

  calculateSize() {
    const originalWidth = this.props.currentSlide.width;
    const originalHeight = this.props.currentSlide.height;

    let adjustedWidth;
    let adjustedHeight;

    // Slide has a portrait orientation
    if (originalWidth <= originalHeight) {
      adjustedWidth = (this.state.paperHeight * originalWidth) / originalHeight;
      if (this.state.paperWidth < adjustedWidth) {
        adjustedHeight = (this.state.paperHeight * this.state.paperWidth) / adjustedWidth;
        adjustedWidth = this.state.paperWidth;
      } else {
        adjustedHeight = this.state.paperHeight;
      }

      // Slide has a landscape orientation
    } else {
      adjustedHeight = (this.state.paperWidth * originalHeight) / originalWidth;
      if (this.state.paperHeight < adjustedHeight) {
        adjustedWidth = (this.state.paperWidth * this.state.paperHeight) / adjustedHeight;
        adjustedHeight = this.state.paperHeight;
      } else {
        adjustedWidth = this.state.paperWidth;
      }
    }
    return {
      width: adjustedWidth,
      height: adjustedHeight,
    };
  }

  // renders the whole presentation area
  renderPresentationArea() {
    // sometimes tomcat publishes the slide url, but the actual file is not accessible (why?)
    if (this.props.currentSlide &&
        this.props.currentSlide.width &&
        this.props.currentSlide.height) {
      // to control the size of the svg wrapper manually
      // and adjust cursor's thickness, so that svg didn't scale it automatically
      const adjustedSizes = this.calculateSize();

      // a reference to the slide object
      const slideObj = this.props.currentSlide;

      // calculating the svg's coordinate system; we set it based on the slide's width/height ratio
      // the longest value becomes '1000' and the second is calculated accordingly to keep the ratio
      // if we don't do it, then the shapes' thickness changes with the slides' resolution
      // 1000 makes html5 shapes' thickness approximately match
      // Flash client's shapes' thickness in a default view (full screen window) at this point.
      let svgWidth;
      let svgHeight;
      if (slideObj.width > slideObj.height) {
        svgWidth = 1000;
        svgHeight = 1000 / (slideObj.width / slideObj.height);
      } else {
        svgHeight = 1000;
        svgWidth = 1000 / (slideObj.height / slideObj.width);
      }

      // calculating viewBox and offsets for the current presentation
      const x = ((-slideObj.xOffset * 2) * svgWidth) / 100;
      const y = ((-slideObj.yOffset * 2) * svgHeight) / 100;
      const viewBoxWidth = (svgWidth * slideObj.widthRatio) / 100;
      const viewBoxHeight = (svgHeight * slideObj.heightRatio) / 100;

      return (
        <div
          style={{
            width: adjustedSizes.width,
            height: adjustedSizes.height,
            WebkitTransition: 'width 0.2s', /* Safari */
            transition: 'width 0.2s',
          }}
        >
          <CSSTransitionGroup
            transitionName={{
              enter: styles.enter,
              enterActive: styles.enterActive,
              appear: styles.appear,
              appearActive: styles.appearActive,
            }}
            transitionAppear
            transitionEnter
            transitionLeave={false}
            transitionAppearTimeout={400}
            transitionEnterTimeout={400}
            transitionLeaveTimeout={400}
          >
            <svg
              width={svgWidth}
              height={svgHeight}
              ref={(ref) => { if (ref != null) { this.svggroup = ref; } }}
              viewBox={`${x} ${y} ${viewBoxWidth} ${viewBoxHeight}`}
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.svgStyles}
              key={slideObj.id}
            >
              <defs>
                <clipPath id="viewBox">
                  <rect x={x} y={y} width="100%" height="100%" fill="none" />
                </clipPath>
              </defs>
              <g clipPath="url(#viewBox)">
                <Slide
                  id="slideComponent"
                  currentSlide={this.props.currentSlide}
                  svgWidth={svgWidth}
                  svgHeight={svgHeight}
                />
                <AnnotationGroupContainer
                  width={svgWidth}
                  height={svgHeight}
                  whiteboardId={slideObj.id}
                />
                <CursorWrapperContainer
                  widthRatio={slideObj.widthRatio}
                  physicalWidthRatio={adjustedSizes.width / svgWidth}
                  slideWidth={svgWidth}
                  slideHeight={svgHeight}
                />
              </g>
              {this.props.userIsPresenter || this.props.multiUser ?
                <PresentationOverlayContainer
                  slideWidth={svgWidth}
                  slideHeight={svgHeight}
                >
                  <WhiteboardOverlayContainer
                    getSvgRef={this.getSvgRef}
                    whiteboardId={slideObj.id}
                    slideWidth={svgWidth}
                    slideHeight={svgHeight}
                    viewBoxX={x}
                    viewBoxY={y}
                    viewBoxWidth={viewBoxWidth}
                    viewBoxHeight={viewBoxHeight}
                    physicalViewBoxWidth={adjustedSizes.width}
                  />
                </PresentationOverlayContainer>
              : null }
            </svg>
          </CSSTransitionGroup>
        </div>
      );
    }
    return null;
  }

  renderPresentationToolbar() {
    if (this.props.currentSlide) {
      return (
        <PresentationToolbarContainer
          currentSlideNum={this.props.currentSlide.num}
          presentationId={this.props.currentSlide.presentationId}
        />
      );
    }
    return null;
  }

  renderWhiteboardToolbar() {
    const adjustedSizes = this.calculateSize();

    return (
      <WhiteboardToolbarContainer
        whiteboardId={this.props.currentSlide.id}
        height={adjustedSizes.height}
      />
    );
  }

  render() {
    return (
      <div className={styles.presentationContainer}>
        <div
          ref={(ref) => { this.presentationPaper = ref; }}
          className={styles.presentationPaper}
        >
          <div
            ref={(ref) => { this.whiteboardSizeAvailable = ref; }}
            className={styles.whiteboardSizeAvailable}
          />
          {this.state.showSlide ?
              this.renderPresentationArea()
            : null }
          {this.props.userIsPresenter || this.props.multiUser ?
              this.renderWhiteboardToolbar()
            : null }
        </div>
        <PollingContainer />
        {this.renderPresentationToolbar()}
      </div>
    );
  }
}

PresentationArea.propTypes = {
  // Defines a boolean value to detect whether a current user is a presenter
  userIsPresenter: PropTypes.bool.isRequired,
  currentSlide: PropTypes.shape({
    // TODO don't need meetingId here
    meetingId: PropTypes.string,
    presentationId: PropTypes.string.isRequired,
    current: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    heightRatio: PropTypes.number.isRequired,
    widthRatio: PropTypes.number.isRequired,
    xOffset: PropTypes.number.isRequired,
    yOffset: PropTypes.number.isRequired,
    num: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    svgUri: PropTypes.string,
    pngUri: PropTypes.string,
    // TODO we don't use any of thefollowing uris here
    swfUri: PropTypes.string.isRequired,
    thumbUri: PropTypes.string.isRequired,
    txtUri: PropTypes.string.isRequired,
  }),
  // current multi-user status
  multiUser: PropTypes.bool.isRequired,
};

PresentationArea.defaultProps = {
  currentSlide: undefined,
};
