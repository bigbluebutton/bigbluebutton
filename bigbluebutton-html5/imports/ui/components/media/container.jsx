import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Media from './component';
import MediaService from './service';
import Button from '../button/component';
import WhiteboardContainer from '../whiteboard/container';
import VideoDockContainer from '../video-dock/container';
import DefaultContent from '../whiteboard/default-content/component';

const defaultProps = {
  overlay: null, //<VideoDockContainer/>,
  content: <WhiteboardContainer/>,
  defaultContent: <DefaultContent />,
};

class MediaContainer extends Component {
  constructor(props) {
    super(props);

    const { overlay, content, defaultContent } = this.props;
    this.state = {
      overlay: overlay,
      content: this.props.current_presentation ? content : defaultContent,
    };

    this.handleToggleLayout = this.handleToggleLayout.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.current_presentation != this.props.current_presentation) {
      if (nextProps.current_presentation) {
        this.setState({ content: this.props.content });
      } else {
        this.setState({ content: this.props.defaultContent });
      }
    }
  }

  handleToggleLayout() {
    const { overlay, content } = this.state;
    this.setState({ overlay: content, content: overlay });
  }

  render() {
    /* an example of toggleLayout button
        <Button
          label="Toggle Layout"
          style={{ position: 'absolute', top: '10px', left: '10px' }}
          onClick={this.handleToggleLayout} />
    */
    return (
      <Media overlay={this.state.overlay} content={this.state.content}>
        {this.props.children}
      </Media>
    );
  }
}

MediaContainer.defaultProps = defaultProps;

export default createContainer(() => {
  const data = MediaService.getPresentationInfo();
  return data;
}, MediaContainer);
