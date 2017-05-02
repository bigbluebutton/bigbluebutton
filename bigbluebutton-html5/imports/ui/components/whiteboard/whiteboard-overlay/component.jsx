import React, { PropTypes } from 'react';
import styles from './styles.scss';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';

export default class WhiteboardOverlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      //initial coordinates for "DRAW_START" message
      initialCoordinates: {
        x: undefined,
        y: undefined,
      },

      currentShapeId: undefined,
      count: 0,

      toolSelected: "Rectangle",
    };

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
  }

  //main mouse down handler
  //calls a mouseDown<AnnotationName> handler based on the tool selected
  mouseDownHandler(event) {
    window.addEventListener('mouseup', this.mouseUpHandler);
    window.addEventListener('mousemove', this.mouseMoveHandler, true);
    this["mouseDown" +this.state.toolSelected](event);
  }

  //main mouse up handler
  //calls a mouseUp<AnnotationName> handler based on the tool selected
  mouseUpHandler(event) {
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler, true);
    this["mouseUp" + this.state.toolSelected](event);
  }

  //main mouse move handler
  //calls a mouseMove<AnnotationName> handler based on the tool selected
  mouseMoveHandler(event) {
    this["mouseMove" + this.state.toolSelected](event);
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

  mouseDownPencil(event) {

  }

  mouseDownText(event) {

  }

  //Line / Ellipse / Rectangle / Triangle have the same actions on mouseDown
  //so we just redirect their mouseDowns here
  commonMouseDown(event) {
    let x = (event.nativeEvent.offsetX + this.props.viewBoxX) / this.props.slideWidth * 100;
    let y = (event.nativeEvent.offsetY + this.props.viewBoxY) / this.props.slideHeight * 100;
    let id = (this.state.count + 1) + "-" + new Date().getTime();
    this.handleDrawLine({x: x, y: y}, {x: x, y: y}, "DRAW_START", id);
    this.setState({
      initialCoordinates: {
        x: x,
        y: y,
      },
      count: this.state.count + 1,
      currentShapeId: id,
    });
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

  mouseMovePencil(event) {

  }

  mouseMoveText(event) {

  }

  //Line / Ellipse / Rectangle / Triangle have the same actions on mouseMove
  //so we just redirect their mouseMoves here
  commonMouseMove(event) {
    const svggroup = this.props.getSvgRef();
    var svgObject = findDOMNode(svggroup);
    var svgPoint = svgObject.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    let transformedSvgPoint = this.coordinateTransform(svgPoint, svgObject);
    transformedSvgPoint.x = transformedSvgPoint.x / this.props.slideWidth * 100;
    transformedSvgPoint.y = transformedSvgPoint.y / this.props.slideHeight * 100;

    this["handleDraw" + this.state.toolSelected](this.state.initialCoordinates, transformedSvgPoint, "DRAW_UPDATE", this.state.currentShapeId);
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

  mouseUpPencil(event) {

  }

  mouseUpText(event) {

  }

  //Line / Ellipse / Rectangle / Triangle have the same actions on mouseUp
  //so we just redirect their mouseUps here
  commonMouseUp(event) {
    const svggroup = this.props.getSvgRef();
    var svgObject = findDOMNode(svggroup);
    var svgPoint = svgObject.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    let transformedSvgPoint = this.coordinateTransform(svgPoint, svgObject);
    transformedSvgPoint.x = transformedSvgPoint.x / this.props.slideWidth * 100;
    transformedSvgPoint.y = transformedSvgPoint.y / this.props.slideHeight * 100;

    this["handleDraw" + this.state.toolSelected](this.state.initialCoordinates, transformedSvgPoint, "DRAW_END", this.state.currentShapeId);
    this.setState({
      initialCoordinates: {
        x: undefined,
        y: undefined,
      },
      currentShapeId: undefined,
    });
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

  handleDrawText() {

  }

  handleDrawPencil() {

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
        color: 0,
        transparency: false,
        status: status,
        thickness: 1,
        status: status,
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
    let toolSelected = this.state.toolSelected;
    return (
      <div
        className={
          cx(
            toolSelected == "Pencil" ? styles.pencil : '',
            toolSelected == "Triangle" ? styles.triangle : '',
            toolSelected == "Rectangle" ? styles.rectangle : '',
            toolSelected == "Ellipse" ? styles.ellipse : '',
            toolSelected == "Line" ? styles.line : ''
          )
        }
        style={{ width: '100%', height: '100%' }}
        onMouseDown={this.mouseDownHandler}
      />
    );
  }
}
