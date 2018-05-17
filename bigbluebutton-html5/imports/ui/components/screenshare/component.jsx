import React from 'react';

import { styles } from './styles';

export default class ScreenshareComponent extends React.Component {
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

  render() {
    return (
      [!this.state.loaded ? (<div className={styles.connecting} />) : null,
        (<video id="screenshareVideo" style={{ maxHeight: '100%', width: '100%' }} autoPlay playsInline onLoadedData={this.onVideoLoad} />)]
    );
  }
}
