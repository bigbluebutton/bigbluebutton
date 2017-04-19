import React, { PropTypes } from 'react';
import ShapeGroupContainer from '../whiteboard/shape-group/container.jsx';
import Cursor from './cursor/component.jsx';
import PresentationToolbarContainer from './presentation-toolbar/container.jsx';
import Slide from './slide/component.jsx';
import styles from './styles.scss';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PollingContainer from '/imports/ui/components/polling/container';
import PresentationOverlayContainer from './presentation-overlay/container';
import WhiteboardOverlayContainer from '/imports/ui/components/whiteboard/whiteboard-overlay/component';
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
    var fn = setTimeout(this.handleResize.bind(this), 0);
    window.addEventListener('resize', () => {
      setTimeout(this.handleResize.bind(this), 0);
    });
    this.setState({
      paperHeight: this.refs.presentationPaper.parentNode.clientHeight,
      paperWidth: this.refs.presentationPaper.parentNode.clientWidth,
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
    this.setState({
      paperHeight: this.refs.presentationPaper.clientHeight,
      paperWidth: this.refs.presentationPaper.clientWidth,
    });
  }

  renderPresentationArea() {

    if (this.props.currentSlide) {
      let adjustedSizes = this.calculateSize();
      let slideObj = this.props.currentSlide.slide;
      let x = -slideObj.x_offset * 2 * adjustedSizes.width / 100;
      let y = -slideObj.y_offset * 2 * adjustedSizes.height / 100;
      let viewBoxWidth = adjustedSizes.width * slideObj.width_ratio / 100;
      let viewBoxHeight = adjustedSizes.height * slideObj.height_ratio / 100;
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
                currentSlide={this.props.currentSlide}
                paperWidth={adjustedSizes.width}
                paperHeight={adjustedSizes.height}
              />
              <ShapeGroupContainer
                width = {adjustedSizes.width}
                height = {adjustedSizes.height}
                whiteboardId = {slideObj.id}
              />
              {this.props.cursor ?
                <Cursor
                viewBoxWidth={viewBoxWidth}
                viewBoxHeight={viewBoxHeight}
                viewBoxX={x}
                viewBoxY={y}
                widthRatio={slideObj.width_ratio}
                cursorX={this.props.cursor.x}
                cursorY={this.props.cursor.y}
                />
              : null }
            </g>
            {this.props.userIsPresenter ?
              <PresentationOverlayContainer
                x={x}
                y={y}
                vbwidth={viewBoxWidth}
                vbheight={viewBoxHeight}
              >
                <WhiteboardOverlayContainer />
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
    console.log('rendering the whiteboard toolbar');
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
