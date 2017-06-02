import React, { PropTypes } from 'react';
import styles from '../styles.scss';

export default class PencilDrawListener extends React.Component {
  constructor(props) {
    super(props);

    this.pencilCoordinates = [];

    //to track the status of drawing
    this.isDrawing = false;

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
  }

  //main mouse down handler
  //calls a mouseDown<AnnotationName> handler based on the tool selected
  mouseDownHandler(event) {
    if(!this.isDrawing) {
      window.addEventListener('mouseup', this.mouseUpHandler);
      window.addEventListener('mousemove', this.mouseMoveHandler, true);
      this.mouseDownPencil(event);
      this.isDrawing = true;

    //if you switch to a different window using Alt+Tab while mouse is down and release it
    //it wont catch mouseUp and will keep tracking the movements. Thus we need this check.
    } else {
      this.mouseUpHandler(event);
    }
  }

  //main mouse up handler
  //calls a mouseUp<AnnotationName> handler based on the tool selected
  mouseUpHandler(event) {
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler, true);
    this.mouseUpPencil(event);

    this.isDrawing = false;
  }

  //main mouse move handler
  //calls a mouseMove<AnnotationName> handler based on the tool selected
  mouseMoveHandler(event) {
    this.mouseMovePencil(event);
  }

  mouseDownPencil(event) {
    const { getSvgPoint, generateNewShapeId } = this.props.actions;

    let svgPoint = getSvgPoint(event);
    let points = [];
    points.push(svgPoint.x);
    points.push(svgPoint.y);
    this.pencilCoordinates = points;
    generateNewShapeId();
  }

  mouseMovePencil(event) {
    const { checkIfOutOfBounds, getTransformedSvgPoint, svgCoordinateToPercentages, generateNewShapeId, getCurrentShapeId } = this.props.actions;

    //get the transformed svg coordinate
    let transformedSvgPoint = getTransformedSvgPoint(event);

    //check if it's out of bounds
    transformedSvgPoint = checkIfOutOfBounds(transformedSvgPoint);

    //transforming svg coordinate to percentages relative to the slide width/height
    transformedSvgPoint = svgCoordinateToPercentages(transformedSvgPoint);

    //adding new coordinates to the saved coordinates in the state
    let points = this.pencilCoordinates;
    points.push(transformedSvgPoint.x);
    points.push(transformedSvgPoint.y);

    //if we have 16 pairs - send a message (number 16 - to match Flash)
    if(points.length > 30) {
      //calling handleDrawPencil to send a message
      this.handleDrawPencil(points, "DRAW_START", getCurrentShapeId());

      //generating a new shape Id
      generateNewShapeId();


      //always save the last pair of coorindtates, since this is the start of the next chunk
      this.pencilCoordinates = [points[points.length - 2], points[points.length-1]];

    //if we don't have 16 pairs yet - just save an updated array in the state
    } else {
      this.pencilCoordinates = points;
    }
  }

  mouseUpPencil(event) {
    const { getCurrentShapeId } = this.props.actions;

    //drawing a pencil
    this.handleDrawPencil(this.pencilCoordinates, "DRAW_START", getCurrentShapeId());

    this.pencilCoordinates = [];
  }

  handleDrawPencil(points, status, id) {
    let shape = {
      annotation: {
        type: "pencil",
        points: points,
        color: this.props.drawSettings.color,
        transparency: false,
        status: status,
        thickness: this.props.drawSettings.thickness,
        id: id,
        whiteboardId: this.props.whiteboardId,
      },
      whiteboard_id: this.props.whiteboardId,
    };

    this.props.sendAnnotation(shape);
  }

  render() {

    return (
      <div
        className={styles.pencil}
        style={{ width: '100%', height: '100%' }}
        onMouseDown={this.mouseDownHandler}
      />
    );
  }
}
