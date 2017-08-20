import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.scss';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';

export default class WhiteboardOverlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // text shape state properties
      textBoxX: undefined,
      textBoxY: undefined,
      textBoxWidth: 0,
      textBoxHeight: 0,

      // to track the status of drawing
      isDrawing: false,

      // to track the status of writing a text shape after the textarea has been drawn
      isWritingText: false,
    };

    // initial mousedown coordinates
    this.initialX = undefined;
    this.initialY = undefined;

    // current X, Y, width and height in percentages of the current slide
    // saving them so that we won't have to recalculate these values on each update
    this.currentX = undefined;
    this.currentY = undefined;
    this.currentWidth = undefined;
    this.currentHeight = undefined;

    // current text shape status, it may change between "textCreated", "textEdited", "textUpdated"
    this.currentStatus = '';

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.resetState = this.resetState.bind(this);
    this.sendLastMessage = this.sendLastMessage.bind(this);
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.sendLastMessage);
  }

  componentDidUpdate(prevProps, prevState) {
    const { drawSettings } = this.props;
    const _drawsettings = prevProps.drawSettings;
    const _textShapeValue = prevProps.drawSettings.textShapeValue;

    if (drawSettings.textFontSize != _drawsettings.textFontSize ||
      drawSettings.color != _drawsettings.color ||
      drawSettings.textShapeValue != _textShapeValue) {
      const { getCurrentShapeId } = this.props.actions;
      this.currentStatus = 'textEdited';

      this.handleDrawText(
        { x: this.currentX, y: this.currentY },
        this.currentWidth,
        this.currentHeight,
        this.currentStatus,
        getCurrentShapeId(),
        drawSettings.textShapeValue,
      );
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.sendLastMessage);
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler, true);

    // sending the last message on componentDidUnmount
    // for example in case when you switched a tool while drawing text shape
    this.sendLastMessage();
  }

  // main mouse down handler
  // calls a mouseDown<AnnotationName> handler based on the tool selected
  mouseDownHandler(event) {
    this.mouseDownText(event);
  }

  // main mouse up handler
  // calls a mouseUp<AnnotationName> handler based on the tool selected
  mouseUpHandler(event) {
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler, true);
    this.mouseUpText(event);
  }

  // main mouse move handler
  // calls a mouseMove<AnnotationName> handler based on the tool selected
  mouseMoveHandler(event) {
    this.mouseMoveText(event);
  }

  mouseDownText(event) {
    // if our current drawing state is not drawing the box and not writing the text
    if (!this.state.isDrawing && !this.state.isWritingText) {
      window.addEventListener('mouseup', this.mouseUpHandler);
      window.addEventListener('mousemove', this.mouseMoveHandler, true);

      // saving initial X and Y coordinates for further displaying of the textarea
      this.initialX = event.nativeEvent.offsetX;
      this.initialY = event.nativeEvent.offsetY;

      this.setState({
        textBoxX: event.nativeEvent.offsetX,
        textBoxY: event.nativeEvent.offsetY,
        isDrawing: true,
      });

    // second case is when a user finished writing the text and publishes the final result
    } else {
      // publishing the final shape and resetting the state
      this.sendLastMessage();
    }
  }

  sendLastMessage() {
    if (this.state.isWritingText) {
      const { getCurrentShapeId } = this.props.actions;
      this.currentStatus = 'textPublished';

      this.handleDrawText(
        { x: this.currentX, y: this.currentY },
        this.currentWidth,
        this.currentHeight,
        this.currentStatus,
        getCurrentShapeId(),
        this.props.drawSettings.textShapeValue,
      );

      // setting text shape status to false
      this.props.setTextShapeActiveId('');

      // resetting the text shape value
      this.props.resetTextShapeValue();

      this.resetState();
    }
  }

  resetState() {
    // resetting the current state
    this.currentX = undefined;
    this.currentY = undefined;
    this.currentWidth = undefined;
    this.currentHeight = undefined;
    this.currentStatus = '';
    this.initialX = undefined;
    this.initialY = undefined;

    this.setState({
      isDrawing: false,
      isWritingText: false,
      textBoxX: undefined,
      textBoxY: undefined,
      textBoxWidth: 0,
      textBoxHeight: 0,
    });
  }

  mouseMoveText(event) {
    const { checkIfOutOfBounds, getTransformedSvgPoint } = this.props.actions;

    // get the transformed svg coordinate
    let transformedSvgPoint = getTransformedSvgPoint(event);

    // check if it's out of bounds
    transformedSvgPoint = checkIfOutOfBounds(transformedSvgPoint);

    // check if we need to use initial or new coordinates for the top left corner of the rectangle
    const x = transformedSvgPoint.x < this.initialX ? transformedSvgPoint.x : this.initialX;
    const y = transformedSvgPoint.y < this.initialY ? transformedSvgPoint.y : this.initialY;

    // calculating the width and height of the displayed text box
    const width = transformedSvgPoint.x > this.initialX ? transformedSvgPoint.x - this.initialX : this.initialX - transformedSvgPoint.x;
    const height = transformedSvgPoint.y > this.initialY ? transformedSvgPoint.y - this.initialY : this.initialY - transformedSvgPoint.y;

    this.setState({
      textBoxWidth: width,
      textBoxHeight: height,
      textBoxX: x,
      textBoxY: y,
    });
  }


  mouseUpText(event) {
    // TODO - find if the size is large enough to display the text area
    if (this.state.isDrawing && !this.state.isWritingText) {
      const { generateNewShapeId, getCurrentShapeId } = this.props.actions;

      // coordinates and width/height of the textarea in percentages of the current slide
      // saving them in the class since they will be used during all updates
      this.currentX = this.state.textBoxX / this.props.slideWidth * 100;
      this.currentY = this.state.textBoxY / this.props.slideHeight * 100;
      this.currentWidth = this.state.textBoxWidth / this.props.slideWidth * 100;
      this.currentHeight = this.state.textBoxHeight / this.props.slideHeight * 100;
      this.currentStatus = 'textCreated';
      this.handleDrawText(
        { x: this.currentX, y: this.currentY },
        this.currentWidth,
        this.currentHeight,
        this.currentStatus,
        generateNewShapeId(),
        '',
      );

      this.props.setTextShapeActiveId(getCurrentShapeId());

      this.setState({
        isWritingText: true,
        textBoxX: undefined,
        textBoxY: undefined,
        textBoxWidth: 0,
        textBoxHeight: 0,
      });
    }
  }

  handleDrawText(startPoint, width, height, status, id, text) {
    const shape = {
      annotation: {
        type: 'text',
        x: startPoint.x, // left corner
        y: startPoint.y, // left corner
        textBoxWidth: width, // width
        textBoxHeight: height, // height
        dataPoints: `${startPoint.x},${startPoint.y}`,
        text,
        fontSize: this.props.drawSettings.textFontSize,
        fontColor: this.props.drawSettings.color,
        calcedFontSize: this.props.drawSettings.textFontSize / this.props.slideWidth * 100, // fontsize
        status,
        id,
        whiteboardId: this.props.whiteboardId,
      },
      whiteboard_id: this.props.whiteboardId,
    };

    this.props.sendAnnotation(shape);
  }

  render() {
    const tool = this.props.drawSettings.tool;
    return (
      <div
        className={styles.text}
        style={{ width: '100%', height: '100%' }}
        onMouseDown={this.mouseDownHandler}
      >
        {this.state.isDrawing ?
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            {!this.state.isWritingText ?
              <rect
                x={this.state.textBoxX}
                y={this.state.textBoxY}
                fill="none"
                stroke="black"
                strokeWidth="1"
                width={this.state.textBoxWidth}
                height={this.state.textBoxHeight}
              />
            : null }
          </svg>
        : null }
      </div>
    );
  }
}
