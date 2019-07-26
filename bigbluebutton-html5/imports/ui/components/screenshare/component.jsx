import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import _ from 'lodash';
import FullscreenService from '../fullscreen-button/service';
import FullscreenButtonContainer from '../fullscreen-button/container';
import { styles } from './styles';

const intlMessages = defineMessages({
  screenShareLabel: {
    id: 'app.screenshare.screenShareLabel',
    description: 'screen share area element label',
  },
});

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;

class ScreenshareComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      loaded: false,
      isFullscreen: false,
    };

    this.onVideoLoad = this.onVideoLoad.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
  }

  componentDidMount() {
    const { presenterScreenshareHasStarted } = this.props;
    presenterScreenshareHasStarted();

    document.onfullscreenchange = () => this.onFullscreenChange();
    document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
  }

  componentWillReceiveProps(nextProps) {
    const {
      isPresenter, unshareScreen,
    } = this.props;
    if (isPresenter && !nextProps.isPresenter) {
      unshareScreen();
    }
  }

  componentWillUnmount() {
    const {
      presenterScreenshareHasEnded, unshareScreen,
    } = this.props;
    presenterScreenshareHasEnded();
    unshareScreen();
  }

  onVideoLoad() {
    this.setState({ loaded: true });
  }

  onFullscreenChange() {
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(this.screenshareContainer);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
    }
  }

  renderFullscreenButton() {
    const { intl } = this.props;
    const { isFullscreen } = this.state;

    if (!ALLOW_FULLSCREEN) return null;

    return (
      <FullscreenButtonContainer
        key={_.uniqueId('fullscreenButton-')}
        elementName={intl.formatMessage(intlMessages.screenShareLabel)}
        fullscreenRef={this.screenshareContainer}
        isFullscreen={isFullscreen}
        dark
      />
    );
  }

  render() {
    const { loaded } = this.state;

    return (
      [!loaded
        ? (
          <div
            key={_.uniqueId('screenshareArea-')}
            className={styles.connecting}
          />
        )
        : null,
      (
        <div
          className={styles.screenshareContainer}
          key="screenshareContainer"
          ref={(ref) => { this.screenshareContainer = ref; }}
        >
          {loaded && this.renderFullscreenButton()}
          <video
            id="screenshareVideo"
            key="screenshareVideo"
            style={{ maxHeight: '100%', width: '100%' }}
            autoPlay
            playsInline
            onLoadedData={this.onVideoLoad}
            ref={(ref) => { this.videoTag = ref; }}
            muted
          />
        </div>
      )]
    );
  }
}

export default injectIntl(ScreenshareComponent);

ScreenshareComponent.propTypes = {
  intl: intlShape.isRequired,
  isPresenter: PropTypes.bool.isRequired,
  unshareScreen: PropTypes.func.isRequired,
  presenterScreenshareHasEnded: PropTypes.func.isRequired,
  presenterScreenshareHasStarted: PropTypes.func.isRequired,
};
