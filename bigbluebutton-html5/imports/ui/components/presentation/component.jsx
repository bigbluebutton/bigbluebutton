import React, { PropTypes } from 'react';
import ShapeGroupContainer from '../whiteboard/shape-group/container.jsx';
import CursorContainer from './cursor/container.jsx';
import PresentationToolbarContainer from './presentation-toolbar/container.jsx';
import Slide from './slide/component.jsx';
import styles from './styles.scss';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PollingContainer from '/imports/ui/components/polling/container';
import PresentationOverlayContainer from './presentation-overlay/container';
import WhiteboardOverlayContainer from '/imports/ui/components/whiteboard/whiteboard-overlay/container';
import WhiteboardToolbarContainer from '/imports/ui/components/whiteboard/whiteboard-toolbar/container';


export default class PresentationArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paperWidth: 0,
      paperHeight: 0,
      showSlide: false,
    };
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidMount() {
    //scale the whiteboard wrapper after the initial load (whiteboardSizeAvailable is rendered)
    //var fn = setTimeout(this.handleResize.bind(this), 0);

    //adding an event listener to scale the whiteboard on 'resize' events sent by chat/userlist etc
    window.addEventListener('resize', () => {
      setTimeout(this.handleResize.bind(this), 0);
    });

    //determining the paperWidth and paperHeight (available space for the svg) on the initial load
    if(this.props.userIsPresenter) {
      var clientHeight = this.refs.whiteboardSizeAvailable.clientHeight;
      var clientWidth = this.refs.whiteboardSizeAvailable.clientWidth;
    } else {
      var clientHeight = this.refs.presentationPaper.clientHeight;
      var clientWidth = this.refs.presentationPaper.clientWidth;
    }

    //setting the state of the paperWidth and paperheight (available space for the svg)
    //and set the showSlide to true to start rendering the slide
    this.setState({
      paperHeight: clientHeight,
      paperWidth: clientWidth,
      showSlide: true,
    });
  }

  calculateSize() {
    let originalWidth;
    let originalHeight;
    let adjustedWidth;
    let adjustedHeight;

    originalWidth = this.props.currentSlide.slide.width;
    originalHeight = this.props.currentSlide.slide.height;

    //Slide has a portrait orientation
    if (originalWidth <= originalHeight) {
      adjustedWidth = this.state.paperHeight * originalWidth / originalHeight;
     if (this.state.paperWidth < adjustedWidth) {
        adjustedHeight = this.state.paperHeight * this.state.paperWidth / adjustedWidth;
        adjustedWidth = this.state.paperWidth;
      } else {
        adjustedHeight = this.state.paperHeight;
      }

      //Slide has a landscape orientation
    } else {
      adjustedHeight = this.state.paperWidth * originalHeight / originalWidth;
      if (this.state.paperHeight < adjustedHeight) {
        adjustedWidth = this.state.paperWidth * this.state.paperHeight / adjustedHeight;
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

  handleResize() {
    //if a user is a presenter - this means there is a whiteboardToolBar on the right
    //and we have to get the width/height of the whiteboardSizeAvailable
    //(inner hidden div with absolute position)
    if(this.props.userIsPresenter) {
      var clientHeight = this.refs.whiteboardSizeAvailable.clientHeight;
      var clientWidth = this.refs.whiteboardSizeAvailable.clientWidth;
    //user is not a presenter - we can get the sizes of the presentationPaper
    //direct parent of the svg wrapper
    } else {
      var clientHeight = this.refs.presentationPaper.clientHeight;
      var clientWidth = this.refs.presentationPaper.clientWidth;
    }

    //updating the size of the space available for the slide
    this.setState({
      paperHeight: clientHeight,
      paperWidth: clientWidth,
    });
  }

  //returns a ref to the svg element, which is required by a WhiteboardOverlay
  //to transform screen coordinates to svg coordinate system
  getSvgRef() {
    const { svggroup } = this.refs;
    return svggroup;
  }

  //renders the whole presentation area
  renderPresentationArea() {

    //sometimes tomcat publishes the link to the slide, but the actual file is not accessible (why?)
    if (this.props.currentSlide && this.props.currentSlide.slide.width && this.props.currentSlide.slide.height) {
      //to control the size of the svg wrapper manually
      //and adjust cursor's thickness, so that svg didn't scale it automatically
      let adjustedSizes = this.calculateSize();

      //a reference to the slide object
      let slideObj = this.props.currentSlide.slide;

      //calculating the coordinate system for the svg; we set it based on the slide's width/height ratio
      //the longest value becomes '1000' and the second is calculated accordingly to keep the ratio
      //if we don't do it, then the shapes' thickness changes with the slides' resolution
      //1000 makes html5 shapes' thickness approximately match
      //Flash client's shapes' thickness in a default view (full screen window) at this point.
      let svgWidth;
      let svgHeight;
      if(slideObj.width > slideObj.height) {
        svgWidth = 1000;
        svgHeight = 1000 / (slideObj.width / slideObj.height);
      } else {
        svgHeight = 1000;
        svgWidth = 1000 / (slideObj.height / slideObj.width);
      }

      //calculating viewBox and offsets for the current presentation
      let x = -slideObj.x_offset * 2 * svgWidth / 100;
      let y = -slideObj.y_offset * 2 * svgHeight / 100;
      let viewBoxWidth = svgWidth * slideObj.width_ratio / 100;
      let viewBoxHeight = svgHeight * slideObj.height_ratio / 100;

      return (
        <div
          style={{
            width: adjustedSizes.width,
            height: adjustedSizes.height,
            WebkitTransition: 'width 0.2s', /* Safari */
            transition: 'width 0.2s',
            WebkitTransition: 'height 0.2s', /* Safari */
            transition: 'height 0.2s',
          }}
        >
        <ReactCSSTransitionGroup
          transitionName={ {
            enter: styles.enter,
            enterActive: styles.enterActive,
            appear: styles.appear,
            appearActive: styles.appearActive,
          } }
          transitionAppear={true}
          transitionEnter={true}
          transitionLeave={false}
          transitionAppearTimeout={400}
          transitionEnterTimeout={400}
          transitionLeaveTimeout={400}
        >
          <svg
            width={svgWidth}
            height={svgHeight}
            ref="svggroup"
            viewBox={`${x} ${y} ${viewBoxWidth} ${viewBoxHeight}`}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.svgStyles}
            key={slideObj.id}
          >
            <defs>
              <clipPath id="viewBox">
                <rect x={x} y={y} width="100%" height="100%" fill="none"/>
              </clipPath>
            </defs>
            <g clipPath="url(#viewBox)">
              <Slide
                id="slideComponent"
                slideHref={this.props.currentSlide.slide.img_uri}
                svgWidth={svgWidth}
                svgHeight={svgHeight}
              />
              <ShapeGroupContainer
                width={svgWidth}
                height={svgHeight}
                whiteboardId = {slideObj.id}

              />
              <CursorContainer
                viewBoxWidth={viewBoxWidth}
                viewBoxHeight={viewBoxHeight}
                viewBoxX={x}
                viewBoxY={y}
                widthRatio={slideObj.width_ratio}
                physicalWidthRatio={adjustedSizes.width / svgWidth}
              />
            </g>
            {this.props.userIsPresenter ?
              <PresentationOverlayContainer
                x={x}
                y={y}
                vbwidth={viewBoxWidth}
                vbheight={viewBoxHeight}
              >
                <WhiteboardOverlayContainer
                  getSvgRef={this.getSvgRef.bind(this)}
                  whiteboardId = {slideObj.id}
                  slideWidth={svgWidth}
                  slideHeight={svgHeight}
                  viewBoxX={x}
                  viewBoxY={y}
                />
              </PresentationOverlayContainer>
            : null }
          </svg>
        </ReactCSSTransitionGroup>
        </div>
      );
    } else {
      return null;
    }
  }

  renderPresentationToolbar() {
    if (this.props.currentSlide) {
      return (
        <PresentationToolbarContainer
          currentSlideNum={this.props.currentSlide.slide.num}
          presentationId={this.props.currentSlide.presentationId}
        />
      );
    } else {
      return null;
    }
  }

  renderWhiteboardToolbar() {
    let adjustedSizes = this.calculateSize();

    return (
      <WhiteboardToolbarContainer
        height={adjustedSizes.height}
      />
    );
  }

  render() {
    return (
      <div className={styles.presentationContainer}>
          <div
            ref="presentationPaper"
            className={styles.presentationPaper}
          >
            <div ref="whiteboardSizeAvailable" className={styles.whiteboardSizeAvailable}/>
            {this.state.showSlide ?
              this.renderPresentationArea()
            : null }
            {this.props.userIsPresenter ?
              this.renderWhiteboardToolbar()
            : null }
          </div>
        <PollingContainer />
        {this.renderPresentationToolbar()}
      </div>
    );
  }
}

PresentationArea.defaultProps = {
  svgProps: {

  },
  svgStyle: {

  },
};
