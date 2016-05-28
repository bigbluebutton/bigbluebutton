import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Media from './component';
import MediaService from './service';
import Button from '../button/component';
import WhiteboardContainer from '../whiteboard/container';
import VideoDockContainer from '../video-dock/container';
import DefaultContent from '../whiteboard/default-content/component';

const defaultProps = {
  overlay: <VideoDockContainer/>,
  content: <WhiteboardContainer/>,
  defaultContent: <DefaultContent />,
};

class MediaContainer extends Component {
  constructor(props) {
    super(props);

    const { overlay, content, defaultContent } = this.props;
    this.state = {
      overlay: overlay,
      content: defaultContent,
    };

    this.handleToggleLayout = this.handleToggleLayout.bind(this);
  }
  componentDidMount() {
    console.log('mounted');
    console.log(this.props);
  }
  componentWillReceiveProps(nextProps) {
    console.log('receiving props');
    if(nextProps.current_slide != this.props.current_slide) {
      console.log('setting new state');
      if(nextProps.current_slide) {
        this.setState({ content: this.props.content });
        } else {
        this.setState({ content: this.props.defaultContent });
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('will update', nextProps);
  }

  handleToggleLayout() {
    const { overlay, content } = this.state;
    this.setState({ overlay: content, content: overlay });
  }

  render() {
    return (
      <Media overlay={this.state.overlay} content={this.state.content}>
        <Button
          label="Toggle Layout"
          style={{ position: 'absolute', top: '10px', left: '10px' }}
          onClick={this.handleToggleLayout} />
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
