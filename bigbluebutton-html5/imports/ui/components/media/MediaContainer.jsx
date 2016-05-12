import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Media from './Media.jsx';

import WhiteboardContainer from '../whiteboard/WhiteboardContainer.jsx';
import VideoDockContainer from '../video-dock/VideoDockContainer.jsx';

const defaultProps = {
  overlay: <VideoDockContainer/>,
  content: <WhiteboardContainer/>,
};

class MediaContainer extends Component {
  constructor(props) {
    super(props);

    const { overlay, content } = this.props;
    this.state = {
      overlay: overlay,
      content: content,
    };

    this.handleToggleLayout = this.handleToggleLayout.bind(this);
  }

  handleToggleLayout() {
    const { overlay, content } = this.state;
    this.setState({ overlay: content, content: overlay });
  }

  render() {
    return (
      <Media overlay={this.state.overlay} content={this.state.content}>

        <button style={{ position: 'absolute', top: '10px', left: '10px' }}
          onClick={this.handleToggleLayout}>toggle layout</button>

        {this.props.children}
      </Media>
    );
  }
}

MediaContainer.defaultProps = defaultProps;

export default createContainer(() => {
  return {};
}, MediaContainer);
