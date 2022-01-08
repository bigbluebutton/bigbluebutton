import React, { Component } from 'react';
import PropTypes from 'prop-types';
//import WhiteboardService from '../../service';
import { getFormattedColor, getStrokeWidth, denormalizeCoord } from '../helpers';

export default class MarkerComponent extends Component {
  static getInitialCoordinates(annotation, slideWidth, slideHeight) {
    const { points } = annotation;
    let i = 2;
    let path = '';
    if (points && points.length >= 2) {
      path = `M${denormalizeCoord(points[0], slideWidth)
      }, ${denormalizeCoord(points[1], slideHeight)}`;
      while (i < points.length) {
        path = `${path} L${denormalizeCoord(points[i], slideWidth)
        }, ${denormalizeCoord(points[i + 1], slideHeight)}`;
        i += 2;
      }
    }

    return { path, points };
  }

  static getFinalCoordinates(annotation, slideWidth, slideHeight) {
    const { points, commands } = annotation;

    let path = '';
    let i;
    let j;
    for (i = 0, j = 0; i < commands.length; i += 1) {
      switch (commands[i]) {
        // MOVE_TO - consumes 1 pair of values
        case 1:
          path = `${path} M${denormalizeCoord(points[j], slideWidth)} ${denormalizeCoord(points[j + 1], slideHeight)}`;
          j += 2;
          break;

          // LINE_TO - consumes 1 pair of values
        case 2:
          path = `${path} L${denormalizeCoord(points[j], slideWidth)} ${denormalizeCoord(points[j + 1], slideHeight)}`;
          j += 2;
          break;

          // QUADRATIC_CURVE_TO - consumes 2 pairs of values
          // 1st pair is a control point, second is a coordinate
        case 3:
          path = `${path} Q${denormalizeCoord(points[j], slideWidth)}, ${
            denormalizeCoord(points[j + 1], slideHeight)}, ${denormalizeCoord(points[j + 2], slideWidth)}, ${
            denormalizeCoord(points[j + 3], slideHeight)}`;
          j += 4;
          break;

          // CUBIC_CURVE_TO - consumes 3 pairs of values
          // 1st and 2nd are control points, 3rd is an end coordinate
        case 4:
          path = `${path} C${denormalizeCoord(points[j], slideWidth)}, ${
            denormalizeCoord(points[j + 1], slideHeight)}, ${denormalizeCoord(points[j + 2], slideWidth)}, ${
            denormalizeCoord(points[j + 3], slideHeight)}, ${denormalizeCoord(points[j + 4], slideWidth)}, ${
            denormalizeCoord(points[j + 5], slideHeight)}`;
          j += 6;
          break;

        default:
          break;
      }
    }

    // If that's just one coordinate at the end (dot) - we want to display it.
    // So adding L with the same X and Y values to the path
    if (path && points.length === 2) {
      path = `${path} L${denormalizeCoord(points[0], slideWidth)} ${denormalizeCoord(points[1], slideHeight)}`;
    }

    return { path, points };
  }

  constructor(props) {
    super(props);

    const { annotation, slideWidth, slideHeight } = this.props;
    
    //this.whiteboardMode = WhiteboardService.getWhiteboardMode();

    this.path = this.getCoordinates(annotation, slideWidth, slideHeight/*, false*/);

    this.getCurrentPath = this.getCurrentPath.bind(this);
    this.getCoordinates = this.getCoordinates.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { version, hidden, selected, annotation, slideWidth, slideHeight } = this.props;
    const { points } = annotation;

    if (points.length !== nextProps.annotation.points.length) {
      this.path = this.getCoordinates(nextProps.annotation, slideWidth, slideHeight/*, false*/);
    }

    if (annotation.status == "DRAW_END"
        && (annotation.points[0] !== nextProps.annotation.points[0]
         || annotation.points[1] !== nextProps.annotation.points[1])) {
      let data;
      if (annotation.commands) {
        data = MarkerComponent.getFinalCoordinates(nextProps.annotation, slideWidth, slideHeight);
      } else {
        data = MarkerComponent.getInitialCoordinates(nextProps.annotation, slideWidth, slideHeight);
      }
      this.points = data.points;
      this.path = data.path;
    }
    return version !== nextProps.version || hidden !== nextProps.hidden || selected !== nextProps.selected;
  }
/*
  componentDidUpdate(prevProps) {
    const { annotation: prevAnnotation } = prevProps;
    const { points: prevPoints } = prevAnnotation;
    const { annotation, slideWidth, slideHeight } = this.props;
    const { points } = annotation;
    if (prevPoints[0] != points[0] || prevPoints[1] != points[1]) {
      this.path = this.getCoordinates(annotation, slideWidth, slideHeight, true);
    } else if (prevPoints.length !== points.length) {
      this.path = this.getCoordinates(annotation, slideWidth, slideHeight, false);
    }
  }
*/
  getCoordinates(annotation, slideWidth, slideHeight/*, fullUpdate*/) {
    //if ((!annotation || annotation.points.length === 0)
    //    || (annotation.status === 'DRAW_END' && !annotation.commands)) {
    if (!annotation || annotation.points.length === 0) {
      return undefined;
    }

    let data;
    // Final message, display smoothes coordinates
    if (annotation.status === 'DRAW_END') {
      if (annotation.commands) {
        data = MarkerComponent.getFinalCoordinates(annotation, slideWidth, slideHeight/*, fullUpdate*/);
      } else {
        data = MarkerComponent.getInitialCoordinates(annotation, slideWidth, slideHeight);
      }
    // Not a final message, but rendering it for the first time, creating a new path
    } else if (!this.path) {
      data = MarkerComponent.getInitialCoordinates(annotation, slideWidth, slideHeight);
    // If it's not the first 2 cases - means we just got an update, updating the coordinates
    } else {
      data = this.updateCoordinates(annotation, slideWidth, slideHeight/*, fullUpdate*/);
    }

    this.points = data.points;
    return data.path;
  }

  getCurrentPath() {
    return this.path ? this.path : 'M -1 -1';
  }

  updateCoordinates(annotation, slideWidth, slideHeight/*, fullUpdate*/) {
    const { points } = annotation;

    let i = this.points.length;
    //let i;
    let path = '';
    /*if (fullUpdate) {
      i = 2
      path += `M${denormalizeCoord(points[0], slideWidth)}, ${denormalizeCoord(points[1], slideHeight)}`;
    } else {
      i = this.points.length;
      path += this.path;
    }*/

    while (i < points.length) {
      path = `${path} L${denormalizeCoord(points[i], slideWidth)
      }, ${denormalizeCoord(points[i + 1], slideHeight)}`;
      i += 2;
    }

    path = this.path + path;
    
    return { path, points };
  }

  getBBox() {
    const { slideWidth, slideHeight, annotation } = this.props;

    const oddPoints = this.points.filter((a,i)=>i%2===0);
    const evenPoints = this.points.filter((a,i)=>i%2===1);
    let x = denormalizeCoord(Math.min(...oddPoints), slideWidth)
    let y = denormalizeCoord(Math.min(...evenPoints), slideHeight)
    let width = denormalizeCoord(Math.max(...oddPoints), slideWidth) - x;
    let height = denormalizeCoord(Math.max(...evenPoints), slideHeight) -y;

    const strokeWidth = getStrokeWidth(annotation.thickness, slideWidth)
    if (width == 0 ) { width = strokeWidth ; x -= strokeWidth/2 }
    if (height== 0 ) { height= strokeWidth ; y -= strokeWidth/2 }

    return {x, y, width, height};
  }

  render() {
    const { annotation, slideWidth, hidden, selected, isEditable } = this.props;
    const maskId = "mask-" + annotation.id;
    const coord = this.getCurrentPath().replace(/^\s+/,'').split(' ').map(x => parseFloat(x.replace(/[ML]/,'')));
    const lineCap = coord.length == 4 && coord[0] == coord[2] && coord[1] == coord[3] ? "square" : "butt";
    const bbox = selected ? this.getBBox() : {x:0, y:0, width:0, height:0};
    return (
     <g>
     {hidden ? null :
      <g data-test="drawnMarker">
      <path
        id={annotation.id}
        fill="none"
        stroke={getFormattedColor(annotation.color)}
        d={this.getCurrentPath()}
        strokeWidth={getStrokeWidth(annotation.thickness, slideWidth)}
        strokeLinejoin="round"
        strokeLinecap={lineCap}
        shapeRendering="crispEdges"
      />
      <mask id = {maskId}>
        <path
          fill="none"
          stroke={annotation.color == 16777215 ? "#ffffff" : "#a0a0a0"}
          d={this.getCurrentPath()}
          strokeWidth={getStrokeWidth(annotation.thickness, slideWidth)}
          strokeLinejoin="round"
          strokeLinecap={lineCap}
          shapeRendering="crispEdges"
        />
      </mask>
      <use mask={`url(#${maskId})`}
        x="0"
        y="0"
        xlinkHref="#slideimg"
      />
      </g>}
     {selected &&
      <rect
        x={bbox.x}
        y={bbox.y}
        width={bbox.width}
        height={bbox.height}
        fill= "none"
        stroke={isEditable ? Meteor.settings.public.whiteboard.selectColor : Meteor.settings.public.whiteboard.selectInertColor}
        opacity="0.5"
        strokeWidth={getStrokeWidth(annotation.thickness+1, slideWidth)}
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
      />}
     </g>
    );
  }
}

MarkerComponent.propTypes = {
  version: PropTypes.number.isRequired,
  annotation: PropTypes.shape({
    points: PropTypes.arrayOf(PropTypes.number).isRequired,
    color: PropTypes.number.isRequired,
    thickness: PropTypes.number.isRequired,
  }).isRequired,
  slideWidth: PropTypes.number.isRequired,
  slideHeight: PropTypes.number.isRequired,
};
