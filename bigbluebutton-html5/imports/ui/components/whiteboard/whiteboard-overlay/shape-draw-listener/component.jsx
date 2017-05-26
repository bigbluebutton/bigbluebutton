import React, { PropTypes } from 'react';
import styles from '../styles.scss';
import cx from 'classnames';

export default class ShapeDrawListener extends React.Component {
  constructor(props) {
    super(props);


    this.initialCoordinates = {
      x: undefined,
      y: undefined,
    };

    this.currentShapeId = undefined;
    this.count = 0;

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
      this["mouseDown" + this.props.drawSettings.tool](event);
      this.isDrawing = true;
    } else {
      this.mouseUpHandler(event);
    }
  }

  //main mouse up handler
  //calls a mouseUp<AnnotationName> handler based on the tool selected
  mouseUpHandler(event) {
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler, true);
    this["mouseUp" + this.props.drawSettings.tool](event);
    this.isDrawing = false;
  }

  //main mouse move handler
  //calls a mouseMove<AnnotationName> handler based on the tool selected
  mouseMoveHandler(event) {
    this["mouseMove" + this.props.drawSettings.tool](event);
  }

  mouseDownLine(event) {
    this.commonMouseDown(event);
  }

  mouseDownEllipse(event) {
    this.commonMouseDown(event);
  }

  mouseDownTriangle(event) {
    this.commonMouseDown(event);
  }

  mouseDownRectangle(event) {
    this.commonMouseDown(event);
  }

  //Line / Ellipse / Rectangle / Triangle have the same actions on mouseDown
  //so we just redirect their mouseDowns here
  commonMouseDown(event) {
    let svgPoint = this.props.actions.getSvgPoint(event);

    let id = (this.count + 1) + "-" + new Date().getTime();
    this["handleDraw" + this.props.drawSettings.tool]({x: svgPoint.x, y: svgPoint.y}, {x: svgPoint.x, y: svgPoint.y}, "DRAW_START", id);
    this.initialCoordinates = {
      x: svgPoint.x,
      y: svgPoint.y,
    };
    this.count = this.count + 1;
    this.currentShapeId = id;
  }

  mouseMoveLine(event) {
    this.commonMouseMove(event);
  }

  mouseMoveEllipse(event) {
    this.commonMouseMove(event);
  }

  mouseMoveTriangle(event) {
    this.commonMouseMove(event);
  }

  mouseMoveRectangle(event) {
    this.commonMouseMove(event);
  }


  //Line / Ellipse / Rectangle / Triangle have the same actions on mouseMove
  //so we just redirect their mouseMoves here
  commonMouseMove(event) {
    const { checkIfOutOfBounds, getTransformedSvgPoint, svgCoordinateToPercentages } = this.props.actions;

    //get the transformed svg coordinate
    let transformedSvgPoint = getTransformedSvgPoint(event);

    //check if it's out of bounds
    transformedSvgPoint = checkIfOutOfBounds(transformedSvgPoint);

    //transforming svg coordinate to percentages relative to the slide width/height
    transformedSvgPoint = svgCoordinateToPercentages(transformedSvgPoint);

    this["handleDraw" + this.props.drawSettings.tool](this.initialCoordinates, transformedSvgPoint, "DRAW_UPDATE", this.currentShapeId);
  }


  mouseUpLine(event) {
    this.commonMouseUp(event);
  }

  mouseUpEllipse(event) {
    this.commonMouseUp(event);
  }

  mouseUpTriangle(event) {
    this.commonMouseUp(event);
  }

  mouseUpRectangle(event) {
    this.commonMouseUp(event);
  }


  //Line / Ellipse / Rectangle / Triangle have the same actions on mouseUp
  //so we just redirect their mouseUps here
  commonMouseUp(event) {
    const { checkIfOutOfBounds, getTransformedSvgPoint, svgCoordinateToPercentages } = this.props.actions;

    //get the transformed svg coordinate
    let transformedSvgPoint = getTransformedSvgPoint(event);

    //check if it's out of bounds
    transformedSvgPoint = checkIfOutOfBounds(transformedSvgPoint);

    //transforming svg coordinate to percentages relative to the slide width/height
    transformedSvgPoint = svgCoordinateToPercentages(transformedSvgPoint);

    this["handleDraw" + this.props.drawSettings.tool](this.initialCoordinates, transformedSvgPoint, "DRAW_END", this.currentShapeId);
    this.initialCoordinates = {
      x: undefined,
      y: undefined,
    };
    this.currentShapeId = undefined;
  }

  handleDrawRectangle(startPoint, endPoint, status, id) {
    this.handleDrawCommonAnnotation(startPoint, endPoint, status, id, "rectangle");
  }

  handleDrawEllipse(startPoint, endPoint, status, id) {
    this.handleDrawCommonAnnotation(startPoint, endPoint, status, id, "ellipse");
  }

  handleDrawTriangle(startPoint, endPoint, status, id) {
    this.handleDrawCommonAnnotation(startPoint, endPoint, status, id, "triangle");
  }

  handleDrawLine(startPoint, endPoint, status, id) {
    this.handleDrawCommonAnnotation(startPoint, endPoint, status, id, "line");
  }


  //since Rectangle / Triangle / Ellipse / Line have the same coordinate structure
  //we use the same function for all of them
  handleDrawCommonAnnotation(startPoint, endPoint, status, id, shapeType) {
    let shape = {
      annotation: {
        type: shapeType,
        points: [
          startPoint.x,
          startPoint.y,
          endPoint.x,
          endPoint.y,
        ],
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

  //a function to transform a screen point to svg point
  //accepts and returns a point of type SvgPoint and an svg object
  coordinateTransform(screenPoint, someSvgObject) {
    var CTM = someSvgObject.getScreenCTM();
    return screenPoint.matrixTransform(CTM.inverse());
  }

  render() {
    let tool = this.props.drawSettings.tool;
    return (
      <div
        className={
          cx(
            tool == "Triangle" ? styles.triangle : '',
            tool == "Rectangle" ? styles.rectangle : '',
            tool == "Ellipse" ? styles.ellipse : '',
            tool == "Line" ? styles.line : '',
          )
        }
        style={{ width: '100%', height: '100%' }}
        onMouseDown={this.mouseDownHandler}
      />
    );
  }
}
