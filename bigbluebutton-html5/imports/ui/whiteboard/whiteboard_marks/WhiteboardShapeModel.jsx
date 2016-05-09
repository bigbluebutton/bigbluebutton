import React, { PropTypes } from 'react';

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

WhiteboardPaper.defaultProps = {
  shapes: {
    'ellipse': Ellipse,
    'line': Line,
    'poll': Poll,
    'rectangle': Rectangle,
    'text': Text,
    'triangle': Triangle,
  },
};
