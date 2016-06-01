import React, { PropTypes } from 'react';
import WhiteboardShapeModel from './shape-factory/component.jsx';
import { createContainer } from 'meteor/react-meteor-data';
import Slide from './slide/component.jsx';
import styles from './styles.scss';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class Whiteboard extends React.Component {
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
    window.addEventListener('resize', this.handleResize.bind(this));
    this.setState({
      paperHeight: this.refs.whiteboardPaper.parentNode.clientHeight,
      paperWidth: this.refs.whiteboardPaper.parentNode.clientWidth,
      showSlide: true,
    });
  }

  calculateSize() {
    let originalWidth;
    let originalHeight;
    let adjustedWidth;
    let adjustedHeight;

    originalWidth = this.props.current_slide.slide.width;
    originalHeight = this.props.current_slide.slide.height;

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
      paperHeight: this.refs.whiteboardPaper.parentNode.clientHeight,
      paperWidth: this.refs.whiteboardPaper.parentNode.clientWidth,
    });
  }

  renderWhiteboard() {
    if (this.props.current_slide) {
      let adjustedSizes = this.calculateSize();
      return (
        <div
          id="svggroup"
          style={{
            width: adjustedSizes.width,
            height: adjustedSizes.height,
            backgroundColor: 'white',
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
              {...this.props.svgProps}
              width={adjustedSizes.width}
              height={adjustedSizes.height}
              viewBox={ '0 0 ' + adjustedSizes.width + ' ' + adjustedSizes.height}
              version="1.1"
              xmlNS="http://www.w3.org/2000/svg"
              style={this.props.svgStyle}
              key={this.props.current_slide.slide.id}
            >
              <Slide
                current_slide={this.props.current_slide}
                paperWidth={adjustedSizes.width}
                paperHeight={adjustedSizes.height}
              />
              { this.props.shapes ? this.props.shapes.map((shape) =>
                <WhiteboardShapeModel
                  shape={shape}
                  key={shape.shape.id}
                />
                )
              : null }
            </svg>
          </ReactCSSTransitionGroup>
        </div>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <div
        ref="whiteboardPaper"
        className={styles.whiteboardPaper}
      >
        {this.state.showSlide ?
          this.renderWhiteboard()
        : null }
      </div>
    );
  }
}

Whiteboard.defaultProps = {
  svgProps: {
    preserveAspectRatio: 'xMinYMin slice',
  },
  svgStyle: {
    overflow: 'hidden',
    position: 'relative',
  },
};
