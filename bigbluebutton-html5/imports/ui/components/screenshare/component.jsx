import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import FullscreenButton from '../video-provider/fullscreen-button/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  screenShareLabel: {
    id: 'app.screenshare.screenShareLabel',
    description: 'screen share area element label',
  },
});

class ScreenshareComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      loaded: false,
    };

    this.onVideoLoad = this.onVideoLoad.bind(this);
  }

  componentDidMount() {
    this.props.presenterScreenshareHasStarted();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isPresenter && !nextProps.isPresenter) {
      this.props.unshareScreen();
    }
  }

  componentWillUnmount() {
    this.props.presenterScreenshareHasEnded();
    this.props.unshareScreen();
  }

  onVideoLoad() {
    this.setState({ loaded: true });
  }

  renderFullscreenButton() {
    const { intl } = this.props;
    const full = () => {
      if (!this.videoTag) return;
      this.videoTag.requestFullscreen();
    };

    return (
      <FullscreenButton
        handleFullscreen={full}
        elementName={intl.formatMessage(intlMessages.screenShareLabel)}
      />
    );
  }

  render() {
    const style = {
      right: 0,
      bottom: 0,
    };

    return (
      [!this.state.loaded ? (<div key="screenshareArea" innerStyle={style} className={styles.connecting} />) : null,
        this.renderFullscreenButton(),
        (
          <video
            key="screenshareVideo"
            id="screenshareVideo"
            style={{ maxHeight: '100%', width: '100%' }}
            autoPlay
            playsInline
            onLoadedData={this.onVideoLoad}
            ref={(ref) => { this.videoTag = ref; }}
          />
        )]
    );
  }
}

export default injectIntl(ScreenshareComponent);

ScreenshareComponent.propTypes = {
  intl: intlShape.isRequired,
};
