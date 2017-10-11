import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Media from './component';
import PresentationAreaContainer from '../presentation/container';
import VideoDockContainer from '../video-dock/container';
import ScreenshareContainer from '../screenshare/container';
import DefaultContent from '../presentation/default-content/component';
import MediaService from './service';

class MediaContainer extends Component {
  constructor(props) {
    super(props);

    const { overlay, content, defaultContent } = this.props;
    this.state = {
      overlay,
      content: this.props.current_presentation ? content : defaultContent,
    };

    this.handleToggleLayout = this.handleToggleLayout.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.current_presentation !== this.props.current_presentation) {
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
    return (
      <Media {...this.props}>
        {this.props.children}
      </Media>
    );
  }
}

let data = buildDefaultData();

const dataDep = new Tracker.Dependency();

const getData = () => {
  dataDep.depend();
  return data;
};

const setData = (d) => {
  data = Object.assign(data, d);
  dataDep.changed();
};


function buildDefaultData() {
  const buildData = {};

  const updateData = () => {
    if (!buildData.overlayFocus) {
      setData({
        overlay: <PresentationAreaContainer updateData={updateData} />,
        content: <VideoDockContainer />,
        overlayFocus: !buildData.overlayFocus,
      });
    } else {
      setData({
        content: <PresentationAreaContainer />,
        overlay: <VideoDockContainer updateData={updateData} />,
        overlayFocus: !buildData.overlayFocus,
      });
    }
  };

  buildData.currentPresentation = MediaService.getPresentationInfo();
  buildData.content = <DefaultContent />;

  if (MediaService.shouldShowWhiteboard()) {
    buildData.content = <PresentationAreaContainer />;
  }

  if (MediaService.shouldShowScreenshare()) {
    buildData.content = <ScreenshareContainer />;
  }

  if (MediaService.shouldShowOverlay()) {
    buildData.overlay = <VideoDockContainer updateData={updateData} />;
  }

  buildData.overlayFocus = false;

  return buildData;
}

export default createContainer(() => getData(), MediaContainer);
