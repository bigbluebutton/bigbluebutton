import React, { PropTypes } from 'react';
import Ellipse from '../shapes/ellipse/component.jsx';
import Line from '../shapes/line/component.jsx';
import Poll from '../shapes/poll/component.jsx';
import Rectangle from '../shapes/rectangle/component.jsx';
import Text from '../shapes/text/component.jsx';
import Triangle from '../shapes/triangle/component.jsx';

export default class WhiteboardShapeModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}

WhiteboardShapeModel.defaultProps = {
  shapes: {
    'ellipse': Ellipse,
    'line': Line,
    'poll': Poll,
    'rectangle': Rectangle,
    'text': Text,
    'triangle': Triangle,
  },
};
