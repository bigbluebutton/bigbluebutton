import React from 'react';

import { styles } from './styles';

export default class ScreenshareComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      hideConnecting: false,
    };

    this.hideConnectingIcon = this.hideConnectingIcon.bind(this);
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
  hideConnectingIcon() {
    this.setState({ hideConnecting: true });
  }

  render() {
    return (
      [(<div className={styles.connecting} hidden={this.state.hideConnecting}/>),
      (<video id="screenshareVideo" style={{ maxHeight: '100%', width: '100%' }} autoPlay playsInline onLoadedData={this.hideConnectingIcon} />)]
    );
  }
}
