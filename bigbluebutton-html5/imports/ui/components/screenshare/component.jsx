import React from 'react';

import { styles } from './styles';

export default class ScreenshareComponent extends React.Component {
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

  render() {
    return (
      [(<div className={styles.connecting} />),
      (<video id="screenshareVideo" style={{ maxHeight: '100%', width: '100%' }} autoPlay playsInline />)]
    );
  }
}
