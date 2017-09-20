import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.scss';

export default class TextDrawListener extends Component {
  constructor() {
    super();

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

    // current text shape status, it may change between "DRAW_START", "DRAW_UPDATE", "DRAW_END"
    this.currentStatus = '';

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.resetState = this.resetState.bind(this);
    this.sendLastMessage = this.sendLastMessage.bind(this);
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.sendLastMessage);
  }


  // If the activeId suddenly became empty - this means the shape was deleted
  // While the user was drawing it. So we are resetting the state.
  componentWillReceiveProps(nextProps) {
    const { drawSettings } = this.props;
    const nextDrawsettings = nextProps.drawSettings;

    if (drawSettings.textShapeActiveId !== '' && nextDrawsettings.textShapeActiveId === '') {
      this.resetState();
    }
  }

  componentDidUpdate(prevProps) {
    const { drawSettings } = this.props;
    const prevDrawsettings = prevProps.drawSettings;
    const prevTextShapeValue = prevProps.drawSettings.textShapeValue;

    // Updating the component in cases when:
    // Either color / font-size or text value has changed
    // and excluding the case when the textShapeActiveId changed to ''
    const fontSizeChanged = drawSettings.textFontSize !== prevDrawsettings.textFontSize;
    const colorChanged = drawSettings.color !== prevDrawsettings.color;
    const textShapeValueChanged = drawSettings.textShapeValue !== prevTextShapeValue;
    const textShapeIdNotEmpty = drawSettings.textShapeActiveId !== '';

    if ((fontSizeChanged || colorChanged || textShapeValueChanged) && textShapeIdNotEmpty) {
      const { getCurrentShapeId } = this.props.actions;
      this.currentStatus = 'DRAW_UPDATE';

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
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove, true);

    // sending the last message on componentDidUnmount
    // for example in case when you switched a tool while drawing text shape
    this.sendLastMessage();
  }

  // main mouse down handler
  handleMouseDown(event) {
    this.mouseDownText(event);
  }

  // main mouse up handler
  handleMouseUp(event) {
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove, true);
    this.mouseUpText(event);
  }

  // main mouse move handler
  handleMouseMove(event) {
    this.mouseMoveText(event);
  }

  mouseDownText(event) {
    // if our current drawing state is not drawing the box and not writing the text
    if (!this.state.isDrawing && !this.state.isWritingText) {
      window.addEventListener('mouseup', this.handleMouseUp);
      window.addEventListener('mousemove', this.handleMouseMove, true);

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
    if (!this.state.isWritingText) {
      return;
    }

    const { getCurrentShapeId } = this.props.actions;
    this.currentStatus = 'DRAW_END';

    this.handleDrawText(
      { x: this.currentX, y: this.currentY },
      this.currentWidth,
      this.currentHeight,
      this.currentStatus,
      getCurrentShapeId(),
      this.props.drawSettings.textShapeValue,
    );

    this.resetState();
  }

  resetState() {
    // resetting the text shape session values
    this.props.actions.resetTextShapeSession();
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
    const width = transformedSvgPoint.x > this.initialX ?
        transformedSvgPoint.x - this.initialX : this.initialX - transformedSvgPoint.x;
    const height = transformedSvgPoint.y > this.initialY ?
        transformedSvgPoint.y - this.initialY : this.initialY - transformedSvgPoint.y;

    this.setState({
      textBoxWidth: width,
      textBoxHeight: height,
      textBoxX: x,
      textBoxY: y,
    });
  }


  mouseUpText() {
    // TODO - find if the size is large enough to display the text area
    if (this.state.isDrawing && !this.state.isWritingText) {
      const { generateNewShapeId,
        getCurrentShapeId,
        setTextShapeActiveId,
      } = this.props.actions;

      // coordinates and width/height of the textarea in percentages of the current slide
      // saving them in the class since they will be used during all updates
      this.currentX = (this.state.textBoxX / this.props.slideWidth) * 100;
      this.currentY = (this.state.textBoxY / this.props.slideHeight) * 100;
      this.currentWidth = (this.state.textBoxWidth / this.props.slideWidth) * 100;
      this.currentHeight = (this.state.textBoxHeight / this.props.slideHeight) * 100;
      this.currentStatus = 'DRAW_START';
      this.handleDrawText(
        { x: this.currentX, y: this.currentY },
        this.currentWidth,
        this.currentHeight,
        this.currentStatus,
        generateNewShapeId(),
        '',
      );

      setTextShapeActiveId(getCurrentShapeId());

      this.setState({
        isWritingText: true,
        isDrawing: false,
        textBoxX: undefined,
        textBoxY: undefined,
        textBoxWidth: 0,
        textBoxHeight: 0,
      });
    }
  }

  handleDrawText(startPoint, width, height, status, id, text) {
    const { normalizeFont, sendAnnotation } = this.props.actions;

    const annotation = {
      id,
      status,
      annotationType: 'text',
      annotationInfo: {
        x: startPoint.x, // left corner
        y: startPoint.y, // left corner
        fontColor: this.props.drawSettings.color,
        calcedFontSize: normalizeFont(this.props.drawSettings.textFontSize), // fontsize
        textBoxWidth: width, // width
        text,
        textBoxHeight: height, // height
        id,
        whiteboardId: this.props.whiteboardId,
        status,
        fontSize: this.props.drawSettings.textFontSize,
        dataPoints: `${startPoint.x},${startPoint.y}`,
        type: 'text',
      },
      wbId: this.props.whiteboardId,
      userId: this.props.userId,
      position: 0,
    };

    sendAnnotation(annotation);
  }

  render() {
    return (
      <div
        role="presentation"
        className={styles.text}
        style={{ width: '100%', height: '100%' }}
        onMouseDown={this.handleMouseDown}
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

TextDrawListener.propTypes = {
  // Defines a whiteboard id, which needed to publish an annotation message
  whiteboardId: PropTypes.string.isRequired,
  // Defines a user id, which needed to publish an annotation message
  userId: PropTypes.string.isRequired,
  // Width of the slide (svg coordinate system)
  slideWidth: PropTypes.number.isRequired,
  // Height of the slide (svg coordinate system)
  slideHeight: PropTypes.number.isRequired,
  // Current draw settings passed from the toolbar and text shape (text value)
  drawSettings: PropTypes.shape({
    // Annotation color
    color: PropTypes.number.isRequired,
    // Font size for the text shape
    textFontSize: PropTypes.number.isRequired,
    // Current active text shape value
    textShapeValue: PropTypes.string.isRequired,
    // Text active text shape id
    textShapeActiveId: PropTypes.string.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    // Defines a function which transforms a coordinate from the window to svg coordinate system
    getTransformedSvgPoint: PropTypes.func.isRequired,
    // Defines a function which checks if the shape is out of bounds and returns
    // appropriate coordinates
    checkIfOutOfBounds: PropTypes.func.isRequired,
    // Defines a function which returns a current shape id
    getCurrentShapeId: PropTypes.func.isRequired,
    // Defines a function which generates a new shape id
    generateNewShapeId: PropTypes.func.isRequired,
    // Defines a function which receives a thickness num and normalizes it before we send a message
    normalizeThickness: PropTypes.func.isRequired,
    // Defines a function which we use to publish a message to the server
    sendAnnotation: PropTypes.func.isRequired,
    // Defines a function which resets the current state of the text shape drawing
    resetTextShapeSession: PropTypes.func.isRequired,
    // Defines a function that sets a session value for the current active text shape
    setTextShapeActiveId: PropTypes.func.isRequired,
  }).isRequired,
};
